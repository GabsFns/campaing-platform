# Campaign Messaging System

Sistema de envio de campanhas via WhatsApp com integração ao Chatwoot para atendimento de clientes.

Este sistema permite:

- criação de campanhas
- envio de templates WhatsApp
- distribuição de clientes para vendedores
- criação automática de conversas no Chatwoot
- acompanhamento de status das mensagens
- processamento de webhooks

---

# Tecnologias

Backend:

- NestJS
- Prisma ORM
- PostgreSQL

Integrações:

- Meta WhatsApp Cloud API
- Chatwoot API

Arquitetura:

- Modular (NestJS)
- UseCases (Clean Architecture)
- Workers para processamento assíncrono
- Webhooks para eventos externos

---

# Estrutura do Projeto

src/
# Campaign Messaging System

Sistema de envio de campanhas via WhatsApp com integração ao Chatwoot para atendimento de clientes.

Este sistema permite:

- criação de campanhas
- envio de templates WhatsApp
- distribuição de clientes para vendedores
- criação automática de conversas no Chatwoot
- acompanhamento de status das mensagens
- processamento de webhooks

---

# Tecnologias

Backend:

- NestJS
- Prisma ORM
- PostgreSQL

Integrações:

- Meta WhatsApp Cloud API
- Chatwoot API

Arquitetura:

- Modular (NestJS)
- UseCases (Clean Architecture)
- Workers para processamento assíncrono
- Webhooks para eventos externos

---

# Estrutura do Projeto
```
src/
│
├── main.ts
├── app.module.ts
│
├── config
│
├── prisma
│ ├── prisma.module.ts
│ └── prisma.service.ts
│
├── common
│
├── modules
│
│ ├── templates
│ ├── audiences
│ ├── sellers
│ ├── campaigns
│ ├── messaging
│ ├── conversations
│ ├── webhooks
│ └── workers

```
---


---

# Módulos

## Templates

Gerencia templates de mensagens.

Tabela:

Template

Endpoints:

POST /templates  
GET /templates  
GET /templates/:id

---

## Audiences

Gerencia públicos e contatos.

Tabelas:

Audience  
AudienceContact

Endpoints:

POST /audiences  
POST /audiences/:id/contacts  
GET /audiences/:id

---

## Sellers

Gerencia vendedores responsáveis pelo atendimento.

Tabela:

Seller

Endpoints:

POST /sellers  
GET /sellers

---

## Campaigns

Gerencia campanhas de envio.

Tabelas:

Campaign  
CampaignBatch  
CampaignMessage  
CampaignStats

Endpoints:

POST /campaigns  
GET /campaigns  
POST /campaigns/:id/start  
POST /campaigns/:id/pause

---

# Estrutura do módulo Campaign

```

campaigns
│
├── campaigns.controller.ts
├── campaigns.service.ts
├── campaigns.processor.ts
│
├── dto
│ ├── create-campaign.dto.ts
│ └── start-campaign.dto.ts
│
└── usecases
├── create-campaign.usecase.ts
├── start-campaign.usecase.ts
└── generate-messages.usecase.ts

```
# UseCases

### UseCases representam ações de negócio do sistema.

Exemplos:

create-campaign
start-campaign
generate-messages

Vantagens:

separar regras de negócio

evitar services gigantes

facilitar manutenção

## Fluxo da Campanha

1️⃣ Criar campanha

POST /campaigns

2️⃣ Iniciar campanha

POST /campaigns/:id/start

3️⃣ Gerar mensagens para contatos da audiência

4️⃣ Criar batches de envio

5️⃣ Worker processa batches

6️⃣ Enviar mensagens via WhatsApp API

7️⃣ Receber eventos via webhook

8️⃣ Atualizar status das mensagens

## Worker de Campanha

Arquivo:

campaign.processor.ts

Responsável por:

processar batches

enviar mensagens

atualizar status

aplicar retry

Fluxo:

Campaign
↓
CampaignBatch
↓
CampaignMessage
↓
Envio WhatsApp

# Messaging Module

Responsável por integrações externas.

Estrutura:

```

messaging
│
├── messaging.module.ts
├── messaging.service.ts
│
├── whatsapp.service.ts
├── chatwoot.service.ts
│
└── providers
├── meta.provider.ts
└── chatwoot.provider.ts

```

### Funções:

WhatsApp:

- enviar template

- enviar mensagem

Chatwoot:

- criar contato

- criar conversa

- atribuir vendedor

# Webhooks

Recebem eventos externos.

Estrutura:

```
webhooks
│
├── meta.controller.ts
├── chatwoot.controller.ts
└── webhooks.service.ts

```

# Rotas:

POST /webhooks/meta
POST /webhooks/chatwoot

Webhook Meta

Eventos recebidos:

message_sent

message_delivered

message_read

message_failed

Atualiza tabela:

CampaignMessage

Webhook Chatwoot

Eventos recebidos:

conversation_created

message_created

conversation_updated

Atualiza tabela:

ChatwootConversation

# Banco de Dados

## Principais tabelas:

Template
Audience
AudienceContact
Seller
Campaign
CampaignBatch
CampaignMessage
CampaignStats
ChatwootConversation
MessageEvent
WebhookEvent

# Fluxo Completo do Sistema

Criação da campanha

Campaign
↓

Gerar mensagens

CampaignMessage
↓

Criar batches

CampaignBatch
↓

Worker envia mensagens

WhatsApp API
↓

Cliente recebe mensagem
↓

Webhook Meta
↓

Atualizar status da mensagem
↓

Criar conversa no Chatwoot
↓

Cliente responde
↓

Webhook Chatwoot
↓

Atualizar conversa

## Variáveis de Ambiente
```
.env

DATABASE_URL=

META_API_URL=
META_TOKEN=

CHATWOOT_URL=
CHATWOOT_TOKEN=
CHATWOOT_ACCOUNT_ID=
CHATWOOT_INBOX_ID=
```