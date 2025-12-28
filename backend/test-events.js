const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api/events';

const mainEvent = {
    title: 'Main Event Strategy',
    description: 'Primary event plan',
    date: '2025-06-01',
    time: '09:00 AM',
    location: 'Conference Hall A',
    organizer: 'HQ',
    capacity: 500,
    isTemplate: true // Create as a template first
};

async function runTests() {
    console.log('--- Starting Enhanced Verification ---');

    // 1. Create Template Event
    console.log('\n1. Creating Template Event...');
    const createRes = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mainEvent)
    });
    const createData = await createRes.json();

    if (!createData.success) {
        console.error('Failed to create template', createData);
        return;
    }
    const templateId = createData.data._id;
    console.log('Template Created ID:', templateId);
    console.log('Is Template:', createData.data.isTemplate);

    // 2. Create Branch Event from Template
    console.log('\n2. Creating Branch Event from Template...');
    const branchEvent = {
        title: 'Alternative Outdoor Plan',
        location: 'City Park', // Override location
        templateId: templateId,
        parentEvent: templateId // Link to parent
    };

    const branchRes = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchEvent)
    });
    const branchData = await branchRes.json();

    if (!branchData.success) {
        console.error('Failed to create branch', branchData);
        return;
    }
    const branchId = branchData.data._id;
    console.log('Branch Created ID:', branchId);
    console.log('Inherited Date:', branchData.data.date === mainEvent.date);
    console.log('Overridden Location:', branchData.data.location === 'City Park');
    console.log('Is Template (should be false):', branchData.data.isTemplate);

    // 3. Update Branch Event to trigger Lineage
    console.log('\n3. Updating Branch Event (Lineage Check)...');
    const updateRes = await fetch(`${API_URL}/${branchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity: 600, description: 'Increased capacity for outdoor' })
    });
    const updateData = await updateRes.json();

    if (!updateData.success) {
        console.error('Failed to update branch', updateData);
        return;
    }
    console.log('Update Success:', updateData.success);
    console.log('Lineage Length:', updateData.data.lineage?.length);
    if (updateData.data.lineage?.length > 0) {
        console.log('Latest Change:', updateData.data.lineage[0].changes);
    }

    // 4. Cleanup
    console.log('\n4. Cleaning Up...');
    await fetch(`${API_URL}/${templateId}`, { method: 'DELETE' });
    await fetch(`${API_URL}/${branchId}`, { method: 'DELETE' });
    console.log('Cleanup Complete');

    console.log('\n--- Verification Complete ---');
}

runTests().catch(console.error);
