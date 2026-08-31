# 本地开发

按 README 安装 pnpm 与 uv 依赖。Web 必须在未跟踪的 `apps/web/.env.local` 中配置 Supabase Project URL 与 Publishable key；应用不会回退到本地内容或 localStorage。修改 FastAPI 响应模型后运行 `pnpm generate:api` 更新 TypeScript 类型。

常用验证命令：

```bash
pnpm test:web -- --run
uv run pytest apps/api/tests tools/content_importer/tests -q
bash scripts/verify.sh
```
