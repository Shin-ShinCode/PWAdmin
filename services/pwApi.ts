
import { 
  PWRole, PWVersion, InventoryItem, ChatMessage, MapInstance, 
  ServiceData, TradeLog, DashboardStats, 
  AuditEntry, GameLogEntry, ThreatLog,
  PWFaction, MailPayload, BanHistoryEntry, SystemUser
} from '../types';

const API_TOKEN = '123456';
const API_URL = '/apipw/index.php';

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
  getAllRoles: async (): Promise<PWRole[]> => await callApi('lista-geral-chars') || [],
  getOnlineRolesFull: async (): Promise<PWRole[]> => await callApi('online') || [],
  saveRole: async (id: number, data: any): Promise<boolean> => await callApi('salvar-personagem', { userid: id, data: JSON.stringify(data) }),
  deleteRole: async (id: number): Promise<boolean> => await callApi('excluir-personagem', { userid: id }),
  toggleBan: async (id: number): Promise<boolean> => await callApi('banir-desbanir', { userid: id }),
  createAccount: async (login: string, pass: string, email: string): Promise<boolean> => await callApi('criar-conta', { login, pass, email }),
  
  // Fix: Added missing getBanHistory method
  getBanHistory: async (): Promise<BanHistoryEntry[]> => await callApi('ban-history') || [],

  // --- INFRAESTRUTURA E SERVIÇOS (LINUX PIDs) ---
  getServerServices: async (): Promise<ServiceData[]> => await callApi('server-services') || [],
  getMapInstances: async (): Promise<MapInstance[]> => await callApi('map-instances') || [],
  toggleService: async (id: string, action: string) => await callApi('controle-servico', { id, action }),
  toggleInstance: async (id: string, action: string) => await callApi('controle-instancia', { id, action }),

  // --- COMUNICAÇÃO E LOGS ---
  getChat: async (): Promise<ChatMessage[]> => await callApi('chat-logs') || [],
  sendSystemMessage: async (msg: string) => await callApi('broadcast', { text: msg }),
  sendMail: async (payload: MailPayload) => await callApi('enviar-item', payload),
  getTradeLogs: async (): Promise<TradeLog[]> => await callApi('logs-trocas') || [],
  getGameLogs: async (page: number, filters: any) => await callApi('log-forense', { page, ...filters }) || { logs: [], total: 0 },
  
  // Fix: Added missing readLogFile method
  readLogFile: async (file: string): Promise<string[]> => await callApi('read-log', { file }) || [],

  // --- CLÃS E DIPLOMACIA ---
  getAllFactions: async (): Promise<PWFaction[]> => await callApi('lista-clãs') || [],
  saveFaction: async (faction: PWFaction): Promise<boolean> => await callApi('salvar-clã', { data: JSON.stringify(faction) }),
  removeFactionMember: async (fid: number, roleId: number) => await callApi('expulsar-membro', { fid, roleId }),
  addFactionMember: async (fid: number, roleId: number) => await callApi('adicionar-membro', { fid, roleId }),
  
  // Fix: Added missing initTerritoryWar method
  initTerritoryWar: async (mapId: number, attackerId: number, defenderId: number) => await callApi('iniciar-tw', { mapId, attackerId, defenderId }),
  
  // Fix: Added missing createFaction method
  createFaction: async (name: string, masterId: number): Promise<boolean> => await callApi('criar-clã', { name, masterId }),

  // --- SEGURANÇA E DASHBOARD ---
  getDashboardStats: async (): Promise<DashboardStats> => await callApi('stats-servidor'),
  getSecurityThreats: async (): Promise<ThreatLog[]> => await callApi('threats') || [],
  getAuditLogs: async (): Promise<AuditEntry[]> => await callApi('audit') || [],
  
  // --- CONFIGURAÇÕES E USUÁRIOS DO SISTEMA ---
  // Fix: Added missing getSystemUsers method
  getSystemUsers: async (): Promise<SystemUser[]> => await callApi('lista-usuarios') || [],
  
  // Fix: Added missing deleteSystemUser method
  deleteSystemUser: async (id: number): Promise<boolean> => await callApi('excluir-usuario', { id }),
  
  // Fix: Added missing saveSystemUser method
  saveSystemUser: async (user: SystemUser): Promise<boolean> => await callApi('salvar-usuario', { data: JSON.stringify(user) }),
  
  // Fix: Added missing saveServerSettings method
  saveServerSettings: async (settings: any): Promise<boolean> => await callApi('salvar-configuracoes', { settings: JSON.stringify(settings) }),

  // --- RAW EDITOR ---
  getRoleXml: async (id: number) => await callApi('get-xml', { userid: id }),
  saveRoleXml: async (id: number, xml: string) => await callApi('save-xml', { userid: id, xml })
};
