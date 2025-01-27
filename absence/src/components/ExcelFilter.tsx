import React, { useState } from "react";
import * as XLSX from "xlsx";
import UploadSVG from "../assets/uploadSVG.svg";
import Logo from "../assets/logo.png";
import Htl from "../assets/htl3r_logo_transp.png";


const ExcelFilter = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [columnOptions, setColumnOptions] = useState({});
  const [fileName, setFileName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const allowedColumns = [
    "Schüler*innen",
    "Klasse",
    "Datum",
    "Wochentag",
    "Lehrkraft",
    "Fach",
  ];

  // Function to handle file upload and parse Excel
  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      setData(parsedData);
      setFilteredData(parsedData);
      setFileName(file.name);
      initializeFiltersAndOptions(parsedData);
    };
    reader.readAsBinaryString(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemove = () => {
    setFileName(null);
    setData([]);
    setFilteredData([]);
    setFilters({});
    setColumnOptions({});
    setSearchQuery("");
  };

  // Initialize filters and unique column options
  const initializeFiltersAndOptions = (data) => {
    const columns = allowedColumns.filter((col) => Object.keys(data[0] || {}).includes(col));
    const initialFilters = columns.reduce((acc, column) => {
      acc[column] = "";
      return acc;
    }, {});
    setFilters(initialFilters);

    const options = columns.reduce((acc, column) => {
      const uniqueValues = [...new Set(data.map((row) => row[column]))];
      acc[column] = uniqueValues.sort();
      return acc;
    }, {});
    setColumnOptions(options);
  };

  // Handle filter changes
  const handleFilterChange = (e, column) => {
    const value = e.target.value;
    const newFilters = { ...filters, [column]: value };
    setFilters(newFilters);
    applyFiltersAndSearch(newFilters, searchQuery);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    applyFiltersAndSearch(filters, query);
  };

  // Filter and search logic
  const applyFiltersAndSearch = (filters, query) => {
    const filtered = data.filter((row) => {
      const matchesFilters = Object.keys(filters).every((key) => {
        return filters[key] === "" || row[key] === filters[key];
      });

      const matchesSearch = Object.values(row).some((value) =>
        value.toString().toLowerCase().includes(query)
      );

      return matchesFilters && matchesSearch;
    });
    setFilteredData(filtered);
  };

  return (
    <div className="flex w-full h-[100vh] bg-[#EBE9E9]">
      
      {/* Filter Section */}
      <div className="w-1/5 bg-white p-4 overflow-y-auto ">
      <div className="w-3/4 ">
            <img src={Logo} alt="Abscence Logo" />
          </div>

          <div className="w-2/4 relative left-36">
            <img
              src={Htl}
              alt="Beschreibung des Bildes"
              className="w-full"
            />
          </div>
        <h2 className="text-lg font-semibold mb-2">Filters</h2>
        {data.length > 0 && (
          <>
            
            {Object.keys(filters).map((column) => (
              <div key={column} className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  {column}
                </label>
                <select
                  value={filters[column]}
                  onChange={(e) => handleFilterChange(e, column)}
                  className="block w-full p-2 border rounded border-red-600"
                >
                  <option value="">All</option>
                  {columnOptions[column].map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Divider */}
      <div className="w-0.5 bg-[#EBE9E9]"></div>

      {/* Upload Section */}
      <div className="w-4/5 bg-[#EBE9E9] flex justify-center items-center mt-36">
        {!fileName && (
          <div
            className={`bg-white w-[50vw] h-[30vh] flex flex-col items-center rounded-3xl shadow-lg border-black border-2 p-12 ${
              isDragging ? "border-blue-500" : ""
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <img src={UploadSVG} alt="upload" className="w-[3vw] mb-4" />
            <h2 className="text-2xl mb-4">Drag & Drop your Excel file here or</h2>
            <label className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded">
              Choose File
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}

        {fileName && filteredData.length > 0 && (
          <div className="w-full h-full overflow-auto p-4">
            <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-1/3 mb-4 p-2 border-red-600 border rounded"
            />
              <button
                onClick={handleRemove}
                className="text-white bg-[#a82036] hover:bg-red-700 px-4 py-2 rounded"
              >
                Löschen
              </button>
            </div>
            <div className="overflow-auto max-h-[70vh] border border-gray-500 bg-gray-700">
              <table className="table-auto border-collapse w-full text-white">
                <thead>
                  <tr>
                    {Object.keys(data[0]).map((key) => (
                      <th key={key} className="border p-2 bg-gray-700">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="border p-2">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcelFilter;
