
import React from 'react';
import Sidebar from './Sidebar';
import { Globe, User, LogOut } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  setView: (v: string) => void;
  lang: Language;
  setLang: React.Dispatch<React.SetStateAction<Language>>;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, lang, setLang, onLogout }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;

  const getPageTitle = (view: string) => {
    switch(view) {
      case 'dashboard': return 'Painel De Controle';
      case 'accounts': return 'Contas & Personagens';
      case 'mail': return 'Correio & Itens';
      case 'server': return 'Operações do Servidor';
      case 'settings': return 'Configurações';
      default: return view;
    }
  };

  const getPageSubtitle = (view: string) => {
    switch(view) {
      case 'dashboard': return 'System Manager for Perfect World Server';
      case 'accounts': return 'Manage game accounts, characters and roles';
      case 'mail': return 'Send items and gold to players';
      case 'server': return 'Monitor server status and logs';
      default: return 'System Administration';
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-cyan-500/30">
      <div className="flex min-h-screen">
        <Sidebar currentView={currentView} setView={setView} lang={lang} />
        
        <main className="flex-1 ml-64 p-8">
          {/* Top Header */}
          <header className="flex justify-between items-start mb-10">
             <div>
               <h2 className="text-3xl font-bold text-white tracking-tight">{getPageTitle(currentView)}</h2>
               <p className="text-slate-400 text-sm mt-1">{getPageSubtitle(currentView)}</p>
             </div>
             
             <div className="flex items-center space-x-6">
               <button 
                 onClick={() => setLang(l => l === 'pt' ? 'en' : 'pt')}
                 className="flex items-center space-x-2 px-3 py-1 bg-slate-800 rounded-full border border-slate-700 hover:border-cyan-500/50 transition-colors"
               >
                 <Globe className="w-3.5 h-3.5 text-cyan-400" />
                 <span className="text-xs font-bold text-white uppercase">{lang}</span>
               </button>

               <div className="flex items-center space-x-3 pl-6 border-l border-slate-800">
                 <div className="text-right">
                   <div className="text-sm font-bold text-white leading-none">Administrator</div>
                   <div className="text-[10px] text-slate-500 font-mono mt-1">root access</div>
                 </div>
                 <button className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 hover:bg-cyan-500/20 transition-all">
                   <User className="w-5 h-5 text-cyan-400" />
                 </button>
               </div>
             </div>
          </header>

          {/* View Content */}
          <div className="animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
