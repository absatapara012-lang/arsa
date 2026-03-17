import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Star, 
  Clock, 
  Calendar, 
  MoreVertical, 
  Users,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { collection, onSnapshot, db, addDoc, updateDoc, doc } from '../firebase';
import { Trainer } from '../types';
import { motion } from 'motion/react';

export function TrainerHub() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'trainers'), (snapshot) => {
      setTrainers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trainer)));
    });
    return () => unsub();
  }, []);

  const morningTrainers = trainers.filter(t => t.shift === 'Morning');
  const eveningTrainers = trainers.filter(t => t.shift === 'Evening');

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Trainer Hub</h2>
          <p className="text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[10px] mt-1">Load Balancing & Shift Matrix</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2 bg-[var(--accent)] text-[#080C14] font-bold rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)]">
          <Plus className="w-4 h-4" />
          Onboard Trainer
        </button>
      </div>

      {/* Trainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {trainers.map((trainer) => (
          <motion.div 
            key={trainer.id}
            whileHover={{ y: -5 }}
            className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <span className={`px-2 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest border ${
                trainer.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}>
                {trainer.status}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <img src={`https://picsum.photos/seed/${trainer.id}/200/200`} alt={trainer.name} className="w-14 h-14 rounded-2xl object-cover border border-[var(--border-subtle)]" />
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">{trainer.name}</h4>
                <p className="text-[10px] text-[var(--accent)] font-bold uppercase tracking-widest">{trainer.specialization}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[var(--text-primary)]/5 p-3 rounded-2xl border border-[var(--border-subtle)]">
                <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Load</p>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-black ${trainer.membersAssigned > 15 ? 'text-rose-500' : 'text-[var(--text-primary)]'}`}>{trainer.membersAssigned}</span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-bold">/ 15</span>
                </div>
                {trainer.membersAssigned > 15 && (
                  <p className="text-[8px] text-rose-500 font-bold uppercase mt-1">Full Capacity</p>
                )}
              </div>
              <div className="bg-[var(--text-primary)]/5 p-3 rounded-2xl border border-[var(--border-subtle)]">
                <p className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Rating</p>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-black text-[var(--text-primary)]">{trainer.rating}</span>
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 text-[var(--text-secondary)]" />
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{trainer.shift} Shift</span>
              </div>
              <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Timing Matrix */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8">
        <h3 className="text-xl font-extrabold tracking-tight mb-8 text-[var(--text-primary)]">Timing Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Morning Shift */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-subtle)]">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Morning Shift</h4>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">06:00 AM - 12:00 PM</p>
              </div>
            </div>
            <div className="space-y-3">
              {morningTrainers.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-[var(--text-primary)]/5 rounded-2xl border border-[var(--border-subtle)] group hover:border-[var(--accent)]/30 transition-all cursor-move">
                  <div className="flex items-center gap-3">
                    <img src={`https://picsum.photos/seed/${t.id}/100/100`} alt={t.name} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">{t.name}</span>
                  </div>
                  <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{t.specialization}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Evening Shift */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-subtle)]">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Evening Shift</h4>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">04:00 PM - 10:00 PM</p>
              </div>
            </div>
            <div className="space-y-3">
              {eveningTrainers.map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-[var(--text-primary)]/5 rounded-2xl border border-[var(--border-subtle)] group hover:border-[var(--accent)]/30 transition-all cursor-move">
                  <div className="flex items-center gap-3">
                    <img src={`https://picsum.photos/seed/${t.id}/100/100`} alt={t.name} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">{t.name}</span>
                  </div>
                  <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{t.specialization}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
