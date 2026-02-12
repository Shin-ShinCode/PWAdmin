import { query } from '../config/database';

export class CharacterService {
  
  static async getCharacterDetail(id: number) {
    // 1. Fetch Raw Data
    // In a real scenario, this might involve multiple tables or parsing a large BLOB.
    // For Phase 1, we assume the 'roles' table has the core columns or we mock the missing ones.
    const [rows]: any = await query('SELECT * FROM roles WHERE id = ?', [id]);
    
    if (!rows || rows.length === 0) {
      return null;
    }

    const raw = rows[0];

    // 2. Map to PWRole Structure (Schema 156)
    // We construct the object structure expected by the frontend (AccountEditor.tsx)
    
    const role = {
      base: {
        id: raw.id,
        name: raw.name,
        race: raw.race || 0,
        cls: raw.cls || raw.class || 0,
        gender: raw.gender || 0,
        userid: raw.userid || raw.user_id || 0,
        create_time: raw.create_time || 0,
        lastlogin_time: raw.lastlogin_time || 0,
        status: raw.status || 0,
        spouse: raw.spouse || 0,
        // Octets are kept as null/strings for now until Phase 4 parsers are ready
        custom_data: raw.custom_data || null,
        config_data: raw.config_data || null,
        help_states: raw.help_states || null,
        cross_data: raw.cross_data || null
      },
      status: {
        level: raw.level || 1,
        level2: raw.level2 || 0,
        exp: raw.exp || 0,
        sp: raw.sp || 0,
        pp: raw.pp || 0,
        hp: raw.hp || 100,
        mp: raw.mp || 100,
        posx: raw.posx || 0,
        posy: raw.posy || 0,
        posz: raw.posz || 0,
        worldtag: raw.worldtag || 1,
        reputation: raw.reputation || 0,
        time_used: raw.time_used || 0,
        // Binary fields placeholders
        property: raw.property || null,
        var_data: raw.var_data || null,
        skills: raw.skills || null,
        storehousepasswd: raw.storehousepasswd || null,
        meridian_data: raw.meridian_data || null,
        title_data: raw.title_data || null,
        reincarnation_data: raw.reincarnation_data || null,
        realm_data: raw.realm_data || null
      },
      pocket: {
        icapacity: raw.pocket_capacity || 64,
        money: raw.money || 0,
        invcount: 0,
        inv: [] // Empty inventory for now
      },
      equipment: {
        eqpcount: 0,
        eqp: [] // Empty equipment for now
      },
      storehouse: {
        capacity: 96,
        money: 0,
        store: [],
        dress: [],
        material: [],
        card: []
      },
      task: {
        task_inventory: [],
        task_data: null,
        task_complete: null
      }
    };

    return role;
  }
}
