import React from 'react';
import CopyFolderForm from './CopyFolderForm';
import core from './images/corecard.jpg';
// Adjust the import path accordingly

function App() {
  return (
    <div className="App">
    <img src={core} width={180} height={80} alt="Core Card" style={{ marginBottom: '20px' }} />
      <CopyFolderForm />
    </div>
  );
}

export default App;
