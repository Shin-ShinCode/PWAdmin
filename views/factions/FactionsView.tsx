import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Trash2, PlusCircle, Flag, Edit, User, Swords, ShieldAlert, CheckCircle, Loader2, Info, Map as MapIcon, Globe } from 'lucide-react';
import { Language, TRANSLATIONS, PWFaction, PW_DATA } from '../../types';
import { PWApiService } from '../../services/pwApi';
import FactionEditor from './FactionEditor';
import { TerritoryMap } from './TerritoryMap';

interface FactionsViewProps {
  lang: Language;
}

export const FactionsView: React.FC<FactionsViewProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [activeTab, setActiveTab] = useState<'list' | 'map' | 'nw'>('list');
  
  const [factions, setFactions] = useState<PWFaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [editingFaction, setEditingFaction] = useState<PWFaction | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newFactionForm, setNewFactionForm] = useState({ name: '', masterId: '', level: 1 });

  // TERRITORY WAR STATE
  const [showTwModal, setShowTwModal] = useState(false);
  const [twData, setTwData] = useState({ mapId: 1, attackerId: 0, defenderId: 0 });
  const [twLoading, setTwLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await PWApiService.getAllFactions();
    setFactions(data);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleStartTw = async () => {
      if(!twData.attackerId || !twData.defenderId) return;
      setTwLoading(true);
      await PWApiService.initTerritoryWar(twData.mapId, twData.attackerId, twData.defenderId);
      setTwLoading(false);
      setShowTwModal(false);
      alert("Guerra de Território Iniciada com Sucesso!");
  };

  const handleCreateFaction = async () => {
      if(!newFactionForm.name || !newFactionForm.masterId) return;
      await PWApiService.createFaction(newFactionForm.name, parseInt(newFactionForm.masterId));
      setIsCreating(false);
      setNewFactionForm({ name: '', masterId: '', level: 1 });
      loadData();
  };

  const filteredFactions = factions.filter(f => 
    f.name.toLowerCase().includes(search.toLowerCase()) || 
    f.fid.toString().includes(search) ||
    f.master_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      
      {/* TABS HEADER */}
      <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-2xl w-fit border border-slate-700">
          <button 
            onClick={() => setActiveTab('list')}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center ${activeTab === 'list' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
             <Flag className="w-4 h-4 mr-2" /> {t('factions') || 'Clãs'}
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center ${activeTab === 'map' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-white'}`}
          >
             <MapIcon className="w-4 h-4 mr-2" /> Mapa Territorial
          </button>
          <button 
            onClick={() => setActiveTab('nw')}
            className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center ${activeTab === 'nw' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-slate-500 hover:text-white'}`}
          >
             <Globe className="w-4 h-4 mr-2" /> Guerra da Nações
          </button>
      </div>

      {activeTab === 'map' && (
          <TerritoryMap lang={lang} factions={factions} />
      )}

      {activeTab === 'nw' && (
          <div className="bg-slate-900/50 border border-slate-700 rounded-[2rem] p-10 text-center">
              <Globe className="w-16 h-16 text-purple-500 mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Guerra das Nações (Nation War)</h2>
              <p className="text-slate-500 mt-2 max-w-lg mx-auto">O módulo de configuração de Nation War requer acesso ao arquivo <code className="text-purple-400">gs.conf</code> e <code className="text-purple-400">is32</code>. A estrutura de dados está sendo implementada no backend.</p>
              <button className="mt-8 px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-white font-bold uppercase text-xs tracking-widest">
                  Carregar Configuração (Beta)
              </button>
          </div>
      )}

      {activeTab === 'list' && (
        <>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por ID, Nome do Clã ou Marechal..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 shadow-inner" 
          />
        </div>
        <button onClick={() => setShowTwModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-2xl flex items-center space-x-2 font-bold transition-all shadow-lg shadow-red-900/20">
            <Swords className="w-5 h-5" /><span>Painel TW</span>
        </button>
        <button onClick={() => setIsCreating(true)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-2xl flex items-center space-x-2 font-bold transition-all shadow-lg shadow-green-900/20">
            <PlusCircle className="w-5 h-5" /><span>Novo Clã</span>
        </button>
        <button onClick={loadData} className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-2xl transition-all">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="glass-panel rounded-[2rem] overflow-hidden border border-slate-700 shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
            <tr>
              <th className="px-8 py-5">ID / Nome do Clã</th>
              <th className="px-8 py-5">Liderança</th>
              <th className="px-8 py-5 text-center">Nível</th>
              <th className="px-8 py-5 text-center">Efetivo</th>
              <th className="px-8 py-5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredFactions.map((faction) => (
              <tr key={faction.fid} className="hover:bg-slate-800/30 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center">
                      <div className="w-10 h-10 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center mr-4 group-hover:border-cyan-500/50 transition-all">
                        <Flag className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <div className="font-black text-white text-lg leading-tight uppercase tracking-tight">{faction.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">ID: {faction.fid}</div>
                      </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                    <div className="flex flex-col">
                        <div className="flex items-center text-cyan-400 font-bold">
                            <User className="w-3.5 h-3.5 mr-2" />
                            {faction.master_name}
                        </div>
                        <div className="text-[10px] text-slate-600 font-mono">RoleID: {faction.master}</div>
                    </div>
                </td>
                <td className="px-8 py-5 text-center">
                    <span className="bg-slate-950 border border-slate-700 px-3 py-1 rounded-lg text-white font-black text-sm">LV. {faction.level}</span>
                </td>
                <td className="px-8 py-5 text-center">
                    <div className="flex flex-col items-center">
                        <span className="text-white font-bold">{faction.members.length} / 200</span>
                        <div className="w-20 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-cyan-600" style={{width: `${(faction.members.length / 200) * 100}%`}}></div>
                        </div>
                    </div>
                </td>
                <td className="px-8 py-5 text-right space-x-2">
                  <button onClick={() => setEditingFaction(faction)} className="p-3 bg-cyan-600/10 hover:bg-cyan-600 text-cyan-400 hover:text-white rounded-xl transition-all border border-cyan-500/20" title={t('edit_faction')}><Edit className="w-4 h-4" /></button>
                  <button onClick={() => alert("Apagar clã requer validação de MasterID")} className="p-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20" title={t('delete_faction')}><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {filteredFactions.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-500 italic">Nenhum clã encontrado para sua pesquisa.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
      </>
      )}


      {/* MODAL INICIAR TW MANUAL */}
      {showTwModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
              <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 animate-fadeIn">
                  <div className="flex items-center mb-8 text-red-500">
                      <Swords className="w-10 h-10 mr-4" />
                      <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Gerenciador de Batalha</h2>
                        <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Escalonamento Manual de Guerra Territorial</p>
                      </div>
                  </div>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-[0.2em]">Seleção de Território</label>
                          <select 
                            value={twData.mapId} 
                            onChange={e => setTwData({...twData, mapId: parseInt(e.target.value)})}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white font-bold focus:border-red-500 outline-none shadow-inner transition-all"
                          >
                              {Object.entries(PW_DATA.maps).slice(0, 15).map(([k, v], idx) => (
                                  <option key={k} value={idx + 1}>{v[lang]} (ID: {idx+1})</option>
                              ))}
                          </select>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className="block text-[10px] font-black text-emerald-500 uppercase mb-2 tracking-[0.2em]">Facção Atacante</label>
                              <select 
                                value={twData.attackerId} 
                                onChange={e => setTwData({...twData, attackerId: parseInt(e.target.value)})}
                                className="w-full bg-slate-950 border border-emerald-900/30 rounded-2xl p-4 text-white font-bold focus:border-emerald-500 outline-none"
                              >
                                  <option value="">Selecione...</option>
                                  {factions.map(f => <option key={f.fid} value={f.fid}>{f.name}</option>)}
                              </select>
                          </div>
                          <div>
                              <label className="block text-[10px] font-black text-red-500 uppercase mb-2 tracking-[0.2em]">Facção Defensora</label>
                              <select 
                                value={twData.defenderId} 
                                onChange={e => setTwData({...twData, defenderId: parseInt(e.target.value)})}
                                className="w-full bg-slate-950 border border-red-900/30 rounded-2xl p-4 text-white font-bold focus:border-red-500 outline-none"
                              >
                                  <option value="">NPC (S/ Dono)</option>
                                  {factions.map(f => <option key={f.fid} value={f.fid}>{f.name}</option>)}
                              </select>
                          </div>
                      </div>

                      <div className="bg-yellow-900/20 border border-yellow-500/30 p-5 rounded-2xl flex items-start">
                          <ShieldAlert className="w-6 h-6 text-yellow-500 mr-4 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-yellow-200/70 leading-relaxed uppercase font-bold tracking-tight">
                              Ação Crítica: Esta operação grava os dados diretamente na estrutura <b className="text-white">GTerritoryDetail</b>. Verifique se o mapa possui instâncias de guerra ativas.
                          </p>
                      </div>
                  </div>

                  <div className="flex justify-end space-x-4 mt-10">
                      <button onClick={() => setShowTwModal(false)} className="px-6 py-2 text-slate-500 hover:text-white transition-colors font-black uppercase tracking-widest text-[10px]">Cancelar</button>
                      <button 
                        onClick={handleStartTw} 
                        disabled={twLoading}
                        className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest flex items-center shadow-2xl shadow-red-900/40 transition-all hover:-translate-y-1 active:scale-95"
                      >
                          {twLoading ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <CheckCircle className="w-5 h-5 mr-3" />}
                          Confirmar Combate
                      </button>
                  </div>
              </div>
          </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 animate-fadeIn">
            <div className="flex items-center mb-8">
                <div className="bg-green-500/10 p-3 rounded-2xl mr-4 border border-green-500/20"><Flag className="w-8 h-8 text-green-500" /></div>
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Fundar Clã</h2>
                    <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Inscrição de Nova Facção no Servidor</p>
                </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Nome da Facção</label>
                <input type="text" className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white font-bold outline-none focus:ring-1 focus:ring-green-500 transition-all shadow-inner" value={newFactionForm.name} onChange={e => setNewFactionForm({...newFactionForm, name: e.target.value})} placeholder="Ex: WarriorsBR" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Marechal (ID do Personagem)</label>
                <input type="number" className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white font-mono outline-none focus:ring-1 focus:ring-green-500 transition-all shadow-inner" value={newFactionForm.masterId} onChange={e => setNewFactionForm({...newFactionForm, masterId: e.target.value})} placeholder="Ex: 1024" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Nível Inicial</label>
                <select value={newFactionForm.level} onChange={e => setNewFactionForm({...newFactionForm, level: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-4 text-white font-bold outline-none">
                    <option value={1}>Nível 1 (Básico)</option>
                    <option value={2}>Nível 2 (Intermediário)</option>
                    <option value={3}>Nível 3 (Avançado)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-10 pt-6 border-t border-slate-800">
                <button onClick={() => setIsCreating(false)} className="px-6 py-2 text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest">Cancelar</button>
                <button onClick={handleCreateFaction} className="px-10 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-green-900/40 transition-all hover:-translate-y-1">Efetivar Fundação</button>
            </div>
          </div>
        </div>
      )}

      {editingFaction && (
          <FactionEditor 
            faction={editingFaction} 
            onClose={() => setEditingFaction(null)} 
            onSave={(f) => { PWApiService.saveFaction(f); setEditingFaction(null); loadData(); }} 
            lang={lang} 
          />
      )}
    </div>
  );
};