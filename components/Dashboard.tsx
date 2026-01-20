
import React from 'react';
import { api } from '../services/api';
import { Action, Policy, QueueStats } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { STATUS_COLORS, Page } from '../constants';
import { Activity, Clock, Layers, ArrowRight } from 'lucide-react';

interface DashboardProps {
  onPageChange?: (page: Page) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const [stats, setStats] = React.useState<{
    actions: { count: number; actions: Action[] };
    policies: { total: number; enabled_count: number };
    queue: QueueStats | null;
  }>({
    actions: { count: 0, actions: [] },
    policies: { total: 0, enabled_count: 0 },
    queue: null
  });

  const [loading, setLoading] = React.useState(true);

  const refreshData = React.useCallback(async () => {
    try {
      const [actionsRes, policiesRes, queueRes] = await Promise.all([
        api.getActions(10),
        api.getPolicies(),
        api.getQueueStats().catch(() => null)
      ]);
      
      setStats({
        actions: actionsRes,
        policies: { total: policiesRes.total, enabled_count: policiesRes.enabled_count },
        queue: queueRes
      });
    } catch (e) {
      console.error("Dashboard refresh error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  if (loading && !stats.actions.actions.length) {
    return <div className="animate-pulse space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-800/50 rounded-xl" />)}
      </div>
      <div className="h-96 bg-gray-800/50 rounded-xl" />
    </div>;
  }

  const pendingCount = stats.actions.actions.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800 shadow-sm group hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Activity size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.actions.count}
          </div>
          <div className="text-sm text-gray-400 font-medium">Metrics Processed</div>
        </div>

        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800 shadow-sm group hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <Clock size={24} />
            </div>
            <span className="text-xs font-bold px-2 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 uppercase">
              Action Required
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {pendingCount}
          </div>
          <div className="text-sm text-gray-400 font-medium">Pending Actions</div>
        </div>

        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800 shadow-sm group hover:border-gray-700 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <Layers size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">
            {stats.queue?.queue_length ?? 0}
          </div>
          <div className="text-sm text-gray-400 font-medium">Queue Depth</div>
        </div>
      </div>

      {/* Recent Actions Table */}
      <div className="bg-[#1f2937] rounded-xl border border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Recent Actions</h2>
          <button 
            onClick={() => onPageChange?.(Page.ACTIONS)}
            className="text-sm text-blue-500 hover:text-blue-400 font-medium flex items-center"
          >
            View all <ArrowRight size={16} className="ml-1" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#111827] text-gray-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-3">Target</th>
                <th className="px-6 py-3">Action</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {stats.actions.actions.map((action) => (
                <tr key={action.id} className="hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-medium text-cyan-400 mono text-sm">{action.target}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-200 capitalize">
                    {action.action}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${STATUS_COLORS[action.status]}`}>
                      {action.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {formatDistanceToNow(new Date(action.started_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
              {stats.actions.actions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                    No recent actions recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Policies Summary */}
      <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Policies</div>
            <div className="text-2xl font-bold text-white">{stats.policies.total}</div>
          </div>
          <div className="h-10 w-px bg-gray-800" />
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Enabled</div>
            <div className="text-2xl font-bold text-emerald-500">{stats.policies.enabled_count}</div>
          </div>
          <div className="h-10 w-px bg-gray-800" />
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Disabled</div>
            <div className="text-2xl font-bold text-gray-400">
              {stats.policies.total - stats.policies.enabled_count}
            </div>
          </div>
        </div>
        <button 
          onClick={() => onPageChange?.(Page.POLICIES)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Manage Policies
        </button>
      </div>
    </div>
  );
};
