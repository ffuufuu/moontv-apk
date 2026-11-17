'use client';

import { useEffect, useState } from 'react';

import NovaMobileAdmin from './NovaMobileAdmin';

/**
 * 手机端进入 /admin 时先展示卡片式管理首页，点任一入口后进入原有后台。
 * 桌面端不做任何改变，直接渲染原有的后台界面。
 */
const AdminMobileGate = ({ children }: { children: React.ReactNode }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const force =
      typeof window !== 'undefined' &&
      window.location.search.indexOf('force=mobile') >= 0;
    setIsMobile(mq.matches || force);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', handler);
    else mq.addListener(handler);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', handler);
      else mq.removeListener(handler);
    };
  }, []);

  const embed =
    typeof window !== 'undefined' &&
    window.location.search.indexOf('embed=1') >= 0;

  if (isMobile && !entered && !embed) {
    return <NovaMobileAdmin onEnter={() => setEntered(true)} />;
  }

  return <>{children}</>;
};

export default AdminMobileGate;
