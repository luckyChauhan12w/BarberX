import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
    console.log('✓ Logs directory created');

    fs.writeFileSync(path.join(logsDir, '.gitkeep'), '');
    console.log('✓ .gitkeep file created');
} else {
    console.log('✓ Logs directory already exists');
}