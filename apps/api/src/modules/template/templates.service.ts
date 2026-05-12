import { Injectable, NotFoundException } from '@nestjs/common';
import { TemplateRepository } from './templates.repository.js';
import { CreateTemplateDto } from './dto/create-template.dto.js';
import { UpdateTemplateDto } from './dto/update-template.dto.js';
import { MetaRepository } from '../meta/meta.repository.js';
import { MetaApiService } from '../meta/meta-api.service.js';

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

    const metaTemplate = await this.metaApiService.createTemplate({
      accessToken: connection.accessToken,
      wabaId: connection.wabaId,
      name: dto.name,
      category: dto.category,
      language: dto.language,
      components: dto.body,
    });

    return this.templateRepository.upsert({
      where: {
        workspaceId_metaTemplateId: {
          workspaceId,
          metaTemplateId: metaTemplate.id,
        },
      },
      update: {
        name: dto.name,
        body: dto.body,
        category: dto.category,
        language: dto.language,
        channel: dto.channel,
        variables: dto.variables,
        status: metaTemplate.status,
      },
      create: {
        name: dto.name,
        body: dto.body,
        category: dto.category,
        language: dto.language,
        channel: dto.channel,
        variables: dto.variables,
        metaTemplateId: metaTemplate.id,
        status: metaTemplate.status,
        workspace: {
          connect: { id: workspaceId },
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
          body: bodyComponent?.text ?? '',
          status: metaTemplate.status,
          variables: metaTemplate.components,
        },
        create: {
          name: metaTemplate.name,
          category: metaTemplate.category,
          language: metaTemplate.language,
          body: bodyComponent?.text ?? '',
          status: metaTemplate.status,
          variables: metaTemplate.components,
          metaTemplateId: metaTemplate.id,
          channel: 'WHATSAPP',
          workspace: {
            connect: { id: workspaceId },
          },
        },
      });
    }

    return { message: 'Templates synchronized successfully' };
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
    const template = await this.templateRepository.findById(id, workspaceId);

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async update(id: string, workspaceId: string, dto: UpdateTemplateDto) {
    const connection = await this.metaRepository.findByWorkspace(workspaceId);

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

    const metaTemplate = await this.metaApiService.updateTemplate({
      accessToken: connection.accessToken,
      wabaId: connection.wabaId,
      oldName: existingTemplate.name,
      name: dto.name ?? existingTemplate.name,
      category: dto.category ?? existingTemplate.category,
      language: dto.language ?? existingTemplate.language,
      components: dto.body ?? existingTemplate.body,
    });

    await this.templateRepository.update(id, workspaceId, {
      ...dto,
      metaTemplateId: metaTemplate.id,
      status: metaTemplate.status,
    });

    return { message: 'Template updated successfully' };
  }

  async delete(id: string, workspaceId: string) {
    const connection = await this.metaRepository.findByWorkspace(workspaceId);

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

    return { message: 'Template deleted successfully' };
  }
}
