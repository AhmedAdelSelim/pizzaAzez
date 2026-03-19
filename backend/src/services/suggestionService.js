const suggestionRepository = require('../repositories/suggestionRepository');

class SuggestionService {
    async createSuggestion(userId, content) {
        if (!content) throw new Error('Suggestion content is required');
        return await suggestionRepository.create({
            user_id: userId,
            content,
            created_at: new Date().toISOString()
        });
    }

    async getAllSuggestions() {
        return await suggestionRepository.findAllWithUserDetails();
    }
}

module.exports = new SuggestionService();
