// import  { useState } from 'react';
// import './CopyFolderForm.css';
// import core from './images/corecard.jpg';


 
// const modules = ["DSL", "WCF", "CoreMoney", "CoreAdmin", "SelfService", "PraxellAPI"];
 
// const CopyFolderForm = () => {
//   const [basePath, setBasePath] = useState('');
//   const [selectedModules, setSelectedModules] = useState({});
//   const [paths, setPaths] = useState({});
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);
 
//   const handleBasePathChange = (e) => {
//     const value = e.target.value;
//     setBasePath(value);
 
//     // If already selected, update their source paths
//     setPaths((prev) => {
//       const updated = { ...prev };
//       Object.keys(updated).forEach(mod => {
//         updated[mod].source =
//           mod === 'DSL'
//             ? `${value}\\Application\\${mod}`
//             : `${value}\\Application\\PublishCode\\${mod}`;
//       });
//       return updated;
//     });
//   };
 
//   const handleCheckboxChange = (mod, checked) => {
//     setSelectedModules((prev) => ({ ...prev, [mod]: checked }));
 
//     if (checked) {
//       const sourcePath =
//         mod === 'DSL'
//           ? `${basePath}\\Application\\${mod}`
//           : `${basePath}\\Application\\PublishCode\\${mod}`;
//       setPaths((prev) => ({
//         ...prev,
//         [mod]: { source: sourcePath, destination: '' }
//       }));
//     } else {
//       setPaths((prev) => {
//         const updated = { ...prev };
//         delete updated[mod];
//         return updated;
//       });
//     }
//   };
 
//   const handleDestinationChange = (mod, value) => {
//     setPaths((prev) => ({
//       ...prev,
//       [mod]: { ...prev[mod], destination: value }
//     }));
//   };
 
//   const handleSubmit = async () => {
//     setLoading(true);
//     setMessage('');
//     try {
// const res = await fetch('http://localhost:8000/copy-folders', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ tasks: paths })
//       });
 
//       const data = await res.json();
//       setMessage(data.message || 'Copy completed!');
//     } catch (err) {
//       setMessage('Error occurred while copying.');
//     } finally {
//       setLoading(false);
//     }
//   };
 
//   return (
//     <div className="form-container">
//       <img src={core} width={180} height={80} alt="Core Card" style={{ marginBottom: '20px' }} />
 
//       <div className="form-group">
//         <label>Base Source Path:</label>
//         <input
//           type="text"
//           className="input-field"
//           placeholder="Enter Base Path"
//           value={basePath}
//           onChange={handleBasePathChange}
//           required
//         />
//       </div>
 
//       <div className="form-group">
//         <label>Select Modules:</label>
//         <div className="checkbox-row">
//           {modules.map((mod) => (
//             <label key={mod} className="checkbox-inline">
//               <input
//                 type="checkbox"
//                 checked={!!selectedModules[mod]}
//                 onChange={(e) => handleCheckboxChange(mod, e.target.checked)}
//               />
//               {mod}
//             </label>
//           ))}
//         </div>
//       </div>
 
//       {Object.keys(paths).map((mod) => (
//         <div key={mod} className="path-inputs">
//           {/* <label>{mod} Source Path:</label> */}
//           <input
//             type="hidden"
//             value={paths[mod].source}
//             className="input-field"
//             readOnly
//           />
//           <label>Destination Path:</label>
//           <input
//             type="text"
//             placeholder={`Enter Destination Path for ${mod}`}
//             value={paths[mod].destination}
//             onChange={(e) => handleDestinationChange(mod, e.target.value)}
//             className="input-field"
//             required
//           />
//         </div>
//       ))}
 
//       <button onClick={handleSubmit} disabled={loading} className="submit-btn">
//         {loading ? <span className="loader">Process...</span> : <>🚀 Start Process</>}
//       </button>
 
//       {message && <p className="message">{message}</p>}
//     </div>
//   );
// };
 
// export default CopyFolderForm;

import { useState } from 'react';
import './CopyFolderForm.css';
import core from './images/corecard.jpg';

const modules = ["DSL", "WCF", "CoreMoney", "CoreAdmin", "SelfService", "PraxellAPI"];

const CopyFolderForm = () => {
  const [basePath, setBasePath] = useState('');
  const [selectedModules, setSelectedModules] = useState({});
  const [paths, setPaths] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [copyDetails, setCopyDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

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
    // const res = await fetch('http://localhost:8000/check-path', {
   const res = await fetch(' https://corecardcopyautomation-3.onrender.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pathToCheck: sourcePath })
    });

    const data = await res.json();

  if (data.exists) {
  setPaths((prev) => ({
    ...prev,
    [mod]: { source: sourcePath, destination: '' }
  }));
  setErrorMessage(''); // clear any previous error
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
      [mod]: { ...prev[mod], destination: value }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    setCopyDetails(null);
    try {
      // const res = await fetch('http://localhost:8000/copy-folders', {
      const res = await fetch('https://corecardcopyautomation-3.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: paths })
      });

      const data = await res.json();
      setMessage(data.message || 'Copy completed!');
      if (data.details) {
        setCopyDetails(data.details);
      }
    } catch (err) {
      setMessage('Error occurred while copying.');
    } finally {
      setLoading(false);
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
      const match = (detail.sourceFiles === detail.destinationFiles &&
                     detail.sourceFolders === detail.destinationFolders) ? 'YES' : 'NO';

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

      {/* source exsist message */}
      {errorMessage && (
  <div className="error-message">
    {errorMessage}
  </div>
)}

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
        {loading ? <span className="loader">Process...</span> : <>🚀 Start Process</>}
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
    </div>
  );
};

export default CopyFolderForm;
