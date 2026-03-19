const BaseRepository = require('./BaseRepository');
const { getDb } = require('../config/db');

class SuggestionRepository extends BaseRepository {
    constructor() {
        super('suggestions');
    }

    async findAllWithUserDetails() {
        // Try to fetch with join first
        const { data, error } = await this._table()
            .select(`
                *,
                user:users (
                    name,
                    phone
                )
            `)
            .order('created_at', { ascending: false });
        
        if (!error) return data;

        // If join fails (e.g. missing relationship in Supabase), fetch suggestions then users
        console.log('SuggestionRepository: Join failed, fetching manually...', error.message);
        const { data: suggestions, error: sError } = await this._table()
            .select('*')
            .order('created_at', { ascending: false });
        
        if (sError) throw new Error(sError.message);

        // Fetch users for these suggestions
        const userIds = [...new Set(suggestions.map(s => s.user_id).filter(Boolean))];
        if (userIds.length === 0) return suggestions;

        const { data: users, error: uError } = await getDb()
            .from('users')
            .select('id, name, phone')
            .in('id', userIds);
        
        if (uError) {
            console.error('Error fetching users for suggestions:', uError);
            return suggestions;
        }

        // Map users back to suggestions
        return suggestions.map(s => ({
            ...s,
            user: users.find(u => u.id === s.user_id)
        }));
    }
}

module.exports = new SuggestionRepository();
