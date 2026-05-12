import { Injectable } from '@nestjs/common';
import { AudienceRepository } from './audiences.repository.js';
import { CreateAudienceDto } from './dto/create-audience.dto.js';

type ImportRow = {
  name?: string;
  phone: string;
  email?: string;
  seller?: string;
};

@Injectable()
export class AudiencesService {
  constructor(private readonly audienceRepository: AudienceRepository) {}

  async create(workspaceId: string, dto: CreateAudienceDto) {
    return this.audienceRepository.create({
      name: dto.name,
      workspace: {
        connect: { id: workspaceId },
      },
    });
  }

  async findAll(workspaceId: string) {
    return this.audienceRepository.findAll(workspaceId);
  }

  async importContacts(
    workspaceId: string,
    audienceId: string,
    rows: ImportRow[],
  ) {
    let imported = 0;

    for (const row of rows) {
      const phoneNormalized = this.normalizePhone(row.phone);

      const contact = await this.audienceRepository.upsertContact({
        workspaceId,
        phoneRaw: row.phone,
        phoneNormalized,
        name: row.name ?? null,
        email: row.email ?? null,
      });

      let sellerId: string | null = null;

      if (row.seller && row.seller.trim() !== '') {
        const seller = await this.audienceRepository.upsertSeller({
          workspaceId,
          name: row.seller.trim(),
        });

        sellerId = seller.id;
      }

      await this.audienceRepository.linkContactToAudience({
        audienceId,
        contactId: contact.id,
        sellerId,
      });

      imported++;
    }

    const totalContacts =
      await this.audienceRepository.countAudienceContacts(audienceId);

    await this.audienceRepository.updateTotalContacts(
      audienceId,
      totalContacts,
    );

    return {
      imported,
      totalContacts,
    };
  }

  async findContacts(workspaceId: string, audienceId: string) {
    return this.audienceRepository.findContacts(audienceId, workspaceId);
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }
}
