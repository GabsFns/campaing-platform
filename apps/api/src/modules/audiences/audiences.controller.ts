import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AudiencesService } from './audiences.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../../common/decorators/auth/current-user.decorator.js';
import type { JwtPayload } from '../auth/types/jwt-payload.js';
import { CreateAudienceDto } from './dto/create-audience.dto.js';

type ContactRow = {
  name?: string;
  phone: string;
  email?: string;
};

@UseGuards(JwtAuthGuard)
@Controller('audiences')
export class AudiencesController {
  constructor(private readonly audienceService: AudiencesService) {}

  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAudienceDto) {
    return this.audienceService.create(user.workspaceId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    return this.audienceService.findAll(user.workspaceId);
  }

  @Get(':id/contacts')
  findContacts(
    @CurrentUser() user: JwtPayload,
    @Param('id') audienceId: string,
  ) {
    return this.audienceService.findContacts(user.workspaceId, audienceId);
  }

  @Post(':id/import')
  @UseInterceptors(FileInterceptor('file'))
  async importContacts(
    @CurrentUser() user: JwtPayload,
    @Param('id') audienceId: string,
    @UploadedFile() file: { buffer: Buffer },
  ) {
    const csvText = file.buffer.toString();

    const rows: ContactRow[] = csvText
      .split('\n')
      .slice(1)
      .map((line: string) => {
        const [name, phone, email] = line.split(',');
        return {
          name: name?.trim(),
          phone: phone?.trim(),
          email: email?.trim(),
        };
      })
      .filter((row) => row.phone);

    return this.audienceService.importContacts(
      user.workspaceId,
      audienceId,
      rows,
    );
  }
}
