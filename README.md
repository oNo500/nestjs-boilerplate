# NestJS + React Full-Stack Boilerplate

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub Issues](https://img.shields.io/github/issues/oNo500/nestjs-boilerplate.svg)](https://github.com/oNo500/nestjs-boilerplate/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/oNo500/nestjs-boilerplate.svg)](https://github.com/oNo500/nestjs-boilerplate/pulls)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

---

A production-ready full-stack **Monorepo Boilerplate** powered by **NestJS**, **React 19**, **Drizzle ORM**, and **Turborepo** — everything you need to build modern web applications efficiently.

## 📦 Project Structure

```bash
├── apps/
│   ├── admin/               # Frontend admin panel (React 19 + Vite)
│   └── api/                 # NestJS backend service
├── packages/                # Shared modules and libraries
│   ├── db/                  # Drizzle ORM schemas, migrations, and seed data
│   ├── ui/                  # Shared React component library (shadcn/ui)
│   ├── lint-config/         # Shared ESLint configuration
│   └── ts-config/           # Shared TypeScript configurations
├── .husky/                  # Git hooks
├── pnpm-workspace.yaml      # Monorepo workspace configuration
├── turbo.json               # Turborepo configuration
└── README.md
```

---

## 🚀 Features

- 📦 **Full-Stack Monorepo**: Managed with Turborepo and pnpm workspaces for unified configuration and blazing-fast builds.
- 🛡️ **Enterprise-Grade Backend**: NestJS 11, Drizzle ORM, JWT/RBAC authentication, Swagger docs, and Pino logging.
- ✨ **Modern Frontend Stack**: React 19, Vite, Tailwind CSS, Zustand, and TanStack Query.
- 🎨 **Component-Driven UI Development**: Shared UI library built with shadcn/ui and Storybook.
- 🔧 **Robust Developer Tooling**: ESLint, Prettier, Husky, and automated code checks.

---

## 📖 Getting Started

### Install Dependencies

```bash
git clone https://github.com/oNo500/nestjs-boilerplate.git
cd nestjs-boilerplate
pnpm install
```

### Configure Environment Variables

```bash
# Backend API
cp apps/api/.env.example apps/api/.env

# Frontend Admin
cp apps/admin/.env.example apps/admin/.env

# Database
cp packages/db/.env.example packages/db/.env
```

Update the `.env` files with your local configuration, including `DATABASE_URL`, email service credentials, and other necessary values.

### Start Database Services

```bash
docker-compose -f docker/docker-compose.yml up -d
```

### Run Database Migrations and Seed Data

```bash
# Run database migrations
cd packages/db
pnpm generate && pnpm migrate && pnpm build

# (Optional) Seed initial data
pnpm -F @repo/db seed
```

> Note: After changing the schema, run pnpm generate, then pnpm migrate && pnpm build.

### Start the Development Servers

```bash
pnpm start
```

---

## 📌 Roadmap

- [ ] Integrate **Single Sign-On (SSO)** module
- [ ] Add **Vitest** for unit testing and write test cases
- [ ] Document **deployment guides**, including Docker and CI/CD automation
- [ ] Expand and refine **project documentation**

---

## 📄 License

This project is open-sourced under the **MIT License**. See the [LICENSE](./LICENSE) file for details.
