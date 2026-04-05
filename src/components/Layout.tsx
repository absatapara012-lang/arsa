import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  TrendingUp, 
  DollarSign, 
  Cpu, 
  Settings as SettingsIcon,
  LogOut,
  ChevronRight,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export function Layout({ children, activeTab, setActiveTab, onLogout }: LayoutProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Member Directory', icon: Users },
    { id: 'trainers', label: 'Trainer Hub', icon: UserPlus },
    { id: 'inquiries', label: 'Inquiry Hub', icon: TrendingUp },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'ai-membership', label: 'AI Membership', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-main)] text-[var(--text-primary)] font-['Plus_Jakarta_Sans'] overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-72 border-r border-[var(--border-subtle)] flex flex-col bg-[var(--bg-card)]/80 backdrop-blur-2xl transition-colors duration-300">
        <div className="p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-xl flex items-center justify-center border border-[var(--accent)]/20 overflow-hidden shadow-[0_0_20px_rgba(0,242,255,0.05)]">
            <img 
              src="/logo.jpeg" 
              alt="Logo" 
              className="w-full h-full object-contain p-1"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/gym/200/200';
              }}
            />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tighter leading-none">ARSA FIT <span className="text-[var(--accent)]">AI</span></h1>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">Terminal v2.1</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative",
                  isActive 
                    ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 shadow-[0_0_15px_rgba(0,242,255,0.1)]" 
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-[var(--accent)]" : "text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]")} />
                <span className="text-sm font-semibold">{item.label}</span>
                {isActive && (
                  <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent)]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-[var(--border-subtle)]">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-rose-400 hover:bg-rose-400/5 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-semibold">Terminate Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-[var(--border-subtle)] flex items-center justify-between px-10 bg-[var(--bg-main)]/40 backdrop-blur-2xl z-10 transition-colors duration-300">
          <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)]">
            <span>TERMINAL</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[var(--text-primary)] uppercase tracking-widest">{activeTab.replace('-', ' ')}</span>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={toggleTheme}
              className="p-2 bg-[var(--border-subtle)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--border-subtle)] rounded-full border border-[var(--border-subtle)]">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse shadow-[0_0_10px_var(--accent)]" />
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">System Online</span>
            </div>
            <button className="relative p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[var(--bg-main)]" />
            </button>
            <div className="w-10 h-10 rounded-full border border-[var(--accent)]/30 p-0.5 overflow-hidden bg-[var(--bg-card)] shadow-[0_0_15px_rgba(0,242,255,0.1)]">
              <img 
                src="/logo.jpeg" 
                alt="ARSA Fit Logo" 
                className="w-full h-full object-contain p-0.5"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/admin/100/100';
                }}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}
