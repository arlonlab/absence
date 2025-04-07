// src/components/ExcelFilter.jsx

import  { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import "react-datepicker/dist/react-datepicker.css";

// Components
import FileUpload from "./FileUpload";
import Sidebar from "./Sidebar";
import DataTable from "./DataTable";
import ExcelChart from "./ExcelChart";
import MonthChart from "./MonthChart";

// Images (update paths accordingly)

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
  const [showOnlyNichtEntschuldigt, setShowOnlyNichtEntschuldigt] =
    useState(false);

  const [status, setStatus] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [groupByStudent, setGroupByStudent] = useState(false);

  // Sorting config
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Day-of-week order for sorting
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

    // Try to parse as a float, gracefully handle commas
    const asNumber = parseFloat(val.replace(",", "."));
    if (!isNaN(asNumber)) {
      return asNumber;
    }

    return val.toLowerCase();
  };

  // ----------------
  // File Handling
  // ----------------
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
        const isNichtEntschuldigt = !row["Erledigt"];

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

  // ----------------
  // Filters and Searching
  // ----------------
  const initializeFiltersAndOptions = (dataArray) => {
    if (!dataArray.length) return;
    const columns = Object.keys(dataArray[0]);
    const initialFilters = columns.reduce((acc, column) => {
      acc[column] = "";
      return acc;
    }, {});
    setFilters(initialFilters);

    const options = columns.reduce((acc, column) => {
      const uniqueValues = [...new Set(dataArray.map((row) => row[column]))];
      acc[column] = uniqueValues.sort();
      return acc;
    }, {});
    setColumnOptions(options);
  };

  const applyFiltersAndSearch = (filters, query, onlyNichtEntschuldigt = false) => {
    const studentAbsenceCounts = {};
    const filtered = data.filter((row) => {
      // Handle "Nur nicht entschuldigt"
      if (onlyNichtEntschuldigt) {
        if (row["Erledigt"] && row["Erledigt"] !== "") {
          return false;
        }
      }
      // Count highlight
      const studentName = row["Schüler*innen"];
      const isNichtEntschuldigt = !row["Erledigt"];
      if (isNichtEntschuldigt) {
        studentAbsenceCounts[studentName] =
          (studentAbsenceCounts[studentName] || 0) + 1;
      }

      // Check dropdown filters
      const matchesFilters = Object.keys(filters).every((key) => {
        return filters[key] === "" || row[key] === filters[key];
      });

      // Check search
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

  // ----------------
  // Search
  // ----------------
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    applyFiltersAndSearch(filters, query, showOnlyNichtEntschuldigt);
  };

  // ----------------
  // Sorting
  // ----------------
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

  const sortedFilteredData = useMemo(() => {
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

  // ----------------
  // Grouping Logic
  // ----------------
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

  const sortedAggregatedData = useMemo(() => {
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

  // ----------------
  // Date Range
  // ----------------
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

  // ----------------
  // Export
  // ----------------
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

  // ----------------
  // Config Save/Load
  // ----------------
  const handleSaveConfig = () => {
    const configData = {
      filters,
      searchQuery,
      showOnlyRedStudents,
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

        // Re-apply filters
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

  // ----------------
  // Sidebar Toggle
  // ----------------
  const handleTriangleClick = () => {
    setTriangleColor((prevColor) =>
      prevColor === "bg-[#A82036]" ? "bg-[#808080]" : "bg-[#A82036]"
    );
    setStatistikColor((prevColor) =>
      prevColor === "bg-[#808080]" ? "bg-[#A82036]" : "bg-[#808080]"
    );
    setStatus(!status);
  };

  // ----------------
  // Render
  // ----------------
  return (
    <div className="flex w-full h-[100vh]">
     
      {/* Sidebar */}
      <Sidebar
        status={status}
        triangleColor={triangleColor}
        statistikColor={statistikColor}
        handleTriangleClick={handleTriangleClick}
        data={data}
        filters={filters}
        setFilters={setFilters}
        columnOptions={columnOptions}
        searchQuery={searchQuery}
        handleSearchChange={handleSearchChange}
        showOnlyRedStudents={showOnlyRedStudents}
        setShowOnlyRedStudents={setShowOnlyRedStudents}
        showOnlyNichtEntschuldigt={showOnlyNichtEntschuldigt}
        setShowOnlyNichtEntschuldigt={setShowOnlyNichtEntschuldigt}
        groupByStudent={groupByStudent}
        setGroupByStudent={setGroupByStudent}
        startDate={startDate}
        endDate={endDate}
        handleDateChange={handleDateChange}
        applyFiltersAndSearch={applyFiltersAndSearch}
        handleSaveConfig={handleSaveConfig}
        handleLoadConfigClick={handleLoadConfigClick}
        handleConfigFileChange={handleConfigFileChange}
      />

      {/* Divider */}
      <div className="w-0.5 bg-[#dddbdb]" />

      {/* Right Section */}
      {status ? (
        <div className="w-4/5 bg-[#EBE9E9] flex flex-col justify-center items-center px-10 pt-20">
          {/* If no file, show FileUpload */}
          {!fileName && (
            <FileUpload
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              handleFileUpload={handleFileUpload}
            />
          )}

          {/* If file is loaded, show DataTable */}
          {fileName && filteredData.length > 0 && (
            <DataTable
              fileName={fileName}
              handleRemove={handleRemove}
              exportToExcel={exportToExcel}
              groupByStudent={groupByStudent}
              sortedFilteredData={sortedFilteredData}
              highlightedStudents={highlightedStudents}
              showOnlyRedStudents={showOnlyRedStudents}
              sortedAggregatedData={sortedAggregatedData}
              handleSort={handleSort}
              sortConfig={sortConfig}
            />
          )}
        </div>
      ) : (
        <div className="w-4/5  bg-[#EBE9E9] flex flex-col justify-center items-center px-10 pt-20">
          <div className="w-1/4 m-4">
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
