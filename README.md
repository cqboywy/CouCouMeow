# 凑凑喵英语乐园

CouCouMeow English Land 是面向 10 岁女孩的家庭英语巩固系统。网站采用 iPad 优先设计，同时完整支持手机和电脑浏览器。

线上学习系统由 React 前端、Supabase 内容数据库/认证/学习事件账本、管理端内容导入工具和自动测试组成。教材、课外内容与学习进度都来自 Supabase；浏览器中的旧版校内与课外记录只会在首次线上启动时读取并安全导入。网站不读取或上传本地 MP4/SRT；内容包入库工具在管理电脑独立运行。

## 快速启动

需要 Node.js 22+、pnpm 11、uv，以及已执行仓库 migrations 并开启 Anonymous Sign-Ins 的 Supabase 项目。

```bash
pnpm install
uv sync --all-packages --dev --python 3.12
cp apps/web/.env.example apps/web/.env.local
```

在 `apps/web/.env.local` 填写 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_PUBLISHABLE_KEY`（旧项目也兼容 `VITE_SUPABASE_ANON_KEY`）。真实值不得提交。完整步骤见[线上学习数据迁移指南](docs/development/supabase-learning-migration.md)。

启动前端：

```bash
pnpm dev:web
```

访问 `http://localhost:5173`。当前 Web 学习流程不依赖 FastAPI；`apps/api` 仅保留给内容处理工具和后续管理服务。

## 本地字幕预检

单集：

```bash
uv run coucou-import single --level 1 --srt /path/episode.srt --video-file /path/episode.mp4 --dry-run
```

批量：

```bash
uv run coucou-import batch --level 1 --directory /path/Level1 --dry-run
```

阶段 0 只进行安全预检，不调用 AI、不写云数据库。

## 验证

```bash
bash scripts/verify.sh
```

## 文档

- [项目路线图](docs/project-roadmap.md)
- [系统架构](docs/architecture/system-overview.md)
- [数据库设计](docs/architecture/database-design.md)
- [入库流水线](docs/architecture/content-import-pipeline.md)
- [UI 设计系统](docs/architecture/ui-design-system.md)
- [本地开发](docs/development/local-setup.md)
- [部署说明](docs/development/deployment.md)
- [Supabase 学习数据迁移](docs/development/supabase-learning-migration.md)
- [内容入库指南](docs/development/content-import-guide.md)
