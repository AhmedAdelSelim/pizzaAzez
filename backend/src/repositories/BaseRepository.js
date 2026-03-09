const { getDb } = require('../config/db');

class BaseRepository {
    constructor(tableName) {
        this.tableName = tableName;
    }

    _table() {
        return getDb().from(this.tableName);
    }

    async find(filter = {}) {
        let query = this._table().select('*');
        for (const [key, value] of Object.entries(filter)) {
            query = query.eq(key, value);
        }
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        return data || [];
    }

    async findOne(filter = {}) {
        let query = this._table().select('*');
        for (const [key, value] of Object.entries(filter)) {
            query = query.eq(key, value);
        }
        const { data, error } = await query.limit(1).single();
        if (error && error.code === 'PGRST116') return null; // no rows
        if (error) throw new Error(error.message);
        return data;
    }

    async findById(id) {
        return this.findOne({ id });
    }

    async create(data) {
        const { data: result, error } = await this._table()
            .insert(data)
            .select()
            .single();
        if (error) throw new Error(error.message);
        return result;
    }

    async update(filter, updates) {
        let query = this._table().update(updates);
        for (const [key, value] of Object.entries(filter)) {
            query = query.eq(key, value);
        }
        const { data, error } = await query.select().single();
        if (error) throw new Error(error.message);
        return data;
    }

    async delete(filter = {}) {
        let query = this._table().delete();
        for (const [key, value] of Object.entries(filter)) {
            query = query.eq(key, value);
        }
        const { error } = await query;
        if (error) throw new Error(error.message);
    }

    async deleteAll() {
        // Delete all rows by matching on a condition that's always true
        const { error } = await this._table().delete().neq('id', '___none___');
        if (error) throw new Error(error.message);
    }

    async insertMany(items) {
        if (!items.length) return [];
        const { data, error } = await this._table().insert(items).select();
        if (error) throw new Error(error.message);
        return data;
    }
}

module.exports = BaseRepository;
