import type { Metadata } from 'next';
import Link from 'next/link';
import { Space_Grotesk } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', desc: '稼働状況と操作' },
  { href: '/signals', label: 'シグナル', desc: '解析済みトレード' },
  { href: '/actions', label: 'アクション', desc: '実行キュー' },
  { href: '/raw', label: 'RAW', desc: 'チャンネル取得' },
  { href: '/settings', label: '設定', desc: '安全な構成' },
];

export const metadata: Metadata = {
  title: 'FINCS 管制コンソール',
  description: 'FINCS 自動売買ボットの管制塔',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" className={spaceGrotesk.variable}>
      <body>
        <div className="shell">
          <header className="topbar">
            <div className="brand">
              <span className="dot" aria-hidden />
              <span>FINCS Ops</span>
              <span className="sub">管制塔</span>
            </div>
            <nav className="nav">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div>
                    <div className="nav-label">{item.label}</div>
                    <div className="nav-desc">{item.desc}</div>
                  </div>
                </Link>
              ))}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
