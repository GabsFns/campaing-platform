# Campaign Platform

Scalable multi-tenant WhatsApp campaign platform built with **NestJS**, **BullMQ**, **Redis**, **PostgreSQL**, **Prisma**, **Meta Cloud API**, and **Chatwoot**.

Designed to support high-throughput message delivery with fault tolerance, distributed workers, rate limiting, retries, and asynchronous integrations.

---

# Features

* Multi-tenant architecture
* WhatsApp Cloud API integration
* Campaign scheduling and execution
* Distributed workers with BullMQ
* Redis-based rate limiting
* Dynamic sender balancing
* Retry engine
* Dead Letter Queue
* Campaign completion engine
* Metrics and observability
* Chatwoot integration
* Meta webhook processing
* Seller assignment
* Template management
* Audience management
* Recovery mechanisms
* Horizontal scalability

---

# Architecture

```text
Campaign

↓
CampaignBatchConsumer

↓
DispatchEngine

↓
SenderSelection

↓
RateLimitEngine

↓
MessageSenderService

↓
Meta Cloud API

↓
WAMID

↓
Chatwoot Sync

↓
Campaign Complete

↓
Campaign FINISHED
```

After that:

```text
Meta Webhook

↓

Delivered / Read / Failed

↓

CampaignMessage

↓

Chatwoot Update

↓

Metrics
```

---

# Project Structure

```text
modules/

campaigns/
chatwoot/
meta/
webhooks/
redis/
sender/
sellers/
template/
audiences/
users/
workspace/
auth/
```

---

# Campaign Module

Responsible for:

* campaign execution
* batching
* dispatch
* sender balancing
* retry
* completion
* dead-letter handling

### Engines

```text
BatchEngine
DispatchEngine
RateLimitEngine
CampaignCompleteEngine
ErrorClassifierEngine
```

---

# Meta Module

Responsible for:

* OAuth
* Templates
* Message delivery
* WhatsApp Cloud API communication

---

# Chatwoot Module

Responsible for:

* Conversation creation
* Message synchronization
* Seller routing

---

# Webhooks Module

Responsible for:

* Delivered events
* Read events
* Failed events
* Incoming messages

---

# Tech Stack

## Backend

* NestJS
* TypeScript
* Prisma
* PostgreSQL

## Queue

* BullMQ
* Redis

## Integrations

* Meta Cloud API
* Chatwoot

## Authentication

* JWT

---

# Database

Main entities:

```text
Workspace
User
Seller
Campaign
CampaignBatch
CampaignMessage
Audience
Template
SenderNumber
MetaConnection
ChatwootConnection
```

---

# Execution Flow

### 1. Create Campaign

```text
Campaign
↓
Batches
↓
Messages
```

### 2. Queue Processing

```text
CampaignBatchConsumer
↓
CampaignSenderConsumer
↓
MessageSenderService
```

### 3. Meta Response

```text
Meta
↓
wamid
↓
CampaignMessage.status = SENT
```

### 4. Chatwoot Sync

```text
Conversation
↓
Message
```

### 5. Completion

```text
No pending messages
↓
CampaignCompleteEngine
↓
FINISHED
```

---

# Reliability

Implemented:

* Retry strategy
* Dead Letter Queue
* Distributed locks
* Redis rate limiting
* Multi-instance safe completion
* Sender balancing

Planned:

* Recovery Engine
* Circuit Breaker
* Buffer updates
* Redis pipelines
* Heartbeat system
* Batch recovery
* Sender memory cache

---

# Queues

```text
campaign-batches

campaign-message-batches

campaign-senders

campaign-completions

campaign-dead-letter

chatwoot-sync
```

---

# Scalability

Designed for:

* Multiple workers
* Multiple instances
* Horizontal scaling
* High throughput
* Fault tolerance

---

# Future Improvements

### Recovery Engine

Recover abandoned jobs.

### Circuit Breakers

Protect against:

* Meta downtime
* Chatwoot downtime

### Redis Pipeline

Reduce Redis operations.

### Buffered Updates

Reduce PostgreSQL write pressure.

### Heartbeat System

Detect stuck batches.

### Metrics Dashboard

Real-time campaign monitoring.

### Observability

* Prometheus
* Grafana
* OpenTelemetry

---

# Author

Gabriel Fernandes

Software Engineer focused on distributed systems, messaging platforms and scalable backend architectures.

---

# License

MIT
