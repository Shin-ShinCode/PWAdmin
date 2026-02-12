import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, FileCode, CheckCircle, AlertCircle, Edit3, Code } from 'lucide-react';
import { Language, TRANSLATIONS } from '../../types';
import { PWApiService } from '../../services/pwApi';

interface ServerConfigProps {
  lang: Language;
}

// Helper to parse key-value from lua
const parseLuaValue = (content: string, key: string): string => {
    const regex = new RegExp(`${key}\\s*=\s*([^\\s\\n-]+)`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
};

export const ServerConfigView: React.FC<ServerConfigProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rawContent, setRawContent] = useState('');
  const [mode, setMode] = useState<'form' | 'raw'>('form');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Form State
  const [config, setConfig] = useState({
      expRate: '',
      spRate: '',
      dropRate: '',
      moneyRate: '',
      maxLevel: '',
      pvpCooldown: '',
      pvpProtectMin: '',
      pvpProtectMax: '',
      maxVigour: '',
      maxReputation: ''
  });

  const loadConfig = async () => {
      setLoading(true);
      setMessage(null);
      try {
          const content = await PWApiService.getLuaConfig();
          if (content) {
              setRawContent(content);
              // Parse values
              setConfig({
                  expRate: parseLuaValue(content, 'EXP_RATE'),
                  spRate: parseLuaValue(content, 'SP_RATE'),
                  dropRate: parseLuaValue(content, 'DROP_RATE'),
                  moneyRate: parseLuaValue(content, 'MONEY_RATE'),
                  maxLevel: parseLuaValue(content, 'MAX_LVL'),
                  pvpCooldown: parseLuaValue(content, 'pvp_cooldown_time'),
                  pvpProtectMin: parseLuaValue(content, 'pvp_protect_level_min'),
                  pvpProtectMax: parseLuaValue(content, 'pvp_protect_level_max'),
                  maxVigour: parseLuaValue(content, 'MaxVigour'),
                  maxReputation: parseLuaValue(content, 'MaxReputation')
              });
          }
      } catch (e) {
          console.error(e);
          setMessage({ type: 'error', text: 'Falha ao carregar script.lua' });
      }
      setLoading(false);
  };

  useEffect(() => { loadConfig(); }, []);

  const handleSave = async () => {
      setSaving(true);
      setMessage(null);
      try {
          let newContent = rawContent;
          
          if (mode === 'form') {
              // Replace values in raw content
              const replacements: Record<string, string> = {
                  'EXP_RATE': config.expRate,
                  'SP_RATE': config.spRate,
                  'DROP_RATE': config.dropRate,
                  'MONEY_RATE': config.moneyRate,
                  'MAX_LVL': config.maxLevel,
                  'pvp_cooldown_time': config.pvpCooldown,
                  'pvp_protect_level_min': config.pvpProtectMin,
                  'pvp_protect_level_max': config.pvpProtectMax,
                  'MaxVigour': config.maxVigour,
                  'MaxReputation': config.maxReputation
              };

              Object.entries(replacements).forEach(([key, val]) => {
                  if (val) {
                      // Regex to replace value preserving spacing
                      const regex = new RegExp(`(${key}\\s*=\\s*)([^\\s\\n-]+)`, 'g');
                      newContent = newContent.replace(regex, `$1${val}`);
                  }
              });
          }

          const success = await PWApiService.saveLuaConfig(newContent);
          if (success) {
              setMessage({ type: 'success', text: 'Configuração salva! O servidor deve atualizar em breve.' });
              setRawContent(newContent);
          } else {
              setMessage({ type: 'error', text: 'Erro ao salvar arquivo.' });
          }
      } catch (e) {
          setMessage({ type: 'error', text: 'Erro de comunicação.' });
      }
      setSaving(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
              <Settings className="w-48 h-48" />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 relative z-10">
              <div className="flex items-center mb-4 md:mb-0">
                  <div className="bg-cyan-500/10 p-3 rounded-2xl mr-4 border border-cyan-500/20">
                      <Settings className="w-10 h-10 text-cyan-400" />
                  </div>
                  <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Server Config (Live Lua)</h2>
                      <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-1">Gerenciador de Script Dinâmico</p>
                  </div>
              </div>

              <div className="flex items-center space-x-3 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                  <button 
                      onClick={() => setMode('form')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center transition-all ${mode === 'form' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                      <Edit3 className="w-3 h-3 mr-2" /> Visual
                  </button>
                  <button 
                      onClick={() => setMode('raw')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center transition-all ${mode === 'raw' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                      <Code className="w-3 h-3 mr-2" /> Raw Code
                  </button>
              </div>
          </div>

          {message && (
              <div className={`mb-6 p-4 rounded-xl border flex items-center ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                  {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
                  <span className="font-bold text-sm">{message.text}</span>
              </div>
          )}

          {mode === 'form' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
                  {/* RATES */}
                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                      <h3 className="text-sm font-black text-cyan-400 uppercase tracking-widest mb-6 flex items-center">
                          <RefreshCw className="w-4 h-4 mr-2" /> Taxas do Servidor (Rates)
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-2">Experiência (EXP)</label>
                              <input type="text" value={config.expRate} onChange={e => setConfig({...config, expRate: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono focus:border-cyan-500 outline-none" />
                          </div>
                          <div>
                              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-2">Alma (SP)</label>
                              <input type="text" value={config.spRate} onChange={e => setConfig({...config, spRate: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono focus:border-cyan-500 outline-none" />
                          </div>
                          <div>
                              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-2">Drop Rate</label>
                              <input type="text" value={config.dropRate} onChange={e => setConfig({...config, dropRate: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono focus:border-cyan-500 outline-none" />
                          </div>
                          <div>
                              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-2">Moedas (Gold)</label>
                              <input type="text" value={config.moneyRate} onChange={e => setConfig({...config, moneyRate: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono focus:border-cyan-500 outline-none" />
                          </div>
                      </div>
                  </div>

                  {/* PVP & LIMITS */}
                  <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                      <h3 className="text-sm font-black text-red-400 uppercase tracking-widest mb-6 flex items-center">
                          <Settings className="w-4 h-4 mr-2" /> PvP & Limites
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-2">Nível Máximo</label>
                              <input type="text" value={config.maxLevel} onChange={e => setConfig({...config, maxLevel: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono focus:border-red-500 outline-none" />
                          </div>
                          <div>
                              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-2">PK Cooldown (s)</label>
                              <input type="text" value={config.pvpCooldown} onChange={e => setConfig({...config, pvpCooldown: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono focus:border-red-500 outline-none" />
                          </div>
                          <div>
                              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-2">PvE Protect Min</label>
                              <input type="text" value={config.pvpProtectMin} onChange={e => setConfig({...config, pvpProtectMin: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono focus:border-red-500 outline-none" />
                          </div>
                          <div>
                              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-2">PvE Protect Max</label>
                              <input type="text" value={config.pvpProtectMax} onChange={e => setConfig({...config, pvpProtectMax: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono focus:border-red-500 outline-none" />
                          </div>
                      </div>
                  </div>
              </div>
          ) : (
              <div className="relative z-10">
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-1">
                      <textarea 
                          value={rawContent}
                          onChange={e => setRawContent(e.target.value)}
                          className="w-full h-[500px] bg-slate-900 text-slate-300 font-mono text-xs p-4 rounded-lg outline-none focus:ring-1 focus:ring-purple-500 custom-scrollbar resize-none leading-relaxed"
                          spellCheck={false}
                      />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Edição direta do arquivo script.lua. Cuidado com a sintaxe para não quebrar o servidor.
                  </p>
              </div>
          )}

          <div className="flex justify-end pt-8 border-t border-slate-800 mt-8 relative z-10">
              <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center shadow-lg hover:shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {saving ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                      <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? 'Aplicando...' : 'Salvar Alterações'}
              </button>
          </div>
      </div>
    </div>
  );
};
