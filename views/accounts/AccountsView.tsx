
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
          {/* Search Bar matching image */}
          <div className="relative w-full md:w-[600px]">
              <Search className="absolute left-4 top-3.5 text-slate-500 w-5 h-5" />
              <input 
                  type="text" 
                  placeholder="Buscar..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500 shadow-sm text-sm" 
              />
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
              <button onClick={() => setCreatingAccount(true)} className="flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all">
                  <PlusCircle className="w-4 h-4 mr-2" /> Criar Nova Conta
              </button>
              <button onClick={loadData} className="flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
              </button>
          </div>
      </div>

      {viewMode === 'list' ? (
          <>
            {/* CHARACTERS TABLE */}
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                    <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">ACCOUNT / CHARACTER</th>
                    <th className="px-6 py-4">LEVEL / CLASS</th>
                    <th className="px-6 py-4">STATUS</th>
                    <th className="px-6 py-4 text-right">ACTIONS</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {filteredChars.map((role) => (
                    <tr key={role.base.id} className="hover:bg-slate-800/50 transition-colors group">
                        <td className="px-6 py-4 text-slate-400 font-mono text-sm">#{role.base.id}</td>
                        <td className="px-6 py-4">
                            <div className="flex items-start space-x-3">
                                <div className="mt-1"><User className="w-4 h-4 text-slate-500" /></div>
                                <div>
                                    <div className="text-white font-bold text-sm">{role.base.name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{role.user_login}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="text-white font-bold text-sm">Lv. {role.status.level}</div>
                            <div className="text-xs text-slate-500 mt-0.5">{getClassName(role.base.cls)}</div>
                        </td>
                        <td className="px-6 py-4">
                        {role.isBanned ? (
                            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">BANNED</span>
                        ) : (
                            <span className="bg-emerald-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">ONLINE</span>
                        )}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                            <button onClick={() => setEditingXmlId(role.base.id)} className="text-slate-500 hover:text-cyan-400 transition-colors"><FileCode className="w-4 h-4" /></button>
                            <button onClick={() => setEditingRole(role)} className="text-slate-500 hover:text-cyan-400 transition-colors"><UserCog className="w-4 h-4" /></button>
                            <button onClick={() => PWApiService.toggleBan(role.base.id).then(loadData)} className={`transition-colors ${role.isBanned ? 'text-green-500 hover:text-green-400' : 'text-slate-500 hover:text-red-400'}`}><Ban className="w-4 h-4" /></button>
                            <button onClick={() => PWApiService.deleteRole(role.base.id).then(loadData)} className="text-slate-500 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
                {filteredChars.length === 0 && <div className="py-20 text-center text-slate-500 italic">No accounts found matching your search.</div>}
            </div>
          </>
      ) : (
          <div className="animate-fadeIn">
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
                <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                        <tr>
                            <th className="px-6 py-4">Personagem Alvo</th>
                            <th className="px-6 py-4">Motivo do Ban</th>
                            <th className="px-6 py-4">Executado por</th>
                            <th className="px-6 py-4">Data / Duração</th>
                            <th className="px-6 py-4 text-center">Estado</th>
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
                                        <span className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-red-500/40">Ativo</span>
                                    ) : (
                                        <span className="bg-slate-800 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Expirado</span>
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
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl p-8 animate-fadeIn">
            <h2 className="text-xl font-bold text-white mb-6">Criar Nova Conta</h2>
            <div className="space-y-4">
              <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Login</label>
                  <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none shadow-inner" placeholder="username" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Password</label>
                  <input type="password" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none shadow-inner" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Email</label>
                  <input type="email" className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none shadow-inner" placeholder="mail@server.com" />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-8">
                <button onClick={() => setCreatingAccount(false)} className="px-4 py-2 text-slate-400 hover:text-white font-bold text-sm transition-colors">Cancelar</button>
                <button onClick={() => setCreatingAccount(false)} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm shadow-lg transition-all">Criar Conta</button>
            </div>
          </div>
        </div>
      )}

      {editingRole && <AccountEditor role={editingRole} onClose={() => setEditingRole(null)} onSave={(r) => PWApiService.saveRole(r.base.id, r).then(loadData)} version={PWApiService.getCurrentVersion()} lang={lang} />}
      {editingXmlId && <XmlEditorModal roleId={editingXmlId} onClose={() => setEditingXmlId(null)} lang={lang} />}
    </div>
  );
};
