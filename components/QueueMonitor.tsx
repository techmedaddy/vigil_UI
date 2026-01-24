
import React from 'react';
import { api } from '../services/api';
import { QueueStats } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Layers, CheckCircle, AlertCircle, TrendingUp, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export const QueueMonitor: React.FC = () => {
  const [stats, setStats] = React.useState<QueueStats | null>(null);
  const [history, setHistory] = React.useState<Array<{ time: string; depth: number }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      const data = await api.getQueueStats();
      setStats(data);
      setError(null);
      
      // Use history from API if available, otherwise build locally
      if (data.history && data.history.length > 0) {
        setHistory(data.history);
      } else {
        const now = format(new Date(), 'HH:mm:ss');
        const depth = data.queue_depth ?? data.queue_length ?? 0;
        setHistory(prev => {
          const newHistory = [...prev, { time: now, depth }];
          if (newHistory.length > 60) return newHistory.slice(1);
          return newHistory;
        });
      }
    } catch (e) {
      console.error("Queue stats error:", e);
      setError('Failed to fetch queue data');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Calculate success rate - prefer API value, fallback to calculation
  const successRate = React.useMemo(() => {
    if (stats?.success_rate !== undefined) {
      return stats.success_rate.toFixed(1);
    }
    if (stats?.tasks_completed !== undefined && stats?.tasks_dequeued) {
      return ((stats.tasks_completed / stats.tasks_dequeued) * 100).toFixed(1);
    }
    return '0.0';
  }, [stats]);

  // Get queue depth - prefer new field, fallback to legacy
  const queueDepth = stats?.queue_depth ?? stats?.queue_length ?? 0;
  const completed = stats?.completed ?? stats?.tasks_completed ?? 0;
  const failed = stats?.failed ?? stats?.tasks_failed ?? 0;

  // Error/No data fallback UI
  if (error && !stats) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#1f2937] p-12 rounded-xl border border-gray-800 text-center">
          <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No Queue Data Available</h3>
          <p className="text-gray-400 mb-6">Unable to connect to the queue service. The backend may be unavailable.</p>
          <button 
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <RefreshCw size={18} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-3 text-gray-400 mb-3">
            <Layers size={20} />
            <span className="text-xs font-bold uppercase tracking-wider">Queue Depth</span>
          </div>
          <div className={`text-4xl font-bold mb-1 ${
            queueDepth > 50 ? 'text-red-500' : queueDepth > 10 ? 'text-amber-500' : 'text-emerald-500'
          }`}>
            {queueDepth}
          </div>
          <div className="text-xs text-gray-500">Current waiting tasks</div>
        </div>

        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-3 text-gray-400 mb-3">
            <CheckCircle size={20} className="text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
          </div>
          <div className="text-4xl font-bold text-white mb-1">
            {completed.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Total successful tasks</div>
        </div>

        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-3 text-gray-400 mb-3">
            <AlertCircle size={20} className="text-red-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Failed</span>
          </div>
          <div className={`text-4xl font-bold mb-1 ${
            failed > 0 ? 'text-red-500' : 'text-white'
          }`}>
            {failed.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Task execution errors</div>
        </div>

        <div className="bg-[#1f2937] p-6 rounded-xl border border-gray-800">
          <div className="flex items-center space-x-3 text-gray-400 mb-3">
            <TrendingUp size={20} className="text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-wider">Success Rate</span>
          </div>
          <div className={`text-4xl font-bold mb-1 ${
            parseFloat(successRate) > 95 ? 'text-emerald-500' : parseFloat(successRate) > 0 ? 'text-amber-500' : 'text-white'
          }`}>
            {successRate}%
          </div>
          <div className="text-xs text-gray-500">Across all dequeued tasks</div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#1f2937] p-8 rounded-xl border border-gray-800 shadow-sm">
        <h3 className="text-lg font-bold text-white mb-8 flex items-center">
          <TrendingUp size={20} className="mr-3 text-blue-500" />
          Queue Depth History (Last 5 Minutes)
        </h3>
        <div className="h-80 w-full">
          {history.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Clock size={48} className="mx-auto mb-4 opacity-50" />
                <p>Waiting for queue data...</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorDepth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickMargin={10}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12} 
                  tickMargin={10}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="depth" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorDepth)" 
                  animationDuration={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Last Processed Task */}
      {stats?.last_processed_task && (
        <div className="bg-[#1f2937] p-8 rounded-xl border border-gray-800 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center">
            <Clock size={20} className="mr-3 text-blue-500" />
            Last Processed Task
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">Task ID</div>
              <div className="text-blue-400 mono text-sm truncate">{stats.last_processed_task.task_id}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">Target</div>
              <div className="text-white font-medium">{stats.last_processed_task.target}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">Action ID</div>
              <button className="text-emerald-400 mono text-sm underline hover:text-emerald-300">
                #{stats.last_processed_task.action_id}
              </button>
            </div>
            <div>
              <div className="text-xs font-bold text-gray-500 uppercase mb-1">Processed at</div>
              <div className="text-gray-400 text-sm">
                {new Date(stats.last_processed_task.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
