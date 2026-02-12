
import React from 'react';
import { LayoutDashboard, Users, Server, Mail, Settings, Shield, Terminal, Flag, LogOut, ChevronRight } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface SidebarProps {
  currentView: string;
  setView: (v: string) => void;
  lang: Language;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Painel de Controle', description: 'Visão Geral' },
    { id: 'accounts', icon: Users, label: 'Contas & Personagens', description: 'Gerenciamento' },
    { id: 'factions', icon: Flag, label: 'Clãs & Territórios', description: 'Diplomacia' },
    { id: 'mail', icon: Mail, label: 'Correio & Itens', description: 'Envios' },
    { id: 'server', icon: Terminal, label: 'Operações do Servidor', description: 'Monitoramento' },
    { id: 'settings', icon: Settings, label: 'Configurações', description: 'Sistema' },
  ];

  return (
    <div className="w-72 bg-[#0B1120] border-r border-slate-800/50 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-2xl">
      {/* Logo Section */}
      <div className="p-8 mb-2">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Shield className="w-10 h-10 text-cyan-500 fill-cyan-500/10" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0B1120]"></div>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide uppercase">PWAdmin</h1>
            <span className="text-[10px] text-cyan-500/80 font-bold tracking-widest uppercase">Intelligence v2.4</span>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] uppercase font-bold text-slate-600 tracking-widest mb-4 ml-2">Menu Principal</div>
        {menuItems.map((item) => {
          const isActive = currentView === item.id || 
                          (item.id === 'accounts' && (currentView === 'factions' || currentView === 'online_players')) || 
                          (item.id === 'server' && (currentView === 'logs' || currentView === 'security_hub'));

          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                isActive 
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {isActive && <div className="absolute left-0 top-0 w-1 h-full bg-white/20"></div>}
              
              <div className="flex items-center space-x-4 relative z-10">
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-cyan-400 transition-colors'}`} />
                <div className="text-left">
                    <span className={`text-sm font-bold block ${isActive ? 'text-white' : ''}`}>{item.label}</span>
                    {isActive && <span className="text-[10px] text-cyan-100 opacity-80 font-medium block">{item.description}</span>}
                </div>
              </div>
              
              {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom Status */}
      <div className="p-6 mt-auto bg-slate-900/30 border-t border-slate-800/50 backdrop-blur-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between group cursor-help">
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse"></div>
                <span className="text-xs text-slate-400 font-bold group-hover:text-white transition-colors">Database</span>
            </div>
            <span className="text-[10px] text-emerald-500 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">CONNECTED</span>
          </div>
          <div className="flex items-center justify-between group cursor-help">
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)] animate-pulse delay-75"></div>
                <span className="text-xs text-slate-400 font-bold group-hover:text-white transition-colors">SSH Tunnel</span>
            </div>
            <span className="text-[10px] text-cyan-500 font-mono bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
