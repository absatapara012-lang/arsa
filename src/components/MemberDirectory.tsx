import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Activity, 
  Zap, 
  ChevronRight,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  X,
  UserPlus,
  MessageSquare
} from 'lucide-react';
import { collection, onSnapshot, db, addDoc, updateDoc, doc, deleteDoc } from '../firebase';
import { Member, NutritionEntry, MembershipTier } from '../types';
import { format, parseISO, subDays, addDays, isAfter } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { analyzeNutrition } from '../services/gemini';

export function MemberDirectory() {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Enrollment Form State
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    tier: 'Standard' as MembershipTier,
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'members'), (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member)));
    });
    return () => unsub();
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAnalyze = async (member: Member) => {
    setSelectedMember(member);
    setIsDrawerOpen(true);
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeNutrition(member.nutritionData || []);
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysis('Failed to analyze nutrition data. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'members'), {
        ...newMember,
        status: 'ACTIVE',
        lastCheckIn: new Date().toISOString(),
        subscriptionExpiry: addDays(new Date(), 30).toISOString(),
        nutritionData: [],
      });
      setIsEnrollModalOpen(false);
      setNewMember({ name: '', email: '', phone: '', tier: 'Standard' });
    } catch (error) {
      console.error('Enrollment failed:', error);
    }
  };

  const handleRescue = async (member: Member) => {
    try {
      await updateDoc(doc(db, 'members', member.id), {
        lastCheckIn: new Date().toISOString(),
        status: 'ACTIVE'
      });
      // In a real app, this would also trigger a WhatsApp message
      alert(`Rescue protocol initiated for ${member.name}. Status reset to ACTIVE.`);
    } catch (error) {
      console.error('Rescue failed:', error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Member Terminal</h2>
          <p className="text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[10px] mt-1">High-Density Management Engine</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Search ID / Name / Email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--accent)]/40 transition-all w-64"
            />
          </div>
          <button className="p-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all">
            <Filter className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsEnrollModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-[var(--accent)] text-[#080C14] font-bold rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)]"
          >
            <Plus className="w-4 h-4" />
            Enroll Member
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Name & ID</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Contact Info</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Nutrition Sparkline</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filteredMembers.map((member) => {
                const isAtRisk = !isAfter(parseISO(member.lastCheckIn), subDays(new Date(), 3));
                
                const expiryDate = parseISO(member.subscriptionExpiry);
                const today = new Date();
                const isExpired = isAfter(today, expiryDate);
                const isExpiringSoon = !isExpired && isAfter(addDays(today, 7), expiryDate);
                
                return (
                  <motion.tr 
                    key={member.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)', y: -2 }}
                    className="group transition-all cursor-pointer"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img src={`https://picsum.photos/seed/${member.id}/100/100`} alt={member.name} className="w-10 h-10 rounded-xl object-cover border border-[var(--border-subtle)]" />
                          {isAtRisk && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[var(--bg-card)] animate-pulse shadow-[0_0_10px_#F43F5E]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold group-hover:text-[var(--accent)] transition-colors">{member.name}</h4>
                            {(isExpiringSoon || isExpired) && (
                              <div className="group/tooltip relative">
                                <AlertCircle className={`w-3.5 h-3.5 ${isExpired ? 'text-rose-500' : 'text-amber-500'}`} />
                                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 ${isExpired ? 'bg-rose-500' : 'bg-amber-500'} text-[#080C14] text-[8px] font-bold rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-lg`}>
                                  {isExpired ? 'Subscription Expired' : 'Expiring Soon'}: {format(expiryDate, 'MMM dd, yyyy')}
                                </div>
                              </div>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-[var(--text-secondary)] uppercase tracking-widest">{member.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-xs font-semibold">{member.email}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">{member.phone}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-end gap-1 h-8">
                        {(member.nutritionData || []).slice(-7).map((entry, i) => (
                          <div 
                            key={i} 
                            className="w-1.5 rounded-full bg-[var(--accent)]/20 group-hover:bg-[var(--accent)]/40 transition-all"
                            style={{ height: `${(entry.kCal / 3000) * 100}%` }}
                          />
                        ))}
                        {(!member.nutritionData || member.nutritionData.length === 0) && (
                          <span className="text-[8px] text-[var(--text-secondary)] font-bold uppercase">No Data</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        isAtRisk ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isAtRisk ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                        {isAtRisk ? 'AT_RISK' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-3">
                        {isAtRisk && (
                          <button 
                            onClick={() => handleRescue(member)}
                            className="p-2 bg-rose-500/10 rounded-lg text-rose-500 hover:bg-rose-500/20 transition-all"
                            title="Initiate Rescue Protocol"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleAnalyze(member)}
                          className="p-2 bg-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all"
                        >
                          <Activity className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrollment Modal */}
      <AnimatePresence>
        {isEnrollModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEnrollModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-10 z-[70] shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--accent)]/10 rounded-lg">
                    <UserPlus className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <h3 className="text-xl font-bold">Enroll New Member</h3>
                </div>
                <button onClick={() => setIsEnrollModalOpen(false)} className="text-[var(--text-secondary)] hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleEnroll} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Full Name</label>
                  <input 
                    required
                    type="text" 
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                    className="w-full px-4 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl focus:ring-2 focus:ring-[var(--accent)]/40 outline-none transition-all"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Email Address</label>
                  <input 
                    required
                    type="email" 
                    value={newMember.email}
                    onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    className="w-full px-4 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl focus:ring-2 focus:ring-[var(--accent)]/40 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Phone Number</label>
                  <input 
                    required
                    type="tel" 
                    value={newMember.phone}
                    onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl focus:ring-2 focus:ring-[var(--accent)]/40 outline-none transition-all"
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Membership Tier</label>
                  <select 
                    value={newMember.tier}
                    onChange={(e) => setNewMember({...newMember, tier: e.target.value as MembershipTier})}
                    className="w-full px-4 py-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl focus:ring-2 focus:ring-[var(--accent)]/40 outline-none transition-all appearance-none"
                  >
                    <option value="Standard">Standard Tier</option>
                    <option value="Pro">Pro Tier</option>
                    <option value="AI">AI Elite Tier</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-[var(--accent)] text-[#080C14] font-bold rounded-2xl hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)] mt-4"
                >
                  Confirm Enrollment
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Side Drawer for Analysis */}
      <AnimatePresence>
        {isDrawerOpen && selectedMember && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[500px] bg-[var(--bg-card)] border-l border-[var(--border-subtle)] z-50 p-10 overflow-y-auto custom-scrollbar shadow-[-20px_0_50px_rgba(0,0,0,0.5)]"
            >
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-2xl font-extrabold tracking-tight">Nutrition Analysis</h3>
                <button onClick={() => setIsDrawerOpen(false)} className="text-[var(--text-secondary)] hover:text-white">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="flex items-center gap-6 mb-10 p-6 bg-[var(--border-subtle)] rounded-3xl border border-[var(--border-subtle)]">
                <img src={`https://picsum.photos/seed/${selectedMember.id}/200/200`} alt={selectedMember.name} className="w-20 h-20 rounded-2xl object-cover border border-[var(--accent)]/30" />
                <div>
                  <h4 className="text-xl font-bold">{selectedMember.name}</h4>
                  <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-widest">{selectedMember.tier} Tier Member</p>
                </div>
              </div>

              <div className="space-y-8">
                {/* 3D Donut Chart */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full blur-3xl -mr-16 -mt-16" />
                  <h5 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-6 relative z-10">Macro Distribution (Avg)</h5>
                  <div className="h-[250px] w-full relative z-10">
                    {selectedMember.nutritionData && selectedMember.nutritionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <defs>
                            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                              <feOffset dx="2" dy="4" result="offsetblur" />
                              <feComponentTransfer>
                                <feFuncA type="linear" slope="0.5" />
                              </feComponentTransfer>
                              <feMerge>
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          <Pie
                            data={(() => {
                              const data = selectedMember.nutritionData || [];
                              const totals = data.reduce((acc, curr) => ({
                                protein: acc.protein + curr.protein,
                                carbs: acc.carbs + curr.carbs,
                                fat: acc.fat + curr.fat
                              }), { protein: 0, carbs: 0, fat: 0 });
                              const sum = totals.protein + totals.carbs + totals.fat;
                              if (sum === 0) return [
                                { name: 'Protein', value: 33 },
                                { name: 'Carbs', value: 33 },
                                { name: 'Fat', value: 34 },
                              ];
                              return [
                                { name: 'Protein', value: Math.round((totals.protein / sum) * 100) },
                                { name: 'Carbs', value: Math.round((totals.carbs / sum) * 100) },
                                { name: 'Fat', value: Math.round((totals.fat / sum) * 100) },
                              ];
                            })()}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={85}
                            paddingAngle={10}
                            dataKey="value"
                            stroke="none"
                            style={{ filter: 'url(#shadow)' }}
                          >
                            <Cell fill="var(--accent)" />
                            <Cell fill="#A855F7" />
                            <Cell fill="#F43F5E" />
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'var(--bg-card)', 
                              border: '1px solid var(--border-subtle)', 
                              borderRadius: '12px',
                              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                            }}
                            itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-4 text-[var(--text-secondary)]">
                        <PieChartIcon className="w-12 h-12 opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">No Nutrition Data Recorded</p>
                      </div>
                    )}
                  </div>
                  {selectedMember.nutritionData && selectedMember.nutritionData.length > 0 && (
                    <div className="flex justify-center gap-6 mt-4 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Protein</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#A855F7]" />
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Carbs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#F43F5E]" />
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Fat</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Gemini Analysis */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 relative overflow-hidden shadow-lg">
                  <div className="absolute top-0 right-0 p-4">
                    <Zap className="w-4 h-4 text-[var(--accent)] animate-pulse" />
                  </div>
                  <h5 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4">AI Insights & Recommendations</h5>
                  {analyzing ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-4">
                      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Consulting AI Dietician...</p>
                    </div>
                  ) : (
                    <div className="text-sm leading-relaxed text-[var(--text-primary)] whitespace-pre-wrap bg-[var(--bg-main)]/50 p-6 rounded-2xl border border-[var(--border-subtle)]">
                      {analysis || "No analysis available. Click 'Analyze' to generate insights."}
                    </div>
                  )}
                </div>

                <button className="w-full py-4 bg-[var(--accent)] text-[#080C14] font-bold rounded-2xl hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)]">
                  Generate Weekly Diet Plan
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
