import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User, auth, signInWithPopup, googleProvider, signOut } from './firebase';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { MemberDirectory } from './components/MemberDirectory';
import { TrainerHub } from './components/TrainerHub';
import { InquiryHub } from './components/InquiryHub';
import { Financials } from './components/Financials';
import { AIMembership } from './components/AIMembership';
import { Settings } from './components/Settings';
import { LogIn, Loader2 } from 'lucide-react';
import { Toaster } from 'sonner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--bg-main)]">
        <Loader2 className="w-12 h-12 text-[var(--accent)] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--bg-main)] text-[var(--text-primary)] p-4">
        <div className="w-32 h-32 bg-[var(--accent)]/10 rounded-3xl flex items-center justify-center border border-[var(--accent)]/20 mb-8 overflow-hidden shadow-[0_0_40px_rgba(0,242,255,0.1)] backdrop-blur-md">
          <img 
            src="/logo.jpeg" 
            alt="ARSA Fit Logo" 
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/gym/200/200';
            }}
          />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tighter mb-2">ARSA FIT <span className="text-[var(--accent)]">AI</span> LITE</h1>
        <p className="text-[var(--text-secondary)] mb-8 text-center max-w-md">The elite gym management terminal. Secure access required.</p>
        <button
          onClick={handleLogin}
          className="flex items-center gap-3 px-8 py-4 bg-[var(--accent)] text-[#080C14] font-bold rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,255,0.3)]"
        >
          <LogIn className="w-5 h-5" />
          Authenticate with Google
        </button>
        <p className="mt-12 text-[10px] text-[var(--text-secondary)] uppercase tracking-widest font-bold opacity-50">Powered by ARSA FIT AI SaaS Engine</p>
      </div>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'members': return <MemberDirectory />;
      case 'trainers': return <TrainerHub />;
      case 'inquiries': return <InquiryHub />;
      case 'financials': return <Financials />;
      case 'ai-membership': return <AIMembership />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <>
      <Toaster position="top-right" theme="dark" richColors />
      <Layout activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout}>
        {renderTab()}
      </Layout>
    </>
  );
}
