import { Injectable } from '@nestjs/common';
import { MetaApiService } from './meta-api.service.js';
import { MetaRepository } from './meta.repository.js';

@Injectable()
export class MetaService {
  constructor(
    private readonly metaApi: MetaApiService,
    private readonly repository: MetaRepository,
  ) {}

  getConnectUrl(workspaceId: string) {
    return this.metaApi.getAuthUrl(workspaceId);
  }

  async handleCallback(code: string, workspaceId: string) {
    const accessToken = await this.metaApi.exchangeCodeForToken(code);

    const businessId = await this.metaApi.getBusinessId(accessToken);

    const wabaId = await this.metaApi.getWabaId(accessToken, businessId);

    const phone = await this.metaApi.getPhoneNumber(accessToken, wabaId);

    return this.repository.upsertConnection({
      workspaceId,
      accessToken,
      businessId,
      wabaId,
      phoneNumberId: phone.id,
      phoneNumber: phone.display_phone_number,
      displayName: phone.verified_name,
    });
  }

  findConnection(workspaceId: string) {
    return this.repository.findByWorkspace(workspaceId);
  }
}
