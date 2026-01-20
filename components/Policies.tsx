
import React from 'react';
import { api } from '../services/api';
import { Policy } from '../types';
import { SEVERITY_COLORS } from '../constants';
import { Plus, Edit2, Trash2, Shield, Search, ToggleLeft as Toggle } from 'lucide-react';

export const Policies: React.FC = () => {
  const [policies, setPolicies] = React.useState<Policy[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [severityFilter, setSeverityFilter] = React.useState('all');
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [editingPolicy, setEditingPolicy] = React.useState<Policy | null>(null);

  const fetchPolicies = React.useCallback(async () => {
    try {
      const data = await api.getPolicies();
      setPolicies(Object.values(data.policies));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const togglePolicy = async (name: string, currentEnabled: boolean) => {
    // Optimistic UI
    setPolicies(prev => prev.map(p => p.name === name ? { ...p, enabled: !currentEnabled } : p));
    try {
      if (currentEnabled) {
        await api.disablePolicy(name);
      } else {
        await api.enablePolicy(name);
      }
    } catch (e) {
      // Revert on error
      setPolicies(prev => prev.map(p => p.name === name ? { ...p, enabled: currentEnabled } : p));
      alert("Failed to update policy");
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete policy "${name}"?`)) return;
    try {
      await api.deletePolicy(name);
      setPolicies(prev => prev.filter(p => p.name !== name));
    } catch (e) {
      alert("Failed to delete policy");
    }
  };

  const handleEdit = (policy: Policy) => {
    setEditingPolicy(policy);
    setShowCreateModal(true);
  };

  const filteredPolicies = policies.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || p.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Policy Management</h2>
          <p className="text-gray-500 text-sm font-medium">Configure thresholds and automated remediation triggers.</p>
        </div>
        
        <button 
          onClick={() => {
            setEditingPolicy(null);
            setShowCreateModal(true);
          }}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
        >
          <Plus size={20} />
          <span>Create New Policy</span>
        </button>
      </div>

      <div className="bg-[#1f2937] p-6 rounded-2xl border border-gray-800 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search policies by name or description..."
            className="w-full bg-[#111827] border border-gray-700 rounded-xl pl-12 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          {['all', 'info', 'warning', 'critical'].map(s => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${
                severityFilter === s 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#1f2937] rounded-2xl border border-gray-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#111827] text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-800">
            <tr>
              <th className="px-8 py-5">Policy Name</th>
              <th className="px-8 py-5">Severity</th>
              <th className="px-8 py-5">Target</th>
              <th className="px-8 py-5">Auto-Remediate</th>
              <th className="px-8 py-5">Enabled</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredPolicies.map(policy => (
              <tr key={policy.name} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-8 py-6">
                  <div className="font-bold text-white mb-0.5">{policy.name}</div>
                  <div className="text-xs text-gray-500 line-clamp-1 max-w-xs">{policy.description}</div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black border uppercase tracking-widest ${SEVERITY_COLORS[policy.severity]}`}>
                    {policy.severity}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="mono text-xs text-gray-400">{policy.target}</span>
                </td>
                <td className="px-8 py-6">
                  {policy.auto_remediate ? (
                    <div className="flex items-center space-x-2 text-emerald-500">
                      <Shield size={16} />
                      <span className="text-xs font-bold uppercase tracking-tighter italic">Active</span>
                    </div>
                  ) : (
                    <span className="text-gray-600 text-xs">—</span>
                  )}
                </td>
                <td className="px-8 py-6">
                  <button 
                    onClick={() => togglePolicy(policy.name, policy.enabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      policy.enabled ? 'bg-emerald-600' : 'bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        policy.enabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => handleEdit(policy)}
                      className="p-2 text-gray-500 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                      title="Edit policy"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(policy.name)}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete policy"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredPolicies.length === 0 && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Shield size={64} className="text-gray-800" />
                    <p className="text-gray-500 text-lg">No policies found matching your search criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Policy Modal */}
      {showCreateModal && (
        <PolicyFormModal
          policy={editingPolicy}
          onClose={() => {
            setShowCreateModal(false);
            setEditingPolicy(null);
          }}
          onSave={async (policy) => {
            try {
              if (editingPolicy) {
                const updated = await api.updatePolicy(editingPolicy.name, policy);
                setPolicies(prev => prev.map(p => p.name === editingPolicy.name ? updated : p));
              } else {
                const created = await api.createPolicy(policy);
                setPolicies(prev => [...prev, created]);
              }
              setShowCreateModal(false);
              setEditingPolicy(null);
            } catch (e: any) {
              alert(e.message || 'Failed to save policy');
            }
          }}
        />
      )}
    </div>
  );
};

// Policy Form Modal Component
interface PolicyFormModalProps {
  policy: Policy | null;
  onClose: () => void;
  onSave: (policy: Policy) => Promise<void>;
}

const PolicyFormModal: React.FC<PolicyFormModalProps> = ({ policy, onClose, onSave }) => {
  const [form, setForm] = React.useState<Policy>(policy || {
    name: '',
    description: '',
    severity: 'warning',
    target: 'all',
    enabled: true,
    auto_remediate: false,
    condition: { type: 'metric_exceeds', metric: 'cpu_percent', threshold: 80 },
    action: 'restart',
    params: {}
  });
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f2937] border border-gray-700 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-8 border-b border-gray-800">
            <h2 className="text-2xl font-bold text-white">
              {policy ? 'Edit Policy' : 'Create New Policy'}
            </h2>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Policy Name*</label>
                <input
                  required
                  disabled={!!policy}
                  type="text"
                  className="w-full bg-[#111827] border border-gray-700 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Severity*</label>
                <select
                  required
                  className="w-full bg-[#111827] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={form.severity}
                  onChange={e => setForm({ ...form, severity: e.target.value as any })}
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Description</label>
              <textarea
                className="w-full bg-[#111827] border border-gray-700 rounded-lg px-4 py-2 text-white h-20"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Target</label>
                <input
                  type="text"
                  className="w-full bg-[#111827] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={form.target}
                  onChange={e => setForm({ ...form, target: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Action*</label>
                <select
                  required
                  className="w-full bg-[#111827] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  value={form.action}
                  onChange={e => setForm({ ...form, action: e.target.value })}
                >
                  <option value="restart">Restart</option>
                  <option value="scale-up">Scale Up</option>
                  <option value="drain-pod">Drain Pod</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  checked={form.enabled}
                  onChange={e => setForm({ ...form, enabled: e.target.checked })}
                />
                <span className="text-sm text-gray-400">Enabled</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  checked={form.auto_remediate}
                  onChange={e => setForm({ ...form, auto_remediate: e.target.checked })}
                />
                <span className="text-sm text-gray-400">Auto Remediate</span>
              </label>
            </div>
          </div>

          <div className="p-6 bg-[#111827] rounded-b-2xl border-t border-gray-800 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Saving...' : (policy ? 'Update Policy' : 'Create Policy')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
