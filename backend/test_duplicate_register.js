const axios = require('axios');

async function testDuplicateRegister() {
    const baseUrl = 'http://localhost:3000/api';
    const testUser = {
        name: 'Test User',
        phone: '01021317616', // This is the admin number, should exist
        password: 'password123'
    };

    try {
        console.log('Testing registration with existing phone:', testUser.phone);
        const response = await axios.post(`${baseUrl}/auth/register`, testUser);
        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Error Status:', error.response.status);
            console.log('Error Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testDuplicateRegister();
