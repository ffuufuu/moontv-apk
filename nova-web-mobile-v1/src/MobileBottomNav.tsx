'use client';

import { Compass, Home, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface MobileBottomNavProps {
  activePath?: string;
}

const ITEMS = [
  { icon: Home, label: '首页', href: '/' },
  { icon: Compass, label: '发现', href: '/discover' },
  { icon: User, label: '我的', href: '/my' },
];

const MobileBottomNav = ({ activePath }: MobileBottomNavProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentActive =
    activePath ?? (searchParams.toString() ? `${pathname}?${searchParams}` : pathname);

  const isActive = (href: string) =>
    href === '/' ? currentActive === '/' : currentActive.startsWith(href);

  return (
    <nav
      className='md:hidden fixed left-0 right-0 z-[600] border-t border-[#2A2143] bg-[#0B0713]/95 backdrop-blur-xl'
      style={{
        bottom: 0,
        paddingBottom: 'env(safe-area-inset-bottom)',
        minHeight: 'calc(3.5rem + env(safe-area-inset-bottom))',
      }}
    >
      <ul className='flex items-stretch h-14'>
        {ITEMS.map((item) => {
          const on = isActive(item.href);
          return (
            <li key={item.href} className='flex-1 flex'>
              <Link
                href={item.href}
                prefetch={false}
                className='relative flex-1 flex flex-col items-center justify-center gap-[3px]'
              >
                {on && (
                  <span className='absolute top-0 left-1/2 -translate-x-1/2 w-7 h-[3px] rounded-b-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7]' />
                )}
                <item.icon
                  className={`h-[22px] w-[22px] transition-colors ${
                    on ? 'text-[#A855F7]' : 'text-[#5C5478]'
                  }`}
                  strokeWidth={on ? 2.4 : 1.9}
                />
                <span
                  className={`text-[11px] tracking-wide transition-colors ${
                    on ? 'text-[#E9D5FF] font-semibold' : 'text-[#6B6285]'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
