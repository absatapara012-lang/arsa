import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { collection, onSnapshot, db, query, orderBy, limit } from '../firebase';
import { Member, Expense, Inquiry } from '../types';
import { format, subDays, isAfter, parseISO } from 'date-fns';

const data = [
  { name: '06:00', traffic: 45 },
  { name: '08:00', traffic: 85 },
  { name: '10:00', traffic: 65 },
  { name: '12:00', traffic: 40 },
  { name: '14:00', traffic: 35 },
  { name: '16:00', traffic: 75 },
  { name: '18:00', traffic: 95 },
  { name: '20:00', traffic: 60 },
  { name: '22:00', traffic: 25 },
];

const revenueData = [
  { name: 'Mon', revenue: 4500, expenses: 3200 },
  { name: 'Tue', revenue: 5200, expenses: 3100 },
  { name: 'Wed', revenue: 4800, expenses: 3400 },
  { name: 'Thu', revenue: 6100, expenses: 3000 },
  { name: 'Fri', revenue: 5500, expenses: 3600 },
  { name: 'Sat', revenue: 7200, expenses: 4000 },
  { name: 'Sun', revenue: 6800, expenses: 3800 },
];

export function Dashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [atRiskCount, setAtRiskCount] = useState(0);

  useEffect(() => {
    const unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      const memberList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member));
      setMembers(memberList);
      
      // Retention Engine Logic
      const threeDaysAgo = subDays(new Date(), 3);
      const atRisk = memberList.filter(m => {
        const lastCheckIn = parseISO(m.lastCheckIn);
        return !isAfter(lastCheckIn, threeDaysAgo);
      });
      setAtRiskCount(atRisk.length);
    });

    const unsubExpenses = onSnapshot(collection(db, 'expenses'), (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
    });

    const unsubInquiries = onSnapshot(collection(db, 'inquiries'), (snapshot) => {
      setInquiries(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Inquiry)));
    });

    return () => {
      unsubMembers();
      unsubExpenses();
      unsubInquiries();
    };
  }, []);

  const totalRevenue = members.reduce((acc, m) => acc + (m.tier === 'AI' ? 99 : m.tier === 'Pro' ? 59 : 29), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const profit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          trend="+12.5%" 
          icon={DollarSign} 
          color="var(--accent)" 
        />
        <KPICard 
          title="Active Members" 
          value={members.length.toString()} 
          trend="+4.2%" 
          icon={Users} 
          color="#A855F7" 
        />
        <KPICard 
          title="Net Profit" 
          value={`$${profit.toLocaleString()}`} 
          trend="+8.1%" 
          icon={TrendingUp} 
          color="#10B981" 
          isPositive={profit > 0}
        />
        <KPICard 
          title="At-Risk Members" 
          value={atRiskCount.toString()} 
          trend="Requires Action" 
          icon={AlertTriangle} 
          color="#F43F5E" 
          isWarning={atRiskCount > 0}
        />
      </div>

      {/* Charts Section */}
      {(members.length > 0 || expenses.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Gym Traffic 3D Bar Chart */}
          <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">Gym Traffic Analysis</h3>
                <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">Hourly Density Terminal</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-[var(--accent)]/10 rounded-full border border-[var(--accent)]/20">
                <Activity className="w-3 h-3 text-[var(--accent)]" />
                <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">Live Feed</span>
              </div>
            </div>
            
            <div className="h-[350px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 700 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 700 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'var(--border-subtle)' }}
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-card)', 
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <Bar 
                    dataKey="traffic" 
                    fill="url(#barGradient)" 
                    radius={[6, 6, 0, 0]} 
                    barSize={32}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} className="hover:opacity-80 transition-opacity cursor-pointer" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Line Graph */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 relative overflow-hidden group">
            <div className="flex flex-col h-full">
              <div className="mb-8">
                <h3 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">Financial Pulse</h3>
                <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">Revenue vs Expenses</p>
              </div>

              <div className="flex-1 h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 700 }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--bg-card)', 
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--accent)" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: 'var(--accent)', strokeWidth: 2, stroke: 'var(--bg-main)' }}
                      activeDot={{ r: 6, fill: 'var(--accent)' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#F43F5E" 
                      strokeWidth={2} 
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8 pt-8 border-t border-[var(--border-subtle)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Revenue</span>
                  </div>
                  <span className="text-sm font-black text-[var(--text-primary)]">$42.8k</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#F43F5E]" />
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Expenses</span>
                  </div>
                  <span className="text-sm font-black text-[var(--text-primary)]">$18.2k</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Section: Retention Alerts & Sales Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Retention Engine */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">Retention Engine</h3>
            <span className="px-3 py-1 bg-rose-500/10 text-rose-500 text-[10px] font-bold rounded-full border border-rose-500/20 uppercase tracking-widest">
              {atRiskCount} Alerts
            </span>
          </div>
          <div className="space-y-4">
            {members.filter(m => {
              const lastCheckIn = parseISO(m.lastCheckIn);
              return !isAfter(lastCheckIn, subDays(new Date(), 3));
            }).slice(0, 4).map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)] group hover:border-[var(--accent)]/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={`https://picsum.photos/seed/${member.id}/100/100`} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[var(--bg-card)] animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{member.name}</h4>
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">Last Check-in: {format(parseISO(member.lastCheckIn), 'MMM dd, HH:mm')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => window.open(`https://wa.me/${member.phone}?text=Hey ${member.name}, we missed you at ARSA. Your progress is waiting!`, '_blank')}
                  className="px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold rounded-lg uppercase tracking-widest hover:bg-[var(--accent)] hover:text-[#080C14] transition-all"
                >
                  Rescue
                </button>
              </div>
            ))}
            {atRiskCount === 0 && (
              <div className="text-center py-12 text-[var(--text-secondary)] font-bold uppercase tracking-widest text-xs">
                All members are consistent.
              </div>
            )}
          </div>
        </div>

        {/* Sales Pipeline */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-extrabold tracking-tight text-[var(--text-primary)]">Sales Pipeline</h3>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded-full border border-amber-500/20 uppercase tracking-widest">
              Hot Leads
            </span>
          </div>
          <div className="space-y-4">
            {inquiries.filter(i => i.status === 'Decision Pitch').slice(0, 4).map((inquiry) => (
              <div key={inquiry.id} className="flex items-center justify-between p-4 bg-[var(--border-subtle)] rounded-2xl border border-[var(--border-subtle)] group hover:border-amber-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">{inquiry.name}</h4>
                    <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">Inquiry: {format(parseISO(inquiry.inquiryDate), 'MMM dd')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-[8px] font-bold rounded uppercase tracking-widest">Decision Pitch</span>
                  <button className="p-2 text-[var(--text-secondary)] hover:text-amber-500 transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {inquiries.filter(i => i.status === 'Decision Pitch').length === 0 && (
              <div className="text-center py-12 text-[var(--text-secondary)] font-bold uppercase tracking-widest text-xs">
                No high-priority leads.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  trend: string;
  icon: React.ElementType;
  color: string;
  isPositive?: boolean;
  isWarning?: boolean;
}

function KPICard({ title, value, trend, icon: Icon, color, isPositive, isWarning }: KPICardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 relative overflow-hidden group cursor-pointer"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-white/10 transition-all" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="p-3 rounded-2xl bg-[var(--border-subtle)] border border-[var(--border-subtle)] group-hover:border-[var(--accent)]/30 transition-all">
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
          isWarning ? "bg-rose-500/10 text-rose-500" : isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-[var(--border-subtle)] text-[var(--text-secondary)]"
        )}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : isWarning ? <AlertTriangle className="w-3 h-3" /> : null}
          {trend}
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-black tracking-tighter text-[var(--text-primary)]">{value}</h3>
      </div>

      {isWarning && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-rose-500/50 blur-sm animate-pulse" />
      )}
    </motion.div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
