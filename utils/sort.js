const fs = require('fs').promises;
const path = require('path');

async function sortRecords(field, order) {
    try {
        const vaultPath = path.join(__dirname, '../data/vault.json');
        const data = await fs.readFile(vaultPath, 'utf8');
        const records = JSON.parse(data);

        // Create a copy to avoid modifying original
        const sorted = [...records];

        // Sort based on field
        if (field.toLowerCase() === 'name') {
            sorted.sort((a, b) => {
                const comparison = a.name.localeCompare(b.name);
                return order.toLowerCase() === 'asc' ? comparison : -comparison;
            });
        } else if (field.toLowerCase() === 'date') {
            sorted.sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                const comparison = dateA - dateB;
                return order.toLowerCase() === 'asc' ? comparison : -comparison;
            });
        } else {
            console.log("❌ Invalid field. Use 'name' or 'date'.");
            return;
        }

        // Display sorted records
        console.log(`\n📋 Sorted Records (by ${field} - ${order}):`);
        console.log("═".repeat(60));
        
        sorted.forEach((record, index) => {
            console.log(`${index + 1}. ID: ${record.id} | Name: ${record.name} | Created: ${record.createdAt}`);
        });
        console.log("═".repeat(60));
        console.log("ℹ️  Note: Original vault order is unchanged.\n");

    } catch (error) {
        console.error("❌ Error sorting records:", error.message);
    }
}

module.exports = { sortRecords };