import type { PropsWithChildren } from 'react';
import { BrandMark } from '../brand/BrandMark';

type AppShellProps = PropsWithChildren<{
  variant?: 'classic' | 'motion';
  showHeader?: boolean;
}>;

export function AppShell({ children, variant = 'classic', showHeader = true }: AppShellProps) {
  return (
    <div className={`app-shell app-shell--${variant}`} data-ui={variant}>
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      {showHeader && <header className="app-shell__header"><BrandMark /></header>}
      <main className="app-shell__main" id="main-content">{children}</main>
    </div>
  );
}
