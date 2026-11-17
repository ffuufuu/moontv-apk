'use client';

import { Compass, Home, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: '首页', icon: Home, match: (p: string) => p === '/' },
  {
    href: '/discover',
    label: '发现',
    icon: Compass,
    match: (p: string) => p.startsWith('/discover'),
  },
  {
    href: '/my',
    label: '我的',
    icon: User,
    match: (p: string) => p.startsWith('/my'),
  },
];

const NovaMobileBottomNav = () => {
  const pathname = usePathname() || '/';

  return (
    <nav className='md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-[#0B0713]/95 backdrop-blur-lg border-t border-[#2A2143]'>
      <div className='flex items-center justify-around h-16'>
        {TABS.map((t) => {
          const active = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              prefetch={false}
              className='flex flex-col items-center gap-1'
            >
              <t.icon
                className={`w-5 h-5 ${
                  active ? 'text-[#A855F7]' : 'text-[#6B6285]'
                }`}
              />
              <span
                className={`text-[11px] ${
                  active ? 'text-[#A855F7]' : 'text-[#6B6285]'
                }`}
              >
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default NovaMobileBottomNav;
