import { 
  PWRole, PWVersion, InventoryItem, ChatMessage, MapInstance, 
  ServiceData, TradeLog, DashboardStats, 
  AuditEntry, GameLogEntry, ThreatLog,
  PWFaction, MailPayload, BanHistoryEntry, SystemUser
} from '../types';

const API_URL = 'http://localhost:3000/api';

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
      // TODO: Implement online check in Node.js
      return [];
  },

  getRoleDetail: async (id: number) => await callApi(`/characters/${id}`),

  saveRole: async (id: number, data: any): Promise<boolean> => {
    // TODO: Implement save in Node.js
    console.warn('Save not implemented in backend yet');
    return false;
  },
  deleteRole: async (id: number): Promise<boolean> => false, // TODO
  toggleBan: async (id: number): Promise<boolean> => false, // TODO
  createAccount: async (login: string, pass: string, email: string): Promise<boolean> => false, // TODO
  
  getBanHistory: async (): Promise<BanHistoryEntry[]> => [], 

  // --- INFRAESTRUTURA E SERVIÇOS ---
  getServerServices: async (): Promise<ServiceData[]> => [], // TODO
  getMapInstances: async (): Promise<MapInstance[]> => [], // TODO
  toggleService: async (id: string, action: string) => {},
  toggleInstance: async (id: string, action: string) => {},

  // --- COMUNICAÇÃO E LOGS ---
  getChat: async (): Promise<ChatMessage[]> => [], // TODO
  sendSystemMessage: async (msg: string) => {},
  sendMail: async (payload: MailPayload) => {},
  getTradeLogs: async (): Promise<TradeLog[]> => [],
  getGameLogs: async (page: number, filters: any) => ({ logs: [], total: 0 }),
  readLogFile: async (file: string): Promise<string[]> => [],

  // --- CLÃS E DIPLOMACIA ---
  getAllFactions: async (): Promise<PWFaction[]> => [], // TODO
  getFactionDetail: async (fid: number) => null, // TODO
  
  saveFaction: async (faction: PWFaction): Promise<boolean> => false,
  removeFactionMember: async (fid: number, roleId: number) => false,
  addFactionMember: async (fid: number, roleId: number) => false,
  initTerritoryWar: async (mapId: number, attackerId: number, defenderId: number) => false,
  createFaction: async (name: string, masterId: number): Promise<boolean> => false,

  // --- SEGURANÇA E DASHBOARD ---
  getDashboardStats: async (): Promise<DashboardStats> => ({
      time: '00:00', cpu: 0, ram: 0, ram_total: 16, swap: 0, swap_total: 0, players: 0, net_in: 0, net_out: 0
  }), // TODO
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
