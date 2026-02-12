
import React from 'react';
import { LayoutDashboard, Users, Server, Mail, Settings, Shield, Terminal, Flag } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (v: string) => void;
  lang: Language;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  
  // Menu items matching the requested image layout
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel de Controle' },
    { id: 'accounts', icon: Users, label: 'Contas & Personagens' },
    { id: 'factions', icon: Flag, label: 'Clãs & Territórios' },
    { id: 'mail', icon: Mail, label: 'Correio & Itens' },
    { id: 'server', icon: Terminal, label: 'Operações do Servidor' },
    { id: 'settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="w-64 bg-[#0B1120] border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-20">
      {/* Logo Section */}
      <div className="p-6 mb-4">
        <div className="flex items-center space-x-3">
          <Shield className="w-8 h-8 text-cyan-400 fill-cyan-400/10" />
          <div>
            <h1 className="text-xl font-bold text-white tracking-wider">PWAdmin</h1>
            <span className="text-[11px] text-cyan-500 font-medium">v2.4.0-release</span>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = currentView === item.id || 
                          (item.id === 'accounts' && (currentView === 'factions' || currentView === 'online_players')) || // Mapping related views
                          (item.id === 'server' && (currentView === 'logs' || currentView === 'security_hub'));

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-slate-800/50 text-white border-l-2 border-cyan-400' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              <span className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Status */}
      <div className="p-6 mt-auto">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
            <span className="text-xs text-slate-400 font-medium">DB: Connected (3ms)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
            <span className="text-xs text-slate-400 font-medium">SSH: Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
