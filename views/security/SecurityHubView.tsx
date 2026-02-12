
import React, { useState, useEffect } from 'react';
import { 
    ShieldAlert, ShieldCheck, Globe, Zap, AlertTriangle, 
    Lock, Unlock, RefreshCw, Terminal, Wifi, Activity, 
    Search, ShieldOff, History, User, Hash, Clock, Eye
} from 'lucide-react';
import { Language, TRANSLATIONS, ThreatLog, AuditEntry } from '../../types';
import { PWApiService } from '../../services/pwApi';

interface SecurityHubProps {
  lang: Language;
}

export const SecurityHubView: React.FC<SecurityHubProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [threats, setThreats] = useState<ThreatLog[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'threats' | 'audit'>('threats');

  const loadData = async () => {
    setLoading(true);
    const [tData, aData] = await Promise.all([
        PWApiService.getSecurityThreats(),
        PWApiService.getAuditLogs()
    ]);
    setThreats(tData);
    setAudit(aData);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      {/* Dynamic Header */}
      <div className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
              <ShieldAlert className="w-48 h-48" />
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
              <div className="flex items-center space-x-8">
                  <div className="p-6 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                      <ShieldCheck className="w-16 h-16" />
                  </div>
                  <div>
                      <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Security Ops Center</h2>
                      <p className="text-slate-500 text-xs font-mono uppercase tracking-[0.3em] mt-2">Inteligência Defensiva & Auditoria Core</p>
                  </div>
              </div>
              <div className="flex gap-4">
                  <button onClick={loadData} className="p-5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-3xl transition-all shadow-xl">
                      <RefreshCw className={`w-8 h-8 ${loading ? 'animate-spin' : ''}`} />
                  </button>
              </div>
          </div>
      </div>

      {/* Internal Navigation */}
      <div className="flex space-x-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800 w-fit">
          <button 
            onClick={() => setActiveSubTab('threats')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'threats' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Monitor de Ameaças
          </button>
          <button 
            onClick={() => setActiveSubTab('audit')} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSubTab === 'audit' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Trilha de Auditoria
          </button>
      </div>

      {activeSubTab === 'threats' ? (
          <div className="grid grid-cols-1 gap-6 animate-fadeIn">
              <div className="glass-panel rounded-[2rem] border border-slate-700 overflow-hidden shadow-2xl">
                  <div className="p-8 border-b border-slate-800 bg-slate-900/30">
                      <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center">
                          <Zap className="w-6 h-6 mr-3 text-red-500" /> Tentativas de Intrusão & Anomalias
                      </h3>
                  </div>
                  <table className="w-full text-left">
                      <thead className="bg-slate-800/40 text-slate-500 text-[9px] uppercase font-black tracking-widest">
                          <tr>
                              <th className="px-8 py-5">Timestamp</th>
                              <th className="px-8 py-5">Tipo de Threat</th>
                              <th className="px-8 py-5">Severidade</th>
                              <th className="px-8 py-5">IP Origem</th>
                              <th className="px-8 py-5">Alvo</th>
                              <th className="px-8 py-5">Status</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                          {threats.map(t => (
                              <tr key={t.id} className="hover:bg-red-500/[0.03] transition-colors">
                                  <td className="px-8 py-5 text-slate-400 font-mono text-[10px]">{t.timestamp}</td>
                                  <td className="px-8 py-5 font-black text-white text-xs uppercase tracking-tighter">{t.type}</td>
                                  <td className="px-8 py-5">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                                          t.severity === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 
                                          t.severity === 'high' ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                                      }`}>
                                          {t.severity}
                                      </span>
                                  </td>
                                  <td className="px-8 py-5 font-mono text-cyan-400 text-xs">{t.sourceIp}</td>
                                  <td className="px-8 py-5 text-slate-400 text-[10px] uppercase font-bold">{t.targetService}</td>
                                  <td className="px-8 py-5">
                                      <div className="flex items-center text-[10px] font-black uppercase text-emerald-400">
                                          <ShieldCheck className="w-3 h-3 mr-1" /> {t.status}
                                      </div>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      ) : (
          <div className="glass-panel rounded-[2rem] border border-indigo-700 overflow-hidden shadow-2xl animate-fadeIn">
              <div className="p-8 border-b border-indigo-900/50 bg-indigo-950/20">
                  <h3 className="text-lg font-black text-white uppercase tracking-tighter flex items-center">
                      <History className="w-6 h-6 mr-3 text-indigo-400" /> Registro de Ações Administrativas
                  </h3>
              </div>
              <table className="w-full text-left">
                  <thead className="bg-indigo-950/40 text-indigo-300/50 text-[9px] uppercase font-black tracking-widest">
                      <tr>
                          <th className="px-8 py-5">Data/Hora</th>
                          <th className="px-8 py-5">Operador</th>
                          <th className="px-8 py-5">Ação Realizada</th>
                          <th className="px-8 py-5">Target ID</th>
                          <th className="px-8 py-5">Detalhes da Transação</th>
                          <th className="px-8 py-5 text-right">Protocolo IP</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-900/30 bg-slate-950/40">
                      {audit.length > 0 ? audit.map(a => (
                          <tr key={a.id} className="hover:bg-indigo-500/5 transition-colors group">
                              <td className="px-8 py-5 text-indigo-300 font-mono text-[10px]">{a.timestamp}</td>
                              <td className="px-8 py-5">
                                  <div className="flex items-center text-white font-bold text-xs uppercase">
                                      <User className="w-3 h-3 mr-2 text-indigo-400" /> {a.adminId}
                                  </div>
                              </td>
                              <td className="px-8 py-5">
                                  <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter">{a.action}</span>
                              </td>
                              <td className="px-8 py-5 font-mono text-xs text-slate-400">ID: {a.targetId}</td>
                              <td className="px-8 py-5 text-slate-500 italic text-[11px] truncate max-w-xs">{a.details}</td>
                              <td className="px-8 py-5 text-right font-mono text-[10px] text-slate-600">{a.originIp}</td>
                          </tr>
                      )) : (
                          <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-600 font-bold uppercase italic">Nenhuma ação auditada registrada na sessão atual.</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      )}
    </div>
  );
};
