// src/components/DataTable.jsx
const DataTable = ({
  fileName,
  handleRemove,
  exportToExcel,
  groupByStudent,
  sortedFilteredData,
  highlightedStudents,
  showOnlyRedStudents,
  sortedAggregatedData,
  handleSort,
  sortConfig,
}) => {
  // Columns for ungrouped data (if any rows exist)
  const ungroupedColumns =
    !groupByStudent && sortedFilteredData.length > 0
      ? Object.keys(sortedFilteredData[0])
      : [];

  // Columns for grouped data (we specified them manually in the original code)
  const groupedColumns = ["Schüler*innen", "Fehlstd.", "Min."];

  // 1) For the ungrouped table: create a displayedData array
  // so the footer sum only includes rows actually shown in <tbody>.
  const ungroupedDisplayedData = sortedFilteredData.filter(
    (row) =>
      // Only show red students if "Paragraph 45" filter is on
      !showOnlyRedStudents || highlightedStudents.has(row["Schüler*innen"])
  );

  // 2) Helper to check if all values in a column are numeric
  const isNumericColumn = (column, data) => {
    return data.every((row) => !isNaN(parseFloat(row[column])));
  };

  return (
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

      {/* =====================================
          UNGROUPED TABLE
         ===================================== */}
      {!groupByStudent && ungroupedDisplayedData.length > 0 && (
        <div className="overflow-auto max-h-[70vh] border border-[#dddbdb]">
          <table className="table-auto border-collapse w-full text-black">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                {ungroupedColumns.map((key) => (
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
              {ungroupedDisplayedData.map((row, rowIndex) => {
                return (
                  <tr key={rowIndex}>
                    {ungroupedColumns.map((key, cellIndex) => {
                      const value = row[key];
                      const isStudentColumn = key === "Schüler*innen";

                      return (
                        <td
                          key={cellIndex}
                          className={`border p-2 bg-white ${
                            isStudentColumn &&
                            highlightedStudents.has(value)
                              ? "text-red-500 font-bold"
                              : ""
                          }`}
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>

            {/* Footer sums the same displayedData we used in the body. */}
            <tfoot>
              <tr className="bg-gray-200 font-bold">
                {ungroupedColumns.map((key, index) => {
                  // Exclude any columns that shouldn't be summed
                  const excludedColumns = ["Klasse", "Datum", "Beginndatum"];
                  if (excludedColumns.includes(key)) {
                    return <td key={index} className="border p-2 text-center" />;
                  }

                  // If it's numeric, sum up from ungroupedDisplayedData
                  if (isNumericColumn(key, ungroupedDisplayedData)) {
                    const total = ungroupedDisplayedData.reduce(
                      (sum, dRow) => sum + parseFloat(dRow[key] || 0),
                      0
                    );

                    return (
                      <td key={index} className="border p-2 text-center">
                        {total}
                      </td>
                    );
                  }

                  // Otherwise leave it blank
                  return <td key={index} className="border p-2 text-center" />;
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* =====================================
          GROUPED TABLE
         ===================================== */}
      {groupByStudent && sortedAggregatedData.length > 0 && (
        <div className="overflow-auto max-h-[70vh] border border-[#dddbdb]">
          <table className="table-auto border-collapse w-full text-black">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                {groupedColumns.map((col) => (
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
              {sortedAggregatedData.map((item, idx) => {
                const student = item["Schüler*innen"];
                return (
                  <tr key={idx}>
                    <td
                      className={`border p-2 bg-white ${
                        highlightedStudents.has(student)
                          ? "text-red-500 font-bold"
                          : ""
                      }`}
                    >
                      {student}
                    </td>
                    <td className="border p-2 bg-white">
                      {item["Fehlstd."].toFixed(2)}
                    </td>
                    <td className="border p-2 bg-white">
                      {item["Min."].toFixed(0)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* 
              Note: If you want a footer sum for the grouped table, 
              you can do something similar to the ungrouped version 
              (but you'd sum the aggregated data).
            */}
          </table>
        </div>
      )}
    </div>
  );
};

export default DataTable;
