# 数据库设计

内容表为 `lf_episodes`、`lf_sentences`、`lf_vocab`、`lf_knowledge`。学习表为 `profiles`、`practice_sessions`、`practice_attempts`、`mistake_items`，系统表为 `content_import_jobs`。

`lf_episodes` 的展示层级是 `Level → series_title（剧集）→ episode_number（集序号）→ title（本集标题）`。同一 Level、同一剧集内的集序号唯一；例如 `Level 1 → Bat and Friends → 第 2 集 → Lost in the Rain`。

迁移文件包含外键、唯一约束、内容替换函数与 RLS。登录用户只能读取已发布内容和自己的学习数据；内容写入及替换函数只授予服务端角色。

当前只运行离线契约测试，未声称 PostgreSQL/RLS 已在真实 Supabase 执行。首次连接云端前必须在空白开发项目执行 migration 与 pgTAP 验证。
