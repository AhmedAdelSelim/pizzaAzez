const connectDB = require('./src/config/db');
connectDB();
const { getDb } = require('./src/config/db');

async function fixRoles() {
    try {
        const db = getDb();
        const { data: users, error } = await db.from('users').select('id, role');
        
        if (error) throw error;

        console.log(`Found ${users.length} users. Checking roles...`);

        for (const user of users) {
            if (typeof user.role === 'string' && user.role.startsWith('"') && user.role.endsWith('"')) {
                const cleanedRole = user.role.slice(1, -1);
                console.log(`Fixing user ${user.id}: ${user.role} -> ${cleanedRole}`);
                await db.from('users').update({ role: cleanedRole }).eq('id', user.id);
            }
        }
        console.log('Role fix completed!');
    } catch (err) {
        console.error('Migration failed:', err.message);
    }
}

fixRoles();
