// const sql = require('mssql');
// require('dotenv').config();


// const dbConfig = {
//   server: process.env.SERVER,  // The SQL Server name or IP address
//   database: 'master',     // Your target database
//   options: {
//     encrypt: true,         // Use encryption
//     trustServerCertificate: true, // Trust the server certificate
     
//   },
//   authentication: {
//     type: 'ntlm',           // Use NTLM (Windows Authentication)
//     options: {
//       domain: process.env.DOMAIN,   // Your domain (if necessary)
//       userName: process.env.DB_USER,  // Your Windows username
//       password: process.env.DB_PASS,  // Your password
//       },
//        requestTimeout: 0
   
//   }
  
// };



// const poolPromise = new sql.ConnectionPool(dbConfig)
//   .connect()
//   .then(pool => {
//     console.log('Connected to SQL Server');
//     return pool;
//   })
//   .catch(err => {
//     console.error('Database connection failed:', err);
//     process.exit(1);
//   });

// module.exports = { sql, poolPromise };