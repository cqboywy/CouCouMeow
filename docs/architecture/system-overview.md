# 系统架构

前端位于 `apps/web`，FastAPI 位于 `apps/api`，本地字幕工具位于 `tools/content_importer`。三者独立运行，API 通过 OpenAPI 生成 `packages/api-client` 类型契约。

阶段 0 使用内存仓库和虚构 JSON/Pydantic 数据运行测试，不连接 Supabase。`supabase/migrations` 保留最终 PostgreSQL 表和 RLS；未来连接云端时再执行实际迁移验证。

视频默认在家长电脑本地播放。网站只显示学习提示与处理后的文字内容，媒体接口保留未来扩展空间。

