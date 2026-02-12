
import React, { useState, useEffect } from 'react';
import { Activity, RotateCw, Zap, ShieldCheck, Hash, Cpu, Database, Server } from 'lucide-react';
import { ServiceData, Language, TRANSLATIONS } from '../../types';
import { PWApiService } from '../../services/pwApi';

interface ServiceMonitorProps {
  lang: Language;
}

const ServiceMonitor: React.FC<ServiceMonitorProps> = ({ lang }) => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
        const data = await PWApiService.getServerServices();
        if (data && Array.isArray(data)) setServices(data);
    } catch (e) {
        console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { 
    fetchServices();
    const interval = setInterval(fetchServices, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (id: string, action: string) => {
    await PWApiService.toggleService(id, action);
    fetchServices();
  };

  return (
    <div className="glass-panel p-10 rounded-[3rem] border border-slate-700 shadow-2xl animate-fadeIn relative overflow-hidden">
      <div className="absolute -bottom-10 -right-10 opacity-5"><Server className="w-96 h-96" /></div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative z-10">
        <div>
            <h3 className="text-3xl font-black text-white flex items-center uppercase tracking-tighter">
            <ShieldCheck className="w-10 h-10 mr-4 text-cyan-400" />
            Monitor de Infraestrutura Core
            </h3>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.3em] mt-2">Sincronização em Tempo Real com Binários Linux</p>
        </div>
        <button onClick={fetchServices} className="p-4 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-2xl transition-all shadow-xl group">
          <RotateCw className={`w-8 h-8 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 relative z-10">
          {services.map(service => (
              <div key={service.id} className={`bg-slate-950/80 p-6 rounded-[2rem] border transition-all ${service.status === 'online' ? 'border-cyan-500/20 shadow-lg shadow-cyan-900/10' : 'border-red-900/20 opacity-70 grayscale'}`}>
                  <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 rounded-xl border ${service.status === 'online' ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                          <Zap className={`w-5 h-5 ${service.status === 'online' ? 'animate-pulse' : ''}`} />
                      </div>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${service.status === 'online' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                          {service.status}
                      </span>
                  </div>

                  <h4 className="text-white font-black text-sm uppercase tracking-widest mb-1">{service.name}</h4>
                  <div className="flex items-center text-[10px] text-slate-500 font-mono mb-6">
                      <Hash className="w-2.5 h-2.5 mr-1" /> PID: {service.pid || 'N/A'}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                          <div className="flex items-center text-[9px] text-slate-500 uppercase font-black mb-1">
                              <Cpu className="w-3 h-3 mr-1 text-purple-500" /> CPU
                          </div>
                          <div className="text-white font-black text-xs">{service.cpu}%</div>
                      </div>
                      <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                          <div className="flex items-center text-[9px] text-slate-500 uppercase font-black mb-1">
                              <Database className="w-3 h-3 mr-1 text-cyan-500" /> MEM
                          </div>
                          <div className="text-white font-black text-xs">{service.mem}%</div>
                      </div>
                  </div>

                  <div className="flex gap-2">
                      {service.status === 'online' ? (
                          <button onClick={() => handleAction(service.id, 'stop')} className="flex-1 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase transition-all">Desligar</button>
                      ) : (
                          <button onClick={() => handleAction(service.id, 'start')} className="flex-1 py-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white rounded-xl text-[9px] font-black uppercase transition-all">Iniciar</button>
                      )}
                      <button onClick={() => handleAction(service.id, 'restart')} className="p-2 bg-slate-800 hover:bg-cyan-600 text-slate-500 hover:text-white rounded-xl transition-all"><RotateCw className="w-4 h-4" /></button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};

export default ServiceMonitor;
