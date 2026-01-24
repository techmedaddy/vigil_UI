
import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  Shield, 
  History, 
  Layers, 
  Beaker, 
  FlaskConical, 
  Settings,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Page } from '../constants';
import { api } from '../services/api';
import { SystemHealth } from '../types';
import { SettingsModal } from './SettingsModal';

interface LayoutProps {
  children: React.ReactNode;
  activePage: Page;
  onPageChange: (page: Page) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onPageChange }) => {
  const [health, setHealth] = React.useState<SystemHealth | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  React.useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await api.getHealth();
        setHealth(data);
      } catch (e) {
        setHealth({ status: 'down', service: 'vigil' });
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: Page.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: Page.METRICS, label: 'Metrics Ingestion', icon: <Activity size={20} /> },
    { id: Page.POLICIES, label: 'Policies', icon: <Shield size={20} /> },
    { id: Page.ACTIONS, label: 'Actions History', icon: <History size={20} /> },
    { id: Page.QUEUE, label: 'Queue Monitor', icon: <Layers size={20} /> },
    { id: Page.SIMULATOR, label: 'Simulator', icon: <Beaker size={20} /> },
    { id: Page.TESTER, label: 'Policy Tester', icon: <FlaskConical size={20} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0b0f1a]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111827] border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-6 flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Vigil</h1>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-4 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                activePage === item.id
                  ? 'bg-blue-600/10 text-blue-500 border-l-4 border-blue-500'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
          Vigil v1.0.0-prod
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#111827] border-b border-gray-800 flex items-center justify-between px-8 shrink-0">
          <div className="text-sm font-medium text-gray-400 capitalize">
            {activePage.replace('_', ' ')}
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className={`w-2.5 h-2.5 rounded-full ${
                health?.status === 'healthy' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'
              }`} />
              <span className="text-sm font-medium text-gray-300">
                {health?.status === 'healthy' ? 'System Healthy' : 'System Degraded'}
              </span>
            </div>
            
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};
