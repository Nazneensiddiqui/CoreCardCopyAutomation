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

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

//********************************************************* */
app.post('/check-path', (req, res) => {
  console.log(req.body)
  const { pathToCheck } = req.body;
  if (!pathToCheck) {
    return res.status(400).json({ exists: false, message: 'No path provided' });
  }

  const exists = fs.existsSync(pathToCheck);
  return res.json({ exists });
});


//********************************************************** */



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

app.post('/copy-folders', async (req, res) => {
  const tasks = req.body.tasks;
  const details = {};

  try {
    for (const [moduleName, paths] of Object.entries(tasks)) {
      const sourceStats = getFolderStats(paths.source);
      const start = Date.now();

      await fs.copy(paths.source, paths.destination);

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

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
