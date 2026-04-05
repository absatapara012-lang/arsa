import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Globe, 
  Shield, 
  CreditCard, 
  Bell, 
  Database,
  Save,
  RefreshCw,
  Upload
} from 'lucide-react';
import { doc, onSnapshot, db, setDoc } from '../firebase';
import { GymConfig } from '../types';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export function Settings() {
  const [config, setConfig] = useState<GymConfig>({
    gymName: 'ARSA Fit Elite',
    logoUrl: '/logo.jpeg',
    currency: 'USD',
    pricing: {
      Standard: 29,
      Pro: 59,
      AI: 99
    }
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'config', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        setConfig(snapshot.data() as GymConfig);
      }
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'global'), config);
      toast.success('Configuration updated successfully.');
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-10 animate-in fade-in duration-700">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">System Settings</h2>
        <p className="text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[10px] mt-1">White-Label SaaS Configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation */}
        <div className="space-y-2">
          {[
            { id: 'general', label: 'General Info', icon: Globe },
            { id: 'security', label: 'Security & Access', icon: Shield },
            { id: 'billing', label: 'Billing & SaaS', icon: CreditCard },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'data', label: 'Data Management', icon: Database },
          ].map((item) => (
            <button 
              key={item.id}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                item.id === 'general' ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20' : 'text-[var(--text-secondary)] hover:bg-[var(--text-primary)]/5'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 space-y-8">
            {/* Gym Branding */}
            <section className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)] pb-4 border-b border-[var(--border-subtle)]">Gym Branding</h3>
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <img src={config.logoUrl} alt="Logo" className="w-24 h-24 rounded-2xl object-cover border border-[var(--border-subtle)] group-hover:opacity-50 transition-all" />
                  <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <Upload className="w-6 h-6 text-[var(--text-primary)]" />
                  </button>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">Gym Name</label>
                    <input 
                      type="text" 
                      value={config.gymName}
                      onChange={(e) => setConfig({...config, gymName: e.target.value})}
                      className="w-full bg-[var(--text-primary)]/5 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)]/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">Currency</label>
                    <select 
                      value={config.currency}
                      onChange={(e) => setConfig({...config, currency: e.target.value})}
                      className="w-full bg-[var(--text-primary)]/5 border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)]/40 transition-all appearance-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            {/* Pricing Tiers */}
            <section className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)] pb-4 border-b border-[var(--border-subtle)]">Membership Pricing</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(config.pricing).map(([tier, price]) => (
                  <div key={tier} className="bg-[var(--text-primary)]/5 p-4 rounded-2xl border border-[var(--border-subtle)]">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">{tier}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] text-xs">$</span>
                      <input 
                        type="number" 
                        value={price}
                        onChange={(e) => setConfig({
                          ...config, 
                          pricing: { ...config.pricing, [tier]: parseFloat(e.target.value) }
                        })}
                        className="w-full bg-transparent border-none p-0 pl-6 text-lg font-black text-[var(--text-primary)] focus:ring-0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Data Management */}
            <section className="space-y-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)] pb-4 border-b border-[var(--border-subtle)]">Data Management</h3>
              <div className="flex items-center justify-between p-6 bg-[var(--text-primary)]/5 rounded-3xl border border-[var(--border-subtle)]">
                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">Seed Demo Data</h4>
                  <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">Populate the terminal with sample records for testing.</p>
                </div>
                <button 
                  onClick={async () => {
                    const { seedInitialData } = await import('../utils/seed');
                    await seedInitialData();
                    toast.success('Demo data seeded.');
                  }}
                  className="px-4 py-2 bg-[var(--text-primary)]/5 border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all"
                >
                  Run Seeder
                </button>
              </div>
            </section>

            {/* Save Button */}
            <div className="pt-6 border-t border-[var(--border-subtle)] flex justify-end">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-[var(--accent)] text-[#080C14] font-bold rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)] disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Configuration
              </button>
            </div>
          </div>

          {/* SaaS Info */}
          <div className="bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-main)] border border-[var(--border-subtle)] rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/10 rounded-full blur-3xl -mr-16 -mt-16" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-2xl flex items-center justify-center text-[var(--accent)] border border-[var(--accent)]/20">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-[var(--text-primary)]">SaaS License: Elite</h4>
                <p className="text-xs text-[var(--text-secondary)] font-medium">Your subscription is active until March 2027.</p>
              </div>
              <button className="ml-auto px-4 py-2 bg-[var(--text-primary)]/5 border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold uppercase tracking-widest text-[var(--text-primary)] hover:bg-[var(--text-primary)]/10 transition-all">
                Manage Billing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
