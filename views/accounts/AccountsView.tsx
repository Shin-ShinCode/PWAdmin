import React, { useState, useEffect } from 'react';
import { 
    Search, RefreshCw, UserCog, Ban, Trash2, PlusCircle, Lock, 
    FileCode, Calendar, Filter, ChevronDown, ShieldAlert, History, User
} from 'lucide-react';
import { Language, TRANSLATIONS, PWRole, PW_DATA, BanHistoryEntry } from '../../types';
import { PWApiService } from '../../services/pwApi';
import AccountEditor from './AccountEditor';
import XmlEditorModal from './XmlEditorModal';

interface AccountsViewProps {
  lang: Language;
}

export const AccountsView: React.FC<AccountsViewProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  
  const [viewMode, setViewMode] = useState<'list' | 'bans'>('list');
  const [search, setSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced Filter States
  const [lvlMin, setLvlMin] = useState('');
  const [lvlMax, setLvlMax] = useState('');
  const [dateStart, setDateStart] = useState('');

  const [chars, setChars] = useState<PWRole[]>([]);
  const [bans, setBans] = useState<BanHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingRole, setEditingRole] = useState<PWRole | null>(null);
  const [editingXmlId, setEditingXmlId] = useState<number | null>(null);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [cData, bData] = await Promise.all([
        PWApiService.getAllRoles(),
        PWApiService.getBanHistory()
    ]);
    setChars(cData);
    setBans(bData);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filteredChars = chars.filter(c => {
    const s = search.toLowerCase();
    const matchesSearch = c.base.id.toString().includes(s) || c.base.name.toLowerCase().includes(s) || c.user_login.toLowerCase().includes(s);
    
    const level = c.status.level;
    const matchesLvlMin = lvlMin === '' || level >= parseInt(lvlMin);
    const matchesLvlMax = lvlMax === '' || level <= parseInt(lvlMax);
    
    // Simple mock date filter (timestamp to string)
    const matchesDate = dateStart === '' || new Date(c.base.create_time * 1000).toISOString().split('T')[0] >= dateStart;

    return matchesSearch && matchesLvlMin && matchesLvlMax && matchesDate;
  });

  const getClassName = (clsId: number) => PW_DATA.classes.find(c => c.id === clsId)?.[lang] || `${t('unknown')} (${clsId})`;

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      
      {/* Header & Main Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button onClick={() => setViewMode('list')} className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${viewMode === 'list' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Personagens</button>
              <button onClick={() => setViewMode('bans')} className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${viewMode === 'bans' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Histórico de Ban</button>
          </div>
          <div className="flex items-center space-x-3 w-full md:w-auto">
              <button onClick={() => setCreatingAccount(true)} className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl flex items-center justify-center font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20">
                  <PlusCircle className="w-4 h-4 mr-2" /> {t('create_account')}
              </button>
              <button onClick={loadData} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all">
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
          </div>
      </div>

      {viewMode === 'list' ? (
          <>
            {/* SEARCH & FILTERS */}
            <div className="bg-slate-900/60 p-6 rounded-[2rem] border border-slate-800 shadow-xl space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Busca inteligente: Nick, ID ou Login de Conta..." 
                            value={search} 
                            onChange={(e) => setSearch(e.target.value)} 
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-inner text-sm" 
                        />
                    </div>
                    <button 
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className={`px-6 py-3.5 rounded-2xl flex items-center font-black text-[10px] uppercase tracking-widest transition-all ${showAdvanced ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filtros Avançados
                        <ChevronDown className={`ml-2 w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {showAdvanced && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 pt-6 border-t border-slate-800 animate-fadeIn">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nível Mínimo</label>
                            <input type="number" value={lvlMin} onChange={e => setLvlMin(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" placeholder="1" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nível Máximo</label>
                            <input type="number" value={lvlMax} onChange={e => setLvlMax(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm" placeholder="105" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Criação Após</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-600" />
                                <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 pl-10 text-white text-xs" />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button onClick={() => { setLvlMin(''); setLvlMax(''); setDateStart(''); setSearch(''); }} className="w-full py-3 text-xs font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest">Limpar Tudo</button>
                        </div>
                    </div>
                )}
            </div>

            {/* CHARACTERS TABLE */}
            <div className="glass-panel rounded-[2rem] overflow-hidden border border-slate-700 shadow-2xl">
                <table className="w-full text-left">
                <thead className="bg-slate-800/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                    <tr>
                    <th className="px-8 py-5">Identidade</th>
                    <th className="px-8 py-5">Classe & Raça</th>
                    <th className="px-8 py-5 text-center">Progresso</th>
                    <th className="px-8 py-5 text-center">Status</th>
                    <th className="px-8 py-5 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {filteredChars.map((role) => (
                    <tr key={role.base.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="px-8 py-5">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-slate-900 rounded-2xl border border-slate-700 flex items-center justify-center group-hover:border-cyan-500/50 transition-all font-black text-slate-500">
                                    {role.base.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-white font-black text-base">{role.base.name}</div>
                                    <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase flex items-center mt-1">
                                        <Lock className="w-2.5 h-2.5 mr-1" /> {role.user_login} | ID: {role.base.id}
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-5">
                            <div className="text-cyan-400 font-black text-xs uppercase tracking-widest">{getClassName(role.base.cls)}</div>
                            <div className="text-[10px] text-slate-600 font-bold uppercase mt-1">Nível de Poder Est.</div>
                        </td>
                        <td className="px-8 py-5 text-center">
                            <div className="inline-flex flex-col items-center">
                                <span className="text-white font-black text-lg">{role.status.level}</span>
                                <div className="w-16 h-1 bg-slate-950 rounded-full mt-1 overflow-hidden">
                                    <div className="h-full bg-cyan-600" style={{width: `${(role.status.level / 105) * 100}%`}}></div>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                        {role.isBanned ? (
                            <span className="bg-red-500/10 text-red-500 border border-red-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-red-900/20">Banido</span>
                        ) : (
                            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg shadow-emerald-900/20">Ativo</span>
                        )}
                        </td>
                        <td className="px-8 py-5 text-right space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingXmlId(role.base.id)} className="p-2.5 hover:bg-orange-500/10 text-orange-400 rounded-xl transition-all border border-transparent hover:border-orange-500/30"><FileCode className="w-5 h-5" /></button>
                            <button onClick={() => setEditingRole(role)} className="p-2.5 hover:bg-cyan-500/10 text-cyan-400 rounded-xl transition-all border border-transparent hover:border-cyan-500/30"><UserCog className="w-5 h-5" /></button>
                            <button onClick={() => PWApiService.toggleBan(role.base.id).then(loadData)} className={`p-2.5 rounded-xl transition-all border border-transparent ${role.isBanned ? 'hover:bg-green-500/10 text-green-400 hover:border-green-500/30' : 'hover:bg-red-500/10 text-red-400 hover:border-red-500/30'}`}><Ban className="w-5 h-5" /></button>
                            <button onClick={() => PWApiService.deleteRole(role.base.id).then(loadData)} className="p-2.5 hover:bg-red-600/10 text-red-600 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
                {filteredChars.length === 0 && <div className="py-20 text-center text-slate-600 font-bold uppercase tracking-widest italic">Nenhum personagem coincide com os filtros aplicados.</div>}
            </div>
          </>
      ) : (
          <div className="animate-fadeIn">
            <div className="glass-panel rounded-[2rem] overflow-hidden border border-slate-700 shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-800/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                        <tr>
                            <th className="px-8 py-5">Personagem Alvo</th>
                            <th className="px-8 py-5">Motivo do Ban</th>
                            <th className="px-8 py-5">Executado por</th>
                            <th className="px-8 py-5">Data / Duração</th>
                            <th className="px-8 py-5 text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {bans.map(ban => (
                            <tr key={ban.id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="font-black text-white">{ban.targetName}</div>
                                    <div className="text-[10px] text-slate-500 font-mono tracking-widest">ID: {ban.targetId}</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-slate-400 text-xs italic">"{ban.reason}"</div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center text-red-400 font-bold text-xs uppercase">
                                        <ShieldAlert className="w-3.5 h-3.5 mr-2" />
                                        {ban.adminId}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-white font-bold text-xs">{ban.date}</div>
                                    <div className="text-[9px] text-slate-500 uppercase font-black">{ban.duration}</div>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    {ban.active ? (
                                        <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase border border-red-500/40">Ativo</span>
                                    ) : (
                                        <span className="bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-[9px] font-black uppercase">Expirado</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
      )}

      {creatingAccount && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-fadeIn">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-8">{t('create_account')}</h2>
            <div className="space-y-6">
              <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest ml-2">{t('login')}</label>
                  <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white focus:ring-1 focus:ring-emerald-500 outline-none shadow-inner font-bold" placeholder="username_core" />
              </div>
              <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest ml-2">{t('password')}</label>
                  <input type="password" className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white focus:ring-1 focus:ring-emerald-500 outline-none shadow-inner font-bold" />
              </div>
              <div>
                  <label className="block text-[10px] font-black text-slate-600 uppercase mb-2 tracking-widest ml-2">{t('email')}</label>
                  <input type="email" className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white focus:ring-1 focus:ring-emerald-500 outline-none shadow-inner font-bold" placeholder="mail@server.com" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-10">
                <button onClick={() => setCreatingAccount(false)} className="px-6 py-2 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all">{t('cancel')}</button>
                <button onClick={() => setCreatingAccount(false)} className="px-10 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all hover:-translate-y-1">Criar Deploy</button>
            </div>
          </div>
        </div>
      )}

      {editingRole && <AccountEditor role={editingRole} onClose={() => setEditingRole(null)} onSave={(r) => PWApiService.saveRole(r.base.id, r).then(loadData)} version={PWApiService.getCurrentVersion()} lang={lang} />}
      {editingXmlId && <XmlEditorModal roleId={editingXmlId} onClose={() => setEditingXmlId(null)} lang={lang} />}
    </div>
  );
};