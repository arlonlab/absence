import React from 'react';

const ExcelTable = ({ tableData, fileName, handleRemove }) => {
  if (!tableData || tableData.length === 0) return null;

  return (
    <div className='w-[90vw] h-[80vh] overflow-auto bg-white rounded-xl shadow-lg p-4 relative'>
      <div className='flex justify-between items-center mb-4'>
        <h3 className='text-lg font-semibold'>Displaying: {fileName}</h3>
        <button
          onClick={handleRemove}
          className='bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-4 rounded'
        >
          Remove File
        </button>
      </div>
      <table className='table-auto w-full border-collapse border border-gray-300'>
        <thead>
          <tr>
            {tableData[0].map((header, index) => (
              <th key={index} className='border border-gray-300 px-4 py-2 sticky top-0 bg-gray-200'>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.slice(1).map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className='border border-gray-300 px-4 py-2'>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExcelTable;
