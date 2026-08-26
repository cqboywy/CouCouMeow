# 内容入库指南

文件应按相同主文件名配对，例如 `episode-01.mp4` 与 `episode-01.srt`。先运行 `--dry-run` 检查字幕数量、文件配对和内容哈希。

批量模式只扫描指定目录，不递归整个 Level1–Level9 素材库。阶段 1 接入 DeepSeek 和 Supabase 后，批量结果仍只写 `draft`，必须人工确认后才改为 `published`。

本地路径、MP4、SRT 和密钥均被 Git 忽略。
