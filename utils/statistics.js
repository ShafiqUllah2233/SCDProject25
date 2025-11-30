const fs = require('fs').promises;
const path = require('path');

async function displayStatistics() {
    try {
        const vaultPath = path.join(__dirname, '../data/vault.json');
        
        // Read vault data
        const data = await fs.readFile(vaultPath, 'utf8');
        const records = JSON.parse(data);

        // Get file stats for last modified time
        const fileStats = await fs.stat(vaultPath);

        // If no records, show empty stats
        if (records.length === 0) {
            console.log("\n📊 Vault Statistics:");
            console.log("═".repeat(60));
            console.log("Total Records: 0");
            console.log("The vault is empty.");
            console.log("═".repeat(60) + "\n");
            return;
        }

        // Calculate statistics
        const totalRecords = records.length;
        
        const lastModified = fileStats.mtime.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Find longest name
        const longestName = records.reduce((longest, record) => {
            return record.name.length > longest.length ? record.name : longest;
        }, '');

        // Find earliest and latest creation dates
        const dates = records.map(r => new Date(r.createdAt));
        const earliest = new Date(Math.min(...dates));
        const latest = new Date(Math.max(...dates));

        const formatDate = (date) => {
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        // Display statistics
        console.log("\n📊 Vault Statistics:");
        console.log("═".repeat(60));
        console.log(`📦 Total Records:        ${totalRecords}`);
        console.log(`🕒 Last Modified:        ${lastModified}`);
        console.log(`📏 Longest Name:         ${longestName} (${longestName.length} characters)`);
        console.log(`📅 Earliest Record:      ${formatDate(earliest)}`);
        console.log(`📅 Latest Record:        ${formatDate(latest)}`);
        console.log("═".repeat(60) + "\n");

    } catch (error) {
        console.error("❌ Error displaying statistics:", error.message);
    }
}

module.exports = { displayStatistics };