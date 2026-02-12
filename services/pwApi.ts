import { 
  PWRole, PWVersion, InventoryItem, ChatMessage, MapInstance, 
  ServiceData, TradeLog, DashboardStats, 
  AuditEntry, GameLogEntry, ThreatLog,
  PWFaction, MailPayload, BanHistoryEntry, SystemUser
} from '../types';

const API_URL = '/api';

/**
 * PW INTELLIGENCE - API CONNECTOR (Node.js Backend)
 * Centralizes all calls to the Node.js API
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('pw_token');
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};

const callApi = async (endpoint: string, method: string = 'GET', body: any = null) => {
  try {
      const options: RequestInit = {
          method,
          headers: getAuthHeaders(),
      };

      if (body) {
          options.body = JSON.stringify(body);
      }

      const response = await fetch(`${API_URL}${endpoint}`, options);
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('pw_token');
        // Optional: Redirect to login or throw specific error
        throw new Error('Unauthorized');
      }

      const json = await response.json();
      if (json.error) throw new Error(json.error);
      return json;
  } catch (e: any) {
      console.error(`Falha na Operação [${endpoint}]:`, e);
      throw e;
  }
};

export const PWApiService = {
  getCurrentVersion: () => '156',
  getToken: () => localStorage.getItem('pw_token'),

  // --- AUTHENTICATION ---
  login: async (username: string, password: string) => {
    const data = await callApi('/auth/login', 'POST', { username, password });
    if (data.token) {
      localStorage.setItem('pw_token', data.token);
      localStorage.setItem('pw_user', JSON.stringify(data.user));
      return true;
    }
    return false;
  },
  logout: () => {
    localStorage.removeItem('pw_token');
    localStorage.removeItem('pw_user');
  },

  // --- CONTAS E PERSONAGENS ---
  getAllRoles: async (): Promise<PWRole[]> => {
      // Maps to Node.js /characters/search
      try {
        const data = await callApi('/characters/search?limit=100');
        // Adapts Node.js return to PWRole type
        return data.map((r: any) => ({
            base: { id: r.id, name: r.name, cls: r.cls, gender: r.gender, create_time: 0 },
            status: { level: r.level, hp: 0, mp: 0 },
            pocket: { money: 0, inv: [] },
            user_login: r.login || `UID:${r.userid}`,
            isBanned: false
        }));
      } catch (e) {
        return [];
      }
  },
  
  getOnlineRolesFull: async (): Promise<PWRole[]> => {
      try {
        const data = await callApi('/status/realtime');
        // Converts the simplified list from PHP into the structure expected by the frontend
        return data.players.list.map((p: any) => ({
            base: { id: p.id, name: p.name, cls: 0, gender: 0, create_time: 0 }, // Minimal info
            status: { level: 0, hp: 0, mp: 0 },
            pocket: { money: 0, inv: [] },
            user_login: `UID:${p.uid}`,
            isBanned: false
        }));
      } catch (e) {
          return [];
      }
  },

  getRoleDetail: async (id: number) => await callApi(`/characters/${id}`),

  saveRole: async (id: number, data: any): Promise<boolean> => {
    // TODO: Implement save in Node.js
    console.warn('Save not implemented in backend yet');
    return false;
  },
  deleteRole: async (id: number): Promise<boolean> => false, // TODO
  toggleBan: async (id: number): Promise<boolean> => false, // TODO
  createAccount: async (login: string, pass: string, email: string): Promise<boolean> => {
      try {
          const data = await callApi('/auth/create', 'POST', { login, password: pass, email });
          return data.success;
      } catch (e) {
          console.error("Create account error", e);
          return false;
      }
  },
  
  getBanHistory: async (): Promise<BanHistoryEntry[]> => [], 

  // --- INFRAESTRUTURA E SERVIÇOS ---
  getServerServices: async (): Promise<ServiceData[]> => {
      try {
        const data = await callApi('/status/realtime');
        return data.services.details.map((s: any, index: number) => ({
            id: `srv-${index}`,
            name: s.name,
            status: s.status === '[ONLINE]' ? 'online' : 'offline',
            uptime: '---',
            cpu: parseFloat(s.cpu.replace('%', '')),
            memory: parseFloat(s.ram.replace('%', '')),
            pid: 0 // PID is not parsed in detail yet
        }));
      } catch (e) {
          return [];
      }
  },
  getMapInstances: async (): Promise<MapInstance[]> => {
      try {
        const data = await callApi('/status/realtime');
        return data.maps.details.map((m: any) => ({
            id: m.id,
            name: m.name,
            status: 'online',
            players: 0, // Not available in simple view
            cpu: parseFloat(m.cpu.replace('%', '')),
            memory: parseFloat(m.ram.replace('%', ''))
        }));
      } catch (e) {
          return [];
      }
  },
  toggleService: async (id: string, action: string) => {},
  toggleInstance: async (id: string, action: string) => {},

  // --- COMUNICAÇÃO E LOGS ---
  getChat: async (): Promise<ChatMessage[]> => {
      try {
        const data = await callApi('/logs/chat');
        // Map backend Log format to Frontend ChatMessage format
        return data.map((log: any) => ({
            id: Math.random(),
            message: log.msg || log.raw || '', // Map 'msg'/'raw' to 'message'
            channel: log.channel ? log.channel.toLowerCase() : 'world',
            roleName: log.srcName || 'System', // Map 'srcName' to 'roleName'
            roleId: log.srcId || 0,
            timestamp: log.date ? log.date.split(' ')[1] : new Date().toLocaleTimeString() // Map 'date' to 'timestamp'
        }));
      } catch (e) {
          console.error("Chat error", e);
          return [];
      }
  },
  sendSystemMessage: async (msg: string) => {
      try {
          await callApi('/logs/chat/send', 'POST', { msg, channel: 9 });
      } catch (e) {
          console.error("Send chat error", e);
      }
  },
  sendMail: async (payload: MailPayload) => {},
  getTradeLogs: async (): Promise<TradeLog[]> => [],
  getGameLogs: async (page: number, filters: any) => ({ logs: [], total: 0 }),
  readLogFile: async (file: string): Promise<string[]> => [],

  // --- CLÃS E DIPLOMACIA ---
  getAllFactions: async (): Promise<PWFaction[]> => {
      try {
          return await callApi('/server/factions');
      } catch (e) {
          return [];
      }
  },
  
  getFactionDetail: async (fid: number) => null, // TODO: Implement detail if needed

  saveFaction: async (faction: PWFaction): Promise<boolean> => false,
  removeFactionMember: async (fid: number, roleId: number) => false,
  addFactionMember: async (fid: number, roleId: number) => false,
  initTerritoryWar: async (mapId: number, attackerId: number, defenderId: number) => false,
  createFaction: async (name: string, masterId: number): Promise<boolean> => false,

  toggleNationWar: async (enable: boolean): Promise<boolean> => {
      try {
          const res = await callApi('/server/nw/toggle', 'POST', { enable });
          return res.success;
      } catch (e) {
          console.error("NW Toggle error", e);
          return false;
      }
  },

  getTerritories: async (): Promise<PWTerritory[]> => {
      try {
          return await callApi('/server/territories');
      } catch (e) {
          console.error("Territories error", e);
          return [];
      }
  },
      try {
        const data = await callApi('/status/realtime');
        return {
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            cpu: parseFloat(data.system.load_average.split(',')[0]) * 10, // Rough estimate from load avg
            ram: parseFloat(data.system.memory.used.replace('MB', '')) / 1024,
            ram_total: parseFloat(data.system.memory.total.replace('MB', '')) / 1024,
            swap: 0,
            swap_total: 0,
            players: data.players.online_count,
            net_in: 0,
            net_out: 0
        };
      } catch (e) {
          return {
              time: '00:00', cpu: 0, ram: 0, ram_total: 16, swap: 0, swap_total: 0, players: 0, net_in: 0, net_out: 0
          };
      }
  },
  getTerritories: async () => [], // TODO
  
  getSecurityThreats: async (): Promise<ThreatLog[]> => [],
  getAuditLogs: async (): Promise<AuditEntry[]> => [],
  
  // --- CONFIGURAÇÕES E USUÁRIOS DO SISTEMA ---
  getSystemUsers: async (): Promise<SystemUser[]> => [],
  deleteSystemUser: async (id: number): Promise<boolean> => false,
  saveSystemUser: async (user: SystemUser): Promise<boolean> => false,
  saveServerSettings: async (settings: any): Promise<boolean> => false,

  // --- RAW EDITOR (JSON) ---
  getRoleXml: async (id: number) => null, // TODO
  saveRoleXml: async (id: number, xml: string) => false, // TODO

  // --- LUA CONFIG MANAGER ---
  getLuaConfig: async (): Promise<string> => '', // TODO
  saveLuaConfig: async (content: string): Promise<boolean> => false
};
