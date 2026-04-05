import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Search, 
  Filter, 
  Plus, 
  ArrowUpRight, 
  MessageSquare, 
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { collection, onSnapshot, db, addDoc, updateDoc, doc } from '../firebase';
import { Inquiry } from '../types';
import { format, parseISO, subDays, isAfter } from 'date-fns';
import { motion } from 'motion/react';

export function InquiryHub() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'inquiries'), (snapshot) => {
      setInquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry)));
    });
    return () => unsub();
  }, []);

  const filteredInquiries = inquiries.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hotLeads = filteredInquiries.filter(i => {
    const inquiryDate = parseISO(i.inquiryDate);
    return i.status === 'Open' && !isAfter(inquiryDate, subDays(new Date(), 7));
  });

  const otherLeads = filteredInquiries.filter(i => !hotLeads.includes(i));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Inquiry Hub</h2>
          <p className="text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[10px] mt-1">7-Day Sales Pipeline & Conversion Engine</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Search Leads by Name or Program..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)]/40 transition-all w-80 shadow-inner"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-2 bg-[var(--accent)] text-[#080C14] font-bold rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_var(--accent-glow)]">
            <Plus className="w-4 h-4" />
            New Inquiry
          </button>
        </div>
      </div>

      {/* Hot Leads Section */}
      {hotLeads.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
            <h3 className="text-lg font-extrabold tracking-tight text-amber-500 uppercase tracking-widest">High Priority: Decision Pitch Required</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotLeads.map((lead) => (
              <motion.div 
                key={lead.id}
                whileHover={{ y: -5 }}
                className="glass border-2 border-amber-500/30 rounded-3xl p-6 relative overflow-hidden shadow-[0_0_30px_rgba(245,158,11,0.1)]"
              >
                <div className="absolute top-0 right-0 p-4">
                  <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[8px] font-bold rounded uppercase tracking-widest border border-amber-500/20">7 Days Old</span>
                </div>
                <h4 className="text-lg font-bold mb-1 text-[var(--text-primary)]">{lead.name}</h4>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mb-4">{lead.program}</p>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 p-3 bg-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)]">
                    <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Contact</p>
                    <p className="text-xs font-bold text-[var(--text-primary)]">{lead.contact}</p>
                  </div>
                </div>
                <button className="w-full py-3 bg-amber-500 text-[#080C14] font-bold rounded-xl text-xs uppercase tracking-widest hover:brightness-110 transition-all">
                  Send 7-Day Special Offer
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Main Pipeline */}
      <div className="glass rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Sales Pipeline</h3>
          <div className="flex gap-2">
            <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"><Filter className="w-4 h-4" /></button>
            <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"><MoreVertical className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--border-subtle)]/50 border-b border-[var(--border-subtle)]">
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Lead Name</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Program Interest</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Inquiry Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {otherLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-[var(--border-subtle)]/30 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[var(--border-subtle)] rounded-lg flex items-center justify-center text-[var(--text-secondary)]">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-[var(--text-primary)]">{lead.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-semibold text-[var(--text-secondary)]">{lead.program}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-[var(--text-secondary)]" />
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{format(parseISO(lead.inquiryDate), 'MMM dd, yyyy')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      lead.status === 'Qualified' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-[var(--border-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]'
                    }`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"><CheckCircle2 className="w-4 h-4" /></button>
                      <button className="p-2 text-[var(--text-secondary)] hover:text-rose-500 transition-all"><XCircle className="w-4 h-4" /></button>
                      <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"><ArrowUpRight className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
