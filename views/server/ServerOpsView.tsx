
import React, { useState, useEffect, useRef } from 'react';
import { 
    Power, Settings, FileText, Terminal, Trash2, RefreshCw, Folder, Save, 
    MessageSquare, Map as MapIcon, Activity, History, PlayCircle, StopCircle, 
    LayoutList
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../../types';
import ChatMonitor from './ChatMonitor';
import InstanceControl from './InstanceControl';
import ServiceMonitor from './ServiceMonitor';
import TradeLogView from './TradeLog';

interface ServerOpsProps {
  lang: Language;
}

export const ServerOpsView: React.FC<ServerOpsProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [activeTab, setActiveTab] = useState<'services' | 'instances' | 'console' | 'chat' | 'logs'>('services');

  const tabs = [
    { id: 'services', icon: Activity, label: t('processes') },
    { id: 'instances', icon: MapIcon, label: t('map_monitor') },
    { id: 'console', icon: Terminal, label: t('console_output') },
    { id: 'chat', icon: MessageSquare, label: t('chat_monitor') },
    { id: 'logs', icon: History, label: t('trade_logs') }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Tab Navigation */}
      <div className="flex items-center space-x-1 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-full md:w-fit overflow-x-auto custom-scrollbar">
        {tabs.map(tab => (
            <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 flex items-center justify-center whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'bg-cyan-600 text-white shadow-xl shadow-cyan-900/30' 
                    : 'text-slate-500 hover:text-white hover:bg-slate-800'
                }`}
            >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
            </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'services' && <ServiceMonitor lang={lang} />}
        {activeTab === 'instances' && <InstanceControl lang={lang} />}
        {activeTab === 'chat' && <ChatMonitor lang={lang} />}
        {activeTab === 'logs' && <TradeLogView lang={lang} />}
        
        {activeTab === 'console' && (
            <ConsoleOutput lang={lang} />
        )}
      </div>
    </div>
  );
};

// COMPONENTE DE CONSOLE MELHORADO
const ConsoleOutput = ({ lang }: { lang: Language }) => {
    const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
    const [logs, setLogs] = useState<string[]>([]);
    const [filter, setFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchLogs = async () => {
            const data = await PWApiService.readLogFile('world.log');
            setLogs(data);
        };
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesFilter = filter === 'ALL' || log.includes(`[${filter}]`);
        const matchesSearch = log.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="glass-panel rounded-2xl border border-slate-700 flex flex-col h-[650px] overflow-hidden">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex space-x-2">
                    {['ALL', 'INFO', 'WARN', 'ERROR'].map(f => (
                        <button 
                            key={f} 
                            onClick={() => setFilter(f as any)}
                            className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border transition-all ${
                                filter === f 
                                ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg' 
                                : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 max-w-md">
                    <Terminal className="absolute left-3 top-2 w-4 h-4 text-slate-600" />
                    <input 
                        type="text" 
                        placeholder="Pesquisar no console..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-cyan-500"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 font-mono text-[11px] bg-slate-950 space-y-1 custom-scrollbar">
                {filteredLogs.map((log, i) => {
                    const isError = log.includes('[ERROR]');
                    const isWarn = log.includes('[WARN]');
                    return (
                        <div key={i} className={`p-1 rounded ${isError ? 'bg-red-900/20 text-red-400' : isWarn ? 'bg-yellow-900/20 text-yellow-400' : 'text-slate-400'}`}>
                            <span className="text-slate-600 mr-2">{i + 1}</span>
                            {log}
                        </div>
                    );
                })}
            </div>
            <div className="p-3 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between uppercase font-black">
                <span>Total: {filteredLogs.length} Entradas</span>
                <span className="text-cyan-600 animate-pulse">Streaming logs from master...</span>
            </div>
        </div>
    );
}

import { PWApiService } from '../../services/pwApi';
