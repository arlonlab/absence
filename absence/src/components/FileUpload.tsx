// src/components/FileUpload.jsx
import UploadSVG from "../assets/uploadSVG.svg";

const FileUpload = ({ isDragging, setIsDragging, handleFileUpload }) => {
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFileUpload(file);
  };

  return (
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
        Drag &amp; Drop your Excel file here or
      </h2>
      <label className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-black font-semibold py-2 px-4 rounded">
        Choose File
        <input
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".xls,.xlsx"
        />
      </label>
    </div>
  );
};

export default FileUpload;
