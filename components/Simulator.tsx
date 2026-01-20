
import React from 'react';
import { api } from '../services/api';
import { SimulatorStatus } from '../types';
import { Play, Square, AlertTriangle, Info, Zap, BarChart3 } from 'lucide-react';

export const Simulator: React.FC = () => {
  const [status, setStatus] = React.useState<SimulatorStatus | null>(null);
  const [config, setConfig] = React.useState({
    rate: 100,
    mode: 'steady',
    failure_rate: 5,
    timeout_rate: 2,
    malformed_rate: 1
  });
  const [loading, setLoading] = React.useState(false);

  const fetchStatus = React.useCallback(async () => {
    try {
      const data = await api.getSimulatorStatus();
      setStatus(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  React.useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => {
      if (status?.running) fetchStatus();
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchStatus, status?.running]);

  const handleStart = async () => {
    setLoading(true);
    try {
      await api.startSimulator({
        ...config,
        failure_rate: config.failure_rate / 100,
        timeout_rate: config.timeout_rate / 100,
        malformed_rate: config.malformed_rate / 100,
      });
      await fetchStatus();
    } catch (e) {
      alert("Failed to start simulator");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await api.stopSimulator();
      await fetchStatus();
    } catch (e) {
      alert("Failed to stop simulator");
    } finally {
      setLoading(false);
    }
  };

  const successRate = status && status.events_generated > 0 
    ? ((status.events_succeeded / status.events_generated) * 100).toFixed(1) 
    : 100;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-amber-500/10 border-l-4 border-amber-500 p-6 rounded-r-xl flex items-start space-x-4">
        <AlertTriangle className="text-amber-500 shrink-0" size={24} />
        <div>
          <h4 className="font-bold text-amber-500 text-lg mb-1">Operational Warning</h4>
          <p className="text-amber-400/80 text-sm leading-relaxed">
            The load simulator generates synthetic metrics and triggers remediation events. 
            Ensure you are in a non-production or isolated staging environment before execution.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Config Panel */}
        <div className="bg-[#1f2937] p-8 rounded-2xl border border-gray-800 shadow-sm">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center">
            <Zap size={24} className="mr-3 text-blue-500" />
            Simulator Configuration
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Generation Rate</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="1000"
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  value={config.rate}
                  onChange={e => setConfig({ ...config, rate: parseInt(e.target.value) })}
                />
                <span className="bg-[#111827] border border-gray-700 px-4 py-2 rounded-lg mono text-blue-400 font-bold w-24 text-center">
                  {config.rate}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Metrics ingested per minute</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Simulation Mode</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['steady', 'burst', 'ramp', 'chaos'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setConfig({ ...config, mode })}
                    className={`py-2 px-3 rounded-xl border text-xs font-black uppercase tracking-widest transition-all ${
                      config.mode === mode 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-[#111827] border-gray-700 text-gray-500 hover:border-gray-500'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Failure (%)</label>
                <input
                  type="number"
                  className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  value={config.failure_rate}
                  onChange={e => setConfig({ ...config, failure_rate: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Timeout (%)</label>
                <input
                  type="number"
                  className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  value={config.timeout_rate}
                  onChange={e => setConfig({ ...config, timeout_rate: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Malformed (%)</label>
                <input
                  type="number"
                  className="w-full bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
                  value={config.malformed_rate}
                  onChange={e => setConfig({ ...config, malformed_rate: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-8">
              <button
                disabled={status?.running || loading}
                onClick={handleStart}
                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/10"
              >
                <Play size={20} />
                <span>START SIMULATOR</span>
              </button>
              <button
                disabled={!status?.running || loading}
                onClick={handleStop}
                className="flex-1 flex items-center justify-center space-x-2 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/10"
              >
                <Square size={20} />
                <span>STOP SIMULATOR</span>
              </button>
            </div>
          </div>
        </div>

        {/* Status Panel */}
        <div className="bg-[#1f2937] p-8 rounded-2xl border border-gray-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white flex items-center">
              <BarChart3 size={24} className="mr-3 text-emerald-500" />
              Runtime Stats
            </h3>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
              status?.running ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
            }`}>
              <div className={`w-2 h-2 rounded-full ${status?.running ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
              <span>{status?.running ? 'Running' : 'Stopped'}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 flex-1">
             <div className="space-y-6">
               <div>
                 <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Events</div>
                 <div className="text-3xl font-black text-white mono">{status?.events_generated ?? 0}</div>
               </div>
               <div>
                 <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Success Rate</div>
                 <div className={`text-3xl font-black mono ${parseFloat(successRate.toString()) > 90 ? 'text-emerald-500' : 'text-amber-500'}`}>
                   {successRate}%
                 </div>
               </div>
               <div>
                 <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Uptime</div>
                 <div className="text-3xl font-black text-blue-400 mono">
                   {Math.floor((status?.uptime_seconds ?? 0) / 60).toString().padStart(2, '0')}:{(status?.uptime_seconds ?? 0 % 60).toString().padStart(2, '0')}
                 </div>
               </div>
             </div>

             <div className="space-y-4">
                <div className="p-4 bg-[#111827] rounded-xl border border-gray-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Failures</span>
                    <span className="text-xs font-bold text-red-500">{status?.events_failed ?? 0}</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: `${(status?.events_failed ?? 0) / (status?.events_generated || 1) * 100}%` }} />
                  </div>
                </div>
                <div className="p-4 bg-[#111827] rounded-xl border border-gray-800">
                   <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Timeouts</span>
                    <span className="text-xs font-bold text-amber-500">{status?.events_timeout ?? 0}</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${(status?.events_timeout ?? 0) / (status?.events_generated || 1) * 100}%` }} />
                  </div>
                </div>
                <div className="p-4 bg-[#111827] rounded-xl border border-gray-800">
                   <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">Malformed</span>
                    <span className="text-xs font-bold text-blue-500">{status?.events_malformed ?? 0}</span>
                  </div>
                  <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: `${(status?.events_malformed ?? 0) / (status?.events_generated || 1) * 100}%` }} />
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
