# 凑凑喵英语乐园

CouCouMeow English Land 是面向 10 岁女孩的家庭英语巩固系统。网站采用 iPad 优先设计，同时完整支持手机和电脑浏览器。

当前完成阶段 0 工程骨架：React 前端、FastAPI 后端、Supabase 迁移、离线字幕工具、类型化 API 客户端和自动测试。网站不读取或上传本地 MP4/SRT；入库工具在家长电脑独立运行。

## 快速启动

需要 Node.js 22+、pnpm 11、uv。无需 Docker，也无需 Supabase 或 DeepSeek 密钥。

```bash
pnpm install
uv sync --all-packages --dev --python 3.12
```

启动后端：

```bash
uv run --package coucoumeow-api uvicorn coucoumeow_api.main:create_app --factory --reload
```

另开一个终端启动前端：

```bash
pnpm dev:web
```

访问 `http://localhost:5173`。API 文档位于 `http://localhost:8000/docs`。

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
- [内容入库指南](docs/development/content-import-guide.md)

