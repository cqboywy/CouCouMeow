# 数据库设计

内容表为 `lf_episodes`、`lf_sentences`、`lf_vocab`、`lf_knowledge`。早期 API 学习表为 `profiles`、`practice_sessions`、`practice_attempts`、`mistake_items`。当前 Web 学习数据层使用 `learning_events`、`learner_preferences` 与 `local_progress_imports`；系统表为 `content_import_jobs`。

`lf_episodes` 的展示层级是 `Level → series_title（剧集）→ episode_number（集序号）→ title（本集标题）`。同一 Level、同一剧集内的集序号唯一；例如 `Level 1 → Bat and Friends → 第 2 集 → Lost in the Rain`。

迁移文件包含外键、唯一约束、内容替换函数与 RLS。登录用户只能读取已发布内容和自己的学习数据；内容写入及替换函数只授予服务端角色。

当前只运行离线契约测试，未声称 PostgreSQL/RLS 已在真实 Supabase 执行。首次连接云端前必须在空白开发项目执行 migration 与 pgTAP 验证。

## Web 学习事件账本

`learning_events` 统一保存 `school` 与 `extra` 两条轨道的不可变事件。事件 UUID 在浏览器生成，旧 localStorage 记录导入时保留原 UUID，因此中断重试不会创建副本。`payload` 保存稳定内容 ID、教材或剧集位置、练习结果和展示快照；成长摘要、复习队列与当前学习位置在前端由事件派生。

`learner_preferences` 保存当前教材。`local_progress_imports` 记录两套 v1 浏览器数据是否完成校验导入。三张表都关联 `auth.users`，并通过 `auth.uid()` RLS 隔离。`learning_events` 不向客户端授予 update，避免历史学习证据被原地改写。

Web 启动时恢复或创建 Supabase 匿名用户，完成旧数据导入后分页读取全部事件。Supabase 是唯一运行时持久化层；缺少配置、认证失败或数据库不可用时显示可重试错误，不写入 localStorage。
