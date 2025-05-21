const sql = require('mssql');

const dbConfig = {
  server: 'BPLDEVDB01',  // The SQL Server name or IP address
  database: 'master',     // Your target database
  options: {
    encrypt: true,         // Use encryption
    trustServerCertificate: true, // Trust the server certificate
     
  },
  authentication: {
    type: 'ntlm',           // Use NTLM (Windows Authentication)
    options: {
      domain: 'NEWVISIONSOFT',   // Your domain (if necessary)
      userName: 'nazneen.bano',  // Your Windows username
      password: 'Core@!card01',  // Your password
      },
       requestTimeout: 0
   
  }
  
};



const poolPromise = new sql.ConnectionPool(dbConfig)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });

module.exports = { sql, poolPromise };