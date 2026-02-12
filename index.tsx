
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Shield } from 'lucide-react';
import { Language } from './types';
import Layout from './components/Layout';

// View Imports
import { DashboardView } from './views/dashboard/DashboardView';
import { AccountsView } from './views/accounts/AccountsView';
import { OnlinePlayersView } from './views/accounts/OnlinePlayersView';
import { FactionsView } from './views/factions/FactionsView';
import { ServerOpsView } from './views/server/ServerOpsView';
import { MailView } from './views/mail/MailView';
import { SettingsView } from './views/settings/SettingsView';
import { LoginView } from './views/auth/LoginView';
import { SecurityHubView } from './views/security/SecurityHubView';
import { LogCenterView } from './views/server/LogCenterView';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [lang, setLang] = useState<Language>('pt');
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    const session = localStorage.getItem('pw_admin_session');
    if (session) setIsLoggedIn(true);
    setTimeout(() => setLoading(false), 1500); 
  }, []);

  const handleLogin = (status: boolean) => {
      setIsLoggedIn(status);
      if (status) localStorage.setItem('pw_admin_session', 'true');
  };

  const handleLogout = () => {
      setIsLoggedIn(false);
      localStorage.removeItem('pw_admin_session');
  };

  const renderView = () => {
    switch(currentView) {
      case 'dashboard': return <DashboardView lang={lang} setView={setCurrentView} />;
      case 'accounts': return <AccountsView lang={lang} />;
      case 'online_players': return <OnlinePlayersView lang={lang} />;
      case 'factions': return <FactionsView lang={lang} />;
      case 'server': return <ServerOpsView lang={lang} />;
      case 'mail': return <MailView lang={lang} />;
      case 'settings': return <SettingsView lang={lang} />;
      case 'security_hub': return <SecurityHubView lang={lang} />;
      case 'logs': return <LogCenterView lang={lang} />;
      default: return <div className="flex items-center justify-center h-96 text-slate-500">Page Not Found</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center flex-col">
        <Shield className="w-16 h-16 text-cyan-500 mb-6 animate-pulse" />
        <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500 animate-[width_1.5s_ease-in-out_forwards]" style={{width: '100%'}}></div>
        </div>
        <p className="mt-4 text-slate-400 font-mono text-sm">Initializing PWAdmin Intelligence...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
      return <LoginView lang={lang} setLang={setLang} onLogin={() => handleLogin(true)} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      setView={setCurrentView} 
      lang={lang} 
      setLang={setLang}
      onLogout={handleLogout}
    >
      {renderView()}
    </Layout>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
