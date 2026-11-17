/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import NovaMobileBottomNav from '@/components/mobile/NovaMobileBottomNav';
import {
  Cat,
  ChevronRight,
  Clover,
  Film,
  Flame,
  LayoutGrid,
  ListVideo,
  MessageSquare,
  Play,
  Search,
  Sparkles,
  Tv,
  Users,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { getDoubanCategories } from '@/lib/douban.client';
import type { DoubanItem } from '@/lib/types';

const proxyImg = (url: string) =>
  url ? `/api/video-proxy?url=${encodeURIComponent(url)}` : '';

const CATEGORY_TABS = [
  { label: '首页', href: '/' },
  { label: '电影', href: '/douban?type=movie' },
  { label: '剧集', href: '/douban?type=tv' },
  { label: '动漫', href: '/douban?type=anime' },
  { label: '综艺', href: '/douban?type=show' },
  { label: '短剧', href: '/duanju' },
];

const SHORTCUTS = [
  { icon: Film, title: '电影', sub: '海量大片', href: '/douban?type=movie' },
  { icon: Tv, title: '剧集', sub: '热播剧集', href: '/douban?type=tv' },
  { icon: Cat, title: '动漫', sub: '人气动画', href: '/douban?type=anime' },
  { icon: Clover, title: '综艺', sub: '精彩综艺', href: '/douban?type=show' },
  { icon: Zap, title: '短剧', sub: '竖屏短剧', href: '/duanju' },
  { icon: LayoutGrid, title: '全部', sub: '更多内容', href: '/douban' },
];

type RecommendTab = { label: string; category: string; type: string };

const RECOMMEND_TABS: RecommendTab[] = [
  { label: '精选', category: '热门', type: '全部' },
  { label: '最新', category: '最新', type: '全部' },
  { label: '高分', category: '豆瓣高分', type: '全部' },
  { label: '国产', category: '热门', type: '全部' },
  { label: '欧美', category: '热门', type: '全部' },
];

const playHref = (item: DoubanItem) =>
  `/play?title=${encodeURIComponent(item.title)}${
    item.year ? `&year=${item.year}` : ''
  }&prefer=true&stitle=${encodeURIComponent(item.title)}`;

const detailHref = (item: DoubanItem) =>
  `/detail?title=${encodeURIComponent(item.title)}${
    item.year ? `&year=${item.year}` : ''
  }${item.rate && item.rate !== '0' ? `&score=${item.rate}` : ''}${
    item.poster ? `&poster=${encodeURIComponent(item.poster)}` : ''
  }`;

const PosterCard = ({
  item,
  badge,
  badgeClass,
}: {
  item: DoubanItem;
  badge?: string;
  badgeClass?: string;
}) => (
  <Link
    href={detailHref(item)}
    prefetch={false}
    className='relative block w-[112px] shrink-0 group'
  >
    <div className='relative w-full aspect-[2/3] overflow-hidden rounded-xl bg-[#1c1730]'>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={proxyImg(item.poster)}
        alt={item.title}
        loading='lazy'
        className='w-full h-full object-cover transition-transform duration-300 group-active:scale-105'
      />
      {badge && (
        <span
          className={`absolute left-1.5 top-1.5 px-1.5 py-[2px] rounded-md text-[10px] font-medium text-white ${
            badgeClass || 'bg-[#7C3AED]/90'
          }`}
        >
          {badge}
        </span>
      )}
    </div>
    <p className='mt-2 text-[13px] leading-[18px] text-[#EDE9FE] line-clamp-2'>
      {item.title}
    </p>
    <p className='mt-[2px] text-[11px] text-[#8B80A8]'>
      {item.rate && item.rate !== '0' ? `${item.rate}分` : ''}
      {item.year ? ` · ${item.year}` : ''}
    </p>
  </Link>
);

const NovaMobileHome = () => {
  const [hotMovies, setHotMovies] = useState<DoubanItem[]>([]);
  const [hotTvs, setHotTvs] = useState<DoubanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [recTab, setRecTab] = useState(0);
  const [recList, setRecList] = useState<DoubanItem[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [movies, tvs] = await Promise.all([
          getDoubanCategories({
            kind: 'movie',
            category: '热门',
            type: '全部',
          }).catch(() => null),
          getDoubanCategories({ kind: 'tv', category: 'tv', type: 'tv' }).catch(
            () => null
          ),
        ]);
        if (cancelled) return;
        if (movies?.code === 200) setHotMovies(movies.list || []);
        if (tvs?.code === 200) setHotTvs(tvs.list || []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadRec = async (tab: RecommendTab) => {
    setRecLoading(true);
    try {
      const res = await getDoubanCategories({
        kind: 'movie',
        category: tab.category,
        type: tab.type,
      }).catch(() => null);
      if (res?.code === 200 && res.list?.length) {
        setRecList(res.list);
      }
    } finally {
      setRecLoading(false);
    }
  };

  useEffect(() => {
    if (hotMovies.length) setRecList(hotMovies.slice(0, 12));
  }, [hotMovies]);

  const heroItems = [...hotMovies, ...hotTvs].slice(0, 4);

  useEffect(() => {
    if (heroItems.length < 2) return;
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroItems.length);
    }, 5000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroItems.length]);

  const hottest = [...hotMovies.slice(0, 6), ...hotTvs.slice(0, 6)].slice(0, 8);
  const hero = heroItems[heroIndex];

  return (
    <div className='min-h-screen bg-[#0B0713] text-[#EDE9FE] pb-24'>
      {/* 分类横滑条 */}
      <div className='sticky top-0 z-[60] bg-[#0B0713]/95 backdrop-blur-lg'>
        <div className='flex items-center gap-1 overflow-x-auto px-2 py-2 no-scrollbar'>
          {CATEGORY_TABS.map((t, i) => (
            <Link
              key={t.label}
              href={t.href}
              prefetch={false}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[13px] transition-colors ${
                i === 0
                  ? 'text-white font-semibold'
                  : 'text-[#A79CC4] hover:text-white'
              }`}
            >
              {t.label}
              {i === 0 && (
                <span className='block mx-auto mt-[3px] w-5 h-[2px] rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7]' />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Hero 轮播 */}
      <section className='px-3 pt-1'>
        <div className='relative h-[238px] overflow-hidden rounded-2xl bg-[#1A1330]'>
          {loading && !hero ? (
            <div className='absolute inset-0 animate-pulse bg-gradient-to-br from-[#1E1738] to-[#120C22]' />
          ) : hero ? (
            <Link
              href={detailHref(hero)}
              prefetch={false}
              className='absolute inset-0'
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={proxyImg(hero.poster)}
                alt={hero.title}
                className='w-full h-full object-cover object-top'
              />
              <div className='absolute inset-0 bg-gradient-to-t from-[#0B0713] via-[#0B0713]/70 to-transparent' />
              <div className='absolute inset-x-4 bottom-4'>
                <span className='inline-block px-2 py-[3px] rounded-md bg-[#7C3AED] text-[11px] font-medium text-white'>
                  热播电影
                </span>
                <h2 className='mt-2 text-[22px] leading-7 font-bold text-white drop-shadow-lg line-clamp-2'>
                  {hero.title}
                </h2>
                <p className='mt-1 text-[12px] text-[#C4B5FD]'>
                  {hero.year ? `${hero.year} · ` : ''}
                  {hero.rate && hero.rate !== '0' ? `豆瓣 ${hero.rate} 分` : '精选推荐'}
                </p>
                <div className='mt-3 flex items-center gap-2'>
                  <Link
                    href={playHref(hero)}
                    prefetch={false}
                    className='flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white text-[13px] font-semibold shadow-lg shadow-[#7C3AED]/40'
                  >
                    <Play className='w-4 h-4 fill-current' />
                    立即播放
                  </Link>
                  <Link
                    href={detailHref(hero)}
                    prefetch={false}
                    className='px-4 py-2 rounded-full bg-white/10 backdrop-blur text-[13px] text-white border border-white/15'
                  >
                    详情
                  </Link>
                </div>
              </div>
            </Link>
          ) : null}
          {heroItems.length > 1 && (
            <div className='absolute bottom-1.5 right-4 flex items-center gap-1'>
              {heroItems.map((_, i) => (
                <span
                  key={i}
                  className={`h-[3px] rounded-full transition-all ${
                    i === heroIndex
                      ? 'w-4 bg-[#A855F7]'
                      : 'w-[3px] bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 分类快捷卡 */}
      <section className='px-3 mt-3'>
        <div className='grid grid-cols-3 gap-2'>
          {SHORTCUTS.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              prefetch={false}
              className='flex items-center gap-2 rounded-xl bg-[#150F26] border border-[#2A2143] px-2.5 py-2.5 active:bg-[#1C1433]'
            >
              <span className='flex items-center justify-center w-8 h-8 rounded-lg bg-[#7C3AED]/15'>
                <s.icon className='w-4 h-4 text-[#A855F7]' />
              </span>
              <span className='min-w-0'>
                <span className='block text-[13px] font-medium text-[#EDE9FE]'>
                  {s.title}
                </span>
                <span className='block text-[10px] text-[#8B80A8] truncate'>
                  {s.sub}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 功能入口（原来首页那排按钮） */}
      <section className='px-3 mt-3'>
        <div className='flex items-center gap-2'>
          {[
            { icon: Search, label: '搜索', href: '/search' },
            { icon: ListVideo, label: '源站寻片', href: '/source-search' },
            { icon: MessageSquare, label: '求片', href: '/movie-request' },
            { icon: Users, label: '观影室', href: '/watch-room' },
          ].map((a) => (
            <Link
              key={a.label}
              href={a.href}
              prefetch={false}
              className='flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#150F26] border border-[#2A2143] text-[12px] text-[#C4B5FD] active:bg-[#1C1433]'
            >
              <a.icon className='w-3.5 h-3.5 text-[#A855F7]' />
              {a.label}
            </Link>
          ))}
        </div>
      </section>

      {/* 正在热播 */}
      <section className='mt-6'>
        <div className='flex items-center justify-between px-4 mb-3'>
          <h3 className='flex items-center gap-1.5 text-[16px] font-bold text-white'>
            <Flame className='w-4 h-4 text-[#F97316] fill-current' />
            正在热播
          </h3>
          <Link
            href='/douban?type=movie'
            prefetch={false}
            className='flex items-center text-[12px] text-[#8B80A8]'
          >
            更多
            <ChevronRight className='w-3.5 h-3.5' />
          </Link>
        </div>
        <div className='flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar'>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='w-[112px] shrink-0'>
                  <div className='w-full aspect-[2/3] rounded-xl bg-[#1A1330] animate-pulse' />
                </div>
              ))
            : hottest.map((item, i) => (
                <PosterCard
                  key={`${item.id}-${i}`}
                  item={item}
                  badge={
                    i < 3 ? '热播'
                    : item.rate && Number(item.rate) >= 8 ? '高分'
                    : undefined
                  }
                  badgeClass={
                    i < 3
                      ? 'bg-[#F43F5E]/90'
                      : 'bg-[#7C3AED]/90'
                  }
                />
              ))}
        </div>
      </section>

      {/* 电影推荐 */}
      <section className='mt-6'>
        <div className='flex items-center justify-between px-4'>
          <h3 className='flex items-center gap-1.5 text-[16px] font-bold text-white'>
            <Sparkles className='w-4 h-4 text-[#A855F7]' />
            电影推荐
          </h3>
          <Link
            href='/douban?type=movie'
            prefetch={false}
            className='flex items-center text-[12px] text-[#8B80A8]'
          >
            查看全部
            <ChevronRight className='w-3.5 h-3.5' />
          </Link>
        </div>
        <div className='flex gap-2 overflow-x-auto px-4 py-3 no-scrollbar'>
          {RECOMMEND_TABS.map((t, i) => (
            <button
              key={t.label}
              type='button'
              onClick={() => {
                setRecTab(i);
                loadRec(t);
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-[12px] transition-colors ${
                i === recTab
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white font-medium'
                  : 'bg-[#150F26] text-[#A79CC4] border border-[#2A2143]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className='flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar'>
          {recLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='w-[112px] shrink-0'>
                  <div className='w-full aspect-[2/3] rounded-xl bg-[#1A1330] animate-pulse' />
                </div>
              ))
            : recList.map((item, i) => (
                <PosterCard key={`${item.id}-rec-${i}`} item={item} />
              ))}
        </div>
      </section>

      <NovaMobileBottomNav />
    </div>
  );
};

export default NovaMobileHome;
