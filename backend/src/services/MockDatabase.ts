import bcrypt from 'bcryptjs';

interface MockTable {
  [key: string]: any[];
}

class MockDatabase {
  private tables: MockTable = {
    admin_users: [],
    admin_roles: [],
    roles: []
  };

  constructor() {
    this.seed();
  }

  private async seed() {
    // Seed Roles
    this.tables.admin_roles = [
      { id: 1, name: 'viewer', permissions: 'read:characters,read:audit', level: 1 },
      { id: 2, name: 'gm', permissions: 'read:characters,write:characters,read:audit,write:items', level: 2 },
      { id: 3, name: 'super_admin', permissions: 'read:characters,write:characters,read:audit,write:items,manage:users,manage:system', level: 3 }
    ];

    // Seed Admin User
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin123', salt);
    this.tables.admin_users = [
      { 
        id: 1, 
        username: 'admin', 
        password_hash: hash, 
        email: 'admin@pwadmin.local', 
        role_id: 3, 
        created_at: new Date(), 
        last_login: null, 
        last_ip: '127.0.0.1', 
        is_active: true 
      }
    ];

    // Seed Game Characters
    this.tables.roles = [
      { id: 1024, name: 'GameMaster', userid: 32, level: 105, cls: 1, gender: 0 },
      { id: 1025, name: 'PlayerOne', userid: 33, level: 99, cls: 0, gender: 1 },
      { id: 1026, name: 'ArcherPro', userid: 34, level: 80, cls: 3, gender: 0 }
    ];
  }

  async query(sql: string, params: any[] = []): Promise<[any[], any]> {
    console.log('[MockDB] Executing:', sql, params);

    // Simple parser for basic queries used in controllers
    const normalizedSql = sql.toLowerCase().trim();

    // LOGIN QUERY
    if (normalizedSql.includes('select u.*, r.name as role_name')) {
      const username = params[0];
      const user = this.tables.admin_users.find(u => u.username === username);
      if (user) {
        const role = this.tables.admin_roles.find(r => r.id === user.role_id);
        return [[{ ...user, role_name: role.name, permissions: role.permissions }], []];
      }
      return [[], []];
    }

    // PROFILE QUERY
    if (normalizedSql.includes('select u.id, u.username, u.email')) {
      const id = params[0];
      const user = this.tables.admin_users.find(u => u.id === id);
      if (user) {
        const role = this.tables.admin_roles.find(r => r.id === user.role_id);
        return [[{ ...user, role_name: role.name, permissions: role.permissions }], []];
      }
      return [[], []];
    }

    // CHARACTER SEARCH
    if (normalizedSql.includes('from roles') && normalizedSql.includes('like')) {
      const searchTerm = params[0].replace(/%/g, '').toLowerCase();
      const results = this.tables.roles.filter(r => 
        r.name.toLowerCase().includes(searchTerm) || r.id.toString() === params[1]?.toString()
      );
      return [results, []];
    }

    // CHARACTER GET BY ID
    if (normalizedSql.includes('from roles where id = ?')) {
      const id = params[0];
      const result = this.tables.roles.filter(r => r.id == id);
      return [result, []];
    }
    
    // DESCRIBE
    if (normalizedSql.includes('describe roles')) {
        return [[
            { Field: 'id' }, { Field: 'name' }, { Field: 'userid' }, { Field: 'level' }, { Field: 'cls' }, { Field: 'gender' }
        ], []];
    }

    // UPDATE LOGIN
    if (normalizedSql.includes('update admin_users set last_login')) {
      return [[], []];
    }

    return [[], []];
  }
}

export const mockDb = new MockDatabase();
