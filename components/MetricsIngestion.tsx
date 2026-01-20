
import React from 'react';
import { api } from '../services/api';
import { IngestResponse } from '../types';
import { Send, Trash2, CheckCircle, AlertTriangle, Code } from 'lucide-react';

export const MetricsIngestion: React.FC = () => {
  const [form, setForm] = React.useState({
    name: '',
    value: '',
    tags: '{"host": "web-01", "region": "us-east-1"}'
  });
  const [response, setResponse] = React.useState<IngestResponse | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const tags = JSON.parse(form.tags);
      const res = await api.ingestMetric({
        name: form.name,
        value: parseFloat(form.value),
        tags
      });
      setResponse(res);
    } catch (err: any) {
      setError(err.message || 'Failed to ingest metric. Check JSON format or connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (name: string, value: string) => {
    setForm(prev => ({ ...prev, name, value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-[#1f2937] p-8 rounded-xl border border-gray-800 shadow-sm">
        <h2 className="text-xl font-bold text-white mb-6">Ingest Manual Metric</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Metric Name</label>
              <input
                required
                type="text"
                placeholder="e.g., cpu_usage"
                className="w-full bg-[#111827] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Value</label>
              <input
                required
                type="number"
                step="any"
                placeholder="e.g., 85.5"
                className="w-full bg-[#111827] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={form.value}
                onChange={e => setForm({ ...form, value: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Tags (JSON)</label>
            <textarea
              className="w-full bg-[#111827] border border-gray-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all h-24"
              value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500 self-center mr-2">Quick presets:</span>
            {['cpu_usage', 'memory_usage', 'disk_usage', 'http_latency'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => handleQuickFill(m, '75')}
                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full text-xs transition-colors"
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/10"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={20} />
              )}
              <span>Submit Metric</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setForm({ name: '', value: '', tags: '{}' });
                setError(null);
                setResponse(null);
              }}
              className="flex items-center space-x-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-semibold transition-all"
            >
              <Trash2 size={20} />
              <span>Clear Form</span>
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center space-x-3 text-red-400">
          <AlertTriangle size={20} />
          <span>{error}</span>
        </div>
      )}

      {response && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {response.violations && response.violations.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 text-amber-500 font-bold">
                <AlertTriangle size={20} />
                <span>Policy violations detected! {response.violations.length} policies triggered.</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {response.violations.map((v, i) => (
                  <span key={i} className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded border border-amber-500/20 uppercase">
                    {v.policy_name} ({v.severity})
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#1f2937] p-8 rounded-xl border border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 text-white font-bold">
                <Code size={20} className="text-blue-500" />
                <span>API Response Preview</span>
              </div>
              <div className="flex items-center space-x-2 text-emerald-500 font-medium">
                <CheckCircle size={18} />
                <span>Success</span>
              </div>
            </div>
            <div className="bg-[#111827] rounded-lg p-6 font-mono text-sm overflow-x-auto text-blue-300">
              <pre>{JSON.stringify(response, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
