const jwt = require('jsonwebtoken');

// Test JWT token structure
const testToken = process.argv[2];

if (!testToken) {
    console.log('Usage: node verify-jwt.js <token>');
    process.exit(1);
}

try {
    // Decode without verification (just to see payload)
    const decoded = jwt.decode(testToken);

    console.log('=== JWT Token Structure ===\n');
    console.log('Decoded Payload:');
    console.log(JSON.stringify(decoded, null, 2));

    console.log('\n=== Verification ===');
    console.log('✓ Contains userId (id):', decoded.id ? 'YES' : 'NO');
    console.log('✓ Contains role:', decoded.role ? 'YES' : 'NO');
    console.log('✓ Has expiration:', decoded.exp ? 'YES' : 'NO');
    console.log('✓ Has issued at:', decoded.iat ? 'YES' : 'NO');

    if (decoded.id && decoded.role) {
        console.log('\n✅ JWT token structure is CORRECT!');
        console.log(`   User ID: ${decoded.id}`);
        console.log(`   Role: ${decoded.role}`);
    } else {
        console.log('\n❌ JWT token structure is INCORRECT!');
    }

    // Verify signature
    const verified = jwt.verify(testToken, process.env.JWT_SECRET || 'supersecretkey123');
    console.log('\n✓ Signature verification: PASSED');

} catch (error) {
    console.error('Error decoding token:', error.message);
    process.exit(1);
}
