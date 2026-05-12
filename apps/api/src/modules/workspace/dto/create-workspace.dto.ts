import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name!: string;
}
