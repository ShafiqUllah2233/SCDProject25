const fs = require('fs').promises;
const path = require('path');

async function searchRecords(keyword) {
    try {
        // Read vault.json
        const vaultPath = path.join(__dirname, '../data/vault.json');
        const data = await fs.readFile(vaultPath, 'utf8');
        const records = JSON.parse(data);

        // Search (case-insensitive)
        const matches = records.filter(record => 
            record.name.toLowerCase().includes(keyword.toLowerCase()) ||
            record.id.toString().includes(keyword)
        );

        if (matches.length === 0) {
            console.log("\n❌ No records found.");
            return;
        }

        console.log(`\n✅ Found ${matches.length} matching record(s):`);
        console.log("═".repeat(60));
        
        matches.forEach((record, index) => {
            console.log(`${index + 1}. ID: ${record.id} | Name: ${record.name} | Created: ${record.createdAt}`);
        });
        console.log("═".repeat(60));

    } catch (error) {
        console.error("❌ Error searching records:", error.message);
    }
}

module.exports = { searchRecords };