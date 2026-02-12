
import React, { useState } from 'react';
import { Database, Server, Save, CheckCircle, Loader2, Folder, FileText } from 'lucide-react';
import { Language, TRANSLATIONS, ServerSettings } from '../../types';
import UserManagement from './UserManagement';
import { PWApiService } from '../../services/pwApi';

interface SettingsProps {
  lang: Language;
}

export const SettingsView: React.FC<SettingsProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [settings, setSettings] = useState<ServerSettings & { logPath: string }>({
      dbHost: '127.0.0.1',
      dbName: 'pw',
      dbUser: 'root',
      sshIp: '192.168.1.100',
      sshPort: 22,
      logPath: '/home/pwserver/gamelog'
  });

  const handleSave = async () => {
      setLoading(true);
      await PWApiService.saveServerSettings(settings);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="glass-panel p-8 rounded-xl border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <Server className="w-6 h-6 mr-3 text-cyan-400" />
          {t('settings')}
        </h2>

        <div className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-white mb-2 flex items-center"><Database className="w-4 h-4 mr-2" /> {t('db_connection')}</h3>
                <div className="grid gap-4 bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                    <div>
                    <label className="block text-sm text-slate-400 mb-1">{t('host')}</label>
                    <input type="text" className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" value={settings.dbHost} onChange={e => setSettings({...settings, dbHost: e.target.value})} />
                    </div>
                    <div>
                    <label className="block text-sm text-slate-400 mb-1">{t('database_name')}</label>
                    <input type="text" className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" value={settings.dbName} onChange={e => setSettings({...settings, dbName: e.target.value})} />
                    </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2 flex items-center"><FileText className="w-4 h-4 mr-2" /> {t('logs')}</h3>
                <div className="grid gap-4 bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                    <div className="space-y-2">
                        <label className="block text-sm text-slate-400 mb-1">{t('logs_path')}</label>
                        <div className="flex space-x-2">
                            <input 
                                type="text" 
                                className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-white font-mono text-xs" 
                                value={settings.logPath} 
                                onChange={e => setSettings({...settings, logPath: e.target.value})} 
                            />
                            <button className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1 rounded flex items-center text-xs transition-colors">
                                <Folder className="w-3 h-3 mr-2" /> {t('browse')}
                            </button>
                        </div>
                    </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-2 flex items-center"><Server className="w-4 h-4 mr-2" /> {t('ssh_connection')}</h3>
               <div className="grid gap-4 bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">{t('ip_address')}</label>
                  <input type="text" className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" value={settings.sshIp} onChange={e => setSettings({...settings, sshIp: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">{t('port')}</label>
                  <input type="number" className="w-full bg-slate-800 border border-slate-600 rounded p-2 text-white" value={settings.sshPort} onChange={e => setSettings({...settings, sshPort: parseInt(e.target.value)})} />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4 border-t border-slate-700">
             <button 
                onClick={handleSave} 
                disabled={loading}
                className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors shadow-lg ${success ? 'bg-green-600 text-white' : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-900/20'}`}
             >
               {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : success ? <CheckCircle className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
               {success ? t('sent') : t('save')}
             </button>
          </div>
        </div>
      </div>
      
      <UserManagement lang={lang} />
    </div>
  );
};
