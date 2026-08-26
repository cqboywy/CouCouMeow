# 部署说明

推荐将 `apps/web` 部署到 Vercel，将 `apps/api` 部署到 Railway 或 Render，数据库与认证使用 Supabase 云端。生产环境必须配置 `SUPABASE_SERVICE_ROLE_KEY`，且只能保存在后端平台的 Secret 设置中。

不要把 Secret Key 发到聊天、写入前端变量或提交 Git。已暴露的 Key 必须立即轮换。

仓库包含可选 Dockerfile，但日常本地开发无需 Docker。`compose.yaml` 只编排 Web/API，不启动本地 Supabase。

