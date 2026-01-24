
import React from 'react';
import { X, Zap, Loader2 } from 'lucide-react';
import { api } from '../services/api';

interface TriggerActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ACTION_TYPES = [
  { value: 'restart', label: 'Restart' },
  { value: 'scale', label: 'Scale' },
  { value: 'notify', label: 'Notify' },
];

export const TriggerActionModal: React.FC<TriggerActionModalProps> = ({ 
  isOpen, 
  onClose,
  onSuccess 
}) => {
  const [target, setTarget] = React.useState('');
  const [actionType, setActionType] = React.useState('restart');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!target.trim()) {
      setError('Target is required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.createAction({
        target: target.trim(),
        action: actionType,
        status: 'pending',
        details: `Manually triggered ${actionType} action on ${target}`
      });
      
      // Reset form
      setTarget('');
      setActionType('restart');
      
      // Notify parent of success
      onSuccess();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create action');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setTarget('');
    setActionType('restart');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#111827] border border-gray-700 rounded-xl shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Zap size={20} />
            </div>
            <h2 className="text-xl font-semibold text-white">Trigger Action</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Target
            </label>
            <input
              type="text"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-[#0b0f1a] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., web-service-01, api-gateway"
              autoFocus
            />
            <p className="mt-1.5 text-xs text-gray-500">
              The service or resource to target with this action
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Action Type
            </label>
            <select
              value={actionType}
              onChange={(e) => setActionType(e.target.value)}
              className="w-full bg-[#0b0f1a] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {ACTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap size={16} />
              )}
              Trigger Action
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
