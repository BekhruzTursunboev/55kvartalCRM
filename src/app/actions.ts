'use server'

import { sql, initDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface Property {
  id?: number;
  title: string;
  category: 'zhiloy' | 'nezhiloy';
  type: string; // 'apartment', 'house', 'office', 'retail', 'salon', 'storage', 'catering'
  deal_type: 'sale' | 'rent';
  price: number;
  rayon: string;
  orientir: string;
  rooms: number | null;
  area: number;
  floor: number | null;
  max_floor: number | null;
  details: Record<string, any>;
  contact_name: string;
  contact_phone: string;
  status?: string; // 'active', 'archived'
  created_at?: string;
}

export interface Client {
  id?: number;
  name: string;
  phone: string;
  category: 'zhiloy' | 'nezhiloy';
  type: string | null; // null means 'any'
  deal_type: 'buy' | 'rent';
  price_min: number;
  price_max: number;
  rayons: string[]; // array of strings, stored as JSONB
  orientir: string;
  min_area: number;
  rooms: string | null; // e.g. "1,2", "3", "any"
  details: Record<string, any>;
  notes: string;
  status?: string; // 'active', 'archived', 'completed'
  created_at?: string;
}

// Ensure database is initialized before any operation
async function ensureDb() {
  await initDb();
}

// ==========================================
// PROPERTY ACTIONS
// ==========================================

export async function getProperties() {
  await ensureDb();
  try {
    const rows = await sql`
      SELECT * FROM properties 
      ORDER BY created_at DESC
    `;
    
    return rows.map((row: any) => ({
      ...row,
      price: Number(row.price),
      area: Number(row.area),
      rooms: row.rooms !== null ? Number(row.rooms) : null,
      floor: row.floor !== null ? Number(row.floor) : null,
      max_floor: row.max_floor !== null ? Number(row.max_floor) : null,
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details || {}
    })) as Property[];
  } catch (error) {
    console.error('Failed to get properties:', error);
    return [];
  }
}

export async function addProperty(property: Omit<Property, 'id' | 'created_at'>) {
  await ensureDb();
  try {
    const detailsJson = JSON.stringify(property.details || {});
    const result = await sql`
      INSERT INTO properties (
        title, category, type, deal_type, price, rayon, orientir, 
        rooms, area, floor, max_floor, details, contact_name, contact_phone, status
      ) VALUES (
        ${property.title},
        ${property.category},
        ${property.type},
        ${property.deal_type},
        ${property.price},
        ${property.rayon},
        ${property.orientir || ''},
        ${property.rooms},
        ${property.area},
        ${property.floor},
        ${property.max_floor},
        ${detailsJson},
        ${property.contact_name || ''},
        ${property.contact_phone},
        'active'
      ) RETURNING id
    `;
    
    revalidatePath('/');
    return { success: true, id: result[0]?.id };
  } catch (error) {
    console.error('Failed to add property:', error);
    return { success: false, error: String(error) };
  }
}

export async function updatePropertyStatus(id: number, status: string) {
  await ensureDb();
  try {
    await sql`
      UPDATE properties 
      SET status = ${status} 
      WHERE id = ${id}
    `;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update property status:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteProperty(id: number) {
  await ensureDb();
  try {
    await sql`DELETE FROM properties WHERE id = ${id}`;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete property:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateProperty(id: number, property: Omit<Property, 'id' | 'created_at'>) {
  await ensureDb();
  try {
    const detailsJson = JSON.stringify(property.details || {});
    await sql`
      UPDATE properties 
      SET 
        title = ${property.title},
        category = ${property.category},
        type = ${property.type},
        deal_type = ${property.deal_type},
        price = ${property.price},
        rayon = ${property.rayon},
        orientir = ${property.orientir || ''},
        rooms = ${property.rooms},
        area = ${property.area},
        floor = ${property.floor},
        max_floor = ${property.max_floor},
        details = ${detailsJson},
        contact_name = ${property.contact_name || ''},
        contact_phone = ${property.contact_phone},
        status = ${property.status || 'active'}
      WHERE id = ${id}
    `;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update property:', error);
    return { success: false, error: String(error) };
  }
}


// ==========================================
// CLIENT ACTIONS
// ==========================================

export async function getClients() {
  await ensureDb();
  try {
    const rows = await sql`
      SELECT * FROM clients 
      ORDER BY created_at DESC
    `;
    
    return rows.map((row: any) => ({
      ...row,
      price_min: Number(row.price_min),
      price_max: Number(row.price_max),
      min_area: Number(row.min_area),
      rayons: typeof row.rayons === 'string' ? JSON.parse(row.rayons) : row.rayons || [],
      details: typeof row.details === 'string' ? JSON.parse(row.details) : row.details || {}
    })) as Client[];
  } catch (error) {
    console.error('Failed to get clients:', error);
    return [];
  }
}

export async function addClient(client: Omit<Client, 'id' | 'created_at'>) {
  await ensureDb();
  try {
    const rayonsJson = JSON.stringify(client.rayons || []);
    const detailsJson = JSON.stringify(client.details || {});
    
    const result = await sql`
      INSERT INTO clients (
        name, phone, category, type, deal_type, price_min, price_max, 
        rayons, orientir, min_area, rooms, details, notes, status
      ) VALUES (
        ${client.name},
        ${client.phone},
        ${client.category},
        ${client.type},
        ${client.deal_type},
        ${client.price_min},
        ${client.price_max},
        ${rayonsJson},
        ${client.orientir || ''},
        ${client.min_area},
        ${client.rooms},
        ${detailsJson},
        ${client.notes || ''},
        'active'
      ) RETURNING id
    `;
    
    revalidatePath('/');
    return { success: true, id: result[0]?.id };
  } catch (error) {
    console.error('Failed to add client:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateClientStatus(id: number, status: string) {
  await ensureDb();
  try {
    await sql`
      UPDATE clients 
      SET status = ${status} 
      WHERE id = ${id}
    `;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update client status:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateClientNotes(id: number, notes: string) {
  await ensureDb();
  try {
    await sql`
      UPDATE clients 
      SET notes = ${notes} 
      WHERE id = ${id}
    `;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update client notes:', error);
    return { success: false, error: String(error) };
  }
}

export async function deleteClient(id: number) {
  await ensureDb();
  try {
    await sql`DELETE FROM clients WHERE id = ${id}`;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete client:', error);
    return { success: false, error: String(error) };
  }
}

export async function updateClient(id: number, client: Omit<Client, 'id' | 'created_at'>) {
  await ensureDb();
  try {
    const rayonsJson = JSON.stringify(client.rayons || []);
    const detailsJson = JSON.stringify(client.details || {});
    await sql`
      UPDATE clients 
      SET 
        name = ${client.name},
        phone = ${client.phone},
        category = ${client.category},
        type = ${client.type},
        deal_type = ${client.deal_type},
        price_min = ${client.price_min},
        price_max = ${client.price_max},
        rayons = ${rayonsJson},
        orientir = ${client.orientir || ''},
        min_area = ${client.min_area},
        rooms = ${client.rooms},
        details = ${detailsJson},
        notes = ${client.notes || ''},
        status = ${client.status || 'active'}
      WHERE id = ${id}
    `;
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to update client:', error);
    return { success: false, error: String(error) };
  }
}


// ==========================================
// SMART MATCHING ENGINE ACTIONS
// ==========================================

export interface MatchResult {
  property?: Property;
  client?: Client;
  score: number; // 0 to 100
  matchingFactors: string[];
}

/**
 * Find matching clients for a specific property
 */
export async function getMatchesForProperty(propertyId: number): Promise<MatchResult[]> {
  await ensureDb();
  try {
    // 1. Get the property
    const propertyRows = await sql`SELECT * FROM properties WHERE id = ${propertyId}`;
    if (!propertyRows || propertyRows.length === 0) return [];
    
    const rawProp = propertyRows[0] as any;
    const property: Property = {
      ...rawProp,
      price: Number(rawProp.price),
      area: Number(rawProp.area),
      rooms: rawProp.rooms !== null ? Number(rawProp.rooms) : null,
      floor: rawProp.floor !== null ? Number(rawProp.floor) : null,
      max_floor: rawProp.max_floor !== null ? Number(rawProp.max_floor) : null,
      details: typeof rawProp.details === 'string' ? JSON.parse(rawProp.details) : rawProp.details || {}
    };

    // 2. Get all active clients
    const clients = await getClients();
    const activeClients = clients.filter(c => c.status === 'active');
    
    const matches: MatchResult[] = [];

    for (const client of activeClients) {
      // Rule 1: Category must match (zhiloy vs nezhiloy)
      if (client.category !== property.category) continue;

      // Rule 2: Deal type mapping
      const isDealTypeMatch = 
        (property.deal_type === 'sale' && client.deal_type === 'buy') ||
        (property.deal_type === 'rent' && client.deal_type === 'rent');
      
      if (!isDealTypeMatch) continue;

      let score = 50; // base compatibility
      const factors: string[] = ['Kategoriya mosligi (Category Match)', 'Bitim turi mosligi (Deal Type Match)'];

      // Rayon check
      if (client.rayons && client.rayons.length > 0) {
        const isAny = client.rayons.some(r => r.toLowerCase().includes('любой') || r.toLowerCase().includes('istalgan'));
        const matchRayon = isAny || client.rayons.some(r => r.toLowerCase() === property.rayon.toLowerCase());
        if (matchRayon) {
          score += 20;
          factors.push(isAny ? "Barcha tumanlar ma'qul (Rayon Flexible)" : `Tuman mosligi: ${property.rayon} (Rayon Match)`);
        } else {
          score -= 20; // major penalty
        }
      } else {
        score += 10; // no rayon preference means open to all
        factors.push("Barcha tumanlar ma'qul (Rayon Flexible)");
      }

      // Budget check
      const price = property.price;
      if (price >= client.price_min && price <= client.price_max) {
        score += 20;
        factors.push(`Byudjet mosligi: $${price.toLocaleString()} (Within Budget)`);
      } else if (price < client.price_min) {
        score += 15; // Client gets it cheaper!
        factors.push(`Byudjetdan ancha arzon: $${price.toLocaleString()} (Under Budget)`);
      } else {
        const excessPercent = ((price - client.price_max) / client.price_max) * 100;
        if (excessPercent <= 15) {
          score += 5; // close enough (15% margin)
          factors.push(`Byudjetdan biroz qimmat (+${Math.round(excessPercent)}%)`);
        } else {
          continue; // too expensive, skip this client
        }
      }

      // Property type sub-category match
      if (client.type && client.type !== 'any') {
        if (client.type.toLowerCase() === property.type.toLowerCase()) {
          score += 10;
          factors.push(`Ob'ekt turi mosligi: ${property.type} (Type Match)`);
        } else {
          continue; // exact type filter mismatch, skip
        }
      }

      // Area check
      if (client.min_area && client.min_area > 0) {
        if (property.area >= client.min_area) {
          score += 5;
          factors.push(`Maydon talabi mos: ${property.area} m² (Area meets requirement)`);
        } else {
          continue; // too small for client, skip
        }
      }

      // Rooms check (Only for Zhiloy)
      if (property.category === 'zhiloy' && client.rooms && client.rooms !== 'any') {
        const preferredRooms = client.rooms.split(',').map(r => r.trim());
        if (property.rooms !== null && preferredRooms.includes(String(property.rooms))) {
          score += 5;
          factors.push(`Xonalar soni mos: ${property.rooms} xona (Rooms Match)`);
        } else {
          score -= 10; // minor penalty or could skip depending on rigidity
        }
      }

      // Limit score range
      const finalScore = Math.max(0, Math.min(100, score));
      if (finalScore >= 50) {
        matches.push({
          client,
          score: finalScore,
          matchingFactors: factors
        });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Failed to match clients for property:', error);
    return [];
  }
}

/**
 * Find matching properties for a specific client
 */
export async function getMatchesForClient(clientId: number): Promise<MatchResult[]> {
  await ensureDb();
  try {
    // 1. Get the client
    const clientRows = await sql`SELECT * FROM clients WHERE id = ${clientId}`;
    if (!clientRows || clientRows.length === 0) return [];
    
    const rawClient = clientRows[0] as any;
    const client: Client = {
      ...rawClient,
      price_min: Number(rawClient.price_min),
      price_max: Number(rawClient.price_max),
      min_area: Number(rawClient.min_area),
      rayons: typeof rawClient.rayons === 'string' ? JSON.parse(rawClient.rayons) : rawClient.rayons || [],
      details: typeof rawClient.details === 'string' ? JSON.parse(rawClient.details) : rawClient.details || {}
    };

    // 2. Get all active properties
    const properties = await getProperties();
    const activeProperties = properties.filter(p => p.status === 'active');
    
    const matches: MatchResult[] = [];

    for (const property of activeProperties) {
      // Rule 1: Category must match
      if (client.category !== property.category) continue;

      // Rule 2: Deal type mapping
      const isDealTypeMatch = 
        (property.deal_type === 'sale' && client.deal_type === 'buy') ||
        (property.deal_type === 'rent' && client.deal_type === 'rent');
      
      if (!isDealTypeMatch) continue;

      let score = 50;
      const factors: string[] = ['Kategoriya mosligi (Category Match)', 'Bitim turi mosligi (Deal Type Match)'];

      // Rayon check
      if (client.rayons && client.rayons.length > 0) {
        const isAny = client.rayons.some(r => r.toLowerCase().includes('любой') || r.toLowerCase().includes('istalgan'));
        const matchRayon = isAny || client.rayons.some(r => r.toLowerCase() === property.rayon.toLowerCase());
        if (matchRayon) {
          score += 20;
          factors.push(isAny ? "Barcha tumanlar ma'qul (Rayon Flexible)" : `Tuman mosligi: ${property.rayon} (Rayon Match)`);
        } else {
          score -= 20;
        }
      } else {
        score += 10;
        factors.push("Barcha tumanlar ma'qul (Rayon Flexible)");
      }

      // Budget check
      const price = property.price;
      if (price >= client.price_min && price <= client.price_max) {
        score += 20;
        factors.push(`Byudjet mosligi: $${price.toLocaleString()} (Within Budget)`);
      } else if (price < client.price_min) {
        score += 15;
        factors.push(`Byudjetdan ancha arzon: $${price.toLocaleString()} (Under Budget)`);
      } else {
        const excessPercent = ((price - client.price_max) / client.price_max) * 100;
        if (excessPercent <= 15) {
          score += 5;
          factors.push(`Byudjetdan biroz qimmat (+${Math.round(excessPercent)}%)`);
        } else {
          continue;
        }
      }

      // Property type sub-category match
      if (client.type && client.type !== 'any') {
        if (client.type.toLowerCase() === property.type.toLowerCase()) {
          score += 10;
          factors.push(`Ob'ekt turi mosligi: ${property.type} (Type Match)`);
        } else {
          continue;
        }
      }

      // Area check
      if (client.min_area && client.min_area > 0) {
        if (property.area >= client.min_area) {
          score += 5;
          factors.push(`Maydon talabi mos: ${property.area} m² (Area meets requirement)`);
        } else {
          continue;
        }
      }

      // Rooms check (Only for Zhiloy)
      if (property.category === 'zhiloy' && client.rooms && client.rooms !== 'any') {
        const preferredRooms = client.rooms.split(',').map(r => r.trim());
        if (property.rooms !== null && preferredRooms.includes(String(property.rooms))) {
          score += 5;
          factors.push(`Xonalar soni mos: ${property.rooms} xona (Rooms Match)`);
        } else {
          score -= 10;
        }
      }

      const finalScore = Math.max(0, Math.min(100, score));
      if (finalScore >= 50) {
        matches.push({
          property,
          score: finalScore,
          matchingFactors: factors
        });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  } catch (error) {
    console.error('Failed to match properties for client:', error);
    return [];
  }
}

/**
 * Seed the database with high-quality Tashkent real estate data
 */
export async function seedDatabase() {
  await ensureDb();
  try {
    const propsCount = await sql`SELECT COUNT(*) as count FROM properties`;
    const clientsCount = await sql`SELECT COUNT(*) as count FROM clients`;
    
    if (Number(propsCount[0]?.count) > 0 || Number(clientsCount[0]?.count) > 0) {
      return { success: true, message: 'Database already has data' };
    }

    // Seed Properties
    const sampleProperties = [
      {
        title: "Yakkasaroyda zamonaviy Ofis",
        category: "nezhiloy" as const,
        type: "office",
        deal_type: "rent" as const,
        price: 2500,
        rayon: "Yakkasaray",
        orientir: "Grand Mir Hotel orqasida, yo'l bo'yi",
        rooms: null,
        area: 150,
        floor: 2,
        max_floor: 4,
        details: { power_kw: 30, ceiling_height: 3.2, separate_entrance: true },
        contact_name: "Aziz aka",
        contact_phone: "+998 90 123 45 67"
      },
      {
        title: "Sergelida baland shiftli Sklad",
        category: "nezhiloy" as const,
        type: "storage",
        deal_type: "rent" as const,
        price: 1800,
        rayon: "Sergeli",
        orientir: "Sergeli avtomobil bozori yaqinida",
        rooms: null,
        area: 450,
        floor: 1,
        max_floor: 1,
        details: { power_kw: 80, ceiling_height: 5.5, separate_entrance: true, parking_spaces: 10 },
        contact_name: "Sherzod",
        contact_phone: "+998 93 345 67 89"
      },
      {
        title: "Chilonzor-9da 3 xonali evro-kvartira",
        category: "zhiloy" as const,
        type: "apartment",
        deal_type: "sale" as const,
        price: 85000,
        rayon: "Chilonzor",
        orientir: "Metro Novza, multfilm studiyasi yaqinida",
        rooms: 3,
        area: 78,
        floor: 4,
        max_floor: 9,
        details: { has_balcony: true, building_series: "French layout" },
        contact_name: "Dilshod",
        contact_phone: "+998 97 765 43 21"
      },
      {
        title: "Yunusobod-11da 2 xonali shinam kvartira",
        category: "zhiloy" as const,
        type: "apartment",
        deal_type: "rent" as const,
        price: 550,
        rayon: "Yunusobod",
        orientir: "Mega Planet ro'parasida",
        rooms: 2,
        area: 55,
        floor: 3,
        max_floor: 5,
        details: { has_balcony: true },
        contact_name: "Umida opa",
        contact_phone: "+998 94 987 65 43"
      },
      {
        title: "Mirobod tumanida Go'zallik saloni uchun joy",
        category: "nezhiloy" as const,
        type: "salon",
        deal_type: "rent" as const,
        price: 1200,
        rayon: "Mirobod",
        orientir: "Perfectum Mobile yaqinida",
        rooms: null,
        area: 70,
        floor: 1,
        max_floor: 5,
        details: { power_kw: 20, ceiling_height: 3.0, separate_entrance: true },
        contact_name: "Saida",
        contact_phone: "+998 99 888 77 66"
      }
    ];

    for (const p of sampleProperties) {
      await addProperty(p);
    }

    // Seed Clients
    const sampleClients = [
      {
        name: "Farrux aka (IT Kompaniya)",
        phone: "+998 90 111 22 33",
        category: "nezhiloy" as const,
        type: "office",
        deal_type: "rent" as const,
        price_min: 1500,
        price_max: 3000,
        rayons: ["Yakkasaray", "Mirobod"],
        orientir: "Yo'l yuzida bo'lishi shart",
        min_area: 120,
        rooms: null,
        details: { separate_entrance: true },
        notes: "Xususiy IT kompaniyasi uchun zamonaviy ofis qidirilmoqda."
      },
      {
        name: "Jasur (Omborxona uchun)",
        phone: "+998 95 222 33 44",
        category: "nezhiloy" as const,
        type: "storage",
        deal_type: "rent" as const,
        price_min: 1000,
        price_max: 2000,
        rayons: ["Sergeli", "Bektemir"],
        orientir: "Yuk mashinalari kirishiga qulay joy",
        min_area: 300,
        rooms: null,
        details: {},
        notes: "Gipsokarton saqlash uchun quruq va baland shiftli sklad."
      },
      {
        name: "Nilufar (Go'zallik saloni)",
        phone: "+998 90 333 44 55",
        category: "nezhiloy" as const,
        type: "salon",
        deal_type: "rent" as const,
        price_min: 800,
        price_max: 1500,
        rayons: ["Mirobod", "Yunusobod", "Yakkasaray"],
        orientir: "Aholi zich joylashgan birinchi qavat",
        min_area: 50,
        rooms: null,
        details: { separate_entrance: true },
        notes: "Katta vitraj oynalari bo'lsa juda yaxshi."
      },
      {
        name: "Bobur aka (3 xonali xaridor)",
        phone: "+998 97 444 55 66",
        category: "zhiloy" as const,
        type: "apartment",
        deal_type: "buy" as const,
        price_min: 70000,
        price_max: 95000,
        rayons: ["Chilonzor", "Uchtepa"],
        orientir: "Metroga 10 daqiqalik masofa bo'lsin",
        min_area: 70,
        rooms: "3,4",
        details: {},
        notes: "Bolalar maktabi yaqinida, yaxshi ta'mirlangan kvartira izlashmoqda."
      }
    ];

    for (const c of sampleClients) {
      await addClient(c);
    }

    return { success: true, message: 'Seeded sample data successfully' };
  } catch (error) {
    console.error('Failed to seed database:', error);
    return { success: false, error: String(error) };
  }
}
