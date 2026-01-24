
import React from 'react';
import { api } from '../services/api';
import { Action } from '../types';
import { STATUS_COLORS } from '../constants';
import { Search, RefreshCw, Filter, ChevronRight, Clock, MapPin, Activity, History, Zap, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { TriggerActionModal } from './TriggerActionModal';

interface Toast {
  id: number;
  type: 'success' | 'error';
  message: string;
}

export const Actions: React.FC = () => {
  const [actions, setActions] = React.useState<Action[]>([]);
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [selectedAction, setSelectedAction] = React.useState<Action | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const fetchActions = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = filter === 'all' 
        ? await api.getActions(100)
        : await api.getActionsByStatus(filter);
      setActions(data.actions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleActionSuccess = () => {
    showToast('success', 'Action triggered successfully');
    fetchActions();
  };

  const filteredActions = actions.filter(a => 
    a.target.toLowerCase().includes(search.toLowerCase()) ||
    a.action.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right duration-300 ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Actions History</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search by target..."
              className="bg-[#1f2937] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchActions}
            className="p-2 bg-[#1f2937] border border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Zap size={18} />
            Trigger Action
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 space-x-2">
        {['all', 'pending', 'running', 'completed', 'failed', 'cancelled'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap ${
              filter === s 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-[#1f2937] border-gray-800 text-gray-400 hover:border-gray-600'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-[#1f2937] rounded-xl border border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#111827] text-gray-400 text-xs font-bold uppercase tracking-wider border-b border-gray-800">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Target</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Started</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredActions.map(action => (
              <tr 
                key={action.id} 
                onClick={() => setSelectedAction(action)}
                className="hover:bg-gray-800/50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4 text-xs mono text-gray-500">#{action.id}</td>
                <td className="px-6 py-4">
                  <span className="font-bold text-cyan-400 mono text-sm">{action.target}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-200 capitalize font-medium">{action.action}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase ${STATUS_COLORS[action.status]}`}>
                    {action.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm text-gray-400">
                  {formatDistanceToNow(new Date(action.started_at), { addSuffix: true })}
                </td>
              </tr>
            ))}
            {filteredActions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <History size={48} className="text-gray-700" />
                    <p className="text-gray-500 font-medium">No actions found matching your filters.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Action Detail Modal */}
      {selectedAction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1f2937] border border-gray-700 rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-gray-800">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Action Details</div>
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    {selectedAction.action.toUpperCase()}
                    <span className={`ml-4 px-3 py-1 rounded-full text-xs border ${STATUS_COLORS[selectedAction.status]}`}>
                      {selectedAction.status.toUpperCase()}
                    </span>
                  </h2>
                </div>
                <button 
                  onClick={() => setSelectedAction(null)}
                  className="text-gray-500 hover:text-white"
                >
                  <ChevronRight className="rotate-90" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-300">
                    <MapPin size={18} className="text-blue-400" />
                    <span className="mono text-sm">{selectedAction.target}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-300">
                    <Clock size={18} className="text-blue-400" />
                    <span className="text-sm">{new Date(selectedAction.started_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-4">
                   <div className="flex items-center space-x-3 text-gray-300">
                    <Activity size={18} className="text-blue-400" />
                    <span className="text-sm">Action ID: <span className="mono">#{selectedAction.id}</span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Audit Details</div>
              <div className="bg-[#111827] rounded-xl p-6 border border-gray-800 font-mono text-sm text-blue-100/80 leading-relaxed whitespace-pre-wrap">
                {selectedAction.details}
              </div>
            </div>

            <div className="p-6 bg-[#111827] rounded-b-2xl border-t border-gray-800 text-right">
              <button 
                onClick={() => setSelectedAction(null)}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Action Modal */}
      <TriggerActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
};
