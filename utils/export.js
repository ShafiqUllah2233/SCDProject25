const fs = require('fs').promises;
const path = require('path');

async function exportData() {
    try {
        // Read vault data
        const vaultPath = path.join(__dirname, '../data/vault.json');
        const data = await fs.readFile(vaultPath, 'utf8');
        const records = JSON.parse(data);

        // Get current date/time
        const now = new Date();
        const formattedDate = now.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // Build export content
        let content = '';
        content += '╔════════════════════════════════════════════════════════════╗\n';
        content += '║                    VAULT DATA EXPORT                       ║\n';
        content += '╚════════════════════════════════════════════════════════════╝\n\n';
        content += `📅 Export Date & Time: ${formattedDate}\n`;
        content += `📊 Total Records: ${records.length}\n`;
        content += `📁 File Name: export.txt\n`;
        content += `${'─'.repeat(60)}\n\n`;
        
        content += '📋 RECORDS:\n';
        content += '═'.repeat(60) + '\n\n';

        if (records.length === 0) {
            content += '   No records found in vault.\n\n';
        } else {
            records.forEach((record, index) => {
                content += `Record #${index + 1}\n`;
                content += `${'─'.repeat(40)}\n`;
                content += `   ID:         ${record.id}\n`;
                content += `   Name:       ${record.name}\n`;
                content += `   Created:    ${record.createdAt}\n`;
                if (record.updatedAt) {
                    content += `   Updated:    ${record.updatedAt}\n`;
                }
                content += '\n';
            });
        }

        content += '═'.repeat(60) + '\n';
        content += 'End of Export\n';

        // Write to export.txt in root directory
        const exportPath = path.join(__dirname, '../export.txt');
        await fs.writeFile(exportPath, content, 'utf8');

        console.log("\n✅ Data exported successfully to export.txt");
        console.log(`📍 Location: ${exportPath}\n`);

    } catch (error) {
        console.error("❌ Error exporting data:", error.message);
    }
}

module.exports = { exportData };