import { Injectable } from '@nestjs/common';
import { UserRepository } from './users.repository.js';
import { CreateUserDto } from './dto/create-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UserRepository) {}

  create(dto: CreateUserDto) {
    return this.repository.create({
      name: dto.name,
      email: dto.email,
      workspace: {
        connect: {
          id: dto.workspaceId,
        },
      },
    });
  }

  findAll() {
    return this.repository.findAll();
  }
}
