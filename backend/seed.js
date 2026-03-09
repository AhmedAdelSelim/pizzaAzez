const { createClient } = require('@supabase/supabase-js');
const { CATEGORIES, MENU_ITEMS, MOCK_USER, DELIVERY_ZONES, STORIES } = require('./mockData_copy');

// --- Supabase config (same as src/config) ---
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://utotcozlqmnverrugjkx.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_HSLL7fsrq4wOZVvxH2lT4Q_XFYKcemz';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- SQL to create tables ---
const CREATE_TABLES_SQL = `
-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT,
    icon TEXT,
    image TEXT,
    description TEXT
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
    id TEXT PRIMARY KEY,
    category_id TEXT,
    name TEXT,
    description TEXT,
    price NUMERIC,
    rating NUMERIC,
    reviews JSONB,
    image TEXT,
    is_popular BOOLEAN DEFAULT false,
    is_special BOOLEAN DEFAULT false,
    sizes JSONB,
    extras JSONB,
    ingredients JSONB
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    password TEXT DEFAULT 'password123'
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    date TEXT,
    status TEXT,
    total NUMERIC,
    items JSONB,
    address TEXT,
    phone TEXT,
    notes TEXT,
    delivery_zone TEXT,
    delivery_fee NUMERIC,
    discount NUMERIC,
    coupon_code TEXT
);

-- Delivery Zones
CREATE TABLE IF NOT EXISTS delivery_zones (
    id TEXT PRIMARY KEY,
    name TEXT,
    price NUMERIC
);

-- Stories
CREATE TABLE IF NOT EXISTS stories (
    id TEXT PRIMARY KEY,
    title TEXT,
    image TEXT,
    owner TEXT,
    owner_image TEXT,
    is_seen BOOLEAN DEFAULT false
);
`;

// --- Helper: convert camelCase data to snake_case for DB ---
function toMenuItemRow(item) {
    return {
        id: item.id,
        category_id: item.categoryId,
        name: item.name,
        description: item.description,
        price: item.price,
        rating: item.rating,
        reviews: item.reviews || null,
        image: item.image,
        is_popular: item.isPopular || false,
        is_special: item.isSpecial || false,
        sizes: item.sizes || null,
        extras: item.extras || null,
        ingredients: item.ingredients || null,
    };
}

function toDeliveryZoneRow(zone) {
    return { id: zone.id, name: zone.name, price: zone.price };
}

function toStoryRow(story) {
    return {
        id: story.id,
        title: story.title,
        image: story.image,
        owner: story.owner,
        owner_image: story.ownerImage || null,
        is_seen: story.isSeen || false,
    };
}

const seed = async () => {
    try {
        console.log('Creating tables via Supabase SQL...');

        // Create tables using Supabase's rpc or SQL editor
        // Note: We use the supabase.rpc for raw SQL via a Postgres function,
        // but since we can't run arbitrary SQL via the JS client directly,
        // we'll just try to insert and rely on tables being created via the Dashboard.
        // 
        // ** IMPORTANT: Run the SQL in CREATE_TABLES_SQL in your Supabase Dashboard **
        // ** Go to SQL Editor → New Query → Paste and Run **

        console.log('\n========================================');
        console.log('IMPORTANT: Before running this seed script,');
        console.log('you must create the tables in Supabase first!');
        console.log('Go to: Supabase Dashboard → SQL Editor → New Query');
        console.log('Paste and run this SQL:\n');
        console.log(CREATE_TABLES_SQL);
        console.log('========================================\n');
        console.log('If tables already exist, proceeding with seeding...\n');

        // Clear existing data
        const tables = ['categories', 'menu_items', 'users', 'delivery_zones', 'stories'];
        for (const table of tables) {
            const { error } = await supabase.from(table).delete().neq('id', '___none___');
            if (error) {
                console.error(`Error clearing ${table}:`, error.message);
                console.log('→ Make sure you created the tables first (see SQL above)');
                process.exit(1);
            }
            console.log(`  ✓ Cleared "${table}"`);
        }

        // Seed categories
        const { error: catErr } = await supabase.from('categories').insert(CATEGORIES);
        if (catErr) throw new Error('categories: ' + catErr.message);
        console.log(`  ✓ Seeded ${CATEGORIES.length} categories`);

        // Seed menu items (convert to snake_case)
        const menuRows = MENU_ITEMS.map(toMenuItemRow);
        const { error: menuErr } = await supabase.from('menu_items').insert(menuRows);
        if (menuErr) throw new Error('menu_items: ' + menuErr.message);
        console.log(`  ✓ Seeded ${MENU_ITEMS.length} menu items`);

        // Seed user
        const { error: userErr } = await supabase.from('users').insert([MOCK_USER]);
        if (userErr) throw new Error('users: ' + userErr.message);
        console.log(`  ✓ Seeded 1 user`);

        // Seed delivery zones
        const zoneRows = DELIVERY_ZONES.map(toDeliveryZoneRow);
        const { error: zoneErr } = await supabase.from('delivery_zones').insert(zoneRows);
        if (zoneErr) throw new Error('delivery_zones: ' + zoneErr.message);
        console.log(`  ✓ Seeded ${DELIVERY_ZONES.length} delivery zones`);

        // Seed stories (convert to snake_case)
        const storyRows = STORIES.map(toStoryRow);
        const { error: storyErr } = await supabase.from('stories').insert(storyRows);
        if (storyErr) throw new Error('stories: ' + storyErr.message);
        console.log(`  ✓ Seeded ${STORIES.length} stories`);

        console.log('\n✅ Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err.message || err);
        process.exit(1);
    }
};

seed();
