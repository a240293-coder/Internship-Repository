const bcrypt = require('bcrypt');

const password = process.argv[2] || 'Abhijeet@1992';

bcrypt.hash(password, 10).then(hash => {
    console.log(`\nPassword: ${password}`);
    console.log(`Hash:     ${hash}`);
    console.log('\nCopy the Hash above and paste it into the password column in MySQL Workbench.');
});
