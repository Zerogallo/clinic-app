const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = process.argv[2];
  if (!password) {
    console.log('Uso: node utils/hashPassword.js "sua_senha"');
    process.exit(1);
  }
  
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash gerado:', hash);
}

hashPassword();