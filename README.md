# Better Warranty

A monorepo containing a Laravel web application with multi-tenancy support and a BullMQ-based state machine.

## Project Structure

- `packages/web` - Laravel application with Inertia.js and Svelte
- `packages/api` - BullMQ State Machine for warranty processing

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ and PNPM
- PHP 8.2+
- Composer

## Setup

1. Clone the repository and set up environment files:

```bash
cp .env.example .env
cp packages/web/.env.example packages/web/.env
cp packages/api/.env.example packages/api/.env
```

2. Start the infrastructure services:

```bash
docker-compose up -d
```

3. Install dependencies:

```bash
pnpm install
```

4. Configure Laravel application:

```bash
cd packages/web
php artisan key:generate
php artisan migrate
```

## Development

To run all applications in development mode:

```bash
pnpm dev
```

### Running individual applications

Laravel application:

```bash
cd packages/web
php artisan serve
```

BullMQ State Machine:

```bash
cd packages/api
pnpm dev
```

## Infrastructure

The project uses Docker Compose to provide the following services:

### PostgreSQL

- Port: 5432
- Default Database: warranty
- Default User: warranty
- Default Password: warranty

### Redis

- Port: 6379
- Persistence: Enabled (appendonly)

## Stopping the Infrastructure

To stop the Docker containers:

```bash
docker-compose down
```

To stop and remove all data (volumes):

```bash
docker-compose down -v
```
