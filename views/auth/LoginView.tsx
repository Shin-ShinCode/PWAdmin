import React, { useState } from 'react';
import { Shield, Lock, User, Globe, AlertCircle, Loader2 } from 'lucide-react';
import { Language, TRANSLATIONS } from '../../types';
import { APP_CONFIG } from '../../config/appConfig';
import { PWApiService } from '../../services/pwApi';

interface LoginViewProps {
  lang: Language;
  setLang: (l: Language) => void;
  onLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ lang, setLang, onLogin }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await PWApiService.login(username, password);
      if (success) {
        onLogin();
      } else {
        setError(t('invalid_credentials'));
      }
    } catch (err) {
      setError(t('invalid_credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
      
      <div className="relative w-full max-w-md p-8 animate-fadeIn">
        <div className="glass-panel p-10 rounded-[2.5rem] border border-slate-700 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="bg-cyan-500/20 p-5 rounded-[2rem] border border-cyan-500/40 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Shield className="w-12 h-12 text-cyan-400" />
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">PWAdmin</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">{t('login_title')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 p-4 rounded-2xl flex items-center text-red-400 text-xs font-bold animate-shake uppercase tracking-tighter">
                <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{t('login')}</label>
              <div className="relative">
                <User className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all shadow-inner"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-all shadow-inner"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl shadow-cyan-900/40 active:scale-95 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : t('login_button')}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-800 flex justify-between items-center">
            <button 
              onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
              className="text-slate-500 hover:text-cyan-400 text-[10px] font-black uppercase tracking-widest flex items-center transition-colors"
            >
              <Globe className="w-4 h-4 mr-2" />
              {lang === 'pt' ? 'Português' : 'English'}
            </button>
            <span className="text-slate-700 text-[10px] font-mono tracking-widest uppercase">v{APP_CONFIG.version}</span>
          </div>
        </div>
      </div>
    </div>
  );
};