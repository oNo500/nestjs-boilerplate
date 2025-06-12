<div align="center">
  <h1>🚀 Modern React Template</h1>
  <p>一个现代化、生产就绪的 React 开发模板，基于 Turborepo Monorepo 架构</p>

  [![Node Version](https://img.shields.io/badge/node-%3E%3D22.11.0-brightgreen?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![pnpm](https://img.shields.io/badge/pnpm-10.11.0-orange?style=for-the-badge&logo=pnpm)](https://pnpm.io/)
  [![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
</div>

## ✨ 特性

- 🏗️ **Turborepo Monorepo** - 高效的代码共享和构建优化
- ⚛️ **双应用支持** - Next.js App Router 和 React + Vite 实现
- 🎨 **现代 UI 组件库** - 基于 shadcn/ui 和 Tailwind CSS
- 📝 **TypeScript 优先** - 完整的类型安全支持
- 🧪 **测试就绪** - Vitest 单元测试 + Playwright E2E 测试
- 📚 **Storybook 集成** - 组件开发和文档
- 🔧 **完整工具链** - ESLint, Prettier, Husky, Commitlint
- 🎯 **最佳实践** - 遵循现代前端开发标准

## 🛠️ 技术栈

### 核心框架
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

### 样式和 UI
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn/ui-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

### 开发工具
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)](https://eslint.org/)
[![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)](https://prettier.io/)

### 测试
[![Vitest](https://img.shields.io/badge/Vitest-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-45ba4b?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)

### 状态管理和表单
[![React Query](https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)](https://react-hook-form.com/)
[![Zod](https://img.shields.io/badge/Zod-000000?style=for-the-badge&logo=zod&logoColor=3068B7)](https://zod.dev/)

## 🚀 快速开始

### 环境要求

- **Node.js** >= 22.11.0
- **pnpm** >= 10.11.0

### 安装

```bash
# 克隆项目
git clone https://github.com/gaoxiu333/react-template.git
cd react-template

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

这将同时启动所有应用：
- **Next.js 应用**: http://localhost:3000
- **Vite 应用**: http://localhost:5173
- **Storybook**: http://localhost:6006

## 📁 项目结构

```
react-template/
├── apps/
│   ├── nextjs-app/          # Next.js 应用 (App Router)
│   └── react-vite/          # React + Vite 应用
├── packages/
│   ├── ui/                  # 共享 UI 组件库
│   ├── lint-config/         # ESLint 配置
│   └── ts-config/           # TypeScript 配置
├── .husky/                  # Git hooks
├── package.json             # 根 package.json
├── turbo.json              # Turborepo 配置
└── pnpm-workspace.yaml     # pnpm 工作空间配置
```

## 📱 应用说明

### Next.js 应用 (`apps/nextjs-app`)

功能完整的 Next.js 应用，使用 App Router，包含：

- 🔐 **身份验证** - 登录/注册页面
- 🎨 **主题切换** - 明暗主题支持
- 📊 **数据获取** - React Query 集成
- 🛡️ **错误处理** - 全局错误边界
- 📈 **监控集成** - Sentry 错误追踪
- 🧪 **API 模拟** - MSW (Mock Service Worker)

**启动命令:**
```bash
pnpm dev --filter=nextjs-app
```

### Vite 应用 (`apps/react-vite`)

轻量化的 React + Vite 应用，包含：

- ⚡ **快速热重载** - Vite 开发体验
- 🗺️ **客户端路由** - React Router v6
- 🏪 **状态管理** - Zustand
- 🎨 **组件库** - 共享 UI 组件
- 🧪 **测试支持** - Vitest 配置

**启动命令:**
```bash
pnpm dev --filter=react-vite
```

## 📦 共享包

### `@repo/ui` - UI 组件库

基于 shadcn/ui 和 Tailwind CSS 的组件库：

- 🧩 **可复用组件** - Button, Input, Card 等
- 📚 **Storybook 文档** - 组件使用示例
- 🎨 **主题系统** - 支持明暗主题
- ♿ **无障碍支持** - WAI-ARIA 兼容

**启动 Storybook:**
```bash
cd packages/ui && pnpm dev
```

### `@repo/lint-config` - 代码规范

统一的 ESLint 配置：

- ⚛️ **React 规则** - React hooks 和最佳实践
- 🎯 **TypeScript 支持** - 类型检查规则
- 🔧 **自定义规则** - 团队编码标准
- 🔗 **多环境配置** - Next.js, Vite, Node.js

### `@repo/ts-config` - TypeScript 配置

共享的 TypeScript 配置：

- 📝 **严格模式** - 最严格的类型检查
- 🎯 **路径映射** - 别名支持
- 🏗️ **多种配置** - React, Node.js, Library

## 🧪 测试

### 单元测试 (Vitest)

```bash
# 运行所有测试
pnpm test

# 监听模式
pnpm test:watch

# 覆盖率报告
pnpm test:coverage
```

### E2E 测试 (Playwright)

```bash
# 运行 E2E 测试
pnpm test:e2e

# 交互式模式
pnpm test:e2e:ui
```

## 🔧 开发命令

```bash
# 安装依赖
pnpm install

# 启动所有应用
pnpm dev

# 构建所有应用
pnpm build

# 代码检查
pnpm lint

# 修复代码问题
pnpm lint:fix

# 代码格式化
pnpm format

# 类型检查
pnpm check-types
```

## 🚀 部署

### Next.js 应用

推荐部署到 [Vercel](https://vercel.com):

```bash
# 构建
pnpm build --filter=nextjs-app

# 本地预览
pnpm start --filter=nextjs-app
```

### Vite 应用

支持部署到任何静态托管服务：

```bash
# 构建
pnpm build --filter=react-vite

# 本地预览
pnpm preview --filter=react-vite
```

## 🤝 贡献

欢迎贡献代码！请遵循以下步骤：

1. **Fork** 本项目
2. **创建特性分支** (`git checkout -b feature/amazing-feature`)
3. **提交更改** (`git commit -m 'feat: add amazing feature'`)
4. **推送分支** (`git push origin feature/amazing-feature`)
5. **创建 Pull Request**

### 提交规范

本项目使用 [Conventional Commits](https://conventionalcommits.org/) 规范：

```bash
feat: 新功能
fix: 修复问题
docs: 文档更新
style: 代码格式化
refactor: 重构代码
test: 测试相关
chore: 构建工具或依赖更新
```

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 🙏 致谢

感谢以下优秀的开源项目：

- [Turborepo](https://turborepo.org/) - Monorepo 构建工具
- [shadcn/ui](https://ui.shadcn.com/) - 优雅的 UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架
- [React](https://reactjs.org/) - 用于构建用户界面的 JavaScript 库
- [Next.js](https://nextjs.org/) - React 生产框架
- [Vite](https://vitejs.dev/) - 现代前端构建工具

---

<div align="center">
  <p>如果这个项目对您有帮助，请考虑给它一个 ⭐️</p>
  <p>Made with ❤️ by <a href="https://github.com/gaoxiu333">gaoxiu333</a></p>
</div>