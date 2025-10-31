// scripts/generate-hash.js
const bcrypt = require('bcryptjs');

// Pegue a senha do argumento da linha de comando
const password = process.argv[2];

if (!password) {
  console.error('ERRO: Por favor, forneça uma senha como argumento.');
  console.log('Uso: node scripts/generate-hash.js "sua-senha-secreta-aqui"');
  process.exit(1);
}

// Gera o hash (10 rounds de salt)
const hash = bcrypt.hashSync(password, 10);

console.log(`Senha Original: ${password}`);
console.log('---');
console.log(`Password Hash: ${hash}`);
console.log('---');
console.log('Copie o hash acima (começando com $2a...) para o seu banco.');
