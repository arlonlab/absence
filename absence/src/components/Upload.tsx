import React, { useState } from "react";
import * as XLSX from "xlsx";
import UploadSVG from "../assets/uploadSVG.svg";
import ExcelTable from "./ExcelTable";
import FilterMenu from "./FilterMenu";

const Upload = () => {
  const [fileName, setFileName] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [originData, setOriginData] = useState([]); // Originaldaten speichern
  const [mode, setMode] = useState('filter'); // Originaldaten speichern

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      readExcel(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      readExcel(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const readExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setTableData(jsonData);
      setOriginData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  // Function to remove the uploaded file and reset state
  const handleRemove = () => {
    setFileName(null);
    setTableData([]);
  };

  const filterTableData = (data, searchQuery) => {
    if (!searchQuery) return data;

    const header = data[0];
    const rows = data.slice(1);

    const filteredRows = rows.filter((row) =>
      row.some((cell) =>
        cell?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );

    return [header, ...filteredRows];
  };

  const Search = (input: string) => {
    setSearchQuery(input);

    const filteredData = filterTableData(originData, input);
    setTableData(filteredData);
  };

  const ChangeMode = () => {
    

    setMode((prevMode) =>
      prevMode === "filter" ? "statistik" : "filter"

    );

  };

  return (
    <>
      {/* Hauptlayout */}
      <div className="flex w-full h-[91vh]">
        {/* Linker Bereich mit FilterMenu */}

        <div className="w-1/4 bg-[#ebe9e9]">
          <FilterMenu onClick={Search} onChange={ChangeMode} />
        </div>

        {/* Trennlinie */}
        <div className="w-0.5 bg-[#D9D7D7]"></div>

        {/* Rechter Bereich mit Upload */}
        {mode === 'filter' ?(
        <div className="w-full bg-[#ebe9e9] flex justify-center items-center">
          {!fileName && (
            <div
              className={`bg-white w-[50vw] h-[30vh] flex flex-col items-center rounded-3xl shadow-lg border-black border-2 p-12 ${
                isDragging ? "border-blue-500" : ""
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col justify-center items-center">
                <img
                  src={UploadSVG}
                  alt="upload"
                  className="w-[3vw] text-black"
                />
              </div>
              <h2 className="text-2xl m-4">
                Drag & Drop your Excel file here or
              </h2>
              <div className="flex items-center">
                <label className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded">
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          )}


          {fileName && tableData.length > 0 && (
            <ExcelTable
              tableData={tableData}
              fileName={fileName}
              handleRemove={handleRemove}
            />
          )}
        </div>
                    ) : null}

      </div>

    </>
  );
};

export default Upload;
