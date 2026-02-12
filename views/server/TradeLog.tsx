import React, { useState, useEffect } from 'react';
import { History, Search, ArrowRight, Coins, Package, User, Hash, Clock, Filter, Trash2 } from 'lucide-react';
import { TradeLog, Language, TRANSLATIONS } from '../../types';
import { PWApiService } from '../../services/pwApi';

interface TradeLogProps {
  lang: Language;
}

const TradeLogView: React.FC<TradeLogProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [logs, setLogs] = useState<TradeLog[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const data = await PWApiService.getTradeLogs();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const filteredLogs = logs.filter(l => {
      const s = search.toLowerCase();
      return (
        l.giver_name.toLowerCase().includes(s) || 
        l.receiver_name.toLowerCase().includes(s) ||
        l.giver_id.toString().includes(s) ||
        l.receiver_id.toString().includes(s) ||
        l.item_id.toString().includes(s)
      );
  });

  return (
    <div className="glass-panel p-8 rounded-[2.5rem] border border-slate-700 h-[700px] flex flex-col shadow-2xl animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-slate-800 pb-8">
        <div>
            <h3 className="text-2xl font-black text-white flex items-center uppercase tracking-tighter">
            <History className="w-8 h-8 mr-4 text-yellow-400" />
            Logs de Transações
            </h3>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em] mt-1 ml-12">Rastreamento de Itens e Moedas GamedBD</p>
        </div>
        <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-3.5 text-slate-600 group-focus-within:text-cyan-500 w-5 h-5 transition-colors" />
            <input 
                type="text" 
                placeholder="Busca inteligente: RoleID, Nick ou Item ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
        {filteredLogs.length > 0 ? (
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-900/90 backdrop-blur z-10">
                    <tr className="text-slate-500 text-[10px] uppercase font-black tracking-widest border-b border-slate-800">
                        <th className="px-6 py-4 w-48"><div className="flex items-center"><Clock className="w-3 h-3 mr-2" /> Timestamp</div></th>
                        <th className="px-6 py-4">Doador (Remetente)</th>
                        <th className="px-6 py-4 text-center"></th>
                        <th className="px-6 py-4">Destinatário</th>
                        <th className="px-6 py-4 text-right">Conteúdo da Troca</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {filteredLogs.map(log => (
                        <tr key={log.id} className="hover:bg-cyan-500/[0.03] transition-colors group">
                            <td className="px-6 py-5 text-slate-500 font-mono text-[10px]">{log.timestamp}</td>
                            <td className="px-6 py-5">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 font-black text-xs">{log.giver_name.charAt(0)}</div>
                                    <div>
                                        <div className="text-white font-black text-xs uppercase">{log.giver_name}</div>
                                        <div className="text-[9px] text-slate-600 font-mono tracking-widest uppercase">ID: {log.giver_id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-center">
                                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ArrowRight className="w-4 h-4 text-slate-700 group-hover:text-cyan-500 transition-colors" />
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-black text-xs">{log.receiver_name.charAt(0)}</div>
                                    <div>
                                        <div className="text-white font-black text-xs uppercase">{log.receiver_name}</div>
                                        <div className="text-[9px] text-slate-600 font-mono tracking-widest uppercase">ID: {log.receiver_id}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                                {log.item_id > 0 ? (
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center text-cyan-400 font-black text-xs">
                                            <Package className="w-3.5 h-3.5 mr-2" /> Item #{log.item_id}
                                        </div>
                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Quantidade: x{log.count}</div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center text-yellow-500 font-black text-sm">
                                            <Coins className="w-4 h-4 mr-2" /> {log.money.toLocaleString()}
                                        </div>
                                        <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-0.5">MOEDAS GAMEDBD</div>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                <Trash2 className="w-12 h-12 opacity-20" />
                <span className="font-black uppercase tracking-widest text-[10px] italic">Sem transações registradas para sua busca.</span>
            </div>
        )}
      </div>
    </div>
  );
};

export default TradeLogView;