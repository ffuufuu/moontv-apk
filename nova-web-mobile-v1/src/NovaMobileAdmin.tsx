/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import {
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  ExternalLink,
  Film,
  FileText,
  Globe,
  Home,
  LayoutGrid,
  Mail,
  PlaySquare,
  Settings,
  Shield,
  SlidersHorizontal,
  Tv,
  Users,
  Wrench,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Props {
  onEnter: () => void;
}

const GROUPS: {
  label: string;
  items: { key: string; title: string; sub: string; icon: any }[];
}[] = [
  {
    label: '常用',
    items: [
      { key: 'siteConfig', title: '站点配置', sub: '站点信息与功能开关', icon: Home },
      { key: 'userConfig', title: '用户管理', sub: '账号、权限与黑名单', icon: Users },
      { key: 'videoSource', title: '视频源配置', sub: '采集站与源参数', icon: Database },
      { key: 'movieRequests', title: '求片管理', sub: '用户求片与处理', icon: Film },
    ],
  },
  {
    label: '内容',
    items: [
      { key: 'categoryConfig', title: '分类配置', sub: '分类与筛选结构', icon: LayoutGrid },
      { key: 'animeSubscription', title: '追番订阅', sub: '番剧订阅与更新', icon: PlaySquare },
      { key: 'liveSource', title: '电视直播源', sub: '直播源与 EPG', icon: Tv },
      { key: 'webLive', title: '网络直播', sub: '网络直播配置', icon: Globe },
      { key: 'sourceScriptLab', title: '视频源脚本', sub: '脚本调试与执行', icon: SlidersHorizontal },
      { key: 'themeConfig', title: '个性化配置', sub: '主题与页面外观', icon: Settings },
    ],
  },
  {
    label: '系统',
    items: [
      { key: 'configFile', title: '配置文件', sub: '整体配置查看与编辑', icon: FileText },
      { key: 'registrationConfig', title: '注册配置', sub: '注册方式与限制', icon: Shield },
      { key: 'emailConfig', title: '邮件配置', sub: '邮件服务与模板', icon: Mail },
      { key: 'customAdFilter', title: '自定义去广告', sub: '广告过滤规则', icon: Download },
      { key: 'dataMigration', title: '数据迁移', sub: '导入导出与迁移', icon: Wrench },
    ],
  },
];

const NovaMobileAdmin = ({ onEnter }: Props) => {
  const [panel, setPanel] = useState<{ key: string; title: string } | null>(null);
  const [stats, setStats] = useState({
    users: '—',
    sources: '—',
    requests: '—',
    categories: '—',
  });
  const [frameH, setFrameH] = useState(0);

  useEffect(() => {
    fetch('/api/admin/users?page=1&limit=1', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (j && typeof j.total === 'number') {
          setStats((s) => ({ ...s, users: j.total.toLocaleString() }));
        } else if (Array.isArray(j?.users)) {
          setStats((s) => ({ ...s, users: String(j.users.length) }));
        }
      })
      .catch(() => {});

    fetch('/api/admin/config', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        const cfg = j?.Config;
        if (!cfg) return;
        const srcList = cfg.SourceConfig;
        const cats = cfg.CustomCategories;
        setStats((s) => ({
          ...s,
          sources: Array.isArray(srcList) ? srcList.length.toLocaleString() : s.sources,
          categories: Array.isArray(cats) ? cats.length.toLocaleString() : s.categories,
        }));
      })
      .catch(() => {});

    fetch('/api/movie-requests', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (Array.isArray(j?.requests)) {
          setStats((s) => ({ ...s, requests: String(j.requests.length) }));
        }
      })
      .catch(() => {});
  }, []);

  if (panel) {
    return (
      <div className='nova-admin-shell min-h-screen bg-[#0B0713] text-[#EDE9FE] w-full max-w-[414px] mx-auto flex flex-col overflow-x-hidden'>
        <header className='sticky top-0 z-40 h-14 flex items-center gap-1 px-2 bg-[#0B0713] border-b border-[#2A2143]'>
          <button
            type='button'
            onClick={() => setPanel(null)}
            className='p-1 active:opacity-70'
            aria-label='返回'
          >
            <ChevronLeft className='w-6 h-6 text-[#C4B5FD]' />
          </button>
          <span className='flex-1 text-[15px] font-semibold text-white truncate'>
            {panel.title}
          </span>
          <Link
            href='/'
            className='flex items-center gap-1 px-2.5 h-8 rounded-full bg-[#17102B] border border-[#3B2C5F] text-[12px] text-[#C4B5FD]'
          >
            <ExternalLink className='w-3.5 h-3.5' />
            回前台
          </Link>
        </header>
        <div className='w-full'>
          <iframe
            src={`/admin?embed=1&section=${panel.key}`}
            title={panel.title}
            className='w-full bg-[#0B0713]'
            onLoad={(e) => {
              const frame = e.currentTarget;
              const sync = () => {
                const d = frame.contentDocument;
                if (!d) return;
                const h = Math.max(
                  d.body?.scrollHeight || 0,
                  d.documentElement?.scrollHeight || 0,
                  d.body?.offsetHeight || 0,
                  600
                );
                setFrameH((prev) => (Math.abs(prev - h) > 6 ? h : prev));
              };
              sync();
              window.setTimeout(sync, 400);
              window.setTimeout(sync, 1200);
              window.setTimeout(sync, 2500);
              const iv = window.setInterval(sync, 900);
              window.setTimeout(() => window.clearInterval(iv), 120000);
            }}
            style={{
              border: 'none',
              width: '100%',
              display: 'block',
              height: frameH ? `${frameH}px` : 'calc(100vh - 56px)',
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className='nova-admin-shell min-h-screen w-full bg-[#0B0713] text-[#EDE9FE] max-w-[414px] mx-auto overflow-x-hidden'>
      <header className='sticky top-0 z-40 bg-[#0B0713]/95 backdrop-blur-lg border-b border-[#2A2143]/50'>
        <div className='h-14 flex items-center justify-between px-4'>
          <div className='flex items-center gap-2'>
            <span className='flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-[#8B5CF6] to-[#A855F7]'>
              <Film className='w-4 h-4 text-white' />
            </span>
            <span className='text-[17px] font-bold bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent'>
              Nova影库
            </span>
            <span className='text-[12px] text-[#8B80A8]'>管理后台</span>
          </div>
          <Link
            href='/'
            className='flex items-center gap-1 px-2.5 h-8 rounded-full bg-[#17102B] border border-[#3B2C5F] text-[12px] text-[#C4B5FD]'
          >
            <ExternalLink className='w-3.5 h-3.5' />
            回前台
          </Link>
        </div>
      </header>

      <section className='px-3 pt-3'>
        <div
          className='relative overflow-hidden rounded-2xl border border-[#3B2C5F] p-4 bg-[#170E2E]'
          style={{
            backgroundImage:
              "linear-gradient(100deg, rgba(23,14,46,0.97) 0%, rgba(23,14,46,0.85) 42%, rgba(76,29,149,0.35) 70%, rgba(23,14,46,0.15) 100%), url('/nova-admin-banner.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className='absolute -right-6 -top-6 w-32 h-32 rounded-full bg-[#7C3AED]/25 blur-2xl' />
          <h2 className='text-[19px] font-bold text-white'>系统管理中心</h2>
          <p className='mt-1 text-[12px] text-[#A79CC4]'>站点配置 · 内容运营 · 用户管理</p>
          <div className='mt-3 flex items-center gap-2'>
            <span className='px-2 py-[3px] rounded-md bg-[#16A34A]/15 text-[#4ADE80] text-[11px] border border-[#16A34A]/30'>
              稳定运行
            </span>
            <span className='px-2 py-[3px] rounded-md bg-[#7C3AED]/15 text-[#C4B5FD] text-[11px] border border-[#7C3AED]/30'>
              v2.0.0
            </span>
            <span className='w-1.5 h-1.5 rounded-full bg-[#4ADE80]' />
          </div>
        </div>
      </section>

      <section className='px-3 mt-3 grid grid-cols-2 gap-2'>
        {[
          { label: '总用户', value: stats.users },
          { label: '视频源', value: stats.sources },
          { label: '待处理求片', value: stats.requests },
          { label: '分类', value: stats.categories },
        ].map((s) => (
          <div key={s.label} className='rounded-xl bg-[#150F26] border border-[#2A2143] px-3 py-3'>
            <div className='flex items-center gap-2'>
              <span className='w-7 h-7 rounded-lg bg-[#7C3AED]/15 flex items-center justify-center'>
                <span className='w-2 h-2 rounded-sm bg-[#A855F7]' />
              </span>
              <span className='text-[12px] text-[#8B80A8]'>{s.label}</span>
            </div>
            <div className='mt-2 text-[20px] font-bold text-white'>{s.value}</div>
          </div>
        ))}
      </section>

      {GROUPS.map((g) => (
        <section key={g.label} className='px-3 mt-4'>
          <h3 className='text-[12px] text-[#8B80A8] mb-2 px-1'>{g.label}</h3>
          <div className='space-y-2'>
            {g.items.map((e) => (
              <button
                key={e.key}
                type='button'
                onClick={() => setPanel({ key: e.key, title: e.title })}
                className='w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left active:scale-[0.99] transition-transform bg-[#150F26] border border-[#2A2143]'
              >
                <span className='w-9 h-9 rounded-lg flex items-center justify-center bg-[#7C3AED]/12'>
                  <e.icon className='w-[18px] h-[18px] text-[#A855F7]' />
                </span>
                <span className='flex-1 min-w-0'>
                  <span className='block text-[15px] font-semibold text-white'>{e.title}</span>
                  <span className='block text-[11px] text-[#8B80A8]'>{e.sub}</span>
                </span>
                <ChevronRight className='w-4 h-4 text-[#5E5476]' />
              </button>
            ))}
          </div>
        </section>
      ))}

      <div className='h-24' />
    </div>
  );
};

export default NovaMobileAdmin;
