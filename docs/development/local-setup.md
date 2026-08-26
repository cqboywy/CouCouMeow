# 本地开发

按 README 安装 pnpm 与 uv 依赖，然后分别运行 API 与 Web。开发模式不要求任何真实密钥。修改 FastAPI 响应模型后运行 `pnpm generate:api` 更新 TypeScript 类型。

常用验证命令：

```bash
pnpm test:web -- --run
uv run pytest apps/api/tests tools/content_importer/tests -q
bash scripts/verify.sh
```

