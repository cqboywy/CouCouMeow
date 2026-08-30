# Supabase 内容导入指南

校内教材和课外内容以 `content/**/manifest.json` 为唯一可审查源文件。Web 应用不会打包这些文件，也没有本地内容回退。

## 校验

校验不访问网络，不需要任何凭据：

```bash
uv run coucoumeow-content validate content/school/pep-grade4-upper/manifest.json
```

## 导入与发布

Service Role Key 只可放在本机管理终端或受保护的 CI Secret 中，绝不能使用 `VITE_` 前缀，也不能提交到 Git：

```bash
export SUPABASE_URL="https://<project-ref>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
uv run coucoumeow-content import content/school/pep-grade4-upper/manifest.json --draft
uv run coucoumeow-content import content/school/pep-grade4-upper/manifest.json --publish
```

课外内容逐个导入：

```bash
for manifest in content/extra/*/manifest.json; do
  uv run coucoumeow-content import "$manifest" --publish
done
```

工具先比较数据库中的内容哈希。完全相同且已经发布的版本会跳过；新版本先通过事务 RPC 写为草稿，只有 `--publish` 才调用发布 RPC。错误信息不会回显响应正文或请求头，以免泄露管理密钥。

发布内容前，数据库必须已经执行 `supabase/migrations/20260830000200_content_platform.sql`。浏览器和 Netlify 仅配置公开的 `VITE_SUPABASE_URL` 与 `VITE_SUPABASE_PUBLISHABLE_KEY`。
