import { createApiClient, getHealth } from '@coucoumeow/api-client';
import { Fish, PawPrint } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { Button } from './components/ui/Button';
import { Surface } from './components/ui/Surface';

type ServiceState = 'loading' | 'ready' | 'error';

export function App() {
  const [serviceState, setServiceState] = useState<ServiceState>('loading');

  useEffect(() => {
    let active = true;
    const api = createApiClient(import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000');
    getHealth(api)
      .then(() => { if (active) setServiceState('ready'); })
      .catch(() => { if (active) setServiceState('error'); });
    return () => { active = false; };
  }, []);

  return (
    <AppShell>
      <div className="hero">
        <div>
          <p className="hero__eyebrow"><PawPrint size={20} aria-hidden="true" /> 温柔陪伴，每天进步一点点</p>
          <h2>今天和凑凑喵学什么？</h2>
          <p className="hero__description">看完本地动画后，来这里复习台词、单词和句型。答错也没关系，凑凑喵会陪你再试一次。</p>
          <div className="hero__actions">
            <Button disabled>学习内容准备中</Button>
            <Button variant="secondary" disabled>查看今日复习</Button>
          </div>
          <p className={`status status--${serviceState}`} role="status">
            {serviceState === 'loading' && '正在叫醒凑凑喵…'}
            {serviceState === 'ready' && '学习服务已准备好'}
            {serviceState === 'error' && '小鱼干暂时迷路啦，我们稍后再试。'}
          </p>
        </div>
        <Surface className="hero__aside">
          <h2>本地动画小提醒</h2>
          <p className="reminder"><Fish size={24} aria-hidden="true" /><span>请先在电脑本地观看对应动画，再回来完成本集练习。</span></p>
        </Surface>
      </div>
    </AppShell>
  );
}
