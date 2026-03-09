const { createClient } = require('@supabase/supabase-js');
const config = require('./index');

let supabase;

const connectDB = () => {
    try {
        supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY);
        console.log('Connected to Supabase');
    } catch (err) {
        console.error('Supabase connection error:', err);
        process.exit(1);
    }
};

const getDb = () => {
    if (!supabase) {
        throw new Error('Database not initialized. Call connectDB() first.');
    }
    return supabase;
};

module.exports = connectDB;
module.exports.getDb = getDb;
