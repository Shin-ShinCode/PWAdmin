
export type Language = 'pt' | 'en';

export type PWVersion = '136' | '144' | '151' | '156';

export interface FieldDefinition {
  key: string;
  type: 'int' | 'byte' | 'short' | 'lint' | 'cuint' | 'float' | 'octets' | 'name';
  label: string;
  readonly?: boolean;
}

export interface VersionSchema {
  version: PWVersion;
  role: {
    base: FieldDefinition[];
    status: FieldDefinition[];
    pocket: FieldDefinition[];
    equipment: FieldDefinition[];
    storehouse: FieldDefinition[];
    task: FieldDefinition[];
  };
}

export interface ChatMessage {
  timestamp: string;
  channel: string;
  roleId: number;
  roleName: string;
  message: string;
}

export interface InventoryItem {
  id: number;
  pos: number;
  count: number;
  max_count: number;
  data: string;
  proctype: number;
  expire_date: number;
  name: string;
  icon?: string;
  guid1?: number;
  guid2?: number;
  mask?: number;
}

export interface PWRole {
  base: {
    id: number;
    name: string;
    race: number;
    cls: number;
    gender: number;
    [key: string]: any;
  };
  status: {
    level: number;
    hp: number;
    mp: number;
    [key: string]: any;
  };
  pocket: {
    money: number;
    icapacity: number;
    inv: InventoryItem[];
  };
  equipment: {
    eqp: InventoryItem[];
  };
  storehouse: {
    money: number;
    capacity: number;
    store: InventoryItem[];
    dress: InventoryItem[];
    material: InventoryItem[];
    generalcard: InventoryItem[];
    glyph: InventoryItem[];
    treasure: InventoryItem[];
    transmutation: InventoryItem[];
  };
  task: {
    task_data: string;
    task_complete: string;
    task_finishtime: string;
    task_inventory: InventoryItem[];
  };
  user_login: string;
  user_email: string;
  isBanned: boolean;
}

export interface AuditEntry {
  id: string;
  adminId: string;
  timestamp: string;
  action: string;
  targetId: string;
  originIp: string;
  details: string;
}

export interface BanHistoryEntry {
  id: number;
  targetId: number;
  targetName: string;
  reason: string;
  adminId: string;
  date: string;
  duration: string;
  active: boolean;
}

export interface GameLogEntry {
  id: string;
  timestamp: string;
  type: string; // Chat, Trade, Shop, Mail, GM, System, Drop, PickUp
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  sourceIp?: string;
  details?: Record<string, any>;
}

export interface ThreatLog {
  id: string;
  timestamp: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  sourceIp: string;
  targetService: string;
  payload: string;
  status: 'Mitigated' | 'Detected' | 'Blocked';
}

export interface MapInstance {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'starting' | 'stopping';
  pid?: number;
  cpu?: number;
  mem?: number;
}

export interface SystemUser {
  id: number;
  username: string;
  email: string;
  group_id: number;
  group_name: string;
  created_at: string;
  permissions: Record<string, boolean>;
}

export interface ServiceData {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'starting' | 'stopping';
  pid?: number;
  cpu?: number;
  mem?: number;
}

export interface TradeLog {
  id: number;
  timestamp: string;
  giver_id: number;
  giver_name: string;
  receiver_id: number;
  receiver_name: string;
  item_id: number;
  count: number;
  money: number;
}

export interface DashboardStats {
  time: string;
  cpu: number;
  ram: number;
  ram_total: number;
  swap: number;
  swap_total: number;
  players: number;
  net_in: number;
  net_out: number;
}

export interface ServerSettings {
  dbHost: string;
  dbName: string;
  dbUser: string;
  sshIp: string;
  sshPort: number;
}

export interface Translation {
  [key: string]: {
    pt: string;
    en: string;
  };
}

export interface FactionMember {
  role_id: number;
  name: string;
  rank: number;
  level: number;
  cls: number;
}

export interface PWFaction {
  fid: number;
  name: string;
  level: number;
  master: number;
  master_name: string;
  members: FactionMember[];
  alliances: number[];
  hostiles: number[];
}

export interface PWTerritory {
  id: number;
  level: number;
  owner: number;
  color: number;
  battle_time: number;
  maxbonus: number;
  challenger: number;
  deposit?: number;
  status?: number;
}

// MailPayload defines the parameters required for sending in-game messages through the API.
export interface MailPayload {
  receiverId: number;
  subject: string;
  message: string;
  itemId: number;
  itemCount: number;
  money: number;
  proctype: number;
  mask: number;
  expire_date: number;
  guid1: number;
  guid2: number;
  itemOctets: string;
}

export const TRANSLATIONS: Translation = {
  dashboard: { pt: 'Painel', en: 'Dashboard' },
  accounts: { pt: 'Contas & Personagens', en: 'Accounts & Characters' },
  mail: { pt: 'Correio', en: 'Mail' },
  server: { pt: 'Servidor', en: 'Server' },
  settings: { pt: 'Configurações', en: 'Settings' },
  factions: { pt: 'Clãs (Factions)', en: 'Factions (Guilds)' },
  online_players: { pt: 'Jogadores Online', en: 'Online Players' },
  logs: { pt: 'Central de Logs', en: 'Log Center' },
  security_threats: { pt: 'Ameaças de Segurança', en: 'Security Threats' },
  audit_trail: { pt: 'Trilha de Auditoria', en: 'Audit Trail' },
  system_manager_subtitle: { pt: 'Gerenciador de Sistemas Perfect World', en: 'Perfect World System Manager' },
  administrator: { pt: 'Administrador', en: 'Administrator' },
  root_access: { pt: 'Acesso Root', en: 'Root Access' },
  logout: { pt: 'Sair', en: 'Logout' },
  invalid_credentials: { pt: 'Credenciais Inválidas', en: 'Invalid Credentials' },
  login_title: { pt: 'Acesso Restrito', en: 'Restricted Access' },
  login_button: { pt: 'Entrar no Sistema', en: 'Login' },
  login: { pt: 'Usuário', en: 'Username' },
  password: { pt: 'Senha', en: 'Password' },
  cpu: { pt: 'Uso de CPU', en: 'CPU Usage' },
  memory_ram_swap: { pt: 'Memória & SWAP', en: 'Memory & SWAP' },
  network_traffic: { pt: 'Tráfego de Rede', en: 'Network Traffic' },
};

export const PW_DATA = {
  maps: {
    gs01: { pt: 'Mundo (World)', en: 'World' },
    is01: { pt: 'Cidade do Gelo (Frost)', en: 'Frostcovered City' },
  } as Record<string, {pt: string, en: string}>,
  classes: [
    { id: 0, pt: 'Guerreiro', en: 'Blademaster' },
    { id: 1, pt: 'Mago', en: 'Wizard' },
    { id: 2, pt: 'Espiritualista', en: 'Psychic' },
    { id: 3, pt: 'Feiticeira', en: 'Venomancer' },
    { id: 4, pt: 'Bárbaro', en: 'Barbarian' },
    { id: 5, pt: 'Mercenário', en: 'Assassin' },
    { id: 6, pt: 'Arqueiro', en: 'Archer' },
    { id: 7, pt: 'Sacerdote', en: 'Cleric' },
    { id: 8, pt: 'Arcano', en: 'Seeker' },
    { id: 9, pt: 'Místico', en: 'Mystic' },
    { id: 10, pt: 'Retalhador', en: 'Duskblade' },
    { id: 11, pt: 'Tormentador', en: 'Stormbringer' },
  ],
  races: [
    { id: 0, pt: 'Humano', en: 'Human' },
    { id: 1, pt: 'Selvagem', en: 'Untamed' },
    { id: 2, pt: 'Alado', en: 'Winged Elf' },
    { id: 3, pt: 'Abissal', en: 'Tideborn' },
    { id: 4, pt: 'Guardião', en: 'Earthguard' },
    { id: 5, pt: 'Sombrio', en: 'Nightshade' },
  ]
};

export const PW_CULTIVATIONS = [
    { id: 0, pt: 'Leal', en: 'Loyal' },
    { id: 20, pt: 'Imortal (God)', en: 'God 1' },
    { id: 21, pt: 'Demoníaco (Evil)', en: 'Evil 1' },
    { id: 22, pt: 'Celestial (God 3)', en: 'God 3' },
    { id: 32, pt: 'Averno (Evil 3)', en: 'Evil 3' },
];
