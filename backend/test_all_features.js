const http = require('http');

const BASE_URL = 'http://localhost:3000/api';
const HOST = 'localhost';
const PORT = 3000;

function request(method, path, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HOST,
            port: PORT,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                const responseData = body ? JSON.parse(body) : null;
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(responseData);
                } else {
                    reject({ status: res.statusCode, data: responseData });
                }
            });
        });

        req.on('error', (err) => reject(err));

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function runTests() {
    console.log('🚀 Starting Comprehensive API Tests (Native HTTP)...');

    try {
        // 1. Test Login
        console.log('\n--- 1. Testing Login ---');
        const loginRes = await request('POST', '/auth/login', {
            phone: '01021317616',
            password: 'password'
        });
        console.log('✅ Login successful');
        const authToken = loginRes.token;

        // 2. Test Fetch Menu
        console.log('\n--- 2. Testing Menu API ---');
        const categories = await request('GET', '/categories');
        console.log(`✅ Fetched ${categories.length} categories`);
        
        const items = await request('GET', '/menu');
        console.log(`✅ Fetched ${items.length} menu items`);

        // 3. Test Stories
        console.log('\n--- 3. Testing Stories API ---');
        const stories = await request('GET', '/stories');
        console.log(`✅ Fetched ${stories.length} stories`);

        // 4. Test Order Placement
        console.log('\n--- 4. Testing Order Placement ---');
        const orderData = {
            items: [{ id: items[0].id, name: items[0].name, quantity: 1, price: items[0].price }],
            total: items[0].price,
            address: 'Test Address',
            phone: '01021317616',
            deliveryZone: 'Cairo',
            deliveryFee: 10
        };
        const orderRes = await request('POST', '/orders', orderData, authToken);
        console.log(`✅ Order placed: ${orderRes.id}`);
        const testOrderId = orderRes.id;

        // 5. Test Admin Dashboard (Protected Route)
        console.log('\n--- 5. Testing Admin Stats (Protected) ---');
        const stats = await request('GET', '/admin/stats', null, authToken);
        console.log('✅ Admin Stats fetched successfully');

        console.log('\n✨ ALL API TESTS PASSED!');
    } catch (error) {
        console.error('\n❌ Test failed!');
        if (error.status) {
            console.error('Status:', error.status);
            console.error('Data:', error.data);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
}

runTests();
