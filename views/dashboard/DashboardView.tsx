
import React, { useState, useEffect } from 'react';
import { 
  Activity, Users, Server, Database, Cpu, Play, Square, RotateCw, 
  CheckCircle, XCircle, Map as MapIcon, Wifi, WifiOff, FileCheck, 
  ArrowUp, ArrowDown, Search, ShieldAlert, Zap, Filter, Hash, ShieldCheck
} from 'lucide-react';
import { Language, ServiceData, TRANSLATIONS, PW_DATA, DashboardStats, MapInstance } from '../../types';
import { PWApiService } from '../../services/pwApi';

interface DashboardProps {
  lang: Language;
  setView: (view: string) => void;
}

export const DashboardView: React.FC<DashboardProps> = ({ lang, setView }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [services, setServices] = useState<ServiceData[]>([]);
  const [instances, setInstances] = useState<MapInstance[]>([]);
  const [serverData, setServerData] = useState<DashboardStats[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  const fetchData = async () => {
    const sData = await PWApiService.getServerServices();
    const mData = await PWApiService.getMapInstances();
    const stats = await PWApiService.getDashboardStats();
    
    setServices(sData);
    setInstances(mData.map(inst => ({
        ...inst,
        name: PW_DATA.maps[inst.id] ? (PW_DATA.maps[inst.id][lang] || PW_DATA.maps[inst.id]['en']) : inst.id
    })));
    setServerData(stats);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [lang]);

  const toggleService = async (id: string, action: 'start' | 'stop' | 'restart') => {
      setLoadingServices(true);
      await PWApiService.toggleService(id, action);
      setTimeout(() => {
          fetchData();
          setLoadingServices(false);
      }, 1000);
  };

  const currentStats = serverData.length > 0 ? serverData[serverData.length - 1] : { 
      players: 0, cpu: 0, ram: 0, ram_total: 16, swap: 0, swap_total: 4, net_in: 0, net_out: 0 
  };

  const getPercentage = (val: number, total: number) => {
    if (!total || total === 0) return 0;
    return (val / total) * 100;
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button onClick={() => setView('online_players')} className="glass-panel p-6 rounded-xl border border-slate-700 shadow-xl text-left hover:border-cyan-500 transition-all group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('online_players')}</p>
              <h3 className="text-3xl font-black text-white mt-1 group-hover:text-cyan-400 transition-colors">{currentStats.players || 0}</h3>
              <p className="text-emerald-400 text-[10px] mt-2 flex items-center font-mono animate-pulse"><Activity className="w-3 h-3 mr-1" /> CORE SYNC ACTIVE</p>
            </div>
            <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20"><Users className="w-6 h-6 text-cyan-400" /></div>
          </div>
        </button>

        <div className="glass-panel p-6 rounded-xl border border-slate-700 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('cpu')}</p>
              <h3 className="text-3xl font-black text-white mt-1">{(currentStats.cpu || 0).toFixed(1)}%</h3>
              <div className="mt-3 w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all duration-500" style={{width: `${currentStats.cpu || 0}%`}}></div>
              </div>
            </div>
            <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20"><Cpu className="w-6 h-6 text-purple-400" /></div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-slate-700 shadow-xl">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">{t('memory_ram_swap')}</p>
          <div className="space-y-4">
              <div>
                  <div className="flex justify-between text-[10px] uppercase font-bold mb-1">
                      <span className="text-cyan-400">RAM: {currentStats.ram || 0}GB</span>
                      <span className="text-slate-500">{currentStats.ram_total || 16}GB</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500" style={{width: `${getPercentage(currentStats.ram, currentStats.ram_total)}%`}}></div>
                  </div>
              </div>
          </div>
        </div>

        <button onClick={() => setView('security_hub')} className="glass-panel p-6 rounded-xl border border-slate-700 shadow-xl text-left group hover:border-red-500 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{t('network_traffic')}</p>
              <h3 className="text-2xl font-black text-white mt-1">{(currentStats.net_in || 0).toFixed(2)} <span className="text-xs text-slate-500">MB/s</span></h3>
              <div className="mt-2 text-[10px] text-blue-400 font-black uppercase tracking-tighter flex items-center">SECURITY HUB <Zap className="w-2.5 h-2.5 ml-1" /></div>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400"><Wifi className="w-6 h-6" /></div>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Status dos Serviços (Novo Widget) */}
          <div className="xl:col-span-2 glass-panel p-8 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5"><ShieldCheck className="w-48 h-48" /></div>
              <div className="flex justify-between items-center mb-8 relative z-10">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center">
                        <Server className="w-6 h-6 mr-3 text-cyan-500" /> Status dos Serviços Core
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">Gestão de Binários e Instâncias de Processamento</p>
                  </div>
                  <button onClick={fetchData} className="p-2 hover:bg-slate-800 rounded-lg text-cyan-400 transition-all">
                      <RotateCw className={`w-5 h-5 ${loadingServices ? 'animate-spin' : ''}`} />
                  </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                  {services.map(service => (
                      <div key={service.id} className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex items-center justify-between group hover:border-cyan-500/30 transition-all">
                          <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-xl border ${service.status === 'online' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                  <Zap className={`w-5 h-5 ${service.status === 'online' ? 'animate-pulse' : ''}`} />
                              </div>
                              <div>
                                  <h4 className="text-white font-black text-sm uppercase tracking-tight">{service.name}</h4>
                                  <div className="flex items-center text-[10px] text-slate-500 font-mono">
                                      <Hash className="w-2.5 h-2.5 mr-1" /> PID: {service.pid || '---'}
                                  </div>
                              </div>
                          </div>
                          <div className="flex items-center space-x-2">
                              <div className="text-right mr-4 hidden sm:block">
                                  <div className="text-[9px] text-slate-600 font-black uppercase">Carga</div>
                                  <div className="text-xs text-white font-bold">{service.cpu}% CPU</div>
                              </div>
                              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  {service.status === 'online' ? (
                                      <>
                                          <button onClick={() => toggleService(service.id, 'restart')} className="p-2 bg-cyan-600/10 text-cyan-400 hover:bg-cyan-600 hover:text-white rounded-lg transition-all" title="Reiniciar"><RotateCw className="w-4 h-4" /></button>
                                          <button onClick={() => toggleService(service.id, 'stop')} className="p-2 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white rounded-lg transition-all" title="Parar"><Square className="w-4 h-4 fill-current" /></button>
                                      </>
                                  ) : (
                                      <button onClick={() => toggleService(service.id, 'start')} className="p-2 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-lg transition-all" title="Iniciar"><Play className="w-4 h-4 fill-current" /></button>
                                  )}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Map Activity Summary */}
          <div className="glass-panel p-8 rounded-2xl border border-slate-700 shadow-2xl">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6 flex items-center">
                  <MapIcon className="w-5 h-5 mr-3 text-emerald-400" /> Instâncias Ativas
              </h3>
              <div className="space-y-4">
                  {instances.filter(i => i.status === 'online').slice(0, 5).map(inst => (
                      <div key={inst.id} className="flex justify-between items-center p-3 bg-slate-900/40 rounded-xl border border-slate-800">
                          <div>
                              <div className="text-xs text-white font-bold">{inst.name}</div>
                              <div className="text-[9px] text-slate-500 font-mono">ID: {inst.id}</div>
                          </div>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black">ONLINE</span>
                      </div>
                  ))}
                  <button onClick={() => setView('server')} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Ver Todos os Mapas</button>
              </div>
          </div>
      </div>
    </div>
  );
};
