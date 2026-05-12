import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UserRepository } from '../users/users.repository.js';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto.js';
import * as bcrypt from 'bcrypt';
import { WorkspaceRepository } from '../workspace/workspace.repository.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.usersRepository.findByEmail(dto.email);

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const workspace = await this.workspaceRepository.create({
      name: dto.workspaceName,
    });

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      workspace: {
        connect: {
          id: workspace.id,
        },
      },
    });

    const payload = {
      sub: user.id,
      workspaceId: user.workspaceId,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
      },
    };
  }
  async login(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) throw new UnauthorizedException('User Not Found');

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) throw new UnauthorizedException('Invalid password');

    const payload = {
      sub: user.id,
      workspaceId: user.workspaceId,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
