
import React, { useState, useEffect } from 'react';
import { 
  Users, Cpu, Server, HardDrive, Activity, Play, Square, RotateCw, 
  CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
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
    
    if (stats) {
        setServerData(prev => {
            const newData = [...prev, stats];
            if (newData.length > 20) newData.shift();
            return newData;
        });
    }
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

  // Mock data for charts if serverData is empty or just one point
  const chartData = serverData.length > 1 ? serverData : Array(10).fill(0).map((_, i) => ({
    time: `${i}:00`,
    cpu: 20 + Math.random() * 10,
    players: 1000 + Math.random() * 200
  }));

  return (
    <div className="space-y-6 pb-10">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Online Players */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex justify-between items-start group hover:border-cyan-500/30 transition-all">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Jogadores Online</p>
            <h3 className="text-3xl font-bold text-white mt-2">{currentStats.players || 0}</h3>
            <p className="text-emerald-400 text-xs mt-2 flex items-center font-medium">
              <Activity className="w-3 h-3 mr-1" /> +12% vs last hour
            </p>
          </div>
          <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* CPU */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex justify-between items-start group hover:border-purple-500/30 transition-all">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Server CPU</p>
            <h3 className="text-3xl font-bold text-white mt-2">{(currentStats.cpu || 0).toFixed(0)}%</h3>
            <p className="text-slate-500 text-xs mt-2 font-medium">Core i9-9900K @ 4.8Ghz</p>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        {/* RAM */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex justify-between items-start group hover:border-orange-500/30 transition-all">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Server RAM</p>
            <h3 className="text-3xl font-bold text-white mt-2">{currentStats.ram || 0}GB</h3>
            <p className="text-slate-500 text-xs mt-2 font-medium">of {currentStats.ram_total || 64}GB Total (DDR4)</p>
          </div>
          <div className="p-3 bg-orange-500/10 rounded-lg border border-orange-500/20 text-orange-400">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

        {/* Map Instances */}
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50 flex justify-between items-start group hover:border-emerald-500/30 transition-all">
          <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Map Instances</p>
            <h3 className="text-3xl font-bold text-white mt-2">{instances.filter(i => i.status === 'online').length}</h3>
            <p className="text-emerald-400 text-xs mt-2 flex items-center font-medium">
              <CheckCircle className="w-3 h-3 mr-1" /> All Stable
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Server className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-white font-bold mb-6">Carga do Servidor</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#475569" tick={{fontSize: 12}} />
                <YAxis stroke="#475569" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}}
                  itemStyle={{color: '#e2e8f0'}}
                />
                <Area type="monotone" dataKey="cpu" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} />
                <Area type="monotone" dataKey="players" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRam)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
          <h3 className="text-white font-bold mb-6">Player Concurrency (CCU)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#475569" tick={{fontSize: 12}} />
                <YAxis stroke="#475569" tick={{fontSize: 12}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px'}}
                  itemStyle={{color: '#e2e8f0'}}
                />
                <Line type="monotone" dataKey="players" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Service Monitoring */}
      <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700/50">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-cyan-400" />
            Monitoramento de Processos
          </h3>
          <button onClick={fetchData} className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium text-white transition-colors border border-slate-600">
            <RefreshCw className={`w-4 h-4 ${loadingServices ? 'animate-spin' : ''}`} />
            <span>Verificar Status</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map(service => (
            <div key={service.id} className="bg-slate-900/50 border border-slate-800 p-5 rounded-xl group hover:border-slate-600 transition-all">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-white font-bold text-sm uppercase">{service.name}</h4>
                  <div className="flex items-center mt-2 space-x-2">
                    <div className={`w-2 h-2 rounded-full ${service.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                    <span className={`text-xs font-bold ${service.status === 'online' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {service.status === 'online' ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">PID: {service.pid || '---'}</div>
                </div>
                <div className={`p-2 rounded-lg ${service.status === 'online' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {service.status === 'online' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
              </div>

              <div className="flex space-x-2 mt-4 pt-4 border-t border-slate-800">
                {service.status === 'online' ? (
                  <>
                    <button onClick={() => toggleService(service.id, 'restart')} className="flex-1 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded flex justify-center transition-colors" title="Reiniciar">
                      <RotateCw className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleService(service.id, 'stop')} className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded flex justify-center transition-colors" title="Parar">
                      <Square className="w-4 h-4 fill-current" />
                    </button>
                  </>
                ) : (
                  <button onClick={() => toggleService(service.id, 'start')} className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded flex justify-center transition-colors" title="Iniciar">
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
