# 部署说明

当前线上站点将 `apps/web` 部署到 Netlify，数据库、内容和认证使用 Supabase。Netlify 只配置 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_PUBLISHABLE_KEY`（已有 `VITE_SUPABASE_ANON_KEY` 也兼容），绝不能配置 Service Role Key。

发布顺序：先在 Supabase SQL Editor 按时间顺序应用全部 migrations；开启 Anonymous Sign-Ins；在管理终端用 `coucoumeow-content import ... --publish` 导入校内和三份课外内容；用匿名用户验证已发布内容可读；最后合并前端分支并触发 Netlify 部署。任何内容或迁移未完成时不要先发布前端，因为纯线上模式没有本地内容回退。

`SUPABASE_SERVICE_ROLE_KEY` 只在执行内容导入的管理终端或受保护 CI Secret 中临时配置，不是 Web 生产环境变量。当前 Web 不需要部署 FastAPI。

不要把 Secret Key 发到聊天、写入前端变量或提交 Git。已暴露的 Key 必须立即轮换。

仓库包含可选 Dockerfile，但日常本地开发无需 Docker。`compose.yaml` 不启动本地 Supabase。
