const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAuthentication() {
    console.log('=== Testing Authentication Flow ===\n');

    try {
        // Test 1: Register a new user
        console.log('1. Testing Registration...');
        const registerData = {
            name: 'Test User',
            email: `testuser${Date.now()}@example.com`,
            password: 'TestPassword123',
            role: 'Attendee',
            phone: '1234567890',
            location: 'Test City'
        };

        const registerResponse = await axios.post(`${API_URL}/auth/register`, registerData, {
            withCredentials: true,
            validateStatus: () => true // Accept any status
        });

        console.log('Registration Response Status:', registerResponse.status);
        console.log('Registration Response Data:', JSON.stringify(registerResponse.data, null, 2));
        console.log('Registration Cookies:', registerResponse.headers['set-cookie']);

        // Extract token from response
        const token = registerResponse.data.token;
        const cookies = registerResponse.headers['set-cookie'];

        if (registerResponse.status === 201 && token) {
            console.log('✓ Registration successful with token!\n');
        } else {
            console.log('✗ Registration failed or no token received\n');
            return;
        }

        // Test 2: Access protected route with token
        console.log('2. Testing /auth/me with token...');
        const meResponse = await axios.get(`${API_URL}/auth/me`, {
            headers: {
                Cookie: cookies ? cookies[0] : `token=${token}`
            },
            withCredentials: true,
            validateStatus: () => true
        });

        console.log('Me Response Status:', meResponse.status);
        console.log('Me Response Data:', JSON.stringify(meResponse.data, null, 2));

        if (meResponse.status === 200 && meResponse.data.success) {
            console.log('✓ Authentication working! User data retrieved.\n');
        } else {
            console.log('✗ Failed to retrieve user data\n');
        }

        // Test 3: Login with the same user
        console.log('3. Testing Login...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: registerData.email,
            password: registerData.password
        }, {
            withCredentials: true,
            validateStatus: () => true
        });

        console.log('Login Response Status:', loginResponse.status);
        console.log('Login Response Data:', JSON.stringify(loginResponse.data, null, 2));
        console.log('Login Cookies:', loginResponse.headers['set-cookie']);

        if (loginResponse.status === 200 && loginResponse.data.token) {
            console.log('✓ Login successful!\n');
        } else {
            console.log('✗ Login failed\n');
        }

        console.log('=== All Tests Completed ===');

    } catch (error) {
        console.error('Error during testing:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

testAuthentication();
