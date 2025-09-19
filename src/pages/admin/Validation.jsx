import { useState } from "react";
import { FaDownload, FaUpload } from "react-icons/fa";
import Papa from "papaparse";   // ✅ for CSV
import * as XLSX from "xlsx";  // ✅ for Excel
import { db } from "../../router/Firebase"; // adjust path kung nasa ibang folder
import { collection, addDoc, setDoc, doc } from "firebase/firestore";

const Validation = () => {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // ✅ Import and Save to Firebase
  const handleImport = async () => {
    if (!file) return;

    try {
      let parsedData = [];

      if (file.name.endsWith(".csv")) {
        const text = await file.text();
        const result = Papa.parse(text, { header: true });
        parsedData = result.data.filter((row) => Object.keys(row).length > 0);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        parsedData = XLSX.utils
          .sheet_to_json(workbook.Sheets[sheetName])
          .filter((row) => Object.keys(row).length > 0);
      } else {
        alert("Only CSV or Excel supported for now.");
        return;
      }

      console.log("📥 Imported Data:", parsedData);

      // 🔥 Save each row into Firestore
      for (const row of parsedData) {
        const id = row.id || crypto.randomUUID();
        await setDoc(doc(db, "registrants", id), {
          name: row.name || row.fullName || "Unknown",
          barangay: row.barangay || "",
          status: row.status || "pending",
          dswdRemarks: row.dswdRemarks || null,
          importedAt: new Date().toISOString(),
        });
      }

      // 🔥 Save import history
      await addDoc(collection(db, "validationImports"), {
        fileName: file.name,
        totalRecords: parsedData.length,
        importedAt: new Date().toISOString(),
      });

      alert(`✅ Successfully saved ${parsedData.length} records to Firebase!`);

      setIsImportOpen(false);
      setFile(null);
    } catch (error) {
      console.error("❌ Import failed:", error);
      alert("Error importing file. Check console.");
    }
  };

  // ✅ Export (fake for now — you can replace with real backend/email sending)
  const handleExport = () => {
    if (file) {
      alert(`📤 Sending ${file.name} to DSWD...`);
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

      {/* Validation Steps */}
      <div className="bg-white p-6 rounded-xl shadow grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold">
            1
          </div>
          <h2 className="mt-3 font-semibold text-gray-800">Export List</h2>
          <p className="text-sm text-gray-600">Send registrants list to DSWD</p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold">
            2
          </div>
          <h2 className="mt-3 font-semibold text-gray-800">DSWD Review</h2>
          <p className="text-sm text-gray-600">DSWD validates eligibility</p>
        </div>

        <div className="flex flex-col items-center text-center">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold">
            3
          </div>
          <h2 className="mt-3 font-semibold text-gray-800">Import Results</h2>
          <p className="text-sm text-gray-600">Upload results to update</p>
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
            Upload results returned by DSWD
          </p>
          <div className="bg-gray-100 rounded-md px-4 py-2 text-gray-700 text-sm">
            Last Import: <span className="font-semibold">2024-01-15 14:30:22</span>
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
              Select the file to send to DSWD
            </p>
            <div className="mt-4 border-2 border-dashed border-gray-300 p-6 text-center rounded-lg">
              <input
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                onChange={handleFileChange}
                className="w-full cursor-pointer"
              />
              {file && <p className="mt-2 text-sm">Selected: {file.name}</p>}
            </div>
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
              Upload the validation results file (CSV/Excel only)
            </p>
            <div className="mt-4 border-2 border-dashed border-gray-300 p-6 text-center rounded-lg">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="w-full cursor-pointer"
              />
              {file && <p className="mt-2 text-sm">Selected: {file.name}</p>}
            </div>
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
