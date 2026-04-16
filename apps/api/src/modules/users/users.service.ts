import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from './users.repository.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UsersService {
  constructor(private readonly repository: UserRepository) {}

  async create(dto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.repository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      workspace: {
        connect: {
          id: dto.workspaceId,
        },
      },
    });
  }

  async findAll(workspaceId: string) {
    return await this.repository.findAllByWorkspace(workspaceId);
  }

  async findById(id: string, workspaceId: string) {
    const user = await this.repository.findById(id, workspaceId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, workspaceId: string, dto: UpdateUserDto) {
    const updated = await this.repository.update(id, workspaceId, dto);

    if (updated.count === 0) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User updated successfully' };
  }

  async delete(id: string, workspaceId: string) {
    const deleted = await this.repository.delete(id, workspaceId);

    if (deleted.count === 0) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }
}
