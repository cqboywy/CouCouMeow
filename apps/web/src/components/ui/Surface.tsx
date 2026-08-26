import type { PropsWithChildren } from 'react';

export function Surface({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <section className={`surface ${className}`.trim()}>{children}</section>;
}
