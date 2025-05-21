// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const fs = require('fs-extra'); // better alternative to fs
// const app = express();
 
// app.use(cors());
// app.use(bodyParser.json());
 
// app.post('/copy-folders', async (req, res) => {
//   const tasks = req.body.tasks;
 
//   try {
//     for (const [moduleName, paths] of Object.entries(tasks)) {
//       await fs.copy(paths.source, paths.destination);
//       console.log(`${moduleName} copied successfully.`);
//     }
//     res.json({ message: "All folders copied successfully!" });
//   } catch (error) {
//     console.error("Error during copy:", error);
//     res.status(500).json({ message: "Error occurred while copying." });
//   }
// });
 
// app.listen(8000, () => {
//   console.log("Server is running on port 8000");
// });
// **********************************************************************************************************************
// const express = require('express');
// const app = express();
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const fs = require('fs-extra');
// const path = require('path');


// app.use(cors());
// app.use(bodyParser.json());

// //********************* */
// app.post('/check-path', (req, res) => {
//   console.log(req.body)
//   const { pathToCheck } = req.body;
//   if (!pathToCheck) {
//     return res.status(400).json({ exists: false, message: 'No path provided' });
//   }

//   const exists = fs.existsSync(pathToCheck);
//   return res.json({ exists });
// });


// //********************************************************** */



// const getFolderStats = (dirPath) => {
//   let totalFiles = 0;
//   let totalFolders = 0;

//   const walk = (dir) => {
//     const items = fs.readdirSync(dir, { withFileTypes: true });
//     for (const item of items) {
//       const fullPath = path.join(dir, item.name);
//       if (item.isDirectory()) {
//         totalFolders++;
//         walk(fullPath);
//       } else {
//         totalFiles++;
//       }
//     }
//   };

//   try {
//     walk(dirPath);
//   } catch (e) {
//     // Ignore inaccessible dirs
//   }

//   return { totalFiles, totalFolders };
// };

// app.post('/copy-folders', async (req, res) => {
//   const tasks = req.body.tasks;
//   const details = {};

//   try {
//     for (const [moduleName, paths] of Object.entries(tasks)) {
//       const sourceStats = getFolderStats(paths.source);
//       const start = Date.now();

//       await fs.copy(paths.source, paths.destination);

//       const end = Date.now();
//       const destinationStats = getFolderStats(paths.destination);

//       details[moduleName] = {
//         sourceFiles: sourceStats.totalFiles,
//         sourceFolders: sourceStats.totalFolders,
//         destinationFiles: destinationStats.totalFiles,
//         destinationFolders: destinationStats.totalFolders,
//         durationSeconds: (end - start) / 1000
//       };

//       console.log(`${moduleName} copied successfully.`);
//     }

//     res.json({
//       message: "All folders copied successfully!",
//       details
//     });
//   } catch (error) {
//     console.error("Error during copy:", error);
//     res.status(500).json({ message: "Error occurred while copying." });
//   }
// });

// app.listen(8000, () => {
//   console.log("Server is running on port 8000");
// });


const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

app.use(express.json()); 
// Middleware
app.use(cors());
app.use(bodyParser.json());

const { sql, poolPromise } = require('./db');

//backup folder Helper function to get current date and time
 const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
   const seconds = String(now.getSeconds()).padStart(2, '0');
return `${day}-${month}-${year}_${hours}-${minutes}-${seconds}`;
};

// Helper function to get folder stats
const getFolderStats = (dirPath) => {
  let totalFiles = 0;
  let totalFolders = 0;

  const walk = (dir) => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        totalFolders++;
        walk(fullPath);
      } else {
        totalFiles++;
      }
    }
  };

  try {
    walk(dirPath);
  } catch (e) {
    // Ignore inaccessible dirs
  }

  return { totalFiles, totalFolders };
};

const copyWithRenaming = async (source, destination) => {
  try {
    // If destination exists and is not empty, rename it
    if (fs.existsSync(destination)) {
      const stats = fs.statSync(destination);
      const contents = fs.readdirSync(destination);

      if (stats.isDirectory() && contents.length > 0) {
        const backupDestination = `${destination}_backup_${getCurrentDateTime()}`;
        await fs.rename(destination, backupDestination);
        console.log(`Existing folder renamed to: ${backupDestination}`);
      }
    }

    // Copy the source to destination
    await fs.copy(source, destination);
    console.log(`New folder copied from ${source} to ${destination}`);
  } catch (error) {
    console.error("❌ Error during folder copy operation:", error);
    throw error;
  }
};


// Route to check if a path exists
// app.post('/check-path', (req, res) => {
//   console.log(req.body)
//   const { pathToCheck } = req.body;
//   if (!pathToCheck) {
//     return res.status(400).json({ exists: false, message: 'No path provided' });
//   }

  // const exists = fs.existsSync(pathToCheck);
  // return res.json({ exists });
  // });

  app.post('/check-path', (req, res) => {
  const { pathToCheck } = req.body;
  if (!pathToCheck) {
    return res.status(400).json({ exists: false, message: 'No path provided' });
  }

  const exists = fs.existsSync(pathToCheck);
  if (exists) {
    res.json({ exists: true, message: `The file or folder at ${pathToCheck} exists.` });
  } else {
    res.json({ exists: false, message: `The file or folder at ${pathToCheck} does not exist.` });
  }
});



// Route to copy folders
app.post('/copy-folders', async (req, res) => {
  const tasks = req.body.tasks;
  const details = {};

  try {
    for (const [moduleName, paths] of Object.entries(tasks)) {
      const sourceStats = getFolderStats(paths.source);
      const start = Date.now();

      // Call the copyWithRenaming function to handle renaming and copying
      await copyWithRenaming(paths.source, paths.destination);

      const end = Date.now();
      const destinationStats = getFolderStats(paths.destination);

      details[moduleName] = {
        sourceFiles: sourceStats.totalFiles,
        sourceFolders: sourceStats.totalFolders,
        destinationFiles: destinationStats.totalFiles,
        destinationFolders: destinationStats.totalFolders,
        durationSeconds: (end - start) / 1000
      };

      console.log(`${moduleName} copied successfully.`);
    }

    res.json({
      message: "All folders copied successfully!",
      details
    });
  } catch (error) {
    console.error("Error during copy:", error);
    res.status(500).json({ message: "Error occurred while copying." });
  }
});

// *************************************dbRestore******************************************************************
app.post('/db-restore', async (req, res) => {
  
  console.log(req.body)
  try {
    console.log('Attempting to restore DB...');

    const pool = await poolPromise;
    console.log('Connection pool established successfully.');

      const {dbLocation, dbName, mdfPath,ldfPath }=req.body

    console.log(`Restoring DB: ${dbName}`);
    console.log(`MDF Path: ${mdfPath}`);
    console.log(`LDF Path: ${ldfPath}`);
    console.log(`Backup Path: ${dbLocation}`);

    // Step 1: Fetch logical file names using RESTORE FILELISTONLY
    const fileListQuery = `RESTORE FILELISTONLY FROM DISK = N'${dbLocation}'`;
    const fileListResult = await pool.request().query(fileListQuery);

    if (!fileListResult.recordset || fileListResult.recordset.length < 2) {
      throw new Error('Unable to fetch logical file names from backup.');
    }

    const logicalDataName = fileListResult.recordset[0].LogicalName;
    const logicalLogName = fileListResult.recordset[1].LogicalName;

    console.log(`Logical Data File: ${logicalDataName}`);
    console.log(`Logical Log File: ${logicalLogName}`);

    // Step 2: Build the RESTORE DATABASE query
    const restoreQuery = `
      RESTORE DATABASE [${dbName}]
      FROM DISK = N'${dbLocation}'
      WITH 
        MOVE N'${logicalDataName}' TO N'${mdfPath}',
        MOVE N'${logicalLogName}' TO N'${ldfPath}',
        REPLACE,
       STATS = 10;
    `;

    // Step 3: Execute restore
    // const restoreResult = await pool.request().query(restoreQuery);
    const request = pool.request();
    request.timeout = 0; // ⬅ 0 means infinite wait
    const restoreResult = await request.query(restoreQuery);


    console.log('✅ Restore successful');
    res.status(200).json({ message: `✅ Database ${dbName} restored successfully.` });

  } catch (error) {
    console.error('❌ Error during restore:', error);
    res.status(500).json({ message: '❌ Failed to restore database.', error: error.message });
  }
});


// Start the server
app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
