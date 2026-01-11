const fs = require('fs');
const path = require('path');

function testRequire(filePath) {
    try {
        console.log(`Checking: ${filePath}`);
        require(filePath);
        console.log(`✅ Success: ${filePath}`);
    } catch (err) {
        console.error(`❌ Error in ${filePath}:`);
        console.error(err);
        process.exit(1);
    }
}

const routesDir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(routesDir);

files.forEach(file => {
    if (file.endsWith('.js')) {
        testRequire('./' + path.join('src', 'routes', file));
    }
});

console.log('All routes loaded successfully!');
