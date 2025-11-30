const fs = require('fs').promises;
const path = require('path');

async function createBackup() {
    try {
        // Ensure backups directory exists
        const backupDir = path.join(__dirname, '../backups');
        await fs.mkdir(backupDir, { recursive: true });

        // Generate timestamp for filename
        const now = new Date();
        const timestamp = now.toISOString()
            .replace(/:/g, '-')      // Replace colons
            .replace(/\..+/, '')      // Remove milliseconds
            .replace('T', '_');       // Replace T with underscore

        const backupFileName = `backup_${timestamp}.json`;
        const backupPath = path.join(backupDir, backupFileName);

        // Read current vault data
        const vaultPath = path.join(__dirname, '../data/vault.json');
        const vaultData = await fs.readFile(vaultPath, 'utf8');

        // Write backup file
        await fs.writeFile(backupPath, vaultData, 'utf8');

        console.log(`\n💾 Backup created successfully: ${backupFileName}`);
        
        return backupPath;

    } catch (error) {
        console.error("❌ Error creating backup:", error.message);
        return null;
    }
}

module.exports = { createBackup };