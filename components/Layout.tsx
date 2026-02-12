import React from 'react';
import Sidebar from './Sidebar';
import { Globe, UserCog, LogOut } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-fixed bg-center">
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-0"></div>
      
      <div className="relative z-10 flex min-h-screen font-sans text-slate-200">
        <Sidebar currentView={currentView} setView={setView} lang={lang} />
        
        <main className="flex-1 ml-64 p-8">
          {/* Top Header */}
          <header className="flex justify-between items-center mb-8 bg-slate-900/40 p-4 rounded-2xl border border-slate-800 backdrop-blur-md sticky top-0 z-30">
             <div>
               <h2 className="text-2xl font-bold text-white capitalize">{TRANSLATIONS[currentView]?.[lang] || currentView}</h2>
               <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">{t('system_manager_subtitle')}</p>
             </div>
             
             <div className="flex items-center space-x-4">
               <button 
                 onClick={() => setLang(l => l === 'pt' ? 'en' : 'pt')}
                 className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
               >
                 <Globe className="w-4 h-4 text-cyan-400" />
                 <span className="text-sm font-medium uppercase">{lang}</span>
               </button>

               <button 
                 onClick={onLogout}
                 className="flex items-center space-x-2 px-3 py-1.5 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded border border-red-900/30 transition-colors"
                 title={t('logout')}
               >
                 <LogOut className="w-4 h-4" />
               </button>
               
               <div className="flex items-center space-x-3 pl-4 border-l border-slate-700">
                 <div className="text-right hidden md:block">
                   <div className="text-sm font-bold text-white">{t('administrator')}</div>
                   <div className="text-[10px] text-cyan-500 font-mono">{t('root_access')}</div>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-cyan-900 flex items-center justify-center border border-cyan-700 shadow-[0_0_10px_rgba(8,145,178,0.3)]">
                   <UserCog className="w-6 h-6 text-cyan-400" />
                 </div>
               </div>
             </div>
          </header>

          {/* View Content */}
          <div className="min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;