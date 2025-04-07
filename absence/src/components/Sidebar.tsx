// src/components/Sidebar.jsx
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Images (update the paths)
import Logo from "../assets/Logo.png";
import HTLLogo from "../assets/htl3r_logo_transp.png";


const Sidebar = ({
  status,
  triangleColor,
  statistikColor,
  handleTriangleClick,
  data,
  filters,
  setFilters,
  columnOptions,
  searchQuery,
  handleSearchChange,
  showOnlyRedStudents,
  setShowOnlyRedStudents,
  showOnlyNichtEntschuldigt,
  setShowOnlyNichtEntschuldigt,
  groupByStudent,
  setGroupByStudent,
  startDate,
  endDate,
  handleDateChange,
  applyFiltersAndSearch,
  handleSaveConfig,
  handleLoadConfigClick,
  handleConfigFileChange,
}) => {
  const handleFilterChange = (e, column) => {
    const value = e.target.value;
    const newFilters = { ...filters, [column]: value };
    setFilters(newFilters);
    applyFiltersAndSearch(newFilters, searchQuery, showOnlyNichtEntschuldigt);
  };

  return (
    <div className="w-1/5 bg-white h-screen overflow-y-auto hide-scrollbar">
      {/* Top Logos */}
      <div className="w-full flex flex-col items-start">
        <img src={Logo} alt="Logo" className="w-60 pt-8 pl-10" />
      </div>
      <div className="w-full flex flex-col items-end">
        <img src={HTLLogo} alt="HTL Logo" className="w-1/2 py-5 pr-10" />
      </div>

      {/* "Dashboard" Button */}
      <div
        className={`relative w-full h-24 mb-5 flex items-center justify-start ${triangleColor} shadow-[0px_4px_6px_rgba(0,0,0,0.1)] `}
        onClick={handleTriangleClick}
      >
        <img src="globe.svg" className="pl-8 pr-4" alt="Globe" />
        <p className="text-white font-semibold text-3xl">Dashboard</p>
        {status && (
          <div className="absolute -right-5 top-1/2 -translate-y-1/2 h-0 w-0 border-y-[22px] border-y-transparent border-l-[24px] border-l-[#A82036]" />
        )}
      </div>

      {/* Conditional Filter Section */}
      {status && (
        <div className="pr-4 pl-4">
          {data.length > 0 && (
            <>
              {/* Search Field */}
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="block w-full border-2 rounded-md border-[#FF9AA9] bg-white py-2 px-5 text-gray-800 leading-tight focus:outline-none"
              />

              {/* Show only red (Paragraph 45) */}
              <div className="flex items-center mt-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyRedStudents}
                    onChange={() => setShowOnlyRedStudents(!showOnlyRedStudents)}
                    className="
                      appearance-none 
                      h-4 w-4 
                      border-2 border-[#FF9AA9] 
                      rounded 
                      checked:bg-[#A82036] 
                      checked:border-[#A82036] 
                      focus:outline-none 
                      mr-2 
                    "
                  />
                  <span className="text-gray-800">Paragraph 45</span>
                </label>
              </div>

              {/* Nur nicht entschuldigt */}
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
                    "
                  />
                  <span className="text-gray-800">
                    Fehlstunden pro Schüler*in
                  </span>
                </label>
              </div>

              {/* Filter dropdowns or date range pickers */}
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

                // Only include certain columns in the UI
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

              {/* Buttons for loading/saving config */}
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

      {/* "Statistiken" Button */}
      <div
        className={`relative w-full h-24 my-5 flex items-center justify-start ${statistikColor} shadow-[0px_4px_6px_rgba(0,0,0,0.1)]`}
        onClick={handleTriangleClick}
      >
        <img src="graph-logo.svg" className="pl-8 pr-4" alt="Graph Icon" />
        <p className="text-white font-semibold text-3xl">Statistiken</p>
        {!status && (
          <div className="absolute -right-5 top-1/2 -translate-y-1/2 h-0 w-0 border-y-[22px] border-y-transparent border-l-[24px] border-l-[#A82036]" />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
