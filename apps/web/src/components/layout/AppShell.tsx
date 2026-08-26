import type { PropsWithChildren } from 'react';
import { BrandMark } from '../brand/BrandMark';

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <header className="app-shell__header"><BrandMark /></header>
      <main className="app-shell__main" id="main-content">{children}</main>
    </div>
  );
}
