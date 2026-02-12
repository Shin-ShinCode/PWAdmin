
import React from 'react';
import Sidebar from './Sidebar';
import { Language } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  setView: (v: string) => void;
  lang: Language;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, setView, lang }) => {
  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Sidebar currentView={currentView} setView={setView} lang={lang} />
      <main className="flex-1 ml-72 p-10 overflow-y-auto h-screen custom-scrollbar relative">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10 animate-fadeIn">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
