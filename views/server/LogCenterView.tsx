
import React, { useState, useEffect } from 'react';
import { 
  FileText, Search, Calendar, Filter, ChevronLeft, ChevronRight, 
  Download, Clock, Shield, AlertTriangle, MessageSquare, Repeat, 
  Terminal, HardDrive, LayoutList, RefreshCw, Layers
} from 'lucide-react';
import { GameLogEntry, Language, TRANSLATIONS } from '../../types';
import { PWApiService } from '../../services/pwApi';

interface LogCenterProps {
  lang: Language;
}

export const LogCenterView: React.FC<LogCenterProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  
  const [logs, setLogs] = useState<GameLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Filtros Avançados (Baseados no LogParser fornecido)
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchLogs = async () => {
    setLoading(true);
    const { logs: data, total: count } = await PWApiService.getGameLogs(page, { search, typeFilter, levelFilter, date });
    setLogs(data);
    setTotal(count);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [page, typeFilter, levelFilter, date]);

  const getLogIcon = (type: string) => {
    switch(type) {
      case 'Chat': return <MessageSquare className="w-4 h-4 text-cyan-400" />;
      case 'Trade': return <Repeat className="w-4 h-4 text-yellow-400" />;
      case 'GM': return <Shield className="w-4 h-4 text-purple-400" />;
      case 'Error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'Shop': return <Layers className="w-4 h-4 text-emerald-400" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Dynamic Search & Control Bar */}
      <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5"><Terminal className="w-48 h-48" /></div>
        
        <div className="flex flex-col xl:flex-row gap-8 relative z-10">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-4 text-slate-500 group-focus-within:text-cyan-500 w-6 h-6 transition-all" />
            <input 
              type="text"
              placeholder="Pesquisa Global Forense (RoleID, Mensagem, IP...)"
              className="w-full bg-slate-950 border border-slate-800 rounded-3xl py-4 pl-14 pr-6 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner font-mono text-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 shadow-inner">
              <Calendar className="w-4 h-4 text-slate-500 mr-4" />
              <input type="date" className="bg-transparent border-none text-white text-sm outline-none cursor-pointer font-bold" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <select className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-3 text-white text-sm font-bold outline-none focus:ring-1 focus:ring-cyan-500 appearance-none min-w-[180px]" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
              <option value="ALL">Todos os Grupos</option>
              <option value="Chat">Chat (Global/Guild)</option>
              <option value="Trade">Transações (Trade)</option>
              <option value="Shop">Consumo GShop</option>
              <option value="GM">Comandos GM</option>
              <option value="System">Kernel do Sistema</option>
            </select>

            <select className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-3 text-white text-sm font-bold outline-none focus:ring-1 focus:ring-cyan-500 appearance-none min-w-[150px]" value={levelFilter} onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}>
              <option value="ALL">Severidade</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARNING</option>
              <option value="ERROR">CRITICAL</option>
            </select>

            <button onClick={fetchLogs} className="bg-slate-800 hover:bg-slate-700 text-cyan-400 p-4 rounded-2xl transition-all border border-slate-700 shadow-xl group">
               <RefreshCw className={`w-6 h-6 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Logs Display */}
      <div className="glass-panel rounded-[2.5rem] border border-slate-700 overflow-hidden shadow-2xl animate-slideUp">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl">
          <div className="flex items-center text-xs font-black text-slate-500 uppercase tracking-[0.3em]">
             <HardDrive className="w-5 h-5 mr-3 text-cyan-500" />
             Endpoint de Dados: <span className="text-white ml-2">/logs/{date.replace(/-/g, '/')}/{typeFilter.toLowerCase()}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono bg-slate-950 px-4 py-1.5 rounded-full border border-slate-800">
            REGISTROS DISPONÍVEIS: {total}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/30 text-slate-500 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-10 py-6 w-56">Data e Hora</th>
                <th className="px-10 py-6 w-32 text-center">Tipo</th>
                <th className="px-10 py-6 w-32 text-center">Nível</th>
                <th className="px-10 py-6">Conteúdo Estrutural do Log</th>
                <th className="px-10 py-6 text-right">Origem/IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                  Array.from({length: 8}).map((_, i) => (
                    <tr key={i} className="animate-pulse opacity-50"><td colSpan={5} className="px-10 py-8 bg-slate-900/20"></td></tr>
                  ))
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-cyan-500/[0.03] transition-all group">
                  <td className="px-10 py-6">
                    <div className="flex items-center text-slate-400 font-mono text-xs">
                      <Clock className="w-3.5 h-3.5 mr-3 text-cyan-500 opacity-50" />
                      {log.timestamp}
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center justify-center space-x-2 font-black text-[10px] uppercase tracking-tighter text-slate-200">
                      {getLogIcon(log.type)}
                      <span>{log.type}</span>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border shadow-sm ${
                      log.level === 'ERROR' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                      log.level === 'WARN' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                      'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                    }`}>
                      {log.level}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="text-xs text-slate-300 font-mono leading-relaxed break-all max-w-3xl group-hover:text-white transition-colors">
                      {log.message}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right font-mono text-[10px] text-slate-500 group-hover:text-cyan-400">
                    {log.sourceIp || 'Internal Core'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination Footer */}
        <div className="p-8 bg-slate-900/50 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
           <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="flex items-center px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs font-black text-slate-300 disabled:opacity-20 disabled:cursor-not-allowed transition-all border border-slate-700 shadow-xl"
           >
             <ChevronLeft className="w-5 h-5 mr-2" /> ANTERIOR
           </button>
           
           <div className="flex items-center space-x-3">
             <span className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mr-4">Protocolo de Página: {page} de {totalPages || 1}</span>
             {[1, 2, 3].map(p => (
               p <= totalPages && (
                 <button 
                  key={p} onClick={() => setPage(p)}
                  className={`w-12 h-12 rounded-2xl text-xs font-black transition-all border ${page === p ? 'bg-cyan-600 text-white border-cyan-500 shadow-2xl shadow-cyan-900/40 scale-110' : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-white'}`}
                 >
                   {p}
                 </button>
               )
             ))}
             {totalPages > 3 && <span className="text-slate-700 px-4">...</span>}
           </div>

           <button 
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="flex items-center px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-2xl text-xs font-black text-slate-300 transition-all border border-slate-700 shadow-xl disabled:opacity-20"
           >
             PRÓXIMO <ChevronRight className="w-5 h-5 ml-2" />
           </button>
        </div>
      </div>
    </div>
  );
};
