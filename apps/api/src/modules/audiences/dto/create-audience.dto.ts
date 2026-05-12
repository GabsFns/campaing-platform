import { IsString, MinLength } from 'class-validator';

export class CreateAudienceDto {
  @IsString()
  @MinLength(3)
  name!: string;
}
