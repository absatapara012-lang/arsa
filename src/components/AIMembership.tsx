import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Lock, 
  Send, 
  Download, 
  CheckCircle2, 
  AlertCircle,
  MessageSquare,
  Calendar,
  FileText,
  Plus
} from 'lucide-react';
import { collection, onSnapshot, db, query, where, updateDoc, doc } from '../firebase';
import { Member } from '../types';
import { motion } from 'motion/react';
import { toast } from 'sonner';

const MAX_AI_SUBS = 100;

export function AIMembership() {
  const [aiMembers, setAiMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [dietMessage, setDietMessage] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'members'), where('tier', '==', 'AI'));
    const unsub = onSnapshot(q, (snapshot) => {
      setAiMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member)));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const activeCount = aiMembers.length;
  const isCapReached = activeCount >= MAX_AI_SUBS;

  const handleSendLink = async (member: Member) => {
    const downloadId = Math.random().toString(36).substring(2, 15);
    await updateDoc(doc(db, 'members', member.id), { downloadId });
    toast.success(`Tokenized link generated for ${member.name}: arsafit.ai/app/dl/${downloadId}`);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">AI Membership Hub</h2>
          <p className="text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[10px] mt-1">Exclusive Tier Management (Cap: 100)</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-[var(--text-primary)]">{activeCount}</span>
              <span className="text-[var(--text-secondary)] font-bold">/ {MAX_AI_SUBS}</span>
            </div>
            <div className="w-32 h-1.5 bg-[var(--border-subtle)] rounded-full overflow-hidden mt-1">
              <div 
                className={`h-full transition-all duration-1000 ${isCapReached ? 'bg-rose-500' : 'bg-[var(--accent)]'}`} 
                style={{ width: `${(activeCount / MAX_AI_SUBS) * 100}%` }} 
              />
            </div>
          </div>
          {isCapReached && (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl">
              <Lock className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Cap Reached</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Member List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-3xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Active AI Subscribers</h3>
              <button className="text-[var(--accent)] text-xs font-bold hover:underline">View All</button>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {aiMembers.map((member) => (
                <div key={member.id} className="p-6 flex items-center justify-between hover:bg-[var(--text-primary)]/[0.02] transition-all group">
                  <div className="flex items-center gap-4">
                    <img src={`https://picsum.photos/seed/${member.id}/100/100`} alt={member.name} className="w-12 h-12 rounded-2xl object-cover border border-[var(--border-subtle)]" />
                    <div>
                      <h4 className="text-sm font-bold text-[var(--text-primary)]">{member.name}</h4>
                      <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">Nutrition Score: 92%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleSendLink(member)}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-[var(--accent)]/50 transition-all text-[var(--text-primary)]"
                    >
                      <Send className="w-3 h-3" />
                      Send App Link
                    </button>
                    <button className="p-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all">
                      <FileText className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {aiMembers.length === 0 && (
                <div className="p-20 text-center text-[var(--text-secondary)] font-bold uppercase tracking-widest text-xs">
                  No AI tier members found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Diet Dispatcher */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-8 relative overflow-hidden shadow-lg">
            <div className="absolute top-0 right-0 p-4">
              <MessageSquare className="w-5 h-5 text-[var(--accent)] opacity-20" />
            </div>
            <h3 className="text-lg font-extrabold tracking-tight mb-6 text-[var(--text-primary)]">Diet Dispatcher</h3>
            <div className="space-y-4">
              <div className="flex gap-2 mb-4">
                <button className="flex-1 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[8px] font-bold uppercase tracking-widest hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all text-[var(--text-secondary)]">High Protein</button>
                <button className="flex-1 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[8px] font-bold uppercase tracking-widest hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all text-[var(--text-secondary)]">Low Carb</button>
                <button className="flex-1 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[8px] font-bold uppercase tracking-widest hover:bg-[var(--accent)]/10 hover:text-[var(--accent)] transition-all text-[var(--text-secondary)]">Keto</button>
              </div>
              <textarea 
                value={dietMessage}
                onChange={(e) => setDietMessage(e.target.value)}
                placeholder="Type diet update or instructions..."
                className="w-full h-40 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-2xl p-4 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)]/40 outline-none transition-all resize-none"
              />
              <div className="flex items-center gap-4">
                <button className="flex-1 py-3 bg-[var(--accent)] text-[#080C14] font-bold rounded-xl text-xs uppercase tracking-widest shadow-[0_0_20px_var(--accent-glow)]">
                  Broadcast to All
                </button>
                <button className="p-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 shadow-lg">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4">App Usage Stats</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Daily Active Users</span>
                <span className="text-sm font-black text-[var(--text-primary)]">84%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--bg-main)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--accent)]" style={{ width: '84%' }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Diet Log Completion</span>
                <span className="text-sm font-black text-[var(--text-primary)]">62%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--bg-main)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--accent)]" style={{ width: '62%' }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
