import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const task = process.argv[2];

if (!task) {
  console.error('Usage: node scripts/gradle-android.mjs <gradle-task>');
  process.exit(1);
}

const androidDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'android');

if (!existsSync(androidDir)) {
  console.error('android/ not found. Run: npm run prebuild');
  process.exit(1);
}

const gradle = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';

execSync(`${gradle} ${task}`, { cwd: androidDir, stdio: 'inherit', shell: true });
