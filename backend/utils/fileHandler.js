const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// Garante que o diretório data existe
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Lê um arquivo JSON
async function readJSON(filename) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Arquivo não existe, retorna array vazio
      await writeJSON(filename, []);
      return [];
    }
    throw error;
  }
}

// Escreve em um arquivo JSON
async function writeJSON(filename, data) {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

module.exports = { readJSON, writeJSON };