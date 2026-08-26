# 凑凑喵英语乐园阶段 0 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建立可启动、可测试、可部署的 React/FastAPI/Supabase 工程骨架，以及支持单集和批量预检的本地字幕入库工具。

**Architecture:** 前端、后端和本地入库工具位于同一 monorepo，但保持独立运行和部署。FastAPI 通过 OpenAPI 向 React 提供类型契约，Supabase 负责认证、数据库和 RLS；本地入库工具复用后端领域模型，但不把本地路径或服务端密钥暴露给前端。

**Tech Stack:** pnpm 11、Node.js 22+、React、Vite、TypeScript、Python 3.12、uv、FastAPI、Pydantic、pytest、Supabase PostgreSQL、Vitest、Testing Library、Playwright、GitHub Actions。

**Spec:** `docs/superpowers/specs/2026-08-26-foundation-design.md`

## Global Constraints

- 官方名称固定为“凑凑喵英语乐园 / CouCouMeow English Land”。
- Python 运行时固定为 3.12；Node.js 支持 22–26，CI 使用 Node.js 22。
- 网站是响应式 Web 应用，iPad 优先，同时完整支持手机和电脑浏览器。
- 阶段 0 不实现完整学习业务页面，不绑定真实 DeepSeek 或语音供应商。
- 本地 MP4、SRT、绝对路径、真实密钥和 `.env` 文件不得提交 Git。
- 网站只展示 `published` 内容；批量入库默认写入 `draft`，不能自动公开。
- 内容写入使用服务端角色；个人学习数据必须启用 RLS。
- UI 使用“凑凑喵的绘本乐园”方向，不用 Emoji 充当正式图标，不使用低质量角色占位图。
- 测试不得依赖真实 Supabase、DeepSeek 或语音服务密钥。
- 保留用户现有的未跟踪文件；只提交当前任务明确列出的文件。

---

## 文件职责图

```text
package.json / pnpm-workspace.yaml      根命令与 JS workspace
pyproject.toml / uv.lock                Python workspace 与锁文件
apps/web                                响应式 React 客户端
apps/api                                FastAPI、领域契约与 HTTP API
tools/content_importer                  本地字幕解析和入库命令
packages/api-client                     OpenAPI 生成类型与调用封装
supabase/migrations                     数据表、索引、函数与 RLS
supabase/tests                          数据库结构和权限测试
scripts                                 可重复的生成与验证命令
.github/workflows                       持续集成
docs/architecture                       架构、数据和 UI 说明
docs/development                        开发、部署和入库操作说明
```

---

### Task 1: Monorepo 与 React 前端基础

**Files:**
- Create: `.gitignore`
- Create: `.editorconfig`
- Create: `.node-version`
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `pyproject.toml`
- Create: `apps/web/package.json`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/tsconfig.app.json`
- Create: `apps/web/vite.config.ts`
- Create: `apps/web/index.html`
- Create: `apps/web/src/main.tsx`
- Create: `apps/web/src/App.tsx`
- Create: `apps/web/src/test/setup.ts`
- Test: `apps/web/src/App.test.tsx`

**Interfaces:**
- Consumes: 无。
- Produces: 根命令 `pnpm dev:web`、`pnpm test:web`、`pnpm typecheck:web`、`pnpm build:web`；React 根组件 `App(): JSX.Element`。

- [ ] **Step 1: 写前端启动壳的失败测试**

```tsx
// apps/web/src/App.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the official product names', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: '凑凑喵英语乐园' })).toBeInTheDocument();
    expect(screen.getByText('CouCouMeow English Land')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 创建 workspace 配置并安装前端测试依赖**

根 `package.json` 必须包含：

```json
{
  "name": "coucoumeow-english-land",
  "private": true,
  "packageManager": "pnpm@11.19.0",
  "engines": { "node": ">=22 <27" },
  "scripts": {
    "dev:web": "pnpm --filter @coucoumeow/web dev",
    "test:web": "pnpm --filter @coucoumeow/web test",
    "typecheck:web": "pnpm --filter @coucoumeow/web typecheck",
    "build:web": "pnpm --filter @coucoumeow/web build"
  }
}
```

`pnpm-workspace.yaml`：

```yaml
packages:
  - apps/web
  - packages/*
```

运行：`pnpm --dir apps/web add react react-dom && pnpm --dir apps/web add -D typescript vite @vitejs/plugin-react vitest jsdom @testing-library/react @testing-library/jest-dom @types/react @types/react-dom`

- [ ] **Step 3: 运行测试并确认因 `App` 不存在而失败**

Run: `pnpm test:web -- --run`

Expected: FAIL，错误包含 `Failed to resolve import "./App"` 或 `App` 未导出。

- [ ] **Step 4: 实现最小 React 启动壳**

```tsx
// apps/web/src/App.tsx
export function App() {
  return (
    <main>
      <h1>凑凑喵英语乐园</h1>
      <p lang="en">CouCouMeow English Land</p>
    </main>
  );
}
```

`vite.config.ts` 配置 React 插件和 `jsdom` 测试环境；`src/test/setup.ts` 导入 `@testing-library/jest-dom/vitest`；`src/main.tsx` 使用 `createRoot` 渲染 `App`。

- [ ] **Step 5: 添加仓库忽略与运行时配置**

`.gitignore` 必须覆盖：

```gitignore
node_modules/
dist/
.venv/
__pycache__/
.pytest_cache/
.ruff_cache/
.env
.env.*
!.env.example
*.mp4
*.srt
.superpowers/
.DS_Store
docs/.~*
```

`.node-version` 写入 `22`；根 `pyproject.toml` 先声明 Python 3.12 uv workspace，成员为 `apps/api` 和 `tools/content_importer`。

- [ ] **Step 6: 验证前端基础**

Run: `pnpm test:web -- --run && pnpm typecheck:web && pnpm build:web`

Expected: 三条检查全部成功，Vite 输出 `apps/web/dist`。

- [ ] **Step 7: 提交任务 1**

```bash
git add .gitignore .editorconfig .node-version package.json pnpm-workspace.yaml pyproject.toml pnpm-lock.yaml apps/web
git commit -m "chore: scaffold monorepo and web app"
```

---

### Task 2: FastAPI 健康检查与统一错误结构

**Files:**
- Create: `apps/api/pyproject.toml`
- Create: `apps/api/src/coucoumeow_api/__init__.py`
- Create: `apps/api/src/coucoumeow_api/main.py`
- Create: `apps/api/src/coucoumeow_api/api/router.py`
- Create: `apps/api/src/coucoumeow_api/api/routes/health.py`
- Create: `apps/api/src/coucoumeow_api/api/errors.py`
- Create: `apps/api/src/coucoumeow_api/config.py`
- Create: `apps/api/tests/conftest.py`
- Test: `apps/api/tests/test_health.py`
- Test: `apps/api/tests/test_errors.py`

**Interfaces:**
- Consumes: 根 uv workspace。
- Produces: `create_app() -> FastAPI`；`GET /api/v1/health` 返回 `HealthResponse`；`ApiError` 返回稳定错误代码和追踪 ID。

- [ ] **Step 1: 写健康检查失败测试**

```python
from fastapi.testclient import TestClient

from coucoumeow_api.main import create_app


def test_health_check_returns_service_status() -> None:
    response = TestClient(create_app()).get("/api/v1/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "coucoumeow-api",
        "version": "0.1.0",
    }
```

- [ ] **Step 2: 声明 API 依赖并同步 Python 3.12 环境**

`apps/api/pyproject.toml` 声明 `fastapi`、`pydantic-settings`、`uvicorn`，开发依赖声明 `httpx`、`pytest`、`pytest-cov`、`ruff`、`mypy`。运行：`uv sync --all-packages --dev --python 3.12`。

- [ ] **Step 3: 运行测试并确认导入失败**

Run: `uv run --package coucoumeow-api pytest apps/api/tests/test_health.py -q`

Expected: FAIL，错误包含 `No module named 'coucoumeow_api.main'`。

- [ ] **Step 4: 实现健康检查和应用工厂**

```python
class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
    service: str = "coucoumeow-api"
    version: str = "0.1.0"


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse()
```

`create_app()` 设置官方英文名、版本 `0.1.0`，并把 API router 挂载到 `/api/v1`。

- [ ] **Step 5: 写统一错误响应失败测试**

```python
def test_api_error_contains_safe_message_and_trace_id(client: TestClient) -> None:
    response = client.get("/api/v1/testing/error")
    body = response.json()
    assert response.status_code == 503
    assert body["code"] == "SERVICE_UNAVAILABLE"
    assert body["message"] == "小鱼干暂时迷路啦，我们稍后再试。"
    assert len(body["trace_id"]) >= 16
```

- [ ] **Step 6: 实现 `ApiError` 与异常处理器**

```python
class ErrorResponse(BaseModel):
    code: str
    message: str
    trace_id: str


class ApiError(Exception):
    def __init__(self, status_code: int, code: str, message: str) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message
```

异常处理器使用 `secrets.token_hex(8)` 生成追踪 ID，不把原始异常内容写入响应。

- [ ] **Step 7: 验证后端基础**

Run: `uv run --package coucoumeow-api pytest apps/api/tests -q && uv run ruff check apps/api && uv run mypy apps/api/src`

Expected: 全部成功。

- [ ] **Step 8: 提交任务 2**

```bash
git add pyproject.toml uv.lock apps/api
git commit -m "feat: add FastAPI service foundation"
```

---

### Task 3: 内容生成与语音转写领域契约

**Files:**
- Create: `apps/api/src/coucoumeow_api/domain/content.py`
- Create: `apps/api/src/coucoumeow_api/domain/speech.py`
- Create: `apps/api/src/coucoumeow_api/ports/content_generator.py`
- Create: `apps/api/src/coucoumeow_api/ports/speech_transcriber.py`
- Create: `apps/api/src/coucoumeow_api/adapters/fakes/content_generator.py`
- Create: `apps/api/src/coucoumeow_api/adapters/fakes/speech_transcriber.py`
- Test: `apps/api/tests/domain/test_content_contract.py`
- Test: `apps/api/tests/domain/test_speech_contract.py`

**Interfaces:**
- Consumes: Pydantic。
- Produces: `ContentGenerator.generate(request: ContentGenerationRequest) -> GeneratedEpisodeContent`；`SpeechTranscriber.transcribe(audio: bytes, content_type: str) -> TranscriptionResult`。

- [ ] **Step 1: 写内容契约失败测试**

```python
def test_generated_episode_requires_sentences_vocab_and_knowledge() -> None:
    content = GeneratedEpisodeContent.model_validate(
        {
            "sentences": [{"sequence_no": 1, "english_text": "Hello, Cat!", "chinese_translation": "你好，小猫！"}],
            "vocab": [{"sequence_no": 1, "word": "hello", "phonetic": "/həˈləʊ/", "chinese_meaning": "你好"}],
            "knowledge": [{"sequence_no": 1, "title": "问候", "grammar_explanation": "Hello 用于问候。", "core_knowledge": "使用 Hello 打招呼。"}],
        }
    )
    assert content.sentences[0].english_text == "Hello, Cat!"
```

- [ ] **Step 2: 写语音契约失败测试**

```python
@pytest.mark.asyncio
async def test_fake_transcriber_returns_deterministic_result() -> None:
    transcriber = FakeSpeechTranscriber(transcript="I like cats.")
    result = await transcriber.transcribe(b"audio", "audio/webm")
    assert result.transcript == "I like cats."
    assert result.confidence == 1.0
    assert result.provider == "fake"
```

- [ ] **Step 3: 运行领域测试并确认失败**

Run: `uv run --package coucoumeow-api pytest apps/api/tests/domain -q`

Expected: FAIL，领域模型和端口尚不存在。

- [ ] **Step 4: 实现内容 Pydantic 模型**

创建 `SentenceContent`、`VocabContent`、`KnowledgeContent`、`ContentGenerationRequest` 和 `GeneratedEpisodeContent`。所有文本使用 `min_length=1`，`sequence_no` 使用 `ge=1`，`level` 使用 `ge=1, le=9`。

- [ ] **Step 5: 实现异步 Protocol 与确定性测试替身**

```python
class SpeechTranscriber(Protocol):
    async def transcribe(self, audio: bytes, content_type: str) -> TranscriptionResult:
        raise NotImplementedError


class ContentGenerator(Protocol):
    async def generate(self, request: ContentGenerationRequest) -> GeneratedEpisodeContent:
        raise NotImplementedError
```

Fake 实现只返回构造函数注入的固定结果，不读取环境变量或调用网络。

- [ ] **Step 6: 验证领域契约**

Run: `uv run --package coucoumeow-api pytest apps/api/tests/domain -q && uv run mypy apps/api/src`

Expected: 全部成功，Protocol 类型检查通过。

- [ ] **Step 7: 提交任务 3**

```bash
git add apps/api/src/coucoumeow_api/domain apps/api/src/coucoumeow_api/ports apps/api/src/coucoumeow_api/adapters apps/api/tests/domain
git commit -m "feat: define AI and speech provider contracts"
```

---

### Task 4: Supabase 初始数据库、事务函数与 RLS

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/20260826000100_initial_schema.sql`
- Test: `supabase/tests/001_schema.test.sql`
- Test: `supabase/tests/002_rls.test.sql`
- Create: `supabase/seed.sql`

**Interfaces:**
- Consumes: Supabase Auth `auth.users.id`。
- Produces: 4 张固定内容表、4 张学习表、`content_import_jobs`、必要枚举和索引；`replace_episode_content(p_episode_id uuid, p_content_hash text, p_sentences jsonb, p_vocab jsonb, p_knowledge jsonb)` 原子替换函数；完整 RLS。

- [ ] **Step 1: 写数据库结构失败测试**

```sql
begin;
select plan(9);
select has_table('public', 'lf_episodes');
select has_table('public', 'lf_sentences');
select has_table('public', 'lf_vocab');
select has_table('public', 'lf_knowledge');
select has_table('public', 'profiles');
select has_table('public', 'practice_sessions');
select has_table('public', 'practice_attempts');
select has_table('public', 'mistake_items');
select has_table('public', 'content_import_jobs');
select * from finish();
rollback;
```

- [ ] **Step 2: 初始化 Supabase 配置并确认测试失败**

Run: `pnpm dlx supabase@latest start`，随后运行 `pnpm dlx supabase@latest test db`

Expected: FAIL，9 张表均不存在。

- [ ] **Step 3: 创建枚举和 4 张内容表**

迁移必须创建 `content_status`、`practice_type`、`mistake_type`、`mastery_status` 枚举，并按规格创建：

```sql
create table public.lf_episodes (
  id uuid primary key default gen_random_uuid(),
  level smallint not null check (level between 1 and 9),
  title text not null check (length(btrim(title)) > 0),
  local_video_filename text not null,
  local_srt_filename text not null,
  is_learned boolean not null default false,
  content_status public.content_status not null default 'draft',
  content_hash text not null,
  media_provider text not null default 'local',
  media_locator text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(level, local_video_filename)
);
```

`lf_sentences` 对 `(episode_id, sequence_no)` 唯一；`lf_vocab` 增加 `normalized_word` 并对 `(episode_id, normalized_word)` 唯一；`lf_knowledge` 对 `(episode_id, sequence_no)` 唯一。三个子表删除剧集时级联删除。

- [ ] **Step 4: 创建学习表和系统表**

`profiles.id` 引用 `auth.users(id)`；`practice_sessions` 同时引用用户和剧集；`practice_attempts` 使用检查约束保证 `vocab_id` 与 `sentence_id` 恰好一个非空；`mistake_items` 使用两个部分唯一索引分别约束用户错词和错句；`content_import_jobs` 只保存文件名、哈希、状态与安全错误摘要。

- [ ] **Step 5: 创建事务替换函数**

`replace_episode_content(p_episode_id uuid, p_content_hash text, p_sentences jsonb, p_vocab jsonb, p_knowledge jsonb)` 必须：锁定剧集行、删除旧子项、插入三类新内容、更新哈希与状态为 `validated`，任何一步失败则整笔回滚。执行权限只授予 `service_role`。

- [ ] **Step 6: 创建 RLS 策略和列级权限**

```sql
alter table public.lf_episodes enable row level security;
create policy "authenticated users read published episodes"
on public.lf_episodes for select to authenticated
using (content_status = 'published');

alter table public.profiles enable row level security;
create policy "users read own profile"
on public.profiles for select to authenticated
using (id = auth.uid());
```

其余内容子表只允许读取所属 `published` 剧集；学习表使用 `user_id = auth.uid()`；`content_import_jobs` 不向 `authenticated` 授权。`is_learned` 只能通过后端受限接口更新，前端不获得内容表 UPDATE 权限。

- [ ] **Step 7: 写并运行 RLS 测试**

测试创建两个 auth 用户，分别设置 JWT subject，证明用户 A 可以读取自己的 profile/session/mistake，不能读取用户 B 数据；登录用户能读取 published 内容，不能读取 draft 内容；authenticated 不能插入内容和 import job。

Run: `pnpm dlx supabase@latest db reset && pnpm dlx supabase@latest test db`

Expected: schema 与 RLS 测试全部通过。

- [ ] **Step 8: 添加虚构 seed 数据**

`seed.sql` 只添加一集虚构内容：“Level 1 / The Sleepy Cat”，不包含 Little Fox 台词、真实文件路径或受版权保护素材。

- [ ] **Step 9: 提交任务 4**

```bash
git add supabase
git commit -m "feat: add Supabase schema and RLS policies"
```

---

### Task 5: 单集与批量字幕入库工具

**Files:**
- Create: `tools/content_importer/pyproject.toml`
- Create: `tools/content_importer/src/coucoumeow_importer/__init__.py`
- Create: `tools/content_importer/src/coucoumeow_importer/models.py`
- Create: `tools/content_importer/src/coucoumeow_importer/srt_parser.py`
- Create: `tools/content_importer/src/coucoumeow_importer/discovery.py`
- Create: `tools/content_importer/src/coucoumeow_importer/hashing.py`
- Create: `tools/content_importer/src/coucoumeow_importer/repository.py`
- Create: `tools/content_importer/src/coucoumeow_importer/runner.py`
- Create: `tools/content_importer/src/coucoumeow_importer/cli.py`
- Test: `tools/content_importer/tests/fixtures/level1/the-sleepy-cat.srt`
- Test: `tools/content_importer/tests/test_srt_parser.py`
- Test: `tools/content_importer/tests/test_discovery.py`
- Test: `tools/content_importer/tests/test_runner.py`

**Interfaces:**
- Consumes: `ContentGenerationRequest`、`GeneratedEpisodeContent`、`ContentGenerator`。
- Produces: `parse_srt(path: Path) -> list[CleanSentence]`；`discover_pairs(directory: Path) -> DiscoveryResult`；`run_single(level, pair, dry_run, generator, repository) -> ImportResult`；`run_batch(level, directory, dry_run, generator, repository) -> BatchImportResult`；CLI 命令 `single` 和 `batch`。

- [ ] **Step 1: 写 SRT 清洗失败测试**

```python
def test_parse_srt_removes_timing_markup_and_duplicates(fixture_dir: Path) -> None:
    result = parse_srt(fixture_dir / "the-sleepy-cat.srt")
    assert [item.text for item in result] == [
        "The cat is sleepy.",
        "Good night, little cat.",
    ]
    assert [item.sequence_no for item in result] == [1, 2]
```

测试 SRT 包含时间轴、HTML 标签、连续重复行和空白行，文本为完全虚构内容。

- [ ] **Step 2: 写媒体配对失败测试**

```python
def test_discover_pairs_matches_same_stem_and_reports_missing_video(tmp_path: Path) -> None:
    (tmp_path / "episode-01.srt").write_text("1\n00:00:00,000 --> 00:00:01,000\nHello.\n", encoding="utf-8")
    (tmp_path / "episode-01.mp4").touch()
    (tmp_path / "episode-02.srt").write_text("", encoding="utf-8")
    result = discover_pairs(tmp_path)
    assert [pair.stem for pair in result.pairs] == ["episode-01"]
    assert result.errors[0].code == "MISSING_VIDEO"
```

- [ ] **Step 3: 安装工具依赖并确认测试失败**

`tools/content_importer/pyproject.toml` 声明 workspace 依赖 `coucoumeow-api`，运行时依赖 `srt`、`typer`，测试依赖 `pytest`。运行 `uv sync --all-packages --dev --python 3.12`。

Run: `uv run --package coucoumeow-content-importer pytest tools/content_importer/tests -q`

Expected: FAIL，解析器和发现函数尚不存在。

- [ ] **Step 4: 实现字幕解析、清洗和稳定哈希**

解析器使用 `srt.parse`，按字幕顺序去除 HTML 标签、合并内部空白、忽略空句，并只去除连续重复句。哈希函数对 `"\n".join(sentence.text for sentence in sentences)` 计算 SHA-256。

- [ ] **Step 5: 实现单集和批量 runner**

```python
@dataclass(frozen=True)
class ImportResult:
    stem: str
    status: Literal["dry_run", "draft", "skipped", "needs_review", "failed"]
    sentence_count: int
    content_hash: str
    error_code: str | None = None


async def run_single(
    *, level: int, pair: MediaPair, dry_run: bool,
    generator: ContentGenerator, repository: ContentRepository,
) -> ImportResult:
    sentences = parse_srt(pair.srt_path)
    content_hash = hash_sentences(sentences)
    if dry_run:
        return ImportResult(pair.stem, "dry_run", len(sentences), content_hash)

    existing = await repository.find_episode(level, pair.video_path.name)
    if existing and existing.content_hash == content_hash:
        return ImportResult(pair.stem, "skipped", len(sentences), content_hash)
    if existing:
        return ImportResult(pair.stem, "needs_review", len(sentences), content_hash)

    request = ContentGenerationRequest(
        level=level,
        title=pair.stem,
        sentences=[item.text for item in sentences],
    )
    generated = await generator.generate(request)
    await repository.save_draft(pair=pair, content_hash=content_hash, content=generated)
    return ImportResult(pair.stem, "draft", len(sentences), content_hash)


@dataclass(frozen=True)
class BatchImportResult:
    results: tuple[ImportResult, ...]
    discovery_errors: tuple[DiscoveryError, ...]


async def run_batch(
    *, level: int, directory: Path, dry_run: bool,
    generator: ContentGenerator, repository: ContentRepository,
) -> BatchImportResult:
    discovery = discover_pairs(directory)
    results: list[ImportResult] = []
    for pair in discovery.pairs:
        try:
            result = await run_single(
                level=level, pair=pair, dry_run=dry_run,
                generator=generator, repository=repository,
            )
        except (OSError, ValueError, SrtParseError, ContentGenerationError) as error:
            result = ImportResult(
                pair.stem, "failed", 0, "", error_code=type(error).__name__
            )
        results.append(result)
    return BatchImportResult(tuple(results), tuple(discovery.errors))
```

`ContentRepository` 定义两个异步方法：`find_episode(level: int, video_filename: str) -> ExistingEpisode | None` 和 `save_draft(pair: MediaPair, content_hash: str, content: GeneratedEpisodeContent) -> UUID`。阶段 0 提供内存测试实现；真实 Supabase 写入适配器在阶段 1 的入库发布任务中实现。

`models.py` 同时定义 `SrtParseError(ValueError)` 和 `ContentGenerationError(RuntimeError)`，分别包装不可解析字幕与内容生成失败，使批量 runner 只捕获已知的单集错误。

`dry_run=True` 时只解析、验证和计算哈希，不调用生成器、不写数据库。批量 runner 按文件名稳定排序，捕获单集异常并继续处理下一集。

- [ ] **Step 6: 写 runner 行为测试**

测试证明：dry-run 不调用 repository；已存在相同哈希返回 `skipped`；单集生成失败只产生一个 `failed` 结果；batch 中下一集仍继续；所有新内容状态为 `draft`。

- [ ] **Step 7: 实现 Typer CLI**

```text
coucou-import single --level 1 --srt /path/episode.srt --video-file episode.mp4 --dry-run
coucou-import batch --level 1 --directory /path/Level1 --dry-run
```

CLI 验证 Level 1–9、文件存在、扩展名和 MP4/SRT 配对。批量非 dry-run 模式要求显式传入 `--confirm-write-drafts`，仍然只写 `draft`。

- [ ] **Step 8: 验证入库工具**

Run: `uv run --package coucoumeow-content-importer pytest tools/content_importer/tests -q && uv run ruff check tools/content_importer`

Expected: 全部成功。

- [ ] **Step 9: 提交任务 5**

```bash
git add pyproject.toml uv.lock tools/content_importer
git commit -m "feat: add safe single and batch content importer"
```

---

### Task 6: OpenAPI TypeScript 客户端与前后端连通

**Files:**
- Modify: `package.json`
- Modify: `apps/web/package.json`
- Create: `packages/api-client/package.json`
- Create: `packages/api-client/tsconfig.json`
- Create: `packages/api-client/src/generated/schema.d.ts`
- Create: `packages/api-client/src/client.ts`
- Create: `packages/api-client/src/health.ts`
- Create: `scripts/export-openapi.py`
- Create: `scripts/generate-api-client.sh`
- Modify: `apps/web/src/App.tsx`
- Test: `packages/api-client/src/health.test.ts`
- Test: `apps/web/src/App.test.tsx`

**Interfaces:**
- Consumes: `GET /api/v1/health` OpenAPI schema。
- Produces: `createApiClient(baseUrl: string)`；`getHealth(client) -> Promise<HealthResponse>`；根命令 `pnpm generate:api`。

- [ ] **Step 1: 写客户端失败测试**

```ts
it('reads the typed health payload', async () => {
  const fetcher = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ status: 'ok', service: 'coucoumeow-api', version: '0.1.0' }),
  });
  const health = await getHealth(createApiClient('http://api.test', fetcher));
  expect(health.status).toBe('ok');
  expect(fetcher).toHaveBeenCalledWith('http://api.test/api/v1/health', expect.any(Object));
});
```

- [ ] **Step 2: 添加 `openapi-typescript` 并确认测试失败**

Run: `pnpm add -Dw openapi-typescript && pnpm --filter @coucoumeow/api-client test -- --run`

Expected: FAIL，客户端函数尚不存在。

- [ ] **Step 3: 实现可重复的 schema 导出与生成脚本**

`scripts/export-openapi.py` 导入 `create_app()` 并把排序后的 OpenAPI JSON 写到标准输出。`scripts/generate-api-client.sh` 使用临时文件生成 schema，只有内容变化时才替换目标文件。根命令固定为：

```json
"generate:api": "bash scripts/generate-api-client.sh"
```

- [ ] **Step 4: 实现类型化客户端**

客户端默认使用全局 `fetch`，允许测试注入 fetcher；非 2xx 响应解析 `ErrorResponse` 并抛出 `ApiClientError`，不把原始响应体直接显示给孩子。

- [ ] **Step 5: 在前端启动壳显示 API 状态**

`App` 初始显示“正在叫醒凑凑喵…”，成功显示“学习服务已准备好”，失败显示“小鱼干暂时迷路啦，我们稍后再试。”。API URL 读取 `VITE_API_BASE_URL`，默认开发值为 `http://localhost:8000`。

- [ ] **Step 6: 验证生成结果和前端测试**

Run: `pnpm generate:api && pnpm generate:api && git diff --exit-code packages/api-client/src/generated/schema.d.ts && pnpm test:web -- --run && pnpm --filter @coucoumeow/api-client test -- --run`

Expected: 连续生成两次无差异，客户端和前端测试通过。

- [ ] **Step 7: 提交任务 6**

```bash
git add package.json pnpm-lock.yaml apps/web packages/api-client scripts/export-openapi.py scripts/generate-api-client.sh
git commit -m "feat: connect web app through generated API client"
```

---

### Task 7: 猫咪主题设计令牌与响应式基础组件

**Files:**
- Create: `apps/web/src/styles/tokens.css`
- Create: `apps/web/src/styles/global.css`
- Create: `apps/web/src/components/ui/Button.tsx`
- Create: `apps/web/src/components/ui/Surface.tsx`
- Create: `apps/web/src/components/brand/BrandMark.tsx`
- Create: `apps/web/src/components/layout/AppShell.tsx`
- Modify: `apps/web/src/main.tsx`
- Modify: `apps/web/src/App.tsx`
- Test: `apps/web/src/components/ui/Button.test.tsx`
- Test: `apps/web/src/components/layout/AppShell.test.tsx`

**Interfaces:**
- Consumes: 阶段 0 的 API 状态。
- Produces: CSS 设计令牌；`Button`、`Surface`、`BrandMark`、`AppShell`；手机、iPad、电脑响应式启动页。

- [ ] **Step 1: 写按钮可访问性失败测试**

```tsx
it('renders a large accessible primary action', () => {
  render(<Button>开始学习</Button>);
  const button = screen.getByRole('button', { name: '开始学习' });
  expect(button).toHaveClass('button', 'button--primary');
  expect(button).not.toHaveAttribute('aria-disabled', 'true');
});
```

- [ ] **Step 2: 写 AppShell 语义失败测试**

```tsx
it('provides one main landmark and the official brand', () => {
  render(<AppShell><p>内容</p></AppShell>);
  expect(screen.getAllByRole('main')).toHaveLength(1);
  expect(screen.getByText('凑凑喵英语乐园')).toBeInTheDocument();
});
```

- [ ] **Step 3: 运行组件测试并确认失败**

Run: `pnpm test:web -- --run src/components`

Expected: FAIL，组件尚不存在。

- [ ] **Step 4: 建立设计令牌**

```css
:root {
  --color-cream: #fff9f2;
  --color-peach: #f5b8b2;
  --color-milk-blue: #cfe7f5;
  --color-lavender: #ddd4f4;
  --color-ink: #514659;
  --color-success: #b9dfcb;
  --color-gentle-error: #f2ceb4;
  --radius-card: 24px;
  --radius-button: 18px;
  --touch-min: 48px;
  --control-primary-height: 52px;
  --motion-fast: 150ms;
  --motion-gentle: 300ms;
}
```

CSS 同时定义可见焦点、`prefers-reduced-motion: reduce`、手机单列、iPad 舒适宽度和电脑最大内容宽度。正文最小 16px。

- [ ] **Step 5: 实现基础组件**

先运行 `pnpm --dir apps/web add lucide-react`。`Button` 支持 `primary` 和 `secondary` 两种视觉层级；`Surface` 只用于独立内容分组，禁止嵌套卡片；`BrandMark` 使用 Lucide 的 `Cat` 图标和文字，不使用 Emoji；`AppShell` 提供 skip link、header 和唯一 main landmark。

- [ ] **Step 6: 更新启动页但不实现阶段 1 首页**

启动页只包含品牌、阶段 0 说明、服务状态和一个禁用的“学习内容准备中”按钮，不伪造剧集列表、统计或业务导航。

- [ ] **Step 7: 验证响应式与无障碍基础**

Run: `pnpm test:web -- --run && pnpm typecheck:web && pnpm build:web`

Expected: 全部成功。手动启动后在 390px、834px、1194px 和 1440px 宽度确认无横向滚动，键盘 Tab 能看到清晰焦点。

- [ ] **Step 8: 提交任务 7**

```bash
git add apps/web package.json pnpm-lock.yaml
git commit -m "feat: add responsive CouCouMeow design foundation"
```

---

### Task 8: CI、容器、环境模板与操作文档

**Files:**
- Create: `.env.example`
- Create: `apps/web/.env.example`
- Create: `apps/api/.env.example`
- Create: `apps/api/Dockerfile`
- Create: `apps/web/Dockerfile`
- Create: `compose.yaml`
- Create: `.github/workflows/ci.yml`
- Create: `scripts/verify.sh`
- Create: `README.md`
- Create: `docs/architecture/system-overview.md`
- Create: `docs/architecture/database-design.md`
- Create: `docs/architecture/content-import-pipeline.md`
- Create: `docs/architecture/ui-design-system.md`
- Create: `docs/development/local-setup.md`
- Create: `docs/development/deployment.md`
- Create: `docs/development/content-import-guide.md`
- Test: `apps/api/tests/test_config.py`

**Interfaces:**
- Consumes: 所有前序任务的命令和环境变量。
- Produces: `bash scripts/verify.sh` 全量验证入口；本地容器启动方式；完整中文操作文档。

- [ ] **Step 1: 写配置安全失败测试**

```python
def test_production_rejects_missing_server_secrets(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.delenv("SUPABASE_SERVICE_ROLE_KEY", raising=False)
    with pytest.raises(ValueError, match="SUPABASE_SERVICE_ROLE_KEY"):
        Settings()
```

- [ ] **Step 2: 定义环境变量模板和配置验证**

根 `.env.example` 说明变量用途；前端只包含 `VITE_API_BASE_URL` 和 Supabase 公共 URL/匿名密钥；后端包含 `APP_ENV`、`CORS_ORIGINS`、`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`、`DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL` 和 `SPEECH_PROVIDER`。示例值必须明显无效，不得包含真实凭据。

- [ ] **Step 3: 创建容器配置**

API Dockerfile 使用 Python 3.12 slim 多阶段构建并以非 root 用户运行；Web Dockerfile 使用 Node 22 构建并由非 root Nginx 提供静态文件；`compose.yaml` 只编排 web 与 api，不在仓库内模拟云端 Supabase。

- [ ] **Step 4: 创建全量验证脚本**

```bash
#!/usr/bin/env bash
set -euo pipefail
pnpm test:web -- --run
pnpm typecheck:web
pnpm build:web
pnpm --filter @coucoumeow/api-client test -- --run
uv run pytest apps/api/tests tools/content_importer/tests -q
uv run ruff check apps/api tools/content_importer
uv run mypy apps/api/src
```

- [ ] **Step 5: 创建 GitHub Actions**

CI 使用 Node 22、pnpm 11 和 Python 3.12；缓存 pnpm store 与 uv；执行 `pnpm install --frozen-lockfile`、`uv sync --all-packages --dev --frozen`、`pnpm generate:api` 和 `bash scripts/verify.sh`。数据库测试放在独立 job，通过 Supabase CLI 和 Docker 执行。

- [ ] **Step 6: 编写中文操作文档**

README 提供 10 分钟快速启动路径；架构文档解释边界、表关系、入库状态机和 UI 令牌；开发文档给出本地安装、迁移、single/batch dry-run、批量草稿确认、Vercel/Railway/Render/Supabase 部署和密钥放置位置。所有命令必须可复制执行。

- [ ] **Step 7: 运行全量验证**

Run: `bash scripts/verify.sh`

Expected: 前端、API、客户端和 importer 的格式、类型、测试与构建全部成功。

Run: `docker compose config`

Expected: 配置解析成功且不需要真实密钥。

Run: `pnpm dlx supabase@latest test db`

Expected: schema 与 RLS 测试全部通过。

- [ ] **Step 8: 检查仓库安全与路径可移植性**

Run: `git grep -nE '/Users/|SUPABASE_SERVICE_ROLE_KEY=.+|DEEPSEEK_API_KEY=.+' -- ':!docs/superpowers/plans/*'`

Expected: 无输出。

Run: `git status --short`

Expected: 只显示用户原有且未被本计划纳入的文件；实现文件均已暂存或提交。

- [ ] **Step 9: 提交任务 8**

```bash
git add .env.example apps/web/.env.example apps/api/.env.example apps/api/Dockerfile apps/web/Dockerfile compose.yaml .github scripts README.md docs/architecture docs/development
git commit -m "chore: add CI deployment and project documentation"
```

---

## 最终验收

- [ ] 运行 `bash scripts/verify.sh`，确认全部检查成功。
- [ ] 运行 `pnpm dlx supabase@latest test db`，确认数据库与 RLS 测试成功。
- [ ] 运行 `docker compose config`，确认容器配置有效。
- [ ] 启动 API 与 Web，确认浏览器显示官方名称及“学习服务已准备好”。
- [ ] 在手机、iPad 竖屏、iPad 横屏和电脑宽度检查布局与键盘焦点。
- [ ] 运行 importer 的 single dry-run 与 batch dry-run，确认不会调用外部服务或写数据库。
- [ ] 检查 Git 历史，确认每个任务有独立提交且没有纳入真实素材、密钥、`.DS_Store`、`.superpowers` 或编辑器临时文件。
