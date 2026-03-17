import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  PieChart as PieChartIcon,
  Filter,
  MoreVertical,
  Calendar,
  CreditCard,
  Briefcase,
  Zap
} from 'lucide-react';
import { collection, onSnapshot, db, addDoc, query, orderBy } from '../firebase';
import { Expense, Member } from '../types';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function Financials() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', category: 'Other' });

  useEffect(() => {
    const unsubExpenses = onSnapshot(query(collection(db, 'expenses'), orderBy('date', 'desc')), (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense)));
    });
    const unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      setMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Member)));
    });
    return () => {
      unsubExpenses();
      unsubMembers();
    };
  }, []);

  const totalRevenue = members.reduce((acc, m) => acc + (m.tier === 'AI' ? 99 : m.tier === 'Pro' ? 59 : 29), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const profit = totalRevenue - totalExpenses;

  const categoryData = [
    { name: 'Rent', value: expenses.filter(e => e.category === 'Rent').reduce((acc, e) => acc + e.amount, 0) },
    { name: 'Electricity', value: expenses.filter(e => e.category === 'Electricity').reduce((acc, e) => acc + e.amount, 0) },
    { name: 'Staff', value: expenses.filter(e => e.category === 'Staff').reduce((acc, e) => acc + e.amount, 0) },
    { name: 'Supplements', value: expenses.filter(e => e.category === 'Supplement Stock').reduce((acc, e) => acc + e.amount, 0) },
    { name: 'Other', value: expenses.filter(e => e.category === 'Other').reduce((acc, e) => acc + e.amount, 0) },
  ].filter(c => c.value > 0);

  const COLORS = ['#00F2FF', '#A855F7', '#F43F5E', '#10B981', '#F59E0B'];

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'expenses'), {
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      date: new Date().toISOString()
    });
    setIsModalOpen(false);
    setNewExpense({ title: '', amount: '', category: 'Other' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">Financial Command Center</h2>
          <p className="text-[var(--text-secondary)] font-bold uppercase tracking-widest text-[10px] mt-1">Revenue Tracking & Profit Engineering</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2 bg-[var(--accent)] text-[#080C14] font-bold rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)]"
        >
          <Plus className="w-4 h-4" />
          Log Expense
        </button>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Total Revenue</p>
            <h3 className="text-4xl font-black tracking-tighter mb-4 text-[var(--text-primary)]">${totalRevenue.toLocaleString()}</h3>
            <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
              <ArrowUpRight className="w-4 h-4" />
              <span>+14.2% from last month</span>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6">
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-500/20">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Total Expenses</p>
            <h3 className="text-4xl font-black tracking-tighter mb-4 text-[var(--text-primary)]">${totalExpenses.toLocaleString()}</h3>
            <div className="flex items-center gap-2 text-rose-500 text-xs font-bold">
              <ArrowDownRight className="w-4 h-4" />
              <span>+5.8% from last month</span>
            </div>
          </div>

          <div className="md:col-span-2 bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-main)] border border-[var(--border-subtle)] rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1">Net Profit Margin</p>
                <h3 className={`text-5xl font-black tracking-tighter ${profit >= 0 ? 'text-[var(--accent)] shadow-[0_0_30px_rgba(0,242,255,0.2)]' : 'text-rose-500'}`}>
                  ${profit.toLocaleString()}
                </h3>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2 text-[var(--accent)] mb-2">
                  <Zap className="w-5 h-5 animate-pulse" />
                  <span className="text-xl font-black">{((profit / totalRevenue) * 100).toFixed(1)}%</span>
                </div>
                <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Efficiency Rating: High</p>
              </div>
            </div>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-8">
          <h3 className="text-lg font-extrabold tracking-tight mb-8 text-[var(--text-primary)]">Expense Allocation</h3>
          <div className="h-[250px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {categoryData.map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{c.name}</span>
                </div>
                <span className="text-xs font-black text-[var(--text-primary)]">${c.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expense Ledger */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-secondary)]">Expense Ledger</h3>
          <div className="flex gap-2">
            <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"><Filter className="w-4 h-4" /></button>
            <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all"><MoreVertical className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--text-primary)]/[0.02] border-b border-[var(--border-subtle)]">
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Transaction</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Category</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-[var(--text-primary)]/[0.02] transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[var(--text-primary)]/5 rounded-lg flex items-center justify-center text-[var(--text-secondary)]">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-[var(--text-primary)]">{expense.title}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-2 py-1 bg-[var(--text-primary)]/5 border border-[var(--border-subtle)] rounded text-[8px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-[var(--text-secondary)]" />
                      <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{format(parseISO(expense.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="text-sm font-black text-rose-500">-${expense.amount.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-10 w-full max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <h3 className="text-2xl font-extrabold tracking-tight mb-8 text-[var(--text-primary)]">Log New Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">Title</label>
                <input 
                  type="text" 
                  required
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({...newExpense, title: e.target.value})}
                  className="w-full bg-[var(--text-primary)]/5 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)]/40 transition-all"
                  placeholder="e.g. Monthly Rent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">Amount</label>
                  <input 
                    type="number" 
                    required
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    className="w-full bg-[var(--text-primary)]/5 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)]/40 transition-all"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 block">Category</label>
                  <select 
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    className="w-full bg-[var(--text-primary)]/5 border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)]/40 transition-all appearance-none"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Staff">Staff</option>
                    <option value="Supplement Stock">Supplements</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-[var(--text-primary)]/5 text-[var(--text-secondary)] font-bold rounded-2xl hover:bg-[var(--text-primary)]/10 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-[var(--accent)] text-[#080C14] font-bold rounded-2xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,242,255,0.2)]"
                >
                  Confirm Log
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
