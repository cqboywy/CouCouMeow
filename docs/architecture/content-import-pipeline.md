# 内容入库流水线

```text
发现 MP4/SRT 配对 → 清洗字幕 → 计算 SHA-256 → 查重 → AI 生成 → Pydantic 校验 → draft → 人工发布
```

阶段 0 实现前四步的本地 `--dry-run`。`single` 处理一集，`batch` 按文件名稳定排序处理目录；缺少视频会被报告，连续重复字幕会被去除。真实 AI 与 Supabase 写入在阶段 1 配置。

