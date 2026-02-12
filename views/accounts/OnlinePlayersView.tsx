import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, UserCog, User, Shield, Hash, LayoutList, ChevronRight, Activity, Zap, Users } from 'lucide-react';
import { Language, TRANSLATIONS, PWRole, PW_DATA } from '../../types';
import { PWApiService } from '../../services/pwApi';
import AccountEditor from './AccountEditor';

interface OnlinePlayersViewProps {
  lang: Language;
}

export const OnlinePlayersView: React.FC<OnlinePlayersViewProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [search, setSearch] = useState('');
  const [onlineChars, setOnlineChars] = useState<PWRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<PWRole | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
        const data = await PWApiService.getOnlineRolesFull();
        // Garante que é array
        setOnlineChars(Array.isArray(data) ? data : []);
    } catch (e) {
        setOnlineChars([]);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filtered = onlineChars.filter(c => {
      const s = search.toLowerCase();
      return (
          c.base.id.toString().includes(s) ||
          c.base.name.toLowerCase().includes(s) ||
          c.user_login.toLowerCase().includes(s)
      );
  });

  const getClassName = (clsId: number) => PW_DATA.classes.find(c => c.id === clsId)?.[lang] || `${t('unknown')} (${clsId})`;

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
              <Users className="w-32 h-32" />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="flex items-center">
                  <div className="bg-emerald-500/10 p-3 rounded-2xl mr-4 border border-emerald-500/20">
                      <Activity className="w-10 h-10 text-emerald-400" />
                  </div>
                  <div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{t('online_players_view')}</h2>
                      <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-1">Gerenciamento Proativo de Jogadores</p>
                  </div>
              </div>

              <div className="flex items-center space-x-4 w-full md:auto">
                  <div className="relative flex-1 md:w-96">
                    <Search className="absolute left-4 top-3 text-slate-500 w-5 h-5" />
                    <input 
                        type="text" 
                        placeholder="ID, Nick ou Conta..." 
                        value={search} 
                        onChange={(e) => setSearch(e.target.value)} 
                        className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-inner" 
                    />
                  </div>
                  <button onClick={loadData} className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-2xl transition-all shadow-lg">
                      <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(role => (
              <div key={role.base.id} className="bg-slate-900/60 border border-slate-700/50 rounded-3xl p-6 hover:border-emerald-500/50 transition-all group flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center">
                          <div className="w-14 h-14 bg-slate-950 rounded-2xl border border-slate-700 flex items-center justify-center text-slate-500 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all font-black text-xl">
                              {role.base.name.charAt(0)}
                          </div>
                          <div className="ml-4">
                              <h4 className="text-white font-black text-lg group-hover:text-emerald-400 transition-colors">{role.base.name}</h4>
                              <div className="flex items-center text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                                  <Hash className="w-2.5 h-2.5 mr-1" /> {role.base.id} | <User className="w-2.5 h-2.5 ml-2 mr-1" /> {role.user_login}
                              </div>
                          </div>
                      </div>
                      <div className="flex items-center text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20 font-black uppercase">LIVE</div>
                  </div>

                  <div className="bg-slate-950/40 rounded-2xl p-4 space-y-3 mb-6 flex-1">
                      <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Classe</span>
                          <span className="text-xs text-white font-bold">{getClassName(role.base.cls)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Nível</span>
                          <span className="text-xs text-cyan-400 font-black">{role.status.level}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Local</span>
                          <span className="text-[10px] text-slate-400 font-mono">Map {role.status.worldtag} ({Math.floor(role.status.posx)}, {Math.floor(role.status.posz)})</span>
                      </div>
                  </div>

                  <button 
                    onClick={() => setEditingRole(role)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
                  >
                      <UserCog className="w-4 h-4 mr-2" />
                      Editar Personagem
                  </button>
              </div>
          ))}
      </div>

      {editingRole && (
          <AccountEditor 
            role={editingRole} 
            onClose={() => setEditingRole(null)} 
            onSave={(r) => { PWApiService.saveRole(r.base.id, r); setEditingRole(null); loadData(); }} 
            version={PWApiService.getCurrentVersion()} 
            lang={lang} 
          />
      )}
    </div>
  );
};