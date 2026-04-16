import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy/jwt.strategy.js';
@Module({
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'DEV-SECRET',
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class AuthModule {}
