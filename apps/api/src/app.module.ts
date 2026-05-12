import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './modules/users/users.module.js';
import { WorkspaceModule } from './modules/workspace/workspace.module.js';
import { CampaignsModule } from './modules/campaigns/campaigns.module.js';
import { AudiencesModule } from './modules/audiences/audiences.module.js';
import { MessagesModule } from './modules/messages/messages.module.js';
import { WebhooksModule } from './modules/webhooks/webhooks.module.js';
import { SenderModule } from './modules/sender/sender.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule } from '@nestjs/config';
import { TemplatesModule } from './modules/template/templates.module.js';
import { MetaModule } from './modules/meta/meta.module.js';
import { ChatwootModule } from './modules/chatwoot/chatwoot.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    WorkspaceModule,
    CampaignsModule,
    AudiencesModule,
    MessagesModule,
    TemplatesModule,
    WebhooksModule,
    SenderModule,
    AuthModule,
    PrismaModule,
    TemplatesModule,
    MetaModule,
    ChatwootModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
