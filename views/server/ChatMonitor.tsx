
import React, { useEffect, useState, useRef } from 'react';
import { MessageSquare, RefreshCw, Send, StopCircle, Play, Filter, Search as SearchIcon, X, User } from 'lucide-react';
import { ChatMessage, Language, TRANSLATIONS } from '../../types';
import { PWApiService } from '../../services/pwApi';

interface ChatMonitorProps {
  lang: Language;
}

const CHANNELS = [
  { id: 'world', label: 'World', color: 'text-yellow-400' },
  { id: 'party', label: 'Party', color: 'text-green-400' },
  { id: 'faction', label: 'Guild', color: 'text-blue-400' },
  { id: 'whisper', label: 'Whisper', color: 'text-purple-400' },
  { id: 'system', label: 'System', color: 'text-red-400' },
];

const ChatMonitor: React.FC<ChatMonitorProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || key;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(CHANNELS.map(c => c.id)));
  const [searchTerm, setSearchTerm] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchChat = async () => {
    const data = await PWApiService.getChat();
    setMessages(data);
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(() => {
      if (autoRefresh) fetchChat();
    }, 4000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeFilters, searchTerm]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMsg) return;
    await PWApiService.sendSystemMessage(broadcastMsg);
    setBroadcastMsg('');
    fetchChat();
  };

  const toggleFilter = (channel: string) => {
      const next = new Set(activeFilters);
      if (next.has(channel)) next.delete(channel);
      else next.add(channel);
      setActiveFilters(next);
  };

  const getChannelStyle = (channel: string) => {
    switch (channel) {
      case 'world': return 'text-yellow-400 font-bold';
      case 'party': return 'text-green-400';
      case 'faction': return 'text-blue-400';
      case 'whisper': return 'text-purple-400';
      case 'system': return 'text-red-400 font-bold';
      default: return 'text-white';
    }
  };

  // BUSCA INTELIGENTE: FILTRA POR NOME OU CONTEÚDO DA MENSAGEM
  const filteredMessages = messages.filter(m => {
      const s = searchTerm.toLowerCase();
      const matchesChannel = activeFilters.has(m.channel);
      const matchesSearch = m.roleName.toLowerCase().includes(s) || m.message.toLowerCase().includes(s);
      return matchesChannel && matchesSearch;
  });

  return (
    <div className="glass-panel p-6 rounded-xl border border-slate-700 h-[650px] flex flex-col">
      <div className="flex flex-col space-y-4 mb-4 border-b border-slate-700 pb-4">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-cyan-400" />
            {t('chat_monitor')}
            </h3>
            <div className="flex items-center space-x-3">
            <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${autoRefresh ? 'bg-green-600/20 text-green-400 border border-green-600/50' : 'bg-slate-800 text-slate-400 border border-slate-600'}`}
            >
                {autoRefresh ? <StopCircle className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                {autoRefresh ? t('live') : t('paused')}
            </button>
            <button onClick={fetchChat} className="p-2 hover:bg-slate-800 rounded-lg text-cyan-400">
                <RefreshCw className="w-5 h-5" />
            </button>
            </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
                {CHANNELS.map(c => (
                    <button
                        key={c.id}
                        onClick={() => toggleFilter(c.id)}
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${
                            activeFilters.has(c.id) 
                            ? `${c.color} bg-slate-800 border border-slate-700` 
                            : 'text-slate-600 grayscale opacity-50'
                        }`}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            <div className="relative flex-1 min-w-[200px]">
                <SearchIcon className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
                <input 
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="Filtrar por nome ou mensagem..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-8 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                />
                {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 bg-black/40 rounded-lg p-4 font-mono text-sm border border-slate-800 mb-4 custom-scrollbar">
        {filteredMessages.length > 0 ? filteredMessages.map((msg, idx) => (
          <div key={idx} className="hover:bg-white/5 p-1 rounded transition-colors break-all border-l-2 border-transparent hover:border-cyan-500/30 group">
            <span className="text-slate-500 text-[10px] mr-2">[{msg.timestamp}]</span>
            <span className={`uppercase text-[9px] border border-slate-800 px-1 rounded mr-2 ${getChannelStyle(msg.channel)}`}>
              {msg.channel}
            </span>
            <button className="text-cyan-300 font-bold hover:underline mr-1 flex items-center inline-flex" title={`ID: ${msg.roleId}`}>
              <User className="w-3 h-3 mr-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              {msg.roleName}:
            </button>
            <span className="text-slate-300">{msg.message}</span>
          </div>
        )) : (
            <div className="h-full flex flex-center items-center justify-center text-slate-600 italic">
                Nenhum resultado encontrado para "{searchTerm}"
            </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleBroadcast} className="flex gap-2">
        <input 
          type="text" 
          value={broadcastMsg}
          onChange={(e) => setBroadcastMsg(e.target.value)}
          placeholder={t('broadcast_placeholder')}
          className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-red-500 outline-none font-bold"
        />
        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center font-black uppercase tracking-tighter">
          <Send className="w-4 h-4 mr-2" /> {t('send')}
        </button>
      </form>
    </div>
  );
};

export default ChatMonitor;
