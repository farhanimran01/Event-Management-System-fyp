const fetch = require('node-fetch'); // You might need to install node-fetch if on older node, or use native fetch in Node 18+

const API_URL = 'http://localhost:5000/api/events';

const testEvent = {
    title: 'Test Event with Agenda',
    description: 'Testing the new agenda feature',
    date: '2025-01-01',
    time: '10:00 AM',
    location: 'Virtual',
    organizer: 'Test Runner',
    capacity: 100,
    agenda: [
        {
            title: 'Opening keynotes',
            startTime: '2025-01-01T10:00:00',
            endTime: '2025-01-01T11:00:00',
            description: 'Welcome speech',
            speaker: 'Jane Doe'
        }
    ],
    backupPlans: 'Switch to Zoom if platform fails'
};

async function runTests() {
    console.log('--- Starting Verification ---');

    // 1. Create Event
    console.log('\n1. Creating Event...');
    const createRes = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testEvent)
    });
    const createData = await createRes.json();
    console.log('Create Status:', createRes.status);
    console.log('Created ID:', createData.data?._id);

    if (!createData.success || !createData.data._id) {
        console.error('Failed to create event', createData);
        return;
    }
    const eventId = createData.data._id;

    // 2. Get All Events
    console.log('\n2. Fetching All Events...');
    const getAllRes = await fetch(API_URL);
    const getAllData = await getAllRes.json();
    console.log('Get All Success:', getAllData.success);
    console.log('Total Events:', getAllData.count);

    // 3. Get Single Event
    console.log('\n3. Fetching Created Event...');
    const getOneRes = await fetch(`${API_URL}/${eventId}`);
    const getOneData = await getOneRes.json();
    console.log('Agenda Title matched:', getOneData.data.agenda[0].title === testEvent.agenda[0].title);
    console.log('Backup Plan matched:', getOneData.data.backupPlans === testEvent.backupPlans);

    // 4. Update Event
    console.log('\n4. Updating Event...');
    const updateRes = await fetch(`${API_URL}/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Title' })
    });
    const updateData = await updateRes.json();
    console.log('Update Status:', updateRes.status);
    console.log('New Title:', updateData.data.title);

    // 5. Delete Event
    console.log('\n5. Deleting Event...');
    const deleteRes = await fetch(`${API_URL}/${eventId}`, {
        method: 'DELETE'
    });
    const deleteData = await deleteRes.json();
    console.log('Delete Status:', deleteRes.status);
    console.log('Delete Success:', deleteData.success);

    console.log('\n--- Verification Complete ---');
}

runTests().catch(console.error);
