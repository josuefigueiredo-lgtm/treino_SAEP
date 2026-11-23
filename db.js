const mysql = require('mysql2');


const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'R.odrigo_18',
  database: 'oficina_mecanica',
  dateStrings: true
});

module.exports = pool.promise();