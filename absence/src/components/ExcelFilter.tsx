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

  // NEW: state for 'Nicht entschuldigt' filter
  const [showOnlyNichtEntschuldigt, setShowOnlyNichtEntschuldigt] =
    useState(false);

  const [status, setStatus] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // NEW: state for grouping by student
  const [groupByStudent, setGroupByStudent] = useState(false);

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
    if (row[key] == null) return "";
    const val = row[key].toString();

    if (key === "Wochentag") {
      return dayOrder[val] !== undefined ? dayOrder[val] : 999;
    }

    const asNumber = parseFloat(val.replace(",", "."));
    if (!isNaN(asNumber)) {
      return asNumber;
    }

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
              value = date.toLocaleDateString("en-GB"); // dd/mm/yyyy
            }

            newRow[key] = value;
          }
        });

        const studentName = row["Schüler*innen"];
        const isNichtEntschuldigt = !row["Erledigt"]; // empty => nicht entschuldigt

        if (isNichtEntschuldigt) {
          studentAbsenceCounts[studentName] =
            (studentAbsenceCounts[studentName] || 0) + 1;
        }

        return newRow;
      });

      // Calculate Fehlstunden pro Monat
      const fehlstundenProMonat = new Array(12).fill(0);
      processedData.forEach((row) => {
        const datum = row["Datum"];
        if (datum && datum.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          const [, month] = datum.split("/");
          const monthIndex = Number(month) - 1;

          const fehlstunden = parseFloat(row["Fehlstd."]) || 0;
          fehlstundenProMonat[monthIndex] += fehlstunden;
        }
      });

      setMonthData(fehlstundenProMonat);

      // Highlighted students
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
    setGroupByStudent(false);
    setShowOnlyNichtEntschuldigt(false);
    setShowOnlyRedStudents(false);
  };

  // Initialize filters and unique column options
  const initializeFiltersAndOptions = (data) => {
    if (!data.length) return;
    const columns = Object.keys(data[0]);
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
    applyFiltersAndSearch(newFilters, searchQuery, showOnlyNichtEntschuldigt);
  };

  // Search
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    applyFiltersAndSearch(filters, query, showOnlyNichtEntschuldigt);
  };

  // Filter & Search
  const applyFiltersAndSearch = (
    filters,
    query,
    onlyNichtEntschuldigt = false
  ) => {
    const studentAbsenceCounts = {};

    const filtered = data.filter((row) => {
      // If "Nur nicht entschuldigt" is checked, skip rows where Erledigt is not empty
      if (onlyNichtEntschuldigt) {
        if (row["Erledigt"] && row["Erledigt"] !== "") {
          return false;
        }
      }

      const studentName = row["Schüler*innen"];
      const isNichtEntschuldigt = !row["Erledigt"];
      if (isNichtEntschuldigt) {
        studentAbsenceCounts[studentName] =
          (studentAbsenceCounts[studentName] || 0) + 1;
      }

      // Check if row matches all dropdown filters
      const matchesFilters = Object.keys(filters).every((key) => {
        return filters[key] === "" || row[key] === filters[key];
      });

      // Check if row matches search query
      const rowValues = Object.values(row).filter(Boolean).map(String);
      const matchesSearch = rowValues.some((val) =>
        val.toLowerCase().includes(query)
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

  // Show/hide sidebar
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
    if (!start || !end) {
      setFilteredData(data);
      return;
    }

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
    if (sortConfig.key && !groupByStudent) {
      sorted.sort((a, b) => {
        const valueA = getSortValue(a, sortConfig.key);
        const valueB = getSortValue(b, sortConfig.key);

        if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return sorted;
  }, [filteredData, sortConfig, groupByStudent]);

  const getAggregatedData = (dataArray) => {
    const aggregated = {};
    dataArray.forEach((row) => {
      const student = row["Schüler*innen"] || "Unbekannt";
      if (!aggregated[student]) {
        aggregated[student] = {
          "Schüler*innen": student,
          "Fehlstd.": 0,
          "Min.": 0,
        };
      }
      aggregated[student]["Fehlstd."] += parseFloat(row["Fehlstd."]) || 0;
      aggregated[student]["Min."] += parseFloat(row["Fehlmin."]) || 0;
    });
    return Object.values(aggregated);
  };

  const sortedAggregatedData = React.useMemo(() => {
    if (!groupByStudent) return [];

    const relevantRows = filteredData.filter(
      (row) =>
        !showOnlyRedStudents || highlightedStudents.has(row["Schüler*innen"])
    );

    const agg = getAggregatedData(relevantRows);

    const column = sortConfig.key || "Schüler*innen";
    const direction = sortConfig.direction || "asc";

    agg.sort((a, b) => {
      const valA = getSortValue(a, column);
      const valB = getSortValue(b, column);
      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
    return agg;
  }, [
    groupByStudent,
    filteredData,
    showOnlyRedStudents,
    highlightedStudents,
    sortConfig,
  ]);

  useEffect(() => {
    if (groupByStudent) {
      setSortConfig({ key: "Schüler*innen", direction: "asc" });
    }
  }, [groupByStudent]);

  const handleSaveConfig = () => {
    const configData = {
      filters,
      searchQuery,
      showOnlyRedStudents,
      // Make sure to include the new checkbox if you want to store it:
      showOnlyNichtEntschuldigt,
      startDate: startDate ? startDate.toISOString() : null,
      endDate: endDate ? endDate.toISOString() : null,
      sortConfig,
      groupByStudent,
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

  const handleConfigFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== "string") {
        alert("Error: Could not read file as text.");
        return;
      }

      try {
        const loadedConfig = JSON.parse(result);
        if (loadedConfig.filters) setFilters(loadedConfig.filters);
        if (typeof loadedConfig.searchQuery === "string") {
          setSearchQuery(loadedConfig.searchQuery);
        }
        if (typeof loadedConfig.showOnlyRedStudents === "boolean") {
          setShowOnlyRedStudents(loadedConfig.showOnlyRedStudents);
        }
        if (typeof loadedConfig.showOnlyNichtEntschuldigt === "boolean") {
          setShowOnlyNichtEntschuldigt(loadedConfig.showOnlyNichtEntschuldigt);
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
        if (typeof loadedConfig.groupByStudent === "boolean") {
          setGroupByStudent(loadedConfig.groupByStudent);
        }

        // Re-apply filters after loading
        applyFiltersAndSearch(
          loadedConfig.filters || {},
          loadedConfig.searchQuery || "",
          loadedConfig.showOnlyNichtEntschuldigt || false
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
      <div className="w-1/5 bg-white h-screen overflow-y-auto hide-scrollbar">
        <div className="w-full flex flex-col items-start  ">
          <img
            src="Logo.png"
            alt="Beschreibung des Bildes"
            className="w-60 pt-8 pl-10"
          />
        </div>
        <div className="w-full flex flex-col items-end ">
          <img
            src="htl3r_logo_transp_gross.png"
            alt="Beschreibung des Bildes"
            className="w-1/2 py-5 pr-10 "
          />
        </div>

        {/* Sidebar "Dashboard" button */}
        <div
          className={`relative w-full h-24 mb-5 flex items-center justify-start ${triangleColor} shadow-[0px_4px_6px_rgba(0,0,0,0.1)] `}
          onClick={handleTriangleClick}
        >
          <img src="globe.svg" className="pl-8 pr-4" />
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

                {/* Show only red students */}
                <div className="mt-4 flex items-center">
                  <div className="flex items-center mt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showOnlyRedStudents}
                        onChange={() =>
                          setShowOnlyRedStudents(!showOnlyRedStudents)
                        }
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
                      <span className="text-gray-800">Paragraph 45</span>
                    </label>
                  </div>
                </div>

                {/* NEW: Show only 'Nicht entschuldigt' */}
                <div className="flex items-center mt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyNichtEntschuldigt}
                      onChange={() => {
                        const newVal = !showOnlyNichtEntschuldigt;
                        setShowOnlyNichtEntschuldigt(newVal);
                        applyFiltersAndSearch(filters, searchQuery, newVal);
                      }}
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
                    <span className="text-gray-800">Nur nicht entschuldigt</span>
                  </label>
                </div>

                {/* Group by Student */}
                <div className="flex items-center mt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={groupByStudent}
                      onChange={() => setGroupByStudent(!groupByStudent)}
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
                      Fehlstunden pro Schüler*in
                    </span>
                  </label>
                </div>

                {/* Filter dropdowns */}
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
                          className="w-full min-w-[17rem] cursor-default border-2 rounded-md border-[#FF9AA9] bg-white py-2 px-5 text-gray-800 leading-tight focus:outline-none"
                        />
                      </div>
                    );
                  }
                  // Example of included columns
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
                          {columnOptions[column]?.map((option, index) => (
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
                <div className="my-8 flex items-center justify-between">
                  <button
                    onClick={handleLoadConfigClick}
                    className=" bg-[#D9D9D9] hover:bg-[#BFBFBF] px-4 py-2 rounded w-[47%] font-semibold text-black"
                  >
                    Laden
                  </button>
                  <input
                    id="load-config-input"
                    type="file"
                    accept=".json"
                    onChange={handleConfigFileChange}
                    style={{ display: "none" }}
                  />
                  <button
                    onClick={handleSaveConfig}
                    className="bg-[#A82036] hover:bg-[#961E31] px-4 py-2 rounded w-[47%] font-semibold text-white"
                  >
                    Speichern
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Sidebar "Statistiken" button */}
        <div
          className={`relative w-full h-24 my-5 flex items-center justify-start ${statistikColor} shadow-[0px_4px_6px_rgba(0,0,0,0.1)]`}
          onClick={handleTriangleClick}
        >
          <img src="graph-logo.svg" className="pl-8 pr-4" />
          <p className="text-white font-semibold text-3xl">Statistiken</p>
          {!status && (
            <div className="absolute -right-5 top-1/2 -translate-y-1/2 h-0 w-0 border-y-[22px] border-y-transparent border-l-[24px] border-l-[#A82036]" />
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-0.5 bg-[#dddbdb]" />

      {/* Right Section */}
      {status && (
        <div className="w-4/5 bg-[#EBE9E9] flex flex-col justify-center items-center px-10 pt-20">
          {/* Upload UI */}
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

          {/* Data Table */}
          {fileName && filteredData.length > 0 && (
            <div className="w-full h-full overflow-auto p-4">
              <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <h2 className="text-xl font-semibold text-black">{fileName}</h2>
                <div className="flex gap-4 w-[30%]">
                  <button
                    onClick={handleRemove}
                    className="text-white bg-[#A82036] hover:bg-[#961E31] px-4 py-2 rounded w-1/2 font-semibold"
                  >
                    Entfernen
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="text-white bg-[#2BA820] hover:bg-[#208916] px-4 py-2 rounded w-1/2 font-semibold"
                  >
                    Exportieren
                  </button>
                </div>
              </div>

              {!groupByStudent && (
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
                        {Object.keys(sortedFilteredData[0]).map(
                          (key, index) => {
                            const excludedColumns = [
                              "Klasse",
                              "Datum",
                              "Beginndatum",
                            ];
                            const isExcluded = excludedColumns.includes(key);

                            const isNumericColumn =
                              !isExcluded &&
                              sortedFilteredData.every(
                                (row) => !isNaN(parseFloat(row[key]))
                              );

                            return (
                              <td
                                key={index}
                                className="border p-2 text-center"
                              >
                                {isNumericColumn
                                  ? sortedFilteredData.reduce(
                                      (sum, row) =>
                                        sum + parseFloat(row[key] || 0),
                                      0
                                    )
                                  : ""}
                              </td>
                            );
                          }
                        )}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}

              {groupByStudent && (
                <div className="overflow-auto max-h-[70vh] border border-[#dddbdb]">
                  <table className="table-auto border-collapse w-full text-black">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr>
                        {["Schüler*innen", "Fehlstd.", "Min."].map((col) => (
                          <th key={col} className="border p-2">
                            <div className="flex items-center">
                              <span className="mr-1">{col}</span>
                              <button
                                type="button"
                                onClick={() => handleSort(col)}
                                className="text-sm"
                              >
                                {sortConfig.key === col
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
                      {sortedAggregatedData.map((item, idx) => (
                        <tr key={idx}>
                          <td
                            className={`border p-2 bg-white ${
                              highlightedStudents.has(item["Schüler*innen"])
                                ? "text-red-500 font-bold"
                                : ""
                            }`}
                          >
                            {item["Schüler*innen"]}
                          </td>
                          <td className="border p-2 bg-white">
                            {item["Fehlstd."].toFixed(2)}
                          </td>
                          <td className="border p-2 bg-white">
                            {item["Min."].toFixed(0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Chart Area */}
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
