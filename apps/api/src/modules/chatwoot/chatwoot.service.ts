import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ChatwootRepository } from './chatwoot.repository.js';
import { ChatwootApiService } from './chatwoot-api.service.js';
import { CreateChatwootConnectionDto } from './dto/create-chatwoot-connect.dto.js';

@Injectable()
export class ChatwootService {
  constructor(
    private readonly apiChatwoot: ChatwootApiService,
    private readonly repository: ChatwootRepository,
  ) {}

  async connect(workspaceId: string, dto: CreateChatwootConnectionDto) {
    try {
      const profile = await this.apiChatwoot.getProfile(
        dto.baseUrl,
        dto.apiToken,
      );
      const account = profile.accounts?.[0];
      if (!account) {
        throw new UnauthorizedException('No Chatwoot account found');
      }

      return this.repository.upsertConnection({
        workspaceId,
        baseUrl: dto.baseUrl,
        apiToken: dto.apiToken,
        accountId: account.id,
      });
    } catch {
      throw new UnauthorizedException('Invalid Chatwoot credentials');
    }
  }

  findConnection(workspaceId: string) {
    return this.repository.findByWorkspace(workspaceId);
  }

  async getAgents(workspaceId: string) {
    const connection = await this.repository.findByWorkspace(workspaceId);

    if (!connection) {
      throw new NotFoundException('Chatwoot connection not found');
    }

    return this.apiChatwoot.getAgents(
      connection.baseUrl,
      connection.apiToken,
      connection.accountId,
    );
  }
}
