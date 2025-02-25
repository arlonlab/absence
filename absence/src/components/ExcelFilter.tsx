import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import UploadSVG from "../assets/uploadSVG.svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExcelChart from "./ExcelChart";

const ExcelFilter = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [columnOptions, setColumnOptions] = useState({});
  const [fileName, setFileName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [triangleColor, setTriangleColor] = useState("bg-[#A82036]");
  const [statistikColor, setStatistikColor] = useState("bg-[#808080]");
  const [highlightedStudents, setHighlightedStudents] = useState(new Set());

  const [status, setStatus] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Function to handle file upload and parse Excel
  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      // Process data: Remove "id" column and convert Excel date values
      const processedData = parsedData.map((row) => {
        const newRow = {}; // New object without "id"

        Object.keys(row).forEach((key) => {
          if (key !== "Externe Id") {
            // Exclude "id" column
            let value = row[key];

            // Check if the value is an Excel date number
            if (typeof value === "number" && value > 40000 && value < 60000) {
              const date = new Date((value - 25569) * 86400 * 1000);
              value = date.toLocaleDateString("en-GB"); // Convert to DD/MM/YYYY format
            }

            newRow[key] = value;
          }
        });

        return newRow;
      });

      setData(processedData);
      setFilteredData(processedData);
      setFileName(file.name);
      initializeFiltersAndOptions(processedData);
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
    const columns = Object.keys(data[0] || {});
    const initialFilters = columns.reduce((acc, column) => {
      acc[column] = "";
      return acc;
    }, {});
    setFilters(initialFilters);

    const options = columns.reduce((acc, column) => {
      const uniqueValues = [...new Set(data.map((row) => row[column]))];
      acc[column] = uniqueValues.sort(); // Sort the unique values alphabetically
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
    const studentAbsenceCounts = {}; // Track "Nicht entschuldigt" counts per student

    const filtered = data.filter((row) => {
      const studentName = row["Schüler*innen"]; // Ensure correct column name
      const isNichtEntschuldigt = !row["Erledigt"]; // If "Erledigt" is empty

      // Count "Nicht entschuldigt" absences
      if (isNichtEntschuldigt) {
        studentAbsenceCounts[studentName] =
          (studentAbsenceCounts[studentName] || 0) + 1;
      }

      const matchesFilters = Object.keys(filters).every((key) => {
        return filters[key] === "" || row[key] === filters[key];
      });

      const matchesSearch = Object.values(row).some((value) =>
        value?.toString().toLowerCase().includes(query)
      );

      return matchesFilters && matchesSearch;
    });

    // Identify students with 30+ "Nicht entschuldigt"
    const newHighlightedStudents = new Set(
      Object.keys(studentAbsenceCounts).filter(
        (student) => studentAbsenceCounts[student] >= 30
      )
    );

    setHighlightedStudents(newHighlightedStudents); // Update state
    setFilteredData(filtered);
  };

  const handleTriangleClick = () => {
    setTriangleColor((prevColor) =>
      prevColor === "bg-[#A82036]" ? "bg-[#808080]" : "bg-[#A82036]"
    );

    setStatistikColor((prevColor) =>
      prevColor === "bg-[#808080]" ? "bg-[#A82036]" : "bg-[#808080]"
    );

    setStatus(!status);
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    applyDateFilter(start, end);
  };

  const applyDateFilter = (start, end) => {
    if (!start || !end) return;

    const filtered = data.filter((row) => {
      const rowDate = new Date(row.Datum);
      return rowDate >= start && rowDate <= end;
    });

    setFilteredData(filtered);
  };

  const exportToExcel = () => {
    if (filteredData.length === 0) {
      alert("No data to export!");
      return;
    }

    // Create a new worksheet
    const worksheet = XLSX.utils.json_to_sheet(filteredData);

    // Create a new workbook and append the sheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");

    // Write file and trigger download
    XLSX.writeFile(workbook, "Filtered_Data.xlsx");
  };

  return (
    <div className="flex w-full h-[100vh]">
      {/* Filter Section */}
      <div className="w-1/5 bg-white  ">
        <div className="w-ful flex flex-col items-start">
          <img
            src="Logo.png"
            alt="Beschreibung des Bildes"
            className="w-64 pt-8 pl-10 "
          />
        </div>

        <div className="w-full flex flex-col items-end">
          <img
            src="htl3r_logo_transp_gross.png"
            alt="Beschreibung des Bildes"
            className="w-1/2 py-5  pr-10"
          />
        </div>
        <div
          className={`relative w-full h-24 mb-5 flex items-center justify-start ${triangleColor} shadow-[0px_4px_6px_rgba(0,0,0,0.1)]`}
          disabled={!status}
          onClick={handleTriangleClick}
        >
          <img src="globe.svg" className="pl-16 pr-8"></img>
          <p className="text-white font-semibold text-3xl">Dashboard</p>

          {status && (
            <div className="absolute -right-5 top-1/2 -translate-y-1/2 h-0 w-0 border-y-[22px] border-y-transparent border-l-[24px] border-l-[#A82036]"></div>
          )}
        </div>
        {status && (
          <div className="  overflow-y-auto px-16 ">
            {data.length > 0 && (
              <>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full border-2 rounded-md border-[#FF9AA9] bg-white py-2 px-5  text-gray-800 leading-tight focus:outline-none "
                />
                {Object.keys(filters).map((column) => {
                  if (column === "Datum" || column === "Beginndatum") {
                    return (
                      <div key={column} className="mt-8 relative">
                        <label className="absolute -top-2 ml-3 px-2 text-sm font-medium bg-white text-gray-700 z-20">
                          {column}
                        </label>
                        <DatePicker
                          selectsRange
                          startDate={startDate}
                          endDate={endDate}
                          onChange={handleDateChange}
                          isClearable={true}
                          dateFormat="dd.MM.yyyy"
                          placeholderText="Wähle Zeitraum"
                          className="w-full min-w-64 cursor-default border-2 rounded-md border-[#FF9AA9] bg-white py-2 px-5 text-gray-800 leading-tight focus:outline-none "
                        />
                      </div>
                    );
                  }

                  if (
                    column === "Klasse" ||
                    column === "Schüler*innen" ||
                    column === "Abwesenheitsgrund" ||
                    column === "Fach" ||
                    column === "Datum" ||
                    column === "Beginndatum"
                  ) {
                    return (
                      <div key={column} className="mt-8 relative">
                        <label className="absolute -top-2 ml-3 px-2 text-sm font-medium  bg-white text-gray-700 z-5">
                          {column}
                        </label>
                        <select
                          value={filters[column]}
                          onChange={(e) => handleFilterChange(e, column)}
                          className="w-full min-w-64 cursor-default border-2 rounded-md border-[#FF9AA9] bg-white py-2 px-5  text-gray-800 leading-tight focus:outline-none "
                        >
                          <option value="">All</option>
                          {columnOptions[column].map((option, index) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  return null;
                })}
              </>
            )}
          </div>
        )}
        <div
          className={`relative w-full h-24 my-5 flex items-center justify-start ${statistikColor} shadow-[0px_4px_6px_rgba(0,0,0,0.1)]`}
          onClick={handleTriangleClick}
        >
          <img src="graph-logo.svg" className="pl-16 pr-8"></img>
          <p className="text-white font-semibold text-3xl">Statistiken</p>
          {!status && (
            <div className="absolute -right-5 top-1/2 -translate-y-1/2 h-0 w-0 border-y-[22px] border-y-transparent border-l-[24px] border-l-[#A82036]"></div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-0.5 bg-[#dddbdb]"></div>

      {/* Upload Section */}

      {status && (
        <div className="w-4/5 bg-[#EBE9E9] flex flex-col justify-center items-center px-10 pt-20">
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
              <h2 className="text-2xl mb-4">
                Drag & Drop your Excel file here or
              </h2>
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
                <h2 className="text-xl font-semibold text-black">{fileName}</h2>
                <button
                  onClick={exportToExcel}
                  className="text-white bg-green-500 hover:bg-green-700 px-4 py-2 rounded"
                >
                  Export to Excel
                </button>
                <button
                  onClick={handleRemove}
                  className="text-white bg-red-500 hover:bg-red-700 px-4 py-2 rounded"
                >
                  Remove File
                </button>
              </div>
              <div className="overflow-auto max-h-[70vh] border border-[#dddbdb]">
                <table className="table-auto border-collapse w-full text-black">
                  <thead>
                    <tr>
                      {Object.keys(filteredData[0]).map((key) => (
                        <th key={key} className="border p-2 bg-white">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {Object.keys(row).map((key, cellIndex) => {
                          const isStudentColumn = key === "Schüler*innen"; // Adjust if column name differs
                          const studentName = row[key];

                          return (
                            <td
                              key={cellIndex}
                              className={`border p-2 bg-white ${
                                isStudentColumn &&
                                highlightedStudents.has(studentName)
                                  ? "text-red-500 font-bold"
                                  : ""
                              }`}
                            >
                              {studentName}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>

                  {/* Sum Row */}
                  <tfoot>
                    <tr className="bg-gray-200 font-bold">
                      {Object.keys(filteredData[0]).map((key, index) => {
                        const isNumericColumn = filteredData.every(
                          (row) =>
                            !isNaN(parseFloat(row[key])) && isFinite(row[key])
                        );
                        return (
                          <td key={index} className="border p-2 text-center">
                            {isNumericColumn
                              ? filteredData.reduce(
                                  (sum, row) => sum + parseFloat(row[key] || 0),
                                  0
                                )
                              : ""}
                          </td>
                        );
                      })}
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      {!status && (
        <div className="w-4/5 bg-[#EBE9E9] flex flex-col justify-center items-center px-10 pt-20">
          <div>
            <ExcelChart data={filteredData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelFilter;
