import React from 'react';

interface ExcelUploaderProps {
  onFileSelect: (file: File) => void;
}

const ExcelUploader: React.FC<ExcelUploaderProps> = ({ onFileSelect }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 24 }}>
      <label
        style={{
          display: 'inline-block',
          padding: '12px 24px',
          fontSize: '16px',
          background: '#1976d2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Select Excel File
        <input
          type="file"
          accept=".xls,.xlsx,.csv"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
      </label>

    </div>
  );
};

export default ExcelUploader;
