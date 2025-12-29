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
  { href: '/dashboard', label: 'Dashboard', desc: 'Status + controls' },
  { href: '/signals', label: 'Signals', desc: 'Parsed trades' },
  { href: '/actions', label: 'Actions', desc: 'Execution queue' },
  { href: '/raw', label: 'Raw', desc: 'Channel feed' },
  { href: '/settings', label: 'Settings', desc: 'Safe config' },
];

export const metadata: Metadata = {
  title: 'Fincs Ops Console',
  description: 'Control tower for the FINCS automated trading bot',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body>
        <div className="shell">
          <header className="topbar">
            <div className="brand">
              <span className="dot" aria-hidden />
              <span>FINCS Ops</span>
              <span className="sub">control tower</span>
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
