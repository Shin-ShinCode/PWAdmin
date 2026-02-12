
import React, { useEffect, useState } from 'react';
import { Map as MapIcon, Power, Play, Square, RotateCw, Search, CheckCircle, WifiOff, Cpu, Database, Hash } from 'lucide-react';
import { MapInstance, Language, TRANSLATIONS, PW_DATA } from '../../types';
import { PWApiService } from '../../services/pwApi';

interface InstanceControlProps {
  lang: Language;
}

const InstanceControl: React.FC<InstanceControlProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [instances, setInstances] = useState<MapInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [refreshInterval, setRefreshInterval] = useState<any | null>(null);

  const loadInstances = async () => {
    if(instances.length === 0) setLoading(true);
    
    const data = await PWApiService.getMapInstances();
    
    // Mesclar e traduzir nomes
    const mergedInstances = data.map(inst => ({
        ...inst,
        name: PW_DATA.maps[inst.id] ? (PW_DATA.maps[inst.id][lang] || PW_DATA.maps[inst.id]['en']) : inst.id
    }));
    
    // Ordenar alfabeticamente pelo nome traduzido
    const sorted = mergedInstances.sort((a, b) => a.name.localeCompare(b.name, lang === 'pt' ? 'pt-BR' : 'en'));
    
    setInstances(sorted);
    setLoading(false);
  };

  useEffect(() => { 
      loadInstances(); 
      const interval = setInterval(() => {
          loadInstances();
      }, 5000);
      setRefreshInterval(interval);

      return () => clearInterval(interval);
  }, [lang]);

  const handleAction = async (id: string, action: 'start' | 'stop' | 'restart') => {
    setInstances(prev => prev.map(inst => {
      if (inst.id === id) {
          let nextStatus = inst.status;
          if (action === 'start') nextStatus = 'starting';
          if (action === 'stop' || action === 'restart') nextStatus = 'stopping';
          return { ...inst, status: nextStatus };
      }
      return inst;
    }));
    
    await PWApiService.toggleInstance(id, action);
    setTimeout(loadInstances, 1000);
  };

  const filteredInstances = instances.filter(i => 
      i.name.toLowerCase().includes(search.toLowerCase()) || 
      i.id.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'online': 
            return <span className="bg-green-500/20 text-green-400 border border-green-500/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-[0_0_8px_rgba(34,197,94,0.3)]">Online</span>;
          case 'starting':
            return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase animate-pulse">Starting</span>;
          case 'stopping':
            return <span className="bg-orange-500/20 text-orange-400 border border-orange-500/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase animate-pulse">Stopping</span>;
          default:
            return <span className="bg-slate-800 text-slate-500 border border-slate-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Offline</span>;
      }
  };

  return (
    <div className="glass-panel p-0 rounded-xl border border-slate-700 flex flex-col h-[650px] overflow-hidden animate-fadeIn">
      {/* Header Toolbar */}
      <div className="p-6 border-b border-slate-700 bg-slate-900/50 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white flex items-center">
                <MapIcon className="w-6 h-6 mr-2 text-emerald-400" />
                {t('map_monitor')}
                <span className="ml-3 text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-full border border-slate-700">
                    {instances.filter(i => i.status === 'online').length} / {instances.length} Online
                </span>
            </h3>
            <button onClick={loadInstances} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                <RotateCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
        </div>

        <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
            <input 
                type="text" 
                placeholder="Search map ID or name..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-950 z-10 shadow-md">
            <tr className="text-slate-400 text-xs uppercase border-b border-slate-800">
              <th className="py-3 px-6 w-1/3">{t('map_name')}</th>
              <th className="py-3 px-4 w-20">ID</th>
              <th className="py-3 px-4 w-24">PID</th>
              <th className="py-3 px-4 w-32">{t('status')}</th>
              <th className="py-3 px-4">{t('resources')}</th>
              <th className="py-3 px-6 text-right w-32">{t('control')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredInstances.map((inst) => (
              <tr key={inst.id} className="hover:bg-slate-800/40 transition-colors group">
                <td className="py-4 px-6">
                    <div className="font-bold text-white text-sm">{inst.name}</div>
                </td>
                <td className="py-4 px-4 font-mono text-[10px] text-slate-500">{inst.id}</td>
                <td className="py-4 px-4">
                    {inst.pid ? <div className="flex items-center text-cyan-500 font-mono text-xs"><Hash className="w-3 h-3 mr-1 opacity-50"/>{inst.pid}</div> : <span className="text-slate-700">-</span>}
                </td>
                <td className="py-4 px-4">
                  {getStatusBadge(inst.status)}
                </td>
                <td className="py-4 px-4">
                    {inst.status === 'online' ? (
                        <div className="grid grid-cols-2 gap-4 max-w-[180px]">
                            <div>
                                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                    <span>CPU</span>
                                    <span>{inst.cpu}%</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-500 rounded-full transition-all" style={{width: `${Math.min((inst.cpu || 0) * 10, 100)}%`}}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                    <span>MEM</span>
                                    <span>{inst.mem}MB</span>
                                </div>
                                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500 rounded-full transition-all" style={{width: `${Math.min((inst.mem || 0) / 2, 100)}%`}}></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <span className="text-[10px] text-slate-600 italic">Inactive</span>
                    )}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    {inst.status === 'online' ? (
                        <>
                            <button onClick={() => handleAction(inst.id, 'restart')} className="bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30 p-1.5 rounded transition-colors" title={t('restart')}>
                                <RotateCw className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleAction(inst.id, 'stop')} className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 p-1.5 rounded transition-colors" title={t('stop')}>
                                <Square className="w-3.5 h-3.5 fill-current" />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => handleAction(inst.id, 'start')} disabled={inst.status !== 'offline'} className={`p-1.5 rounded transition-colors ${inst.status === 'offline' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30' : 'bg-slate-800 text-slate-600 border border-slate-700'}`} title={t('start')}>
                            <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstanceControl;
