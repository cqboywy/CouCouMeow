# Supabase 线上学习数据层设计

## 目标与边界

将应用从浏览器本地持久化改为纯 Supabase 线上持久化，保留现有 UI、校内学习、课外学习和成长记录的产品行为。Supabase 配置完成后是唯一数据源；不再提供 localStorage 运行模式、双写镜像或运行时本地回退。

本次迁移的数据是会变化的用户数据：课外练习与掌握事件、校内练习与完成事件、稍后复习事件和当前教材选择。成长记录继续从事件派生，不另存重复统计。PEP 教材结构、课本页面、单词、句子和课外推荐继续作为版本化静态课程内容留在代码中。本次不建设课程 CMS，不增加家长登录 UI，不推送、不部署、不写入真实凭据。

## 身份与安全边界

客户端仅从 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 读取配置。缺少任一变量时，应用显示可诊断的配置错误，不进入学习界面。`.env.example` 只放变量名与占位说明。

应用启动时恢复 Supabase Auth 会话；没有会话时调用 anonymous sign-in。数据表全部以 `auth.users.id` 为所有者，RLS 只允许 `auth.uid()` 读写自己的记录。匿名会话适合当前无登录 UI 的阶段，但清除浏览器站点数据后无法找回原匿名身份；未来可将该用户升级为家长邮箱身份，无需迁表。

## 数据模型

新增 `learning_track` 枚举：`extra` 和 `school`。新增 `learning_event_type` 枚举，覆盖当前事件：

- 课外：`practice_completed`、`mastered`。
- 校内：`exercise`、`lesson_completed`、`page_completed`、`page_check`、`later_review_added`、`later_review_resolved`。

`learning_events` 是 append-only 事件账本：

- `id uuid`：客户端生成的事件 ID，作为主键和旧数据幂等导入键。
- `user_id uuid`：关联 `auth.users`。
- `track learning_track` 与 `event_type learning_event_type`：明确区分学习轨道和事件语义。
- `occurred_at timestamptz` 与 `local_day date`：保留真实时间和原浏览器日期分组。
- `payload jsonb`：保留当前事件中的稳定内容 ID、教材/单元/课时/页面/练习位置、正确状态、作答方式、展示快照和页面掌握项集合。数据库约束其必须是 JSON object；TypeScript 辨别联合负责更精确的类型。
- `created_at timestamptz`：服务器接收时间。

账本拒绝 update；用户可以为未来的数据清除能力删除自己的记录，本次 UI 不暴露删除操作。按 `(user_id, occurred_at desc)` 建立查询索引。

`learner_preferences` 每个用户一行，保存 `selected_textbook_id`、`created_at` 和 `updated_at`。通过 upsert 修改教材选择。

`local_progress_imports` 以 `(user_id, source_key)` 为主键，保存旧存储键、源版本、导入事件数和完成时间。它是迁移回执，不代替对事件 ID 的幂等保护。

## 代码架构

存储与派生逻辑从当前两个 localStorage 仓库中拆开：

1. 共享领域类型定义两条轨道的事件 envelope 与 payload 辨别联合。
2. 纯函数分别从课外和校内事件派生现有 `GrowthSummary` 和 `SchoolProgressSummary`。
3. `LearningProgressRepository` 提供异步的加载事件、批量追加事件、读写教材选择和读写迁移回执能力。
4. Supabase 实现通过一个可注入、可模拟的窄客户端端口访问数据，避免 hooks 与 Supabase SDK 耦合。
5. 旧 localStorage 代码变为只读迁移适配器，不再写入新学习记录。
6. React 上下文在应用启动时完成配置校验、匿名认证、迁移和初始加载，两个现有学习 hook 消费同一仓库会话。

应用界面保留现有 hook 对外动作名称，但写入动作改为异步。动作上传成功后在内存事件集中追加同一事件并重新派生摘要，不为每次点击全量重读云端。

## 启动与旧数据迁移

启动流程固定为：

1. 校验环境变量并创建客户端。
2. 恢复会话，或创建匿名用户。
3. 对 `coucoumeow.learning-progress.v1` 和 `coucoumeow.school-progress.v1` 分别查询迁移回执。
4. 对尚未迁移的键执行严格解析；无数据也写入事件数为零的回执。
5. 将合法旧事件转为统一 envelope，分批 upsert。事件 UUID 不变，重试不会重复创建。
6. 回读所有已导入事件 ID，确认无缺失后写回执。
7. 导入校内数据时同步 upsert 旧 `selectedTextbookId`。
8. 保留旧 localStorage 原文，不自动删除，但之后的学习动作只写 Supabase。
9. 加载全部云端事件和教材设置，进入应用。

事件查询必须分页，不依赖 Supabase API 默认行数上限。迁移中断后重新启动会重试未写回执的源，事件主键保证幂等。损坏的旧 JSON 不得被当作空数据标记成功；启动界面要告知用户旧数据无法迁移并提供重试。

## 错误处理

- 配置缺失、匿名登录失败、旧数据损坏或初始云端加载失败：留在全屏启动状态，展示可操作的错误和重试按钮。
- 学习中写入失败：不修改派生成长数据，不落入 localStorage，在当前操作区显示失败提示，保留输入和重试路径。
- 同一启动会话不在本地与云端之间自动切换，避免分叉。
- 不向用户显示 URL、key、Supabase 原始错误详情或其他敏感配置；开发控制台可保留经过筛选的错误代码。

## 验收与测试

数据库契约测试覆盖枚举、三张新表、主键/外键/检查/索引、权限与 RLS 策略；现有静态契约测试验证 migration 文件不依赖真实凭据。在连接真实开发 Supabase 项目前，不声称 RLS 已经远程执行验证。

前端测试覆盖：

- 环境变量完整性和客户端创建。
- 恢复会话与无会话时匿名登录。
- 事件分页读取、批量 upsert、教材设置和迁移回执。
- 两种旧存储格式的成功转换、空数据回执、损坏数据阻断、部分失败重试和重复运行幂等。
- 从事件派生的课外、校内和成长摘要与当前行为一致。
- React 启动加载、可重试错误、写入成功刷新和写入失败不乐观更新。
- 现有学习 UI 、双轨成长页、课本页和课外练习回归测试。

验收时必须通过前端单元/组件测试、TypeScript 类型检查、生产构建和 Supabase 静态契约测试。手工验收需在用户后续提供的开发项目中执行 migration，开启 anonymous sign-in，使用包含旧 localStorage 记录的浏览器启动应用，并核对云端事件数、完成页、复习项和成长摘要。
