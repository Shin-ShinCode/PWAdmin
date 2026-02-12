
import React, { useState, useEffect } from 'react';
import { 
    Search, RefreshCw, UserCog, Ban, Trash2, PlusCircle, Lock, 
    FileCode, Calendar, Filter, ChevronDown, ShieldAlert, History, User
} from 'lucide-react';
import { Language, TRANSLATIONS, PWRole, BanHistoryEntry } from '../../types';
import { PWApiService } from '../../services/pwApi';
import AccountEditor from './AccountEditor';
import XmlEditorModal from './XmlEditorModal';

interface AccountsViewProps {
  lang: Language;
}

const getClassName = (cls: number) => {
    const classes: Record<number, string> = {
        0: 'Guerreiro', 1: 'Mago', 2: 'Espiritualista', 3: 'Feiticeira',
        4: 'Bárbaro', 5: 'Mercenário', 6: 'Arqueiro', 7: 'Sacerdote',
        8: 'Arcano', 9: 'Místico', 10: 'Retalhador', 11: 'Tormentador'
    };
    return classes[cls] || `Class ${cls}`;
};

export const AccountsView: React.FC<AccountsViewProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  
  const [viewMode, setViewMode] = useState<'list' | 'bans'>('list');
  const [search, setSearch] = useState('');
  
  const [chars, setChars] = useState<PWRole[]>([]);
  const [bans, setBans] = useState<BanHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingAccount, setCreatingAccount] = useState(false);
  
  const [editingRole, setEditingRole] = useState<PWRole | null>(null);
  const [editingXmlId, setEditingXmlId] = useState<number | null>(null);
  const [newAccount, setNewAccount] = useState({ login: '', pass: '', email: '' });

  const loadData = async () => {
      setLoading(true);
      try {
          if (viewMode === 'list') {
              const roles = await PWApiService.getAllRoles();
              setChars(roles);
          } else {
              const banHistory = await PWApiService.getBanHistory();
              setBans(banHistory);
          }
      } catch (error) {
          console.error("Failed to load data", error);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      loadData();
  }, [viewMode]);

  const handleCreateAccount = async () => {
      if(!newAccount.login || !newAccount.pass) return;
      await PWApiService.createAccount(newAccount.login, newAccount.pass, newAccount.email);
      setCreatingAccount(false);
      setNewAccount({ login: '', pass: '', email: '' });
      loadData();
  };

  const filteredChars = chars.filter(c => 
      c.base.name.toLowerCase().includes(search.toLowerCase()) || 
      c.user_login.toLowerCase().includes(search.toLowerCase()) ||
      c.base.id.toString().includes(search)
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-[600px]">
              <Search className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
              <input 
                  type="text" 
                  placeholder={t('search') || (lang === 'pt' ? "Buscar por nome, ID ou login..." : "Search by name, ID or login...")} 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500 shadow-sm text-sm transition-all" 
              />
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
              <div className="bg-slate-900 rounded-lg p-1 border border-slate-800 flex">
                  <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                      {t('characters') || (lang === 'pt' ? "Personagens" : "Characters")}
                  </button>
                  <button onClick={() => setViewMode('bans')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'bans' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                      {t('bans') || "Bans"}
                  </button>
              </div>

              <button onClick={() => setCreatingAccount(true)} className="flex-1 md:flex-none flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-emerald-900/20">
                  <PlusCircle className="w-4 h-4 mr-2" /> {t('create_account') || (lang === 'pt' ? "Criar Conta" : "Create Account")}
              </button>
              <button onClick={loadData} className="flex-none flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg hover:shadow-cyan-900/20">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
          </div>
      </div>

      {viewMode === 'list' ? (
          <>
            {/* CHARACTERS TABLE */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden shadow-xl overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                <thead className="bg-slate-900 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">{t('account_character') || (lang === 'pt' ? "CONTA / PERSONAGEM" : "ACCOUNT / CHARACTER")}</th>
                    <th className="px-6 py-4">{t('level_class') || (lang === 'pt' ? "NÍVEL / CLASSE" : "LEVEL / CLASS")}</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4 text-right">{t('actions') || (lang === 'pt' ? "AÇÕES" : "ACTIONS")}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {filteredChars.map((role) => (
                    <tr key={role.base.id} className="hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-4 text-slate-400 font-mono text-sm">#{role.base.id}</td>
                        <td className="px-6 py-4">
                            <div className="flex items-start space-x-3">
                                <div className="mt-1 bg-slate-800 p-1.5 rounded-lg"><User className="w-4 h-4 text-slate-400" /></div>
                                <div>
                                    <div className="text-white font-bold text-sm">{role.base.name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5 font-mono">{role.user_login}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                                <span className="text-white font-bold text-sm bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Lv. {role.status.level}</span>
                                <span className="text-xs text-slate-400">{getClassName(role.base.cls)}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                        {role.isBanned ? (
                            <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex w-fit items-center">
                                <Ban className="w-3 h-3 mr-1" /> BANNED
                            </span>
                        ) : (
                            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex w-fit items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse"></div> NORMAL
                            </span>
                        )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                            <button onClick={() => setEditingXmlId(role.base.id)} className="p-2 hover:bg-cyan-500/10 rounded-lg text-slate-500 hover:text-cyan-400 transition-colors" title={lang === 'pt' ? "Editar XML" : "Edit XML"}><FileCode className="w-4 h-4" /></button>
                            <button onClick={() => setEditingRole(role)} className="p-2 hover:bg-cyan-500/10 rounded-lg text-slate-500 hover:text-cyan-400 transition-colors" title={lang === 'pt' ? "Editar Personagem" : "Edit Character"}><UserCog className="w-4 h-4" /></button>
                            <button onClick={() => PWApiService.toggleBan(role.base.id).then(loadData)} className={`p-2 hover:bg-slate-800 rounded-lg transition-colors ${role.isBanned ? 'text-green-500 hover:text-green-400' : 'text-slate-500 hover:text-red-400'}`} title="Ban/Unban"><Ban className="w-4 h-4" /></button>
                            <button onClick={() => PWApiService.deleteRole(role.base.id).then(loadData)} className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-500 transition-colors" title={lang === 'pt' ? "Deletar" : "Delete"}><Trash2 className="w-4 h-4" /></button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
                {filteredChars.length === 0 && !loading && <div className="py-20 text-center text-slate-500 italic flex flex-col items-center">
                    <Search className="w-10 h-10 mb-4 opacity-20" />
                    {t('no_results') || (lang === 'pt' ? "Nenhum resultado encontrado." : "No results found.")}
                </div>}
                {loading && <div className="py-20 text-center text-slate-500 italic">Loading...</div>}
            </div>
          </>
      ) : (
          <div className="animate-fadeIn">
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden shadow-xl overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-slate-900 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4">{lang === 'pt' ? "Personagem Alvo" : "Target"}</th>
                            <th className="px-6 py-4">{lang === 'pt' ? "Motivo" : "Reason"}</th>
                            <th className="px-6 py-4">Admin</th>
                            <th className="px-6 py-4">{lang === 'pt' ? "Data / Duração" : "Date / Duration"}</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {bans.map(ban => (
                            <tr key={ban.id} className="hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white text-sm">{ban.targetName}</div>
                                    <div className="text-xs text-slate-500 font-mono">ID: {ban.targetId}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-slate-400 text-sm italic">"{ban.reason}"</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-red-400 font-bold text-xs uppercase">
                                        <ShieldAlert className="w-3.5 h-3.5 mr-2" />
                                        {ban.adminId}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-white font-bold text-xs">{ban.date}</div>
                                    <div className="text-[10px] text-slate-500 uppercase font-black">{ban.duration}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {ban.active ? (
                                        <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-red-500/40">Active</span>
                                    ) : (
                                        <span className="bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Expired</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {bans.length === 0 && !loading && <div className="py-20 text-center text-slate-500 italic">
                    {t('no_bans') || (lang === 'pt' ? "Nenhum histórico de banimento." : "No ban history.")}
                </div>}
            </div>
          </div>
      )}

      {creatingAccount && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-8 animate-fadeIn relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5"><User className="w-32 h-32" /></div>
            <h2 className="text-xl font-bold text-white mb-6 relative z-10">{t('create_account') || (lang === 'pt' ? "Criar Nova Conta" : "Create New Account")}</h2>
            <div className="space-y-4 relative z-10">
              <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Login</label>
                  <input type="text" value={newAccount.login} onChange={e => setNewAccount({...newAccount, login: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none shadow-inner transition-colors" placeholder="username" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Password</label>
                  <input type="password" value={newAccount.pass} onChange={e => setNewAccount({...newAccount, pass: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none shadow-inner transition-colors" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email</label>
                  <input type="email" value={newAccount.email} onChange={e => setNewAccount({...newAccount, email: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none shadow-inner transition-colors" placeholder="mail@server.com" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8 relative z-10">
                <button onClick={() => setCreatingAccount(false)} className="px-4 py-2 text-slate-400 hover:text-white font-bold text-sm transition-colors">{lang === 'pt' ? "Cancelar" : "Cancel"}</button>
                <button onClick={handleCreateAccount} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-lg transition-all hover:scale-105 active:scale-95">{lang === 'pt' ? "Criar Conta" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

      {editingRole && <AccountEditor role={editingRole} onClose={() => setEditingRole(null)} onSave={(r) => PWApiService.saveRole(r.base.id, r).then(loadData)} version={PWApiService.getCurrentVersion()} lang={lang} />}
      {editingXmlId && <XmlEditorModal roleId={editingXmlId} onClose={() => setEditingXmlId(null)} lang={lang} />}
    </div>
  );
};
