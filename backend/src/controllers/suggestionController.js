const suggestionService = require('../services/suggestionService');

const suggestionController = {
    async createSuggestion(request, reply) {
        try {
            const { content } = request.body;
            const userId = request.user.id;
            const suggestion = await suggestionService.createSuggestion(userId, content);
            return reply.status(201).send(suggestion);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    },

    async getAdminSuggestions(request, reply) {
        try {
            const suggestions = await suggestionService.getAllSuggestions();
            return reply.send(suggestions);
        } catch (error) {
            return reply.status(400).send({ message: error.message });
        }
    }
};

module.exports = suggestionController;
