import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import {
  Prisma,
  Channel,
  TemplateCategory,
} from '../../../generated/prisma/client.js';

export class CreateTemplateDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsEnum(TemplateCategory as object)
  category!: TemplateCategory;

  @IsEnum(Channel as object)
  channel!: Channel;

  @IsString()
  language!: string;

  @IsString()
  body!: string;

  @IsOptional()
  variables?: Prisma.InputJsonValue;
}
