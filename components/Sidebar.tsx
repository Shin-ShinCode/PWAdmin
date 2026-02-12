
import React from 'react';
import { Activity, Users, Server, Mail, Settings, Shield, Flag, FileText, ShieldAlert } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (v: string) => void;
  lang: Language;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  
  const menuItems = [
    { id: 'dashboard', icon: Activity, label: 'Painel Geral' },
    { id: 'online_players', icon: Users, label: 'Jogadores Online' },
    { id: 'accounts', icon: UserCog, label: 'Gestão de Contas' },
    { id: 'factions', icon: Flag, label: 'Gestão de Clãs' },
    { id: 'mail', icon: Mail, label: 'Expresso Correio' },
    { id: 'logs', icon: FileText, label: 'Log Forense' },
    { id: 'security_hub', icon: ShieldAlert, label: 'Central de Segurança' },
    { id: 'server', icon: Server, label: 'Monitor de Core' },
    { id: 'settings', icon: Settings, label: 'Configurações' },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
        <Shield className="w-8 h-8 text-cyan-400" />
        <div>
          <h1 className="text-xl font-bold text-white tracking-wider uppercase">PWAdmin</h1>
          <span className="text-[10px] text-cyan-500 font-mono tracking-widest">PRODUCTION READY</span>
        </div>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 border ${
              currentView === item.id 
                ? 'bg-cyan-900/20 text-cyan-400 border-cyan-800/50 shadow-lg shadow-cyan-900/10' 
                : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center space-x-3 text-slate-500 text-[10px] px-2 font-black uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span>GamedBD: Ativo</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-500 text-[10px] px-2 mt-1 font-black uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
          <span>Database: Online</span>
        </div>
      </div>
    </div>
  );
};

import { UserCog } from 'lucide-react';
export default Sidebar;
