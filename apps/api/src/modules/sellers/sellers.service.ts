import { Injectable, NotFoundException } from '@nestjs/common';
import { SellersRepository } from './sellers.repository.js';
import { ChatwootRepository } from '../chatwoot/chatwoot.repository.js';
import { ChatwootApiService } from '../chatwoot/chatwoot-api.service.js';
import { CreateSellerDto } from './dto/create-seller.dto.js';
@Injectable()
export class SellersService {
  constructor(
    private readonly sellerRepository: SellersRepository,
    private readonly chatwootRepository: ChatwootRepository,
    private readonly ApiChatwoot: ChatwootApiService,
  ) {}

  async sync(workspaceId: string) {
    const connection =
      await this.chatwootRepository.findByWorkspace(workspaceId);

    if (!connection) {
      throw new NotFoundException('Chatwoot connection not found');
    }
    const agents = await this.ApiChatwoot.getAgents(
      connection.baseUrl,
      connection.apiToken,
      connection.accountId,
    );

    for (const agent of agents) {
      await this.sellerRepository.upsert({
        workspaceId,

        name: agent.name,
        email: agent.email,

        chatwootAgentId: agent.chatwootAgentId,
        chatwootAccountId: agent.chatwootAccountId,

        availabilityStatus: agent.availabilityStatus,
        role: agent.role,
      });
    }

    return this.sellerRepository.findAll(workspaceId);
  }

  async findAll(workspaceId: string) {
    return this.sellerRepository.findAll(workspaceId);
  }

  async create(workspaceId: string, dto: CreateSellerDto) {
    const connection =
      await this.chatwootRepository.findByWorkspace(workspaceId);

    if (!connection) {
      throw new NotFoundException('Chatwoot connection not found');
    }

    const agent = await this.ApiChatwoot.createAgent({
      baseUrl: connection.baseUrl,
      apiToken: connection.apiToken,
      accountId: connection.accountId,

      name: dto.name,
      email: dto.email,
    });

    return this.sellerRepository.create({
      workspace: {
        connect: {
          id: workspaceId,
        },
      },

      name: agent.name,
      email: agent.email,

      chatwootAgentId: agent.id,
      chatwootAccountId: agent.account_id,

      availabilityStatus: agent.availability_status,
      role: agent.role,
    });
  }
}
