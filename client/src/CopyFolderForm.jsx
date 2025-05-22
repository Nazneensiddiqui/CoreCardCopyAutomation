import { useState } from 'react';
import './CopyFolderForm.css';
import core from './images/corecard.jpg';


const modules = ["DSL", "WCF", "CoreMoney", "CoreAdmin", "SelfService", "PraxellAPI"];
const dbModules = ["CoreMoneyDB", "CoreIssueDB", "CoreAuthDB", "CoreLibraryDB", "dashBoardDB"];

const CopyFolderForm = () => {
  const [basePath, setBasePath] = useState('');
  const [selectedModules, setSelectedModules] = useState({});
  const [paths, setPaths] = useState({});
  const [message, setMessage] = useState('');
  const [dbDetails, setDbDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [copyDetails, setCopyDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [dbmessage, setdbMessage] = useState('');
  const [dbloading, setdbLoading] = useState(false);
 const [dbbasePath, setdbBasePath] = useState('');
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState("");
const [serverName, setServerName] = useState('')
const [dbTestMessage, setDbTestMessage] = useState('');

  const handleBasePathChange = (e) => {
    const value = e.target.value;
    setBasePath(value);

    setPaths((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach(mod => {
        updated[mod].source =
          mod === 'DSL'
            ? `${value}\\Application\\${mod}`
            : `${value}\\Application\\PublishCode\\${mod}`;
      });
      return updated;
    });
  };

  const handleCheckboxChange = async (mod, checked) => {
    setSelectedModules((prev) => ({ ...prev, [mod]: checked }));

    if (checked) {
      const sourcePath =
        mod === 'DSL'
          ? `${basePath}\\Application\\${mod}`
          : `${basePath}\\Application\\PublishCode\\${mod}`;

      // Call backend to check if the source path exists
      const res = await fetch('http://localhost:8000/check-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pathToCheck: sourcePath }),
      });

      const data = await res.json();

      if (data.exists) {
        setPaths((prev) => ({
          ...prev,
          [mod]: { source: sourcePath, destination: '' },
        }));
        setErrorMessage(''); // Clear any previous error
      } else {
        setErrorMessage(`❌ Source path for "${mod}" does not exist.`);
        setSelectedModules((prev) => {
          const updated = { ...prev };
          delete updated[mod];
          return updated;
        });
      }
    } else {
      setPaths((prev) => {
        const updated = { ...prev };
        delete updated[mod];
        return updated;
      });
    }
  };

  const handleDestinationChange = (mod, value) => {
    setPaths((prev) => ({
      ...prev,
      [mod]: { ...prev[mod], destination: value },
    }));
  };

 
  //****************** */ DB Restore Handlers********************************
const dbFileMap = {
  CoreMoneyDB: "\\Application\\DB\\MPE\\CM.bak",
  CoreIssueDB: "\\Application\\DB\\MPE\\CI.bak",
  CoreAuthDB: "\\Application\\DB\\MPE\\CAUTH.bak",
  CoreLibraryDB: "\\Application\\DB\\MPE\\CL.bak",
  dashBoardDB: "\\Application\\DB\\MPE\\DASHBOARD.bak"
};

const handleDbCheckboxChange = (dbKey, checked) => {
  setDbDetails((prev) => {
    const newDetails = { ...prev };

    if (checked) {
      // Sirf dbLocation ko fill karo, baaki fields ko default chhodo
      newDetails[dbKey] = {
        dbLocation: dbbasePath + (dbFileMap[dbKey] || ""), // dbLocation ko basePath ke saath append karo
      };
    } else {
      delete newDetails[dbKey]; // Agar checkbox uncheck ho to DB details hata do
    }

    return newDetails;
  });
};



  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    setCopyDetails(null);
    try {
      const res = await fetch('http://localhost:8000/copy-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: paths }),
      });

      const data = await res.json();
      setMessage(data.message || 'Copy completed!!');
      if (data.details) {
        setCopyDetails(data.details);
      }
    } catch (err) {
      setMessage('Error occurred while copying...');
    } finally {
      setLoading(false);
    }
  };

   //**************************DB connecting ********************************** */

 const handleTestDbConnection = async () => {
    setDbTestMessage("Testing connection...");

    try {
      const response = await fetch("http://localhost:8000/db-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          serverName,
        }),
      });

      const data = await response.json();
      setDbTestMessage(data.message || "✅ DB Connection successful");
    } catch (error) {
      setDbTestMessage("❌ Failed to connect to the database");
    }
  };

  // ********************DB Restore****************************
  const handleDbRestore = async () => {
  setdbLoading(true);
  setdbMessage('');

  try {
   for (const [key, {  dbLocation, dbName, mdfPath, ldfPath }] of Object.entries(dbDetails)) {
  if (!dbLocation || !dbName || !mdfPath || !ldfPath ) {
    setdbMessage('Please fill all fields (DB Location, name, MDF, LDF) for each selected DB.');
    setdbLoading(false);
    return;
  }

  const payload = {  dbLocation, dbName, mdfPath, ldfPath};

  const res = await fetch('http://localhost:8000/db-restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    });
 console.log(payload)
  const data = await res.json();
  setdbMessage((prev) => `${prev}\n${data.message}`);
}
  } catch (err) {
    console.error(err);
    setdbMessage('❌ Error occurred during DB restore.');
  } finally {
    setdbLoading(false);
  }
};


  const downloadSummary = () => {
    if (!copyDetails) return;

    let content = 'Copy Summary Report\n';
    content += '-----------------------------------------------------------\n';
    content += 'Module        Source(F/D)   Dest(F/D)   Time(s)   Match\n';
    content += '-----------------------------------------------------------\n';

    Object.entries(copyDetails).forEach(([mod, detail]) => {
      const src = `${detail.sourceFiles}/${detail.sourceFolders}`;
      const dest = `${detail.destinationFiles}/${detail.destinationFolders}`;
      const time = detail.durationSeconds.toFixed(2);
      const match =
        detail.sourceFiles === detail.destinationFiles &&
        detail.sourceFolders === detail.destinationFolders
          ? 'YES'
          : 'NO';

      content += `${mod.padEnd(14)} ${src.padEnd(13)} ${dest.padEnd(11)} ${time.padEnd(9)} ${match}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'copy_summary.txt';
    link.click();
  };

  return (
    <div className="form-container">
      <img src={core} width={180} height={80} alt="Core Card" style={{ marginBottom: '20px' }} />

      <div className="form-group">
        <label>Label Location:</label>
        <input
          type="text"
          className="input-field"
          placeholder="Enter Base Path"
          value={basePath}
          onChange={handleBasePathChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Select Modules:</label>
        <div className="checkbox-row">
          {modules.map((mod) => (
            <label key={mod} className="checkbox-inline">
              <input
                type="checkbox"
                checked={!!selectedModules[mod]}
                onChange={(e) => handleCheckboxChange(mod, e.target.checked)}
              />
              {mod}
            </label>
          ))}
        </div>
      </div>

      {/* Source existence message */}
      {errorMessage && <div className="error-message">{errorMessage}</div>}

      {Object.keys(paths).map((mod) => (
        <div key={mod} className="path-inputs">
          <input
            type="hidden"
            value={paths[mod].source}
            className="input-field"
            readOnly
          />
          <label>Destination Path:</label>
          <input
            type="text"
            placeholder={`Enter Destination Path for ${mod}`}
            value={paths[mod].destination}
            onChange={(e) => handleDestinationChange(mod, e.target.value)}
            className="input-field"
            required
          />
        </div>
      ))}

      <button onClick={handleSubmit} disabled={loading} className="submit-btn">
        {loading ? <span className="loader">Processing...</span> : <>🚀 Start Process</>}
      </button>

      {message && <p className="message">{message}</p>}

      {copyDetails && (
        <div className="summary-report">
          <h3>Copy Summary:</h3>
          {Object.entries(copyDetails).map(([mod, detail]) => (
            <div key={mod} className="summary-block">
              <h4>{mod}</h4>
              <p>📂 Source — {detail.sourceFolders} folders, {detail.sourceFiles} files</p>
              <p>📁 Destination — {detail.destinationFolders} folders, {detail.destinationFiles} files</p>
              <p>⏱️ Time Taken: {detail.durationSeconds.toFixed(2)} seconds</p>
              <p style={{ color: (detail.sourceFiles === detail.destinationFiles && detail.sourceFolders === detail.destinationFolders) ? 'green' : 'red' }}>
                {detail.sourceFiles === detail.destinationFiles && detail.sourceFolders === detail.destinationFolders
                  ? '✅ File & Folder count match'
                  : '❌ Mismatch detected'}
              </p>
            </div>
          ))}
          <button onClick={downloadSummary} className="submit-btn" style={{ marginTop: '10px' }}>
            📄 Download Summary (.txt)
          </button>
        </div>
      )}
{/* ******************************************DBRestor************************************ */}

<h4>Database Connect & Restore</h4>

<div className="db-connection-form">
      <div className="form-group-row">
        <div className="form-group half">
          <label>Username:</label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter Donaim\Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group half">
          <label>Password:</label>
          <input
            type="password"
            className="input-field"
            placeholder="Enter SQL Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="form-group half">
          <label>Server Name:</label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter SQL Server Name"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
          />
        </div>
      </div>

      <button onClick={handleTestDbConnection} className="submit-btn" >🔌 Test DB Connection</button>

      {dbTestMessage && <p className="message">{dbTestMessage}</p>}
    </div>
{/* ✅ New Input Field for Base Path */}
<div className="form-group">
  <label> Base Location:</label>
  <input
    type="text"
    className="input-field"
    placeholder="Enter Base Path"
    value={dbbasePath}
    onChange={(e) => setdbBasePath(e.target.value)}
  />
</div>

{/* ✅ Checkbox List */}
<div className="form-group">
  <label>Select Databases:</label>
  <div className="checkbox-row">
    {dbModules.map((db) => (
      <label key={db} className="checkbox-inline">
        <input
          type="checkbox"
          checked={!!dbDetails[db]}
          onChange={(e) => handleDbCheckboxChange(db, e.target.checked)}
        />
        {db}
      </label>
    ))}
  </div>
</div>

{/* ✅ DB Config Form */}
{Object.keys(dbDetails).length > 0 && (
  <>
    {Object.keys(dbDetails).map((key) => (
      <div key={key} className="db-config-block">
        <h4>{key}</h4>

        <div className="form-group">
          {/* <label>Database Location:</label> */}
          <input
            type="hidden"
            className="input-field"
            placeholder="Enter Database Location"
            value={dbDetails[key]?.dbLocation || ''}
            onChange={(e) =>
               setDbDetails((prev) => ({
                ...prev,
                [key]: { ...prev[key], dbLocation: e.target.value },
              }))
            }
          />
        </div>

        <div className="form-group">
          <label>Database Name:</label>
          <input
            type="text"
            className="input-field"
            placeholder="Enter DB Name"
            value={dbDetails[key]?.dbName || ''}
            onChange={(e) =>
              setDbDetails((prev) => ({
                ...prev,
                [key]: { ...prev[key], dbName: e.target.value },
              }))
            }
          />
        </div>

        <div className="form-group">
          <label>MDF File Path:</label>
          <input
            type="text"
            className="input-field"
            placeholder="Full path to MDF file"
            value={dbDetails[key]?.mdfPath || ''}
            onChange={(e) =>
              setDbDetails((prev) => ({
                ...prev,
                [key]: { ...prev[key], mdfPath: e.target.value },
              }))
            }
          />
        </div>

        <div className="form-group">
          <label>LDF File Path:</label>
          <input
            type="text"
            className="input-field"
            placeholder="Full path to LDF file"
            value={dbDetails[key]?.ldfPath || ''}
            onChange={(e) =>
              setDbDetails((prev) => ({
                ...prev,
                [key]: { ...prev[key], ldfPath: e.target.value },
              }))
            }
          />
        </div>
      </div>
    ))}
  </>
)}

<button onClick={handleDbRestore} disabled={dbloading} className="submit-btn"> 
  {dbloading ? 'Processing...' :  ' 🔄 DB Restore'}
</button>

{dbmessage && <p className="message">{dbmessage}</p>}


    </div>
  );
};

export default CopyFolderForm;
