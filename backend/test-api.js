// Native fetch is used (Node 18+)

const API_URL = 'http://localhost:5000/api';

async function testAPI() {
    console.log('--- STARTING API TEST ---');

    // 1. Register User
    console.log('\n[1] Testing Registration...');
    const randomEmail = `test${Date.now()}@example.com`;
    const userPayload = {
        name: 'Test Organizer',
        email: randomEmail,
        password: 'password123',
        role: 'Organizer'
    };

    let token = '';

    try {
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userPayload)
        });
        const regData = await regRes.json();

        if (regRes.ok) {
            console.log('✅ Registration Successful:', regData.user.email);
            token = regData.token;
        } else {
            console.error('❌ Registration Failed:', regData);
            console.error('Status:', regRes.status);
            return;
        }

        // 2. Login (Optional since register returns token, but good to test)
        console.log('\n[2] Testing Login...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: randomEmail, password: 'password123' })
        });
        const loginData = await loginRes.json();

        if (loginRes.ok) {
            console.log('✅ Login Successful');
            token = loginData.token; // Update token just in case
        } else {
            console.error('❌ Login Failed:', loginData);
            return;
        }

        // 3. Create Event
        console.log('\n[3] Testing Event Creation...');
        const eventPayload = {
            title: 'Test Event 2025',
            description: 'Automated test event',
            date: '2025-12-25',
            time: '10:00',
            location: 'Test Venue',
            capacity: 50,
            ticketTypes: [{ name: 'VIP', price: 100, quantity: 10 }]
        };

        const eventRes = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(eventPayload)
        });
        const eventData = await eventRes.json();

        if (eventRes.ok) {
            console.log('✅ Event Creation Successful:', eventData.data.title);
            console.log('   Event ID:', eventData.data._id);
        } else {
            console.error('❌ Event Creation Failed:', eventData);
        }

        // 4. Get Events
        console.log('\n[4] Testing Get Events...');
        const getRes = await fetch(`${API_URL}/events`);
        const getData = await getRes.json();

        if (getRes.ok) {
            console.log(`✅ Get Events Successful. Found ${getData.count} events.`);
        } else {
            console.error('❌ Get Events Failed:', getData);
        }

    } catch (err) {
        console.error('❌ API Test Error:', err);
    }

    console.log('\n--- TEST COMPLETE ---');
}

testAPI();
