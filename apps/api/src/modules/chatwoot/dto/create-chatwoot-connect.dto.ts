import { IsString, IsUrl } from 'class-validator';

export class CreateChatwootConnectionDto {
  @IsUrl()
  baseUrl!: string;

  @IsString()
  apiToken!: string;
}
