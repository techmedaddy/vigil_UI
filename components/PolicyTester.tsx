
import React from 'react';
import { api } from '../services/api';
import { EvaluationResult } from '../types';
import { FlaskConical, Play, CheckCircle, AlertCircle, Info, ArrowRight } from 'lucide-react';

export const PolicyTester: React.FC = () => {
  const [metricsJson, setMetricsJson] = React.useState(
    JSON.stringify({ cpu_percent: 95, memory_percent: 88, disk_free_percent: 12 }, null, 2)
  );
  const [target, setTarget] = React.useState('web-server-01');
  const [result, setResult] = React.useState<EvaluationResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);
    try {
      const metrics = JSON.parse(metricsJson);
      const res = await api.evaluatePolicies({ metrics, target });
      setResult(res);
    } catch (e: any) {
      setError(e.message || "Invalid JSON or evaluation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#1f2937] p-8 rounded-2xl border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <FlaskConical size={24} className="mr-3 text-blue-500" />
            Dry-Run Evaluation
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Metrics (JSON)</label>
              <textarea
                className="w-full h-48 bg-[#111827] border border-gray-700 rounded-xl p-4 font-mono text-sm text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={metricsJson}
                onChange={e => setMetricsJson(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Target Service</label>
              <input
                type="text"
                className="w-full bg-[#111827] border border-gray-700 rounded-xl px-4 py-2.5 text-white mono"
                value={target}
                onChange={e => setTarget(e.target.value)}
                placeholder="e.g., web-server-01"
              />
            </div>
            <button
              disabled={loading}
              onClick={handleEvaluate}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white font-bold rounded-xl transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play size={20} />
              )}
              <span>Evaluate Policies</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1f2937] p-8 rounded-2xl border border-gray-800 h-full">
            <h3 className="text-xl font-bold text-white mb-6">Evaluation Results</h3>
            
            {!result && !error && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-600 space-y-4">
                <Info size={48} />
                <p className="text-sm font-medium">Input metrics and click evaluate to see results.</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start space-x-3">
                <AlertCircle size={20} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {result.violations.length === 0 ? (
                  <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center space-x-4 text-emerald-400">
                    <CheckCircle size={32} />
                    <div>
                      <div className="font-bold">No Violations Found</div>
                      <div className="text-xs">The provided metrics pass all enabled policies.</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-amber-500 font-bold text-sm uppercase flex items-center mb-4">
                      <AlertCircle size={18} className="mr-2" />
                      {result.violations.length} Violations Detected
                    </div>
                    {result.violations.map((v, i) => (
                      <div key={i} className="bg-[#111827] border border-gray-700 p-5 rounded-xl space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-white">{v.policy_name}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-widest ${
                            v.severity === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          }`}>
                            {v.severity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{v.description}</p>
                        {result.actions_triggered[i] && (
                          <div className="pt-2 border-t border-gray-800 flex items-center text-xs font-medium text-emerald-500">
                            <ArrowRight size={14} className="mr-2" />
                            <span>Action: {result.actions_triggered[i].action}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-blue-600/5 border border-blue-600/10 p-4 rounded-xl text-xs text-blue-400 leading-relaxed">
                  <span className="font-bold text-blue-300 block mb-1 uppercase tracking-tighter">Dry-Run Note</span>
                  This evaluation is a static test against currently loaded policies. No remediation actions have been sent to workers.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
