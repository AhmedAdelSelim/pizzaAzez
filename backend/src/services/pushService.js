const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

class PushService {
    async sendNotification(tokens, title, body, data = {}) {
        if (!tokens || tokens.length === 0) return;

        // Expo push notifications support array of tokens or single token
        const messages = tokens.map(token => ({
            to: token,
            sound: 'default',
            title: title,
            body: body,
            data: data,
        }));

        try {
            const response = await fetch(EXPO_PUSH_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Accept-encoding': 'gzip, deflate',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(messages),
            });

            const result = await response.json();
            console.log('Push notification result:', JSON.stringify(result, null, 2));
            return result;
        } catch (error) {
            console.error('Error sending push notification:', error);
            throw error;
        }
    }
}

module.exports = new PushService();
