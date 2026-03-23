import { IsEmail, IsString, MinLength, IsUUID } from 'class-validator';
export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsEmail()
  email!: string;

  password!: string;

  @IsUUID()
  workspaceId!: string;
}
