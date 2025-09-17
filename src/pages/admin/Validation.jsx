import { useState } from "react";
import { FaDownload, FaUpload } from "react-icons/fa";

const Validation = () => {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = () => {
    if (file) {
      console.log("Importing file:", file.name);
      // TODO: Upload/parse and save to Firebase
      setIsImportOpen(false);
      setFile(null);
    }
  };

  const handleExport = () => {
    if (file) {
      console.log("Sending file to DSWD email:", file.name);
      // TODO: Send file to DSWD email via backend API (Node.js, Firebase, etc.)
      setIsExportOpen(false);
      setFile(null);
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">DSWD Validation</h1>
        <p className="text-gray-600 text-sm">
          External validation process management
        </p>
      </div>

      {/* Validation Process Steps */}
      <div className="bg-white p-6 rounded-xl shadow grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold">
            1
          </div>
          <h2 className="mt-3 font-semibold text-gray-800">Export List</h2>
          <p className="text-sm text-gray-600">
            Send registrants list to DSWD for review
          </p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold">
            2
          </div>
          <h2 className="mt-3 font-semibold text-gray-800">DSWD Review</h2>
          <p className="text-sm text-gray-600">
            DSWD validates eligibility and returns results
          </p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold">
            3
          </div>
          <h2 className="mt-3 font-semibold text-gray-800">Import Results</h2>
          <p className="text-sm text-gray-600">
            Upload validation results to update statuses
          </p>
        </div>
      </div>

      {/* Export & Import Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center text-center space-y-4">
          <FaDownload className="text-orange-500 text-3xl" />
          <h3 className="text-lg font-semibold text-gray-800">
            Export List for DSWD
          </h3>
          <p className="text-sm text-gray-600">
            Choose a file and send to DSWD email
          </p>
          <div className="bg-gray-100 rounded-md px-4 py-2 text-gray-700 font-semibold">
            Registrants: <span className="text-gray-900">1,247</span>
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md shadow hover:bg-blue-700 flex items-center gap-2"
            onClick={() => setIsExportOpen(true)}
          >
            <FaDownload /> Send to DSWD
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center text-center space-y-4">
          <FaUpload className="text-orange-500 text-3xl" />
          <h3 className="text-lg font-semibold text-gray-800">
            Import Validation Results
          </h3>
          <p className="text-sm text-gray-600">
            Upload results returned by DSWD to update statuses
          </p>
          <div className="bg-gray-100 rounded-md px-4 py-2 text-gray-700 text-sm">
            Last Import:{" "}
            <span className="font-semibold">2024-01-15 14:30:22</span>
          </div>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 flex items-center gap-2"
            onClick={() => setIsImportOpen(true)}
          >
            <FaUpload /> Import Results
          </button>
        </div>
      </div>

      {/* Export Modal */}
      {isExportOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-bold">Send Export List to DSWD</h2>
            <p className="mt-2 text-sm text-gray-600">
              Select the file to send to DSWD via email
            </p>

            {/* File Upload */}
            <div className="mt-4 border-2 border-dashed border-gray-300 p-6 text-center rounded-lg">
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                onChange={handleFileChange}
                className="w-full cursor-pointer"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-700">
                  Selected file:{" "}
                  <span className="font-semibold">{file.name}</span>
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => setIsExportOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
                onClick={handleExport}
                disabled={!file}
              >
                Send to DSWD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-bold">Import Validation Results</h2>
            <p className="mt-2 text-sm text-gray-600">
              Upload the validation results file received from DSWD
              <br />
              <span className="text-red-500">
                Supported formats: CSV, Excel (.xlsx, .xls), PDF
              </span>
            </p>

            {/* File Upload */}
            <div className="mt-4 border-2 border-dashed border-gray-300 p-6 text-center rounded-lg">
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                onChange={handleFileChange}
                className="w-full cursor-pointer"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-700">
                  Selected file:{" "}
                  <span className="font-semibold">{file.name}</span>
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded-lg"
                onClick={() => setIsImportOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
                onClick={handleImport}
                disabled={!file}
              >
                Import Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Validation;
