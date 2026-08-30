# Supabase 统一内容平台与代码清理设计

## 背景与目标

当前学习进度、复习队列和成长记录已以 Supabase 为唯一持久化层，但校内教材仍分散在 `apps/web/src/curriculum` 的 TypeScript 文件中，课外动画在 Netlify 生产环境仍经由 `hostedPreview` 回退到 `localExtraContent`。FastAPI 中另有一份硬编码动画数据，导致同一内容存在多个版本。

本次改造要达成：

1. 校内教材和课外动画全部从 Supabase 读取，生产前端不再包含写死内容或内容回退。
2. 导入新年级、新册次或新动画时只处理结构化内容包和数据库发布，不修改学习页代码。
3. 保持现有 UI、学习流程、成长统计与旧进度 ID 连续性。
4. 删除重复内容源、旧可写 localStorage 仓库和多重 fallback，拆分过度集中的前端责任。
5. 保留可审计、可校验、可重复执行的管理端内容导入流程。

## 边界与非目标

- Supabase 是生产环境的唯一内容和学习数据源。
- 版本化 JSON 内容包可作为导入源和审计备份保存在仓库的 `content/` 目录，但不进入 Web 构建产物，也不是运行时 fallback。
- 本阶段提供管理端 CLI 导入工具，不开发通用教材 CMS 界面。
- Supabase JS SDK 仍可在浏览器保存匿名登录会话令牌；这不是内容或学习记录的本地持久化。
- 不在本次改造中更换现有 UI 视觉设计或重写学习交互。

## 数据模型

### 稳定内容标识

内容表使用 UUID 作为数据库内部主键，同时提供全局唯一且不可变的 `content_key` 文本标识。现有 `pep4a-u1-p3`、`episode-the-park`、`vocab-park` 等 ID 原样成为 `content_key`。

UI、URL 和 `learning_events.payload` 继续使用 `content_key`；表内外键使用 UUID。因此旧 localStorage 导入事件和已上传成长记录无需重写，仍能对应新内容。学习事件保留当时的文字快照，即使内容后续修订，历史记录也不会失真。

### 校内教材

新增以下公共表：

- `school_textbooks`：`content_key`、课程体系、年级、上/下册、标题、内容版本、发布状态和时间戳。
- `school_units`：所属教材、`content_key`、顺序、中英标题、大问题和学习目标。
- `school_lessons`：所属单元、`content_key`、顺序、页码范围、时长、概念、学习步骤与说明。
- `school_pages`：所属教材/单元、`content_key`、印刷页码、中英标题、版本化 `sections` JSONB、练习提示和完成项。
- `school_content_items`：单词、句子、拼读和项目项；包含 `content_key`、英文、中文、音标及可选扩展属性。
- `school_page_items`：页面与内容项的有序关联，包含来源、角色、注释和顺序。
- `school_exercises`：所属课时或页面、阶段、题型、题干、标准答案、选项、提示及可选内容项关联。

`school_pages.sections` 只承载页面排版结构和句子引用，可搜索、需去重或会进入成长记录的词句必须存在 `school_content_items`，避免把所有内容塞进一个无法约束的 JSON 大字段。

### 课外内容

继续使用已有 `lf_episodes`、`lf_sentences`、`lf_vocab`和 `lf_knowledge`，但补齐线上展示所需字段：

- 四张表增加稳定 `content_key`。
- `lf_episodes` 增加中文标题、故事摘要、主题、理解问题、复述步骤和过去式配对等展示字段；媒体由 `media_provider` + `media_locator` 定位。
- `lf_sentences` 增加是否精选和稳定标识。
- `lf_knowledge` 增加示例数组和稳定标识。
- `lf_episodes.is_learned` 不再使用并从内容模型移除；是否学过始终由用户的 `learning_events` 派生。

现有三个本地动画内容包导入这些表，保留原 ID 作为 `content_key`。上线后前端不再 import `localExtraContent`。

### 权限和发布

- 匿名用户经 Supabase Auth 获得 `authenticated` 角色。
- `authenticated` 只能读取已发布教材、单元、页面、练习和课外内容。
- 内容创建、更新、发布与删除只授予 `service_role`，Secret Key 不进入 Web 环境。
- 内容导入先写入 `draft`，通过完整性校验后才切换为 `published`。前端永远看不到未完成的半批数据。

## 前端架构

### 统一内容仓库

新增 `ContentRepository` 接口，一次读取已发布的教材索引和课外索引，按需读取课本页、课时和动画详情。生产实现只有 `SupabaseContentRepository`。

`ContentProvider` 在身份建立后加载内容目录，与 `LearningDataProvider` 分工：

- `ContentProvider` 只处理全用户共享的已发布内容。
- `LearningDataProvider` 只处理当前用户的偏好、学习事件和旧数据导入。
- 进度派生函数通过显式 `ContentCatalog` 参数获取教材顺序和标题，不再 import 人教版四上模块。

内容加载或校验失败时显示可重试错误页。不读取静态 TypeScript 或本地 JSON 回退，不返回部分内容冒充成功。

### 组件与应用拆分

- 将 `App.tsx` 中内联的课外类型、API 适配器和路由辅助函数分别移到内容域和导航域。
- 校内组件仅接收仓库返回的 `Textbook`、`Unit`、`Lesson` 和 `Page` 模型，不 import 具体教材。
- 课外组件仅使用 Supabase 动画模型，答案判定使用当前已加载内容，结果仍写入 `learning_events`。
- 删除 Netlify hostname 特判、`hostedPreviewApi` 和“先请求 API、失败再读本地”的路径。

## 导入和版本管理

`content/` 下分为 `school/<textbook-key>/manifest.json` 和 `extra/<episode-key>/manifest.json`。每个内容包包含 `schema_version`、`content_version`、稳定 key 和完整子项。

管理端导入工具执行：

1. 使用严格模型校验 JSON、引用完整性、顺序冲突和重复 `content_key`。
2. 计算整包内容哈希；相同版本和哈希可安全跳过。
3. 在数据库事务中 upsert 完整内容树，新内容默认为 `draft`。
4. 校验记录数、所有引用和发布前条件，再显式发布。
5. 将结果写入 `content_import_jobs`，不记录 Secret Key 或本机绝对路径。

导入工具仅从管理员本机环境变量读取 Supabase URL 和 service-role Secret Key，不进入 Netlify、前端代码或 Git。

## 兼容性与清理

### 必须保留

- `legacyProgressImport` 保留为唯一可读取旧 localStorage 学习键的适配器，继续只读、幂等且不做运行时 fallback。
- 保留旧教材、页面、课时、动画和词句 ID 作为数据库 `content_key`。
- 保留学习事件的文字快照，不为新内容外键破坏历史事件。

### 必须删除或退役

- `localProgressRepository.ts` 和 `schoolProgressRepository.ts` 的可写 localStorage 实现及对应旧测试。
- `localExtraContent.ts`、`hostedPreview.ts` 及它们的运行时路径。
- Web 运行时对 `pepGrade4Upper*` 数据模块的直接 import。内容转换为导入包并进入 Supabase 后，旧模块删除。
- FastAPI `learning.py` 中的硬编码动画数据和内存进度状态。当前生产不依赖它们；API 保留健康检查骨架，未来服务端能力使用独立、显式的模块。
- `App.tsx` 中的内联域类型、压缩单行帮助函数和多重内容请求 fallback。

## 上线顺序

改造采用数据库先行的双阶段发布，但不进行双读或双写：

1. 在 Supabase 新增内容 schema 和 RLS，不改现网前端。
2. 导入现有人教版四上和三个课外动画，执行数量、引用和发布查询验收。
3. 部署只读 Supabase 内容的新前端。内容不完整时阻止进入，不回退旧内容。
4. 核对现网教材页数、课外动画、旧成长记录和新学习事件。
5. 验收通过后删除旧静态内容和 fallback 代码，保留可审计导入包。

由于新前端发布前数据库必须完成导入，数据库未就绪时不合并不部署。

## 错误处理

- 身份建立失败：保持现有线上学习档案错误页。
- 内容目录为空或关键引用缺失：显示内容服务错误页并允许重试。
- 单个详情不存在：返回到对应内容库并显示可理解的“内容暂未发布”提示。
- 练习写入失败：不更新派生成长数据，保留当前页和重试路径。
- 导入失败：事务回滚或保持 `draft`，不影响已发布版本。

## 测试和验收

### 自动测试

- SQL/pgTAP：表约束、稳定 key、外键、发布状态、RLS 和 service-role 写权限。
- 导入工具：合法内容包、重复 key、断裂引用、版本冲突、重复导入和日志脱敏。
- 内容仓库：映射、排序、发布过滤、页面/动画详情和错误传递。
- 进度派生：使用注入的 `ContentCatalog` 确定当前页、标题和下一内容，旧 `content_key` 事件继续正确。
- 组件：内容加载、校内学习、课外学习、成长记录和无 fallback 失败页。
- 静态契约：生产源码不存在 `localExtraContent`、`hostedPreviewApi` 或可写 localStorage 仓库引用；真实凭据不进入仓库。

### 数据验收

- 人教版四上为 6 个单元、72 个印刷页，顺序与当前网站一致。
- 现有三个课外动画及其词汇、句子、知识点和练习内容全部可查。
- 随机抽取教材页和动画，对比中英文、顺序、答案和提示。
- 现有用户的当前页、完成页、复习队列、已学动画和七日成长记录不变。
- 新完成一项校内或课外练习后，只新增 Supabase `learning_events`，不新增任何本地内容或进度记录。

## 成功标准

1. 将新年级内容包导入 Supabase 后，不修改 Web 代码即可在内容库中显示。
2. 关闭 Supabase 或删除已发布内容后，Web 明确报错而不展示写死备份。
3. 生产 Web bundle 不包含整册教材、完整动画文本或答案集。
4. 除 Supabase Auth 会话和一次性旧数据导入外，产品运行时不依赖 localStorage。
5. 旧成长记录与新内容通过稳定 `content_key` 正确关联。
6. 全量 Web、API、导入工具、SQL 契约、类型检查和生产构建全部通过。
