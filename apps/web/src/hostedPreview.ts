import { localExtraApi } from './extra/localExtraContent';

// Netlify 没有连接正式 API 时，沿用同一份完整的课外内容。
// 这样线上书架、离线回退和本地开发不会出现不同剧集或不同学习材料。
export function hostedPreviewApi(path: string, init?: RequestInit): unknown {
  return localExtraApi(path, init);
}
