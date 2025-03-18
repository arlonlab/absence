import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import UploadSVG from "../assets/uploadSVG.svg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ExcelChart from "./ExcelChart";
import MonthChart from "./MonthChart";

const ExcelFilter = () => {
  const [monthData, setMonthData] = useState([]);
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
  const [showOnlyRedStudents, setShowOnlyRedStudents] = useState(false);

  const [status, setStatus] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
 
  // Sorting config
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Day-of-week order and numeric extraction for sorting
  const dayOrder = {
    "Mo.": 0,
    "Di.": 1,
    "Mi.": 2,
    "Do.": 3,
    "Fr.": 4,
    "Sa.": 5,
    "So.": 6,
  };

  const getSortValue = (row, key) => {
    const val = row[key] ? row[key].toString() : "";

    // Handle Wochentag
    if (key === "Wochentag") {
      return dayOrder[val] !== undefined ? dayOrder[val] : 999;
    }
    // Handle Schüler*innen numeric sorting
    if (key === "Schüler*innen") {
      const match = val.match(/\d+/);
      if (match) {
        return parseInt(match[0], 10);
      }
      return val.toLowerCase();
    }
    // Default alphabetical
    return val.toLowerCase();
  };

  // Handle file upload
  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      const studentAbsenceCounts = {};

      const processedData = parsedData.map((row) => {
        const newRow = {};

        Object.keys(row).forEach((key) => {
          if (key !== "Externe Id") {
            let value = row[key];

            // Convert Excel date values
            if (typeof value === "number" && value > 40000 && value < 60000) {
              const date = new Date((value - 25569) * 86400 * 1000);
              value = date.toLocaleDateString("en-GB");
            }

            newRow[key] = value;
          }
        });

        const studentName = row["Schüler*innen"];
        const isNichtEntschuldigt = !row["Erledigt"];

        if (isNichtEntschuldigt) {
          studentAbsenceCounts[studentName] =
            (studentAbsenceCounts[studentName] || 0) + 1;
        }

        return newRow;
      });

      const fehlstundenProMonat = new Array(12).fill(0);

      processedData.forEach((row) => {
        // Extrahiere das Datum und den Monatswert
        const datum = row["Datum"]; // Annahme: Das Datumsfeld heißt "Datum"
        if (datum && datum.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          const [day, month, year] = datum.split("/");
          const monthIndex = Number(month) - 1;

          // Extrahiere die Fehlstunden
          const fehlstunden = row["Fehlstd."]; // Annahme: Das Feld heißt "Fehlstd."

          // Addiere die Fehlstunden für den Monat
          fehlstundenProMonat[monthIndex] += fehlstunden;
        }
      });

      setMonthData(fehlstundenProMonat);

      console.log("Fehlstunden pro Monat:", monthData);

      const newHighlightedStudents = new Set(
        Object.keys(studentAbsenceCounts).filter(
          (student) => studentAbsenceCounts[student] >= 30
        )
      );

      setData(processedData);
      setFilteredData(processedData);
      setFileName(file.name);
      setHighlightedStudents(newHighlightedStudents);
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
      acc[column] = uniqueValues.sort();
      return acc;
    }, {});
    setColumnOptions(options);
  };

  // Filter changes
  const handleFilterChange = (e, column) => {
    const value = e.target.value;
    const newFilters = { ...filters, [column]: value };
    setFilters(newFilters);
    applyFiltersAndSearch(newFilters, searchQuery);
  };

  // Search
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    applyFiltersAndSearch(filters, query);
  };

  // Filter & Search
  const applyFiltersAndSearch = (filters, query) => {
    const studentAbsenceCounts = {};

    const filtered = data.filter((row) => {
      const studentName = row["Schüler*innen"];
      const isNichtEntschuldigt = !row["Erledigt"];

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

    const newHighlightedStudents = new Set(
      Object.keys(studentAbsenceCounts).filter(
        (student) => studentAbsenceCounts[student] >= 30
      )
    );

    setHighlightedStudents(newHighlightedStudents);
    setFilteredData(filtered);
  };

  // Show/hide side
  const handleTriangleClick = () => {
    setTriangleColor((prevColor) =>
      prevColor === "bg-[#A82036]" ? "bg-[#808080]" : "bg-[#A82036]"
    );
    setStatistikColor((prevColor) =>
      prevColor === "bg-[#808080]" ? "bg-[#A82036]" : "bg-[#808080]"
    );
    setStatus(!status);
  };

  // Date range
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

  // Export to Excel
  const exportToExcel = () => {
    if (filteredData.length === 0) {
      alert("No data to export!");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Data");
    XLSX.writeFile(workbook, "Filtered_Data.xlsx");
  };

  // Sorting logic
  const handleSort = (column) => {
    setSortConfig((prev) => {
      if (prev.key === column) {
        return {
          key: column,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: column, direction: "asc" };
    });
  };

  const sortedFilteredData = React.useMemo(() => {
    const sorted = [...filteredData];
    if (sortConfig.key) {
      sorted.sort((a, b) => {
        const valueA = getSortValue(a, sortConfig.key);
        const valueB = getSortValue(b, sortConfig.key);

        if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredData, sortConfig]);

  // Already existing Save Config logic
  const handleSaveConfig = () => {
    const configData = {
      filters,
      searchQuery,
      showOnlyRedStudents,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      sortConfig,
    };

    const jsonString = JSON.stringify(configData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "filter_config.json";
    link.click();

    URL.revokeObjectURL(url);
  };

  // Example "Load Config" logic
  const [configFile, setConfigFile] = useState(null);

  const handleConfigFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const loadedConfig = JSON.parse(event.target.result);
        if (loadedConfig.filters) setFilters(loadedConfig.filters);
        if (typeof loadedConfig.searchQuery === "string") {
          setSearchQuery(loadedConfig.searchQuery);
        }
        if (typeof loadedConfig.showOnlyRedStudents === "boolean") {
          setShowOnlyRedStudents(loadedConfig.showOnlyRedStudents);
        }
        if (loadedConfig.startDate) {
          setStartDate(new Date(loadedConfig.startDate));
        } else {
          setStartDate(null);
        }
        if (loadedConfig.endDate) {
          setEndDate(new Date(loadedConfig.endDate));
        } else {
          setEndDate(null);
        }
        if (loadedConfig.sortConfig) {
          setSortConfig(loadedConfig.sortConfig);
        }

        // Rerun the filters for immediate effect
        applyFiltersAndSearch(
          loadedConfig.filters || {},
          loadedConfig.searchQuery || ""
        );

        alert("Filter config loaded successfully!");
      } catch (error) {
        console.error("Failed to parse config file:", error);
        alert("Error: Invalid config file.");
      }
    };

    reader.readAsText(file);
  };

  const handleLoadConfigClick = () => {
    document.getElementById("load-config-input").click();
  };

  return (
    <div className="flex w-full h-[100vh]">
      {/* Filter Section */}
      <div className="w-1/5 bg-white">
        <div className="w-full flex flex-col items-start">
          <img
            src="Logo.png"
            alt="Beschreibung des Bildes"
            className="w-64 pt-8 pl-10"
          />
        </div>
        <div className="w-full flex flex-col items-end">
          <img
            src="htl3r_logo_transp_gross.png"
            alt="Beschreibung des Bildes"
            className="w-1/2 py-5 pr-10"
          />
        </div>
        <div
          className={`relative w-full h-24 mb-5 flex items-center justify-start ${triangleColor} shadow-[0px_4px_6px_rgba(0,0,0,0.1)]`}
          disabled={!status}
          onClick={handleTriangleClick}
        >
          <img src="globe.svg" className="pl-16 pr-8" />
          <p className="text-white font-semibold text-3xl">Dashboard</p>
          {status && (
            <div className="absolute -right-5 top-1/2 -translate-y-1/2 h-0 w-0 border-y-[22px] border-y-transparent border-l-[24px] border-l-[#A82036]" />
          )}
        </div>
        {status && (
          <div className="pr-4 pl-4">
            {data.length > 0 && (
              <>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="block w-full border-2 rounded-md border-[#FF9AA9] bg-white py-2 px-5 text-gray-800 leading-tight focus:outline-none"
                />
                <div className="flex items-center mt-2">
                  {/* 
                    ---- ADDED LINES: Style the checkbox in a "pink/red" theme. ----
                    We wrap the input and label together with a custom style:
                  */}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyRedStudents}
                      onChange={() =>
                        setShowOnlyRedStudents(!showOnlyRedStudents)
                      }
                      // Tailwind classes to style the checkbox:
                      className="
                        appearance-none 
                        h-4 w-4 
                        border-2 border-[#FF9AA9] 
                        rounded 
                        checked:bg-[#A82036] 
                        checked:border-[#A82036] 
                        focus:outline-none 
                        mr-2 
                        center
                      "
                    />
                    <span className="text-gray-800">
                      Show only red students
                    </span>
                  </label>
                </div>

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
                          className="w-full min-w-64 cursor-default border-2 rounded-md border-[#FF9AA9] bg-white py-2 px-5 text-gray-800 leading-tight focus:outline-none"
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
                        <label className="absolute -top-2 ml-3 px-2 text-sm font-medium bg-white text-gray-700 z-5">
                          {column}
                        </label>
                        <select
                          value={filters[column]}
                          onChange={(e) => handleFilterChange(e, column)}
                          className="w-full min-w-64 cursor-default border-2 rounded-md border-[#FF9AA9] bg-white py-2 px-5 text-gray-800 leading-tight focus:outline-none"
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
          <img src="graph-logo.svg" className="pl-16 pr-8" />
          <p className="text-white font-semibold text-3xl">Statistiken</p>
          {!status && (
            <div className="absolute -right-5 top-1/2 -translate-y-1/2 h-0 w-0 border-y-[22px] border-y-transparent border-l-[24px] border-l-[#A82036]" />
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-0.5 bg-[#dddbdb]" />

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
              <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
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
                <button
                  onClick={handleSaveConfig}
                  className="text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded"
                >
                  Save Config
                </button>

                <button
                  onClick={handleLoadConfigClick}
                  className="text-white bg-purple-500 hover:bg-purple-700 px-4 py-2 rounded"
                >
                  Load Config
                </button>
                <input
                  id="load-config-input"
                  type="file"
                  accept=".json"
                  onChange={handleConfigFileChange}
                  style={{ display: "none" }}
                />
              </div>
              <div className="overflow-auto max-h-[70vh] border border-[#dddbdb]">
                <table className="table-auto border-collapse w-full text-black">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr>
                      {Object.keys(filteredData[0]).map((key) => (
                        <th key={key} className="border p-2">
                          <div className="flex items-center">
                            <span className="mr-1">{key}</span>
                            <button
                              type="button"
                              onClick={() => handleSort(key)}
                              className="text-sm"
                            >
                              {sortConfig.key === key
                                ? sortConfig.direction === "asc"
                                  ? "▲"
                                  : "▼"
                                : "⇅"}
                            </button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFilteredData
                      .filter(
                        (row) =>
                          !showOnlyRedStudents ||
                          highlightedStudents.has(row["Schüler*innen"])
                      )
                      .map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          {Object.keys(row).map((key, cellIndex) => {
                            const isStudentColumn = key === "Schüler*innen";
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
                  <tfoot>
                    <tr className="bg-gray-200 font-bold">
                      {Object.keys(sortedFilteredData[0]).map((key, index) => {
                        const isNumericColumn = sortedFilteredData.every(
                          (row) =>
                            !isNaN(parseFloat(row[key])) && isFinite(row[key])
                        );
                        return (
                          <td key={index} className="border p-2 text-center">
                            {isNumericColumn
                              ? sortedFilteredData.reduce(
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
          <div className="w-3/5 m-4">
            <MonthChart data={monthData} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelFilter;
