import { PWRole, PWVersion } from './types';
import { getVersionSchema } from './pwSchema';

// Helper to generate mock hex octets
const randomHex = (len: number) => Array.from({length: len}, () => Math.floor(Math.random()*256).toString(16).padStart(2, '0')).join('').toUpperCase();

let currentVersion: PWVersion = '156'; // Default

// Dynamic generator based on schema
const generateMockRole = (id: number, name: string, version: PWVersion): PWRole => {
  const schema = getVersionSchema(version);
  
  const role: any = {
    base: {},
    status: {},
    pocket: {
      money: Math.floor(Math.random() * 10000000),
      icapacity: 64,
      inv: []
    },
    equipment: {
      eqp: []
    },
    storehouse: {
      money: Math.floor(Math.random() * 50000000),
      capacity: 96,
      store: [],
      dress: [],
      material: [],
      generalcard: [],
      glyph: [],
      treasure: [],
      transmutation: []
    },
    user_login: `user${id}`,
    user_email: `user${id}@example.com`,
    isBanned: Math.random() > 0.9
  };

  // Populate Base from Schema
  schema.role.base.forEach(field => {
    if (field.key === 'id') role.base[field.key] = id;
    else if (field.key === 'name') role.base[field.key] = name;
    else if (field.type === 'int') role.base[field.key] = Math.floor(Math.random() * 100);
    else if (field.type === 'byte') role.base[field.key] = Math.floor(Math.random() * 2);
    else if (field.type === 'octets') role.base[field.key] = randomHex(8);
    else role.base[field.key] = '00';
  });

  // Populate Status from Schema
  schema.role.status.forEach(field => {
    if (field.key === 'level') role.status[field.key] = Math.floor(Math.random() * 100) + 1;
    else if (field.key === 'hp') role.status[field.key] = Math.floor(Math.random() * 10000);
    else if (field.key === 'mp') role.status[field.key] = Math.floor(Math.random() * 10000);
    else if (field.type === 'octets') role.status[field.key] = randomHex(8);
    else role.status[field.key] = 0;
  });

  // --- MOCK INVENTORY GENERATION ---
  
  // Pocket
  if (Math.random() > 0.3) {
    role.pocket.inv.push({ id: 11208, pos: 0, count: 50, max_count: 9999, data: '00', proctype: 0, expire_date: 0, name: 'Mirage Stone', icon: '11208.png' });
    role.pocket.inv.push({ id: 19283, pos: 1, count: 1, max_count: 1, data: randomHex(16), proctype: 0, expire_date: 0, name: 'Rank 9 Weapon', icon: 'weapon_icon.png' });
    role.pocket.inv.push({ id: 27932, pos: 2, count: 100, max_count: 9999, data: '00', proctype: 0, expire_date: 0, name: 'Perfect Stone', icon: '27932.png' });
  }

  // Storehouse Items (Bank)
  role.storehouse.store.push({ id: 11208, pos: 0, count: 100, max_count: 9999, data: '00', proctype: 0, expire_date: 0, name: 'Mirage Stone', icon: '11208.png' });
  
  // Dress (Fashion)
  role.storehouse.dress.push({ id: 38421, pos: 0, count: 1, max_count: 1, data: randomHex(10), proctype: 0, expire_date: 0, name: 'Fashion Top', icon: 'fashion_m.png' });

  // 156 Specifics
  if (version === '156') {
    role.storehouse.generalcard.push({ id: 45001, pos: 0, count: 1, max_count: 1, data: randomHex(20), proctype: 0, expire_date: 0, name: 'S-Rank War Avatar', icon: 'card_s.png' });
    role.storehouse.glyph.push({ id: 50001, pos: 0, count: 1, max_count: 1, data: randomHex(8), proctype: 0, expire_date: 0, name: 'Golden Glyph Lv5', icon: 'glyph_5.png' });
  }

  return role as PWRole;
};

// Initial Mock Store
let MOCK_ROLES: PWRole[] = [];

const initializeMocks = (ver: PWVersion) => {
  MOCK_ROLES = [
    generateMockRole(1024, 'AdminGod', ver),
    generateMockRole(1025, 'xXDragonXx', ver),
    generateMockRole(1026, 'Healer007', ver),
  ];
};

initializeMocks(currentVersion);

export const PWApiService = {
  setVersion: async (version: PWVersion) => {
    currentVersion = version;
    initializeMocks(version); // Reset mocks when version changes for demo purposes
    return true;
  },

  getCurrentVersion: () => currentVersion,

  getAllRoles: async (): Promise<PWRole[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...MOCK_ROLES]), 500);
    });
  },

  getRole: async (id: number): Promise<PWRole | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_ROLES.find(r => r.base.id === id)), 300);
    });
  },

  saveRole: async (id: number, data: Partial<PWRole>): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        MOCK_ROLES = MOCK_ROLES.map(r => r.base.id === id ? { ...r, ...data } : r);
        resolve(true);
      }, 800);
    });
  },

  createAccount: async (login: string, pass: string, email: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = Math.max(...MOCK_ROLES.map(r => r.base.id)) + 1;
        const newRole = generateMockRole(newId, `NewUser${newId}`, currentVersion);
        newRole.user_login = login;
        newRole.user_email = email;
        MOCK_ROLES.push(newRole);
        resolve(true);
      }, 800);
    });
  },

  deleteRole: async (id: number): Promise<boolean> => {
    return new Promise((resolve) => {
       setTimeout(() => {
         MOCK_ROLES = MOCK_ROLES.filter(r => r.base.id !== id);
         resolve(true);
       }, 500);
    });
  },
  
  toggleBan: async (id: number): Promise<boolean> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              MOCK_ROLES = MOCK_ROLES.map(r => {
                  if (r.base.id === id) {
                      return { ...r, isBanned: !r.isBanned };
                  }
                  return r;
              });
              resolve(true);
          }, 300);
      });
  }
};
