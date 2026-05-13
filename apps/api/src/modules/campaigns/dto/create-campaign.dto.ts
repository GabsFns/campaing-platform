import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  name!: string;

  @IsUUID()
  templateId!: string;

  @IsUUID()
  audienceId!: string;

  @IsOptional()
  @IsUUID()
  senderNumberId?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}
