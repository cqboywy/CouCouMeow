# Supabase 学习数据迁移指南

## 迁移结果

Web 的校内进度、课外进度、复习队列、当前教材和成长记录现在以 Supabase 为唯一数据源。旧版 localStorage 只在首次启动时读取，用于导入既有记录；导入后所有新学习事件只写云端。应用不会在网络故障时偷偷写回本地，也不会自动删除旧浏览器数据。

本仓库不包含真实 Supabase URL、anon key、service role key 或用户数据。本次改造不会自动连接、推送或部署到任何远程项目。

## 一、准备开发项目

1. 在 Supabase 创建或选择一个非生产项目。
2. 在 Authentication 设置中开启 Anonymous Sign-Ins。
3. 使用 Supabase CLI 按时间顺序应用 `supabase/migrations`。本次学习数据 migration 是 `20260830000100_online_learning_progress.sql`。
4. 在本地 PostgreSQL/Supabase 环境执行 `supabase test db`，确认 `001_schema.test.sql`、`002_rls.test.sql` 与 `003_online_learning_progress.test.sql` 全部通过。
5. 在 Supabase 项目设置中复制 Project URL 和 public anon key。不要使用 service role key 作为前端 key。

仓库的 Python 静态契约测试只能检查 SQL 构件是否完整，不能代替真实 PostgreSQL 与 RLS 执行。没有运行第 4 步时，不应宣称远端 RLS 已验证。

## 二、配置本地 Web

从空白示例创建未跟踪配置：

```bash
cp apps/web/.env.example apps/web/.env.local
```

填写：

```dotenv
VITE_SUPABASE_URL=<Project URL>
VITE_SUPABASE_ANON_KEY=<public anon key>
```

不要把真实值写入 `.env.example`、文档、测试、提交信息或聊天记录。`.gitignore` 已忽略 `.env.local`。

## 三、导入旧浏览器记录

必须使用原来保存学习记录的同一个浏览器与同一个站点来源启动新版本。浏览器只能读取当前来源下的 localStorage；从另一台设备、另一域名或清空后的浏览器无法恢复旧匿名身份和旧记录。

启动顺序如下：

1. 应用恢复已有 Supabase 会话；没有会话时创建匿名用户。
2. 检查 `coucoumeow.learning-progress.v1` 与 `coucoumeow.school-progress.v1` 的导入回执。
3. 严格校验尚未迁移的 v1 JSON、事件 UUID、时间、事件类型和必要字段。
4. 每批最多上传 100 条事件，并使用原事件 UUID 幂等 upsert。
5. 回读全部源事件 ID；只有一条不少时才写入 `local_progress_imports` 回执。
6. 校内源同时迁移 `selectedTextbookId`。
7. 分页读取云端事件并进入学习界面。

如果 JSON 损坏、上传中断或回读缺失，启动页会阻止进入并提供重试。没有回执的源会在下次启动重新导入；事件主键避免重复。旧 localStorage 原文不会被修改或删除。

## 四、验收查询

在 Supabase SQL Editor 中以管理员身份检查目标匿名用户。将示例 UUID 替换为 Authentication 用户列表中的实际 ID：

```sql
select track, event_type, count(*)
from public.learning_events
where user_id = '<user uuid>'
group by track, event_type
order by track, event_type;

select source_key, source_version, event_count, imported_at
from public.local_progress_imports
where user_id = '<user uuid>'
order by source_key;

select selected_textbook_id
from public.learner_preferences
where user_id = '<user uuid>';
```

然后在应用中核对：

- 已完成课本页和当前下一页与旧版一致。
- 校内错题、稍后复习项和已掌握词句仍在。
- 课外已学剧集、单词、句子、句式与最近七天成长记录一致。
- 两条轨道仍分别统计，学习总览只并列展示。
- 新完成一次练习后，`learning_events` 增加对应云端事件，localStorage 原文不变化。

验收完成前保留旧 localStorage，不清理浏览器站点数据。

## 五、故障与恢复边界

- 缺少环境变量：应用显示配置错误，不进入学习界面。
- Anonymous Sign-Ins 未开启或认证失败：应用显示安全档案连接失败，可修正项目设置后重试。
- migration 未应用或 RLS/grant 不完整：数据请求失败；先修复数据库，不切换到本地模式。
- 写入中断：当前成长摘要不更新，操作区显示错误；恢复网络后重新执行学习动作。
- 清除浏览器站点数据：匿名 Supabase 会话可能丢失，无法自动找回原匿名用户。上线家庭账号前应保留浏览器会话；未来可将匿名用户升级为家长邮箱身份而不迁移学习表。

## 六、验证命令

```bash
PYTHONDONTWRITEBYTECODE=1 python3 -m unittest supabase.tests.test_static_contract -v
pnpm test:web -- --run
pnpm typecheck:web
pnpm build:web
bash scripts/verify.sh
```

只有在真实开发 Supabase 项目执行 migration、pgTAP 与旧浏览器手工验收后，才可授权推送或部署。本任务本身不执行推送和部署。
