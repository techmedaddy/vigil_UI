
import React from 'react';

export enum Page {
  DASHBOARD = 'dashboard',
  METRICS = 'metrics',
  POLICIES = 'policies',
  ACTIONS = 'actions',
  QUEUE = 'queue',
  SIMULATOR = 'simulator',
  TESTER = 'tester'
}

export const SEVERITY_COLORS = {
  info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export const STATUS_COLORS = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  running: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  cancelled: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};
