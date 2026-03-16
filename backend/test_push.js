const pushService = require('./src/services/pushService');

async function testPush() {
    console.log('Testing Push Notification Service...');
    const dummyToken = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]'; // Fake token
    
    try {
        console.log('Sending test notification to:', dummyToken);
        const result = await pushService.sendNotification(
            [dummyToken],
            'اختبار التنبيهات 🔔',
            'هذا تنبيه تجريبي من نظام بيتزا عزيز'
        );
        console.log('Result from Expo:', JSON.stringify(result, null, 2));
        console.log('\n✅ Push Service integration verified (hit Expo API).');
    } catch (error) {
        console.error('❌ Push Service test failed:', error);
    }
}

testPush();
