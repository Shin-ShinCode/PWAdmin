
import React, { useState, useEffect } from 'react';
import { 
  XCircle, Save, Info, Users, Shield, Hammer, Crown, Search, Plus, 
  UserPlus, Swords, Handshake, Activity, 
  Map as MapIcon, Clock, Award, Star, Zap, Trash, Hash, ChevronRight, Layout,
  Settings, Palette, Calendar, Coins, UserMinus, ShieldCheck
} from 'lucide-react';
import { PWFaction, FactionMember, Language, TRANSLATIONS, PW_DATA, PWTerritory } from '../../types';
import { PWApiService } from '../../services/pwApi';

interface FactionEditorProps {
  faction: PWFaction;
  onClose: () => void;
  onSave: (faction: PWFaction) => void;
  lang: Language;
}

const RANK_LABELS: Record<number, { pt: string, en: string, color: string }> = {
    2: { pt: 'Marechal (Mestre)', en: 'Marshal', color: 'text-yellow-400' },
    3: { pt: 'General (Sub)', en: 'General', color: 'text-orange-400' },
    4: { pt: 'Major', en: 'Major', color: 'text-purple-400' },
    5: { pt: 'Capitão', en: 'Captain', color: 'text-blue-400' },
    6: { pt: 'Membro (Recruta)', en: 'Member', color: 'text-slate-400' }
};

const FactionEditor: React.FC<FactionEditorProps> = ({ faction, onClose, onSave, lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [editingFaction, setEditingFaction] = useState<PWFaction>(JSON.parse(JSON.stringify(faction)));
  const [activeTab, setActiveTab] = useState<'basic' | 'members' | 'diplomacy' | 'territories'>('basic');
  
  // Search states
  const [memberSearch, setMemberSearch] = useState('');
  const [newMemberId, setNewMemberId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleRankChange = (roleId: number, newRank: number) => {
    setEditingFaction(prev => ({
      ...prev,
      members: prev.members.map(m => m.role_id === roleId ? { ...m, rank: newRank } : m)
    }));
  };

  const removeMember = async (roleId: number) => {
    if(confirm(`Expulsar membro ID ${roleId} da facção permanentemente?`)) {
      await PWApiService.removeFactionMember(editingFaction.fid, roleId);
      setEditingFaction(prev => ({ ...prev, members: prev.members.filter(m => m.role_id !== roleId) }));
    }
  };

  const addMember = async () => {
      const rid = parseInt(newMemberId);
      if (isNaN(rid)) return;
      setIsSaving(true);
      const success = await PWApiService.addFactionMember(editingFaction.fid, rid);
      if (success) {
          // No mundo real, aqui buscaríamos o nome do char via API
          const newM: FactionMember = { role_id: rid, name: `Char_${rid}`, rank: 6, level: 1, cls: 0 };
          setEditingFaction(prev => ({ ...prev, members: [...prev.members, newM] }));
          setNewMemberId('');
      }
      setIsSaving(false);
  };

  const filteredMembers = editingFaction.members.filter(m => 
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) || 
      m.role_id.toString().includes(memberSearch)
  );

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700/50 w-full max-w-7xl h-[92vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden animate-fadeIn relative">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Header */}
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/80 backdrop-blur-md z-10">
          <div className="flex items-center space-x-6">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-3 rounded-2xl shadow-lg shadow-yellow-900/20">
                <Crown className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{editingFaction.name}</h2>
              <div className="flex items-center space-x-4 text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">FID: {editingFaction.fid}</span>
                <span className="text-cyan-500">{editingFaction.members.length} CIDADÃOS ATIVOS</span>
                <span className={`px-2 py-0.5 rounded ${editingFaction.level >= 3 ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' : 'bg-slate-800 text-slate-400'}`}>NÍVEL {editingFaction.level}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-800 hover:bg-red-500/20 rounded-2xl transition-all group">
            <XCircle className="w-8 h-8 text-slate-500 group-hover:text-red-500" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden z-10">
          {/* Navigation */}
          <div className="w-72 bg-slate-950/40 border-r border-slate-800 p-6 space-y-2 shrink-0">
            {[
              { id: 'basic', icon: Layout, label: 'Identificação & Hierarquia' },
              { id: 'members', icon: Users, label: 'Gestão de Membros' },
              { id: 'diplomacy', icon: Shield, label: 'Relações Diplomáticas' },
              { id: 'territories', icon: MapIcon, label: 'Domínios de Guerra' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`w-full text-left px-5 py-4 rounded-2xl flex items-center space-x-4 transition-all ${activeTab === tab.id ? 'bg-cyan-600/10 border border-cyan-500/30 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-800/50'}`}>
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-cyan-400' : ''}`} />
                <span className="font-black uppercase text-[11px] tracking-widest">{tab.label}</span>
              </button>
            ))}
            
            <div className="mt-10 p-5 bg-slate-900/50 rounded-2xl border border-slate-800">
                <h4 className="text-[10px] font-black text-slate-600 uppercase mb-3 tracking-widest">Protocolo de Segurança</h4>
                <div className="flex items-center text-emerald-500 text-[10px] font-bold">
                    <ShieldCheck className="w-4 h-4 mr-2" /> GamedBD: Conectado
                </div>
                <div className="flex items-center text-slate-500 text-[10px] font-bold mt-2">
                    <Activity className="w-4 h-4 mr-2" /> Latência: 12ms
                </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-10 overflow-y-auto bg-slate-900/10 custom-scrollbar">
            
            {activeTab === 'basic' && (
              <div className="max-w-3xl space-y-10 animate-fadeIn">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nome da Facção (Exibição)</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-black text-lg focus:border-cyan-500 outline-none shadow-inner transition-all"
                            value={editingFaction.name}
                            onChange={e => setEditingFaction({...editingFaction, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Marechal Atual (RoleID)</label>
                        <input 
                            type="number" 
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-cyan-400 font-mono text-lg focus:border-cyan-500 outline-none shadow-inner"
                            value={editingFaction.master}
                            onChange={e => setEditingFaction({...editingFaction, master: parseInt(e.target.value) || 0})}
                        />
                    </div>
                 </div>

                 <div className="bg-slate-950/60 p-8 rounded-[2rem] border border-slate-800">
                    <h4 className="text-white font-black text-sm uppercase tracking-widest mb-6 flex items-center">
                        <Award className="w-5 h-5 mr-3 text-yellow-500" /> Evolução Estrutural
                    </h4>
                    <div className="space-y-8">
                        <div>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-[10px] text-slate-500 font-black uppercase">Nível da Facção</span>
                                <span className="text-xl font-black text-white">{editingFaction.level} / 3</span>
                            </div>
                            <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                                <div className="h-full bg-gradient-to-r from-yellow-600 to-orange-500 transition-all duration-1000 shadow-[0_0_15px_rgba(245,158,11,0.3)]" style={{width: `${(editingFaction.level / 3) * 100}%`}}></div>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map(lvl => (
                                <button key={lvl} onClick={() => setEditingFaction({...editingFaction, level: lvl})} className={`py-4 rounded-2xl border font-black text-xs transition-all ${editingFaction.level === lvl ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-white'}`}>
                                    MODO NÍVEL {lvl}
                                </button>
                            ))}
                        </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'members' && (
              <div className="space-y-6 animate-fadeIn h-full flex flex-col">
                 <div className="flex flex-col md:flex-row gap-4 items-center bg-slate-950/40 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-500 transition-colors w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Pesquisar por Nome ou RoleID..." 
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-inner text-sm"
                            value={memberSearch}
                            onChange={e => setMemberSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <input 
                            type="number" 
                            placeholder="RoleID..." 
                            className="w-32 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-cyan-400 font-mono text-sm focus:ring-1 focus:ring-emerald-500"
                            value={newMemberId}
                            onChange={e => setNewMemberId(e.target.value)}
                        />
                        <button onClick={addMember} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-900/20 flex items-center">
                            <UserPlus className="w-4 h-4 mr-2" /> Ingressar Membro
                        </button>
                    </div>
                 </div>

                 <div className="flex-1 glass-panel rounded-[2rem] overflow-hidden border border-slate-800 shadow-2xl flex flex-col min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-800/50 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                                <tr>
                                    <th className="px-8 py-5">Identidade do Char</th>
                                    <th className="px-8 py-5">Patente / Rank</th>
                                    <th className="px-8 py-5 text-center">Nível</th>
                                    <th className="px-8 py-5 text-right">Controle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {filteredMembers.map(member => (
                                    <tr key={member.role_id} className="hover:bg-cyan-500/[0.02] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-10 h-10 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center font-black text-slate-600 group-hover:border-cyan-500 transition-all">
                                                    {member.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-white font-black text-sm uppercase tracking-tight">{member.name}</div>
                                                    <div className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">ID: {member.role_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <select 
                                                value={member.rank}
                                                onChange={e => handleRankChange(member.role_id, parseInt(e.target.value))}
                                                className={`bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-cyan-500 transition-all ${RANK_LABELS[member.rank]?.color || 'text-slate-400'}`}
                                            >
                                                {Object.entries(RANK_LABELS).map(([val, info]) => (
                                                    <option key={val} value={val} className="bg-slate-900 text-white">{info[lang]}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-8 py-5 text-center font-black text-white text-xs">LVL {member.level}</td>
                                        <td className="px-8 py-5 text-right">
                                            <button onClick={() => removeMember(member.role_id)} className="p-2.5 bg-slate-950 border border-slate-800 hover:bg-red-600/10 hover:border-red-500/30 text-slate-600 hover:text-red-500 rounded-xl transition-all shadow-lg">
                                                <UserMinus className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'diplomacy' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-fadeIn">
                  {/* Alliances */}
                  <div className="space-y-6">
                      <div className="bg-blue-500/5 p-10 rounded-[3rem] border border-blue-500/20 relative overflow-hidden group">
                          <div className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-1000">
                             <Handshake className="w-40 h-40 text-blue-400" />
                          </div>
                          <h4 className="text-blue-400 font-black text-xl mb-8 flex items-center uppercase tracking-tighter">
                              <Handshake className="w-7 h-7 mr-4" /> Alianças de Sangue
                          </h4>
                          <div className="flex gap-3 mb-10">
                              <input id="add-alliance" type="number" placeholder="ID da Facção..." className="flex-1 bg-slate-950 border border-slate-800 rounded-[1.5rem] px-6 py-4 text-white text-sm shadow-inner" />
                              <button onClick={() => {
                                  const id = parseInt((document.getElementById('add-alliance') as any).value);
                                  if(id && !editingFaction.alliances.includes(id)) setEditingFaction({...editingFaction, alliances: [...editingFaction.alliances, id]});
                                  (document.getElementById('add-alliance') as any).value = '';
                              }} className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl shadow-lg transition-all"><Plus /></button>
                          </div>
                          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                              {editingFaction.alliances.map(id => (
                                  <div key={id} className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex justify-between items-center hover:border-blue-500/30 transition-all">
                                      <div className="flex items-center">
                                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-4 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
                                          <span className="text-white font-black text-sm uppercase tracking-widest">FACÇÃO REGISTRADA #{id}</span>
                                      </div>
                                      <button onClick={() => setEditingFaction({...editingFaction, alliances: editingFaction.alliances.filter(x => x !== id)})} className="text-slate-600 hover:text-red-500 transition-colors"><Trash className="w-4 h-4" /></button>
                                  </div>
                              ))}
                              {editingFaction.alliances.length === 0 && <p className="text-center text-slate-700 font-bold uppercase text-[10px] tracking-[0.2em] py-10 italic">Nenhum tratado assinado.</p>}
                          </div>
                      </div>
                  </div>

                  {/* Hostiles */}
                  <div className="space-y-6">
                      <div className="bg-red-500/5 p-10 rounded-[3rem] border border-red-500/20 relative overflow-hidden group">
                          <div className="absolute -top-10 -right-10 opacity-5 group-hover:-rotate-12 transition-transform duration-1000">
                             <Swords className="w-40 h-40 text-red-400" />
                          </div>
                          <h4 className="text-red-400 font-black text-xl mb-8 flex items-center uppercase tracking-tighter">
                              <Swords className="w-7 h-7 mr-4" /> Estado de Guerra Ativa
                          </h4>
                          <div className="flex gap-3 mb-10">
                              <input id="add-hostile" type="number" placeholder="ID da Facção..." className="flex-1 bg-slate-950 border border-slate-800 rounded-[1.5rem] px-6 py-4 text-white text-sm shadow-inner" />
                              <button onClick={() => {
                                  const id = parseInt((document.getElementById('add-hostile') as any).value);
                                  if(id && !editingFaction.hostiles.includes(id)) setEditingFaction({...editingFaction, hostiles: [...editingFaction.hostiles, id]});
                                  (document.getElementById('add-hostile') as any).value = '';
                              }} className="bg-red-600 hover:bg-red-500 text-white p-4 rounded-2xl shadow-lg transition-all"><Plus /></button>
                          </div>
                          <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                              {editingFaction.hostiles.map(id => (
                                  <div key={id} className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex justify-between items-center hover:border-red-500/30 transition-all">
                                      <div className="flex items-center">
                                          <div className="w-2.5 h-2.5 rounded-full bg-red-500 mr-4 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]"></div>
                                          <span className="text-white font-black text-sm uppercase tracking-widest">FACÇÃO EM CONFLITO #{id}</span>
                                      </div>
                                      <button onClick={() => setEditingFaction({...editingFaction, hostiles: editingFaction.hostiles.filter(x => x !== id)})} className="text-slate-600 hover:text-red-500 transition-colors"><Trash className="w-4 h-4" /></button>
                                  </div>
                              ))}
                              {editingFaction.hostiles.length === 0 && <p className="text-center text-slate-700 font-bold uppercase text-[10px] tracking-[0.2em] py-10 italic">Nenhuma hostilidade registrada.</p>}
                          </div>
                      </div>
                  </div>
              </div>
            )}
            
            {activeTab === 'territories' && (
                <div className="flex flex-col items-center justify-center h-full text-slate-700 py-20 border border-dashed border-slate-800 rounded-[3rem] animate-fadeIn">
                    <MapIcon className="w-20 h-20 mb-6 opacity-10" />
                    <p className="font-black uppercase tracking-[0.3em] text-xs">Módulo de Territórios em Desenvolvimento</p>
                    <p className="text-[10px] mt-2 font-mono">Syncing with GamedBD GTerritoryDetail protocol...</p>
                </div>
            )}

          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-800 flex justify-end space-x-4 bg-slate-900/80 backdrop-blur-md z-10">
          <button onClick={onClose} className="px-8 py-4 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-widest transition-all">Descartar Protocolo</button>
          <button 
            onClick={() => onSave(editingFaction)} 
            disabled={isSaving}
            className="px-12 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl shadow-cyan-900/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center"
          >
            {isSaving ? <Activity className="w-4 h-4 mr-3 animate-spin" /> : <Shield className="w-4 h-4 mr-3" />}
            Efetivar Atualização do Clã
          </button>
        </div>
      </div>
    </div>
  );
};

export default FactionEditor;
