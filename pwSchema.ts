import { PWVersion, VersionSchema, FieldDefinition } from './types';

// --- BASE (PW156) - Translated & Structured ---
const BASE_156: FieldDefinition[] = [
  { key: 'version', type: 'byte', label: 'Versão Estrutura (Byte)' },
  { key: 'id', type: 'int', label: 'ID do Personagem', readonly: true },
  { key: 'name', type: 'name', label: 'Nome' },
  { key: 'race', type: 'int', label: 'Raça (ID)' },
  { key: 'cls', type: 'int', label: 'Classe (ID)' },
  { key: 'gender', type: 'byte', label: 'Gênero (0=M, 1=F)' },
  { key: 'custom_data', type: 'octets', label: 'Dados da Face (Custom Data)' },
  { key: 'config_data', type: 'octets', label: 'Configurações (UI)' },
  { key: 'custom_stamp', type: 'int', label: 'Custom Stamp' },
  { key: 'status', type: 'byte', label: 'Status da Conta' },
  { key: 'delete_time', type: 'int', label: 'Tempo Deleção' },
  { key: 'create_time', type: 'int', label: 'Data Criação (Timestamp)' },
  { key: 'lastlogin_time', type: 'int', label: 'Último Login' },
  { key: 'forbidcount', type: 'cuint', label: 'Contagem Banimentos' },
  { key: 'help_states', type: 'octets', label: 'Estados de Ajuda' },
  { key: 'spouse', type: 'int', label: 'ID Cônjuge' },
  { key: 'userid', type: 'int', label: 'ID da Conta (User ID)' },
  { key: 'cross_data', type: 'octets', label: 'Dados Cross Server' },
  { key: 'reserved2', type: 'byte', label: 'Reservado 2' },
  { key: 'reserved3', type: 'byte', label: 'Reservado 3' },
  { key: 'reserved4', type: 'byte', label: 'Reservado 4' },
];

// --- STATUS (PW156) - Translated & Structured ---
const STATUS_156: FieldDefinition[] = [
  { key: 'version', type: 'byte', label: 'Versão Status' },
  { key: 'level', type: 'int', label: 'Nível' },
  { key: 'level2', type: 'int', label: 'Cultivo (Level2)' },
  { key: 'exp', type: 'int', label: 'Experiência (EXP)' },
  { key: 'sp', type: 'int', label: 'Alma (SP)' },
  { key: 'pp', type: 'int', label: 'Pontos Atributo (PP)' },
  { key: 'hp', type: 'int', label: 'HP Atual' },
  { key: 'mp', type: 'int', label: 'MP Atual' },
  { key: 'posx', type: 'float', label: 'Posição X' },
  { key: 'posy', type: 'float', label: 'Posição Y' },
  { key: 'posz', type: 'float', label: 'Posição Z' },
  { key: 'worldtag', type: 'int', label: 'ID Mapa (WorldTag)' },
  { key: 'invader_state', type: 'int', label: 'Estado PK' },
  { key: 'invader_time', type: 'int', label: 'Tempo PK' },
  { key: 'pariah_time', type: 'int', label: 'Tempo Name Pink' },
  { key: 'reputation', type: 'int', label: 'Fama' },
  { key: 'custom_status', type: 'octets', label: 'Custom Status' },
  { key: 'filter_data', type: 'octets', label: 'Filter Data' },
  { key: 'charactermode', type: 'octets', label: 'Modo Personagem' },
  { key: 'instancekeylist', type: 'octets', label: 'Chaves de Instância' },
  { key: 'dbltime_expire', type: 'int', label: 'Expira Double Exp' },
  { key: 'dbltime_mode', type: 'int', label: 'Modo Double Exp' },
  { key: 'dbltime_begin', type: 'int', label: 'Inicio Double Exp' },
  { key: 'dbltime_used', type: 'int', label: 'Uso Double Exp' },
  { key: 'dbltime_max', type: 'int', label: 'Max Double Exp' },
  { key: 'time_used', type: 'int', label: 'Tempo Jogado' },
  { key: 'dbltime_data', type: 'octets', label: 'Dados Double Exp' },
  { key: 'storesize', type: 'short', label: 'Tamanho Banco' },
  { key: 'petcorral', type: 'octets', label: 'Jaula Pets' },
  { key: 'property', type: 'octets', label: 'Propriedades' },
  { key: 'var_data', type: 'octets', label: 'Var Data' },
  { key: 'skills', type: 'octets', label: 'Habilidades (Skills)' },
  { key: 'storehousepasswd', type: 'octets', label: 'Senha do Banco (Hash)' },
  { key: 'waypointlist', type: 'octets', label: 'Pontos de Teleporte' },
  { key: 'coolingtime', type: 'octets', label: 'Cooling Time' },
  { key: 'npc_relation', type: 'octets', label: 'Relação NPC' },
  { key: 'multi_exp_ctrl', type: 'octets', label: 'Controle Multi Exp' },
  { key: 'storage_task', type: 'octets', label: 'Storage Task' },
  { key: 'faction_contrib', type: 'octets', label: 'Contribuição Clã' },
  { key: 'force_data', type: 'octets', label: 'Dados Facção (Morai)' },
  { key: 'online_award', type: 'octets', label: 'Prêmio Online' },
  { key: 'profit_time_data', type: 'octets', label: 'Profit Time' },
  { key: 'country_data', type: 'octets', label: 'Dados Nação' },
  { key: 'king_data', type: 'octets', label: 'Dados Rei' },
  { key: 'meridian_data', type: 'octets', label: 'Meridianos' },
  { key: 'extraprop', type: 'octets', label: 'Propriedades Extra' },
  { key: 'title_data', type: 'octets', label: 'Títulos' },
  { key: 'reincarnation_data', type: 'octets', label: 'Reencarnação' },
  { key: 'realm_data', type: 'octets', label: 'Céu (Realm)' },
  { key: 'reserved2', type: 'byte', label: 'Reservado 2' },
  { key: 'reserved3', type: 'byte', label: 'Reservado 3' },
  { key: 'glyph_data', type: 'octets', label: 'Glifos' },
  { key: 'treasure_data', type: 'octets', label: 'Relíquias (Treasure)' },
  { key: 'lottery_data', type: 'octets', label: 'Loteria' },
];

export const getVersionSchema = (version: PWVersion): VersionSchema => {
  // Always returning 156 structure as per user request to "add everything"
  return {
    version,
    role: {
      base: BASE_156,
      status: STATUS_156,
      pocket: [
        { key: 'icapacity', type: 'int', label: 'Capacidade (Slots)' },
        { key: 'timestamp', type: 'int', label: 'Timestamp' },
        { key: 'money', type: 'int', label: 'Moedas (Inventário)' },
        { key: 'invcount', type: 'cuint', label: 'Contagem Itens' },
        { key: 'reserved6', type: 'int', label: 'Reservado 6' },
        { key: 'reserved7', type: 'int', label: 'Reservado 7' },
      ],
      equipment: [
         { key: 'eqpcount', type: 'cuint', label: 'Contagem Equip' }
      ], 
      storehouse: [
         { key: 'capacity', type: 'int', label: 'Slots Banco' },
         { key: 'money', type: 'int', label: 'Moedas Banco' },
         { key: 'storecount', type: 'cuint', label: 'Contagem Banco' },
         { key: 'size1', type: 'byte', label: 'Tamanho Fashion' }, 
         { key: 'size2', type: 'byte', label: 'Tamanho Mats' },
         { key: 'size3', type: 'byte', label: 'Tamanho Cartas' },
         { key: 'reserved', type: 'short', label: 'Reservado' },
         { key: 'size4', type: 'byte', label: 'Tamanho Glifos' },
         { key: 'size5', type: 'byte', label: 'Tamanho Relíquias' },
         { key: 'size6', type: 'byte', label: 'Tamanho Transmut.' },
      ],
      task: [
        { key: 'task_data', type: 'octets', label: 'Dados Tarefas (Ativas)' },
        { key: 'task_complete', type: 'octets', label: 'Tarefas Completas' },
        { key: 'task_finishtime', type: 'octets', label: 'Tempo Finalização' },
        { key: 'task_inventorycount', type: 'cuint', label: 'Contagem Itens Quest' }
      ]
    }
  };
};