require('dotenv').config();
const readline = require('readline');
const fs = require('fs').promises;
const path = require('path');
const { connectMongo, closeMongo, isMongoConnected } = require('./db/mongo');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

const VAULT_PATH = path.join(__dirname, 'data', 'vault.json');
const BACKUP_DIR = path.join(__dirname, 'backups');

// Read vault data
async function readVault() {
    try {
        const data = await fs.readFile(VAULT_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Write vault data
async function writeVault(records) {
    await fs.writeFile(VAULT_PATH, JSON.stringify(records, null, 2));
}

// Create backup
async function createBackup() {
    try {
        await fs.mkdir(BACKUP_DIR, { recursive: true });
        
        const now = new Date();
        const timestamp = now.toISOString()
            .replace(/:/g, '-')
            .replace(/\..+/, '')
            .replace('T', '_');
        
        const backupFileName = `backup_${timestamp}.json`;
        const backupPath = path.join(BACKUP_DIR, backupFileName);
        
        const vaultData = await fs.readFile(VAULT_PATH, 'utf8');
        await fs.writeFile(backupPath, vaultData);
        
        console.log(`\n💾 Backup created successfully: ${backupFileName}`);
    } catch (error) {
        console.error("Error creating backup:", error.message);
    }
}

// SEARCH FUNCTIONALITY
async function searchRecords() {
    const keyword = await question("\nEnter search keyword: ");
    
    const records = await readVault();
    
    const matches = records.filter(record => 
        record.name.toLowerCase().includes(keyword.toLowerCase()) ||
        record.id.toString().includes(keyword)
    );
    
    if (matches.length === 0) {
        console.log("\nNo records found.");
        return;
    }
    
    console.log(`\nFound ${matches.length} matching records:`);
    matches.forEach((record, index) => {
        console.log(`${index + 1}. ID: ${record.id} | Name: ${record.name} | Created: ${record.createdAt}`);
    });
}

// SORT FUNCTIONALITY
async function sortRecords() {
    console.log("\nChoose field to sort by:");
    console.log("1. Name");
    console.log("2. Creation Date");
    const fieldChoice = await question("Enter choice (1-2): ");
    
    console.log("\nChoose order:");
    console.log("1. Ascending");
    console.log("2. Descending");
    const orderChoice = await question("Enter choice (1-2): ");
    
    const field = fieldChoice === '1' ? 'name' : 'date';
    const order = orderChoice === '1' ? 'Ascending' : 'Descending';
    
    const records = await readVault();
    const sorted = [...records];
    
    if (field === 'name') {
        sorted.sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);
            return orderChoice === '1' ? comparison : -comparison;
        });
    } else {
        sorted.sort((a, b) => {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            const comparison = dateA - dateB;
            return orderChoice === '1' ? comparison : -comparison;
        });
    }
    
    console.log(`\nChoose field to sort by: ${field === 'name' ? 'Name' : 'Creation Date'}`);
    console.log(`Choose order: ${order}`);
    console.log("\nSorted Records:");
    sorted.forEach((record, index) => {
        console.log(`${index + 1}. ID: ${record.id} | Name: ${record.name}`);
    });
}

// EXPORT FUNCTIONALITY
async function exportData() {
    const records = await readVault();
    
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    let content = '';
    content += '═'.repeat(70) + '\n';
    content += '                    VAULT DATA EXPORT\n';
    content += '═'.repeat(70) + '\n\n';
    content += `Export Date & Time: ${formattedDate}\n`;
    content += `Total Records: ${records.length}\n`;
    content += `File Name: export.txt\n`;
    content += '─'.repeat(70) + '\n\n';
    content += 'RECORDS:\n';
    content += '═'.repeat(70) + '\n\n';
    
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
    
    content += '═'.repeat(70) + '\n';
    content += 'End of Export\n';
    
    const exportPath = path.join(__dirname, 'export.txt');
    await fs.writeFile(exportPath, content);
    
    console.log('\nData exported successfully to export.txt');
}

// STATISTICS FUNCTIONALITY
async function displayStatistics() {
    const records = await readVault();
    const fileStats = await fs.stat(VAULT_PATH);
    
    if (records.length === 0) {
        console.log("\nVault Statistics:");
        console.log("--------------------------");
        console.log("Total Records: 0");
        console.log("The vault is empty.");
        return;
    }
    
    const lastModified = fileStats.mtime.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const longestName = records.reduce((longest, record) => {
        return record.name.length > longest.length ? record.name : longest;
    }, '');
    
    const dates = records.map(r => new Date(r.createdAt));
    const earliest = new Date(Math.min(...dates));
    const latest = new Date(Math.max(...dates));
    
    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };
    
    console.log("\nVault Statistics:");
    console.log("--------------------------");
    console.log(`Total Records: ${records.length}`);
    console.log(`Last Modified: ${lastModified}`);
    console.log(`Longest Name: ${longestName} (${longestName.length} characters)`);
    console.log(`Earliest Record: ${formatDate(earliest)}`);
    console.log(`Latest Record: ${formatDate(latest)}`);
}

// ADD RECORD
async function addRecord() {
    const name = await question("\nEnter name: ");
    const id = Date.now();
    const createdAt = new Date().toISOString().split('T')[0];
    
    const records = await readVault();
    records.push({ id, name, createdAt });
    
    await writeVault(records);
    await createBackup();
    
    console.log(`\n✅ Record added successfully! ID: ${id}`);
}

// VIEW ALL RECORDS
async function viewRecords() {
    const records = await readVault();
    
    if (records.length === 0) {
        console.log("\nNo records found.");
        return;
    }
    
    console.log("\nAll Records:");
    console.log("─".repeat(60));
    records.forEach((record, index) => {
        console.log(`${index + 1}. ID: ${record.id} | Name: ${record.name} | Created: ${record.createdAt}`);
    });
    console.log("─".repeat(60));
}

// DELETE RECORD
async function deleteRecord() {
    const id = await question("\nEnter record ID to delete: ");
    
    const records = await readVault();
    const filteredRecords = records.filter(r => r.id.toString() !== id);
    
    if (records.length === filteredRecords.length) {
        console.log("\n❌ Record not found.");
        return;
    }
    
    await writeVault(filteredRecords);
    await createBackup();
    
    console.log("\n✅ Record deleted successfully!");
}

// MENU
async function displayMenu() {
    console.log("\n╔════════════════════════════════════════╗");
    console.log("║       VAULT MANAGEMENT SYSTEM          ║");
    console.log("╚════════════════════════════════════════╝");
    console.log("1. Add Record");
    console.log("2. View All Records");
    console.log("3. Delete Record");
    console.log("4. Search Records");
    console.log("5. Sort Records");
    console.log("6. Export Data");
    console.log("7. View Vault Statistics");
    console.log("8. Exit");
    console.log("═".repeat(42));
}

// MAIN FUNCTION
async function main() {
    console.log("\n🚀 Starting Vault Management System...\n");
    
    try {
        await connectMongo();
        
        let running = true;
        
        while (running) {
            await displayMenu();
            const choice = await question("Enter your choice: ");
            
            switch(choice) {
                case '1':
                    await addRecord();
                    break;
                case '2':
                    await viewRecords();
                    break;
                case '3':
                    await deleteRecord();
                    break;
                case '4':
                    await searchRecords();
                    break;
                case '5':
                    await sortRecords();
                    break;
                case '6':
                    await exportData();
                    break;
                case '7':
                    await displayStatistics();
                    break;
                case '8':
                    console.log("\n👋 Goodbye!");
                    running = false;
                    break;
                default:
                    console.log("\n❌ Invalid choice. Please try again.");
            }
        }
        
    } catch (error) {
        console.error("\n❌ Application error:", error.message);
    } finally {
        await closeMongo();
        rl.close();
    }
}

main();