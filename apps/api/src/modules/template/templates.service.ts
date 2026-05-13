import { Injectable, NotFoundException } from '@nestjs/common';
import { TemplateRepository } from './templates.repository.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';
import { MetaRepository } from '../meta/meta.repository.js';
import { MetaApiService } from '../meta/meta-api.service.js';

type InternalTemplateVariable = {
  key: string;
  label: string;
  source: 'contact' | 'seller' | 'custom';
};

@Injectable()
export class TemplateService {
  constructor(
    private readonly templateRepository: TemplateRepository,
    private readonly metaRepository: MetaRepository,
    private readonly metaApiService: MetaApiService,
  ) {}

  async create(workspaceId: string, dto: CreateTemplateDto) {
    const connection = await this.metaRepository.findByWorkspace(workspaceId);

    if (!connection) {
      throw new NotFoundException('Meta connection not found');
    }

    /**
     * BODY INTERNO PADRONIZADO
     *
     * Exemplo:
     * Olá {{contact.name}}, fale com {{seller.name}}
     */
    const internalBody = dto.body;

    /**
     * VARIÁVEIS INTERNAS PADRONIZADAS
     */
    const variables = this.extractVariables(internalBody);

    /**
     * CONVERTE PARA O FORMATO DA META
     *
     * Exemplo:
     * Olá {{1}}, fale com {{2}}
     */
    const metaBody = this.convertInternalBodyToMeta(internalBody);

    /**
     * COMPONENT PAYLOAD META
     */
    const metaComponents = [
      {
        type: 'BODY',
        text: metaBody,

        example: {
          body_text: [
            variables.map((variable) =>
              this.getExampleValue(variable.source, variable.key),
            ),
          ],
        },
      },
    ];

    /**
     * CRIA TEMPLATE NA META
     */
    const metaTemplate = await this.metaApiService.createTemplate({
      accessToken: connection.accessToken,
      wabaId: connection.wabaId,
      name: dto.name,
      category: dto.category,
      language: dto.language,
      components: metaComponents,
    });

    /**
     * SALVA PADRONIZAÇÃO INTERNA
     */
    return this.templateRepository.upsert({
      where: {
        workspaceId_metaTemplateId: {
          workspaceId,
          metaTemplateId: metaTemplate.id,
        },
      },

      update: {
        name: dto.name,
        body: internalBody,
        category: dto.category,
        language: dto.language,
        channel: dto.channel,

        /**
         * JSON INTERNO PADRONIZADO
         */
        variables,

        status: metaTemplate.status,
      },

      create: {
        name: dto.name,
        body: internalBody,
        category: dto.category,
        language: dto.language,
        channel: dto.channel,

        /**
         * JSON INTERNO PADRONIZADO
         */
        variables,

        metaTemplateId: metaTemplate.id,
        status: metaTemplate.status,

        workspace: {
          connect: {
            id: workspaceId,
          },
        },
      },
    });
  }

  async syncTemplates(workspaceId: string) {
    const connection = await this.metaRepository.findByWorkspace(workspaceId);

    if (!connection) {
      throw new NotFoundException('Meta connection not found');
    }

    const metaTemplates = await this.metaApiService.getTemplates(
      connection.accessToken,
      connection.wabaId,
    );

    for (const metaTemplate of metaTemplates) {
      const bodyComponent = metaTemplate.components?.find(
        (component: any) => component.type === 'BODY',
      );

      const metaBody = bodyComponent?.text ?? '';

      /**
       * NÃO TEM COMO RECUPERAR O MAPEAMENTO INTERNO
       * DA META AUTOMATICAMENTE
       *
       * ENTÃO SALVAMOS COMO RAW
       */
      const variables = this.extractMetaVariables(metaBody);

      await this.templateRepository.upsert({
        where: {
          workspaceId_metaTemplateId: {
            workspaceId,
            metaTemplateId: metaTemplate.id,
          },
        },

        update: {
          name: metaTemplate.name,
          category: metaTemplate.category,
          language: metaTemplate.language,

          /**
           * BODY RAW META
           */
          body: metaBody,

          /**
           * VARIÁVEIS RAW
           */
          variables,

          status: metaTemplate.status,
        },

        create: {
          name: metaTemplate.name,
          category: metaTemplate.category,
          language: metaTemplate.language,

          body: metaBody,

          variables,

          status: metaTemplate.status,
          metaTemplateId: metaTemplate.id,

          channel: 'WHATSAPP',

          workspace: {
            connect: {
              id: workspaceId,
            },
          },
        },
      });
    }

    return {
      message: 'Templates synchronized successfully',
    };
  }

  async findAll(workspaceId: string, page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      this.templateRepository.findAll(workspaceId, page, limit),

      this.templateRepository.count(workspaceId),
    ]);

    return {
      data,

      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, workspaceId: string) {
    const template = await this.templateRepository.findById(
      id,
      workspaceId,
    );

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async update(
    id: string,
    workspaceId: string,
    dto: UpdateTemplateDto,
  ) {
    const connection = await this.metaRepository.findByWorkspace(
      workspaceId,
    );

    if (!connection) {
      throw new NotFoundException('Meta connection not found');
    }

    const existingTemplate = await this.templateRepository.findById(
      id,
      workspaceId,
    );

    if (!existingTemplate) {
      throw new NotFoundException('Template not found');
    }

    const internalBody = dto.body ?? existingTemplate.body;

    const variables = this.extractVariables(internalBody);

    const metaBody = this.convertInternalBodyToMeta(internalBody);

    const metaComponents = [
      {
        type: 'BODY',
        text: metaBody,

        example: {
          body_text: [
            variables.map((variable) =>
              this.getExampleValue(variable.source, variable.key),
            ),
          ],
        },
      },
    ];

    const metaTemplate = await this.metaApiService.updateTemplate({
      accessToken: connection.accessToken,
      wabaId: connection.wabaId,

      oldName: existingTemplate.name,

      name: dto.name ?? existingTemplate.name,

      category:
        dto.category ?? existingTemplate.category,

      language:
        dto.language ?? existingTemplate.language,

      components: metaComponents,
    });

    await this.templateRepository.update(id, workspaceId, {
      name: dto.name ?? existingTemplate.name,

      body: internalBody,

      category:
        dto.category ?? existingTemplate.category,

      language:
        dto.language ?? existingTemplate.language,

      channel:
        dto.channel ?? existingTemplate.channel,

      variables,

      metaTemplateId: metaTemplate.id,

      status: metaTemplate.status,
    });

    return {
      message: 'Template updated successfully',
    };
  }

  async delete(id: string, workspaceId: string) {
    const connection = await this.metaRepository.findByWorkspace(
      workspaceId,
    );

    if (!connection) {
      throw new NotFoundException('Meta connection not found');
    }

    const existingTemplate = await this.templateRepository.findById(
      id,
      workspaceId,
    );

    if (!existingTemplate) {
      throw new NotFoundException('Template not found');
    }

    await this.metaApiService.deleteTemplate({
      accessToken: connection.accessToken,
      wabaId: connection.wabaId,
      name: existingTemplate.name,
    });

    await this.templateRepository.delete(id, workspaceId);

    return {
      message: 'Template deleted successfully',
    };
  }

  /**
   * =========================================
   * INTERNAL VARIABLE ENGINE
   * =========================================
   */

  private extractVariables(
    body: string,
  ): InternalTemplateVariable[] {
    const regex = /{{(.*?)}}/g;

    const matches = [...body.matchAll(regex)];

    return matches.map((match) => {
      const value = match[1].trim();

      /**
       * contact.name
       */
      if (value.startsWith('contact.')) {
        return {
          key: value.replace('contact.', ''),
          label: value,
          source: 'contact',
        };
      }

      /**
       * seller.name
       */
      if (value.startsWith('seller.')) {
        return {
          key: value.replace('seller.', ''),
          label: value,
          source: 'seller',
        };
      }

      /**
       * custom.variable
       */
      return {
        key: value,
        label: value,
        source: 'custom',
      };
    });
  }

  /**
   * CONVERTE:
   *
   * Olá {{contact.name}}
   *
   * PARA:
   *
   * Olá {{1}}
   */
  private convertInternalBodyToMeta(body: string) {
    const regex = /{{(.*?)}}/g;

    let index = 1;

    return body.replace(regex, () => {
      return `{{${index++}}}`;
    });
  }

  /**
   * QUANDO SINCRONIZA DA META
   */
  private extractMetaVariables(body: string) {
    const regex = /{{(.*?)}}/g;

    const matches = [...body.matchAll(regex)];

    return matches.map((match, index) => ({
      key: String(index + 1),
      label: match[0],
      source: 'custom',
    }));
  }

  private getExampleValue(
    source: 'contact' | 'seller' | 'custom',
    key: string,
  ) {
    if (source === 'contact') {
      switch (key) {
        case 'name':
          return 'Gabriel';

        case 'email':
          return 'gabriel@email.com';

        case 'phone':
          return '21999999999';

        default:
          return 'Contato';
      }
    }

    if (source === 'seller') {
      switch (key) {
        case 'name':
          return 'Carlos';

        case 'email':
          return 'carlos@empresa.com';

        default:
          return 'Vendedor';
      }
    }

    return 'Valor';
  }
}