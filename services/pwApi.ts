
import { 
  PWRole, PWVersion, InventoryItem, ChatMessage, MapInstance, 
  ServiceData, TradeLog, DashboardStats, 
  AuditEntry, GameLogEntry, ThreatLog,
  PWFaction, MailPayload, BanHistoryEntry, SystemUser
} from '../types';

const API_TOKEN = '123456';
const API_URL = 'http://95.111.235.239/apipw/index.php';

/**
 * PW INTELLIGENCE - API CONNECTOR
 * Centraliza todas as chamadas ao servidor PHP / Linux
 */
const callApi = async (func: string, params: Record<string, any> = {}) => {
    const body = new FormData();
    body.append('token', API_TOKEN);
    body.append('function', func);
    Object.entries(params).forEach(([k, v]) => body.append(k, String(v)));

    try {
        const response = await fetch(API_URL, { method: 'POST', body });
        const json = await response.json();
        if (json.status === 0 && json.error) throw new Error(json.error);
        return json.retorno;
    } catch (e) {
        console.error(`Falha na Operação [${func}]:`, e);
        return null;
    }
};

export const PWApiService = {
  getCurrentVersion: () => '156',
  getToken: () => API_TOKEN,

  // --- CONTAS E PERSONAGENS (REALTIME DB) ---
  getAllRoles: async (): Promise<PWRole[]> => {
      // Mapeia para ultimos-personagens pois listar TODOS é pesado
      const data = await callApi('ultimos-personagens', { limit: 100 });
      // Adapta o retorno do PHP para o tipo PWRole
      return data ? data.map((r: any) => ({
          base: { id: r.id, name: r.name, cls: r.cls, gender: r.gender, create_time: 0 },
          status: { level: r.level, hp: 0, mp: 0 },
          pocket: { money: 0, inv: [] },
          user_login: r.login || 'Unknown',
          isBanned: false
      })) : [];
  },
  
  getOnlineRolesFull: async (): Promise<PWRole[]> => {
      const data = await callApi('online');
      // O endpoint 'online' retorna lista simplificada.
      // Idealmente, iterariamos para pegar detalhes, mas para performance,
      // retornamos o básico mapeado para PWRole
      return data ? data.map((r: any) => ({
          base: { id: r.roleid, name: r.name, cls: 0, gender: 0, create_time: 0 }, // cls não vem no online list padrão as vezes
          status: { level: 0, hp: 0, mp: 0, worldtag: r.map_id || 1, posx: 0, posz: 0 },
          user_login: `UID:${r.userid}`,
          isBanned: false
      })) : [];
  },

  getRoleDetail: async (id: number) => await callApi('detalhes-personagem', { roleid: id }),

  saveRole: async (id: number, data: any): Promise<boolean> => await callApi('salvar-personagem', { userid: id, data: JSON.stringify(data) }),
  deleteRole: async (id: number): Promise<boolean> => await callApi('excluir-personagem', { userid: id }),
  toggleBan: async (id: number): Promise<boolean> => await callApi('banir-desbanir', { userid: id }),
  createAccount: async (login: string, pass: string, email: string): Promise<boolean> => await callApi('criar-conta', { login, pass, email }),
  
  getBanHistory: async (): Promise<BanHistoryEntry[]> => [], // Não implementado

  // --- INFRAESTRUTURA E SERVIÇOS (LINUX PIDs) ---
  getServerServices: async (): Promise<ServiceData[]> => await callApi('server-services') || [],
  getMapInstances: async (): Promise<MapInstance[]> => await callApi('map-instances') || [],
  toggleService: async (id: string, action: string) => console.warn('Toggle Service not impl on PHP'),
  toggleInstance: async (id: string, action: string) => console.warn('Toggle Instance not impl on PHP'),

  // --- COMUNICAÇÃO E LOGS ---
  getChat: async (): Promise<ChatMessage[]> => await callApi('chat-logs') || [],
  sendSystemMessage: async (msg: string) => await callApi('broadcast', { text: msg }),
  sendMail: async (payload: MailPayload) => await callApi('enviar-item', { 
      roleid: payload.receiverId, 
      title: payload.title, 
      context: payload.content, 
      item_id: payload.itemId, 
      count: payload.count, 
      money: payload.money 
  }),
  getTradeLogs: async (): Promise<TradeLog[]> => [],
  getGameLogs: async (page: number, filters: any) => ({ logs: [], total: 0 }),
  readLogFile: async (file: string): Promise<string[]> => [],

  // --- CLÃS E DIPLOMACIA ---
  getAllFactions: async (): Promise<PWFaction[]> => await callApi('lista-clãs') || [],
  getFactionDetail: async (fid: number) => await callApi('detalhes-faccao', { fid }),
  
  saveFaction: async (faction: PWFaction): Promise<boolean> => false,
  removeFactionMember: async (fid: number, roleId: number) => false,
  addFactionMember: async (fid: number, roleId: number) => false,
  initTerritoryWar: async (mapId: number, attackerId: number, defenderId: number) => false,
  createFaction: async (name: string, masterId: number): Promise<boolean> => false,

  // --- SEGURANÇA E DASHBOARD ---
  getDashboardStats: async (): Promise<DashboardStats> => await callApi('stats-servidor'),
  getTerritories: async () => await callApi('territorios') || [],
  
  getSecurityThreats: async (): Promise<ThreatLog[]> => [],
  getAuditLogs: async (): Promise<AuditEntry[]> => [],
  
  // --- CONFIGURAÇÕES E USUÁRIOS DO SISTEMA ---
  getSystemUsers: async (): Promise<SystemUser[]> => [],
  deleteSystemUser: async (id: number): Promise<boolean> => false,
  saveSystemUser: async (user: SystemUser): Promise<boolean> => false,
  saveServerSettings: async (settings: any): Promise<boolean> => false,

  // --- RAW EDITOR ---
  getRoleXml: async (id: number) => await callApi('get-xml', { userid: id }),
  saveRoleXml: async (id: number, xml: string) => await callApi('save-xml', { userid: id, xml }),

  // --- LUA CONFIG MANAGER ---
  getLuaConfig: async (): Promise<string> => await callApi('get-lua-config'),
  saveLuaConfig: async (content: string): Promise<boolean> => await callApi('save-lua-config', { content })
};
