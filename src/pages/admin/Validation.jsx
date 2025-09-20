import { useState, useEffect } from "react";
import { FaDownload, FaUpload, FaDatabase } from "react-icons/fa";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { db } from "../../router/Firebase";
import {
  collection,
  addDoc,
  setDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

const Validation = () => {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMasterlistOpen, setIsMasterlistOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastImport, setLastImport] = useState(null);
  const [lastMasterlistImport, setLastMasterlistImport] = useState(null);

  // ✅ Fetch latest imports
  useEffect(() => {
    const fetchLastImport = async () => {
      try {
        const q = query(
          collection(db, "validationImports"),
          orderBy("importedAt", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setLastImport(snapshot.docs[0].data().importedAt);
        }
      } catch (err) {
        console.error("⚠️ Failed to fetch last validation import:", err);
      }
    };

    const fetchLastMasterlistImport = async () => {
      try {
        const q = query(
          collection(db, "masterlistImports"),
          orderBy("importedAt", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setLastMasterlistImport(snapshot.docs[0].data().importedAt);
        }
      } catch (err) {
        console.error("⚠️ Failed to fetch last masterlist import:", err);
      }
    };

    fetchLastImport();
    fetchLastMasterlistImport();
  }, []);

  // ✅ Check duplicate imports
  const isDuplicateFile = async (fileName, type) => {
    const q = query(
      collection(db, type === "masterlist" ? "masterlistImports" : "validationImports"),
      where("fileName", "==", fileName)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  };

  // ✅ Parse CSV/Excel
  const parseFile = async (file) => {
    if (file.name.endsWith(".csv")) {
      const text = await file.text();
      return Papa.parse(text, { header: true }).data;
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      throw new Error("❌ Only CSV or Excel files are supported.");
    }
  };

  // ✅ Import Validation Results → save to `eligible`
  const handleImportValidation = async (file) => {
    if (!file) return alert("⚠️ Please select a file first.");
    setLoading(true);

    try {
      const alreadyExists = await isDuplicateFile(file.name, "validation");
      if (alreadyExists) {
        alert("❌ This validation file was already imported before.");
        setLoading(false);
        return;
      }

      let parsedData = await parseFile(file);
      parsedData = parsedData.filter(
        (row) => row["SURNAME"]?.trim() && row["FIRST NAME"]?.trim()
      );

      if (!parsedData.length) {
        alert("⚠️ No valid rows (missing names).");
        setLoading(false);
        return;
      }

      let savedCount = 0;
      for (const row of parsedData) {
        const id = row["NO"]?.toString() || crypto.randomUUID();
        await setDoc(doc(db, "eligible", id), {
          no: row["NO"] || null,
          barangay: row["BARANGAY"] || "",
          surname: row["SURNAME"].trim(),
          firstName: row["FIRST NAME"].trim(),
          middleName: row["MIDDLE NAME"]?.trim() || "",
          extName: row["EXT. NAME"]?.trim() || "",
          q1_2025: Number(row["1ST QUARTER 2025"]) || 0,
          q2_2025: Number(row["2ND QUARTER 2025"]) || 0,
          q3_2025: Number(row["3RD QUARTER 2025"]) || 0,
          totalAmountPaid: Number(row["TOTAL AMOUNT PAID"]) || 0,
          importedAt: new Date().toISOString(),
        });
        savedCount++;
      }

      await addDoc(collection(db, "validationImports"), {
        fileName: file.name,
        totalRecords: savedCount,
        importedAt: new Date().toISOString(),
      });

      setLastImport(new Date().toISOString());
      alert(`✅ Successfully saved ${savedCount} eligible records!`);
      setIsImportOpen(false);
    } catch (err) {
      console.error("❌ Validation import failed:", err);
      alert("Error importing validation file. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Import Masterlist → save to `masterlist`
  const handleImportMasterlist = async (file) => {
    if (!file) return alert("⚠️ Please select a file first.");
    setLoading(true);

    try {
      const alreadyExists = await isDuplicateFile(file.name, "masterlist");
      if (alreadyExists) {
        alert("❌ This masterlist file was already imported before.");
        setLoading(false);
        return;
      }

      let parsedData = await parseFile(file);
      parsedData = parsedData.filter(
        (row) => row["LAST NAME"]?.trim() && row["FIRST NAME"]?.trim()
      );

      if (!parsedData.length) {
        alert("⚠️ No valid rows (missing names).");
        setLoading(false);
        return;
      }

      let savedCount = 0;
      for (const row of parsedData) {
        const id = row["ID NO."]?.toString() || crypto.randomUUID();
        await setDoc(doc(db, "masterlist", id), {
          no: row["NO"] || null,
          barangay: row["BARANGAY"] || "",
          surname: row["LAST NAME"]?.trim() || "",
          firstName: row["FIRST NAME"]?.trim() || "",
          middleName: row["MIDDLE NAME"]?.trim() || "",
          purok: row["PUROK"] || "",
          birthDate: row["BIRTH DATE"] || null,
          idNo: row["ID NO."] || "",
          importedAt: new Date().toISOString(),
        });
        savedCount++;
      }

      await addDoc(collection(db, "masterlistImports"), {
        fileName: file.name,
        totalRecords: savedCount,
        importedAt: new Date().toISOString(),
      });

      setLastMasterlistImport(new Date().toISOString());
      alert(`✅ Successfully saved ${savedCount} masterlist records!`);
      setIsMasterlistOpen(false);
    } catch (err) {
      console.error("❌ Masterlist import failed:", err);
      alert("Error importing masterlist file. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Export (dummy for now)
  const handleExport = (file) => {
    if (file) {
      alert(`📤 Sending ${file.name} to DSWD...`);
      setIsExportOpen(false);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">DSWD Validation</h1>
      <p className="text-gray-600 text-sm">External validation process management</p>

      {/* Export, Masterlist, Import Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Export */}
        <Card
          icon={<FaDownload className="text-orange-500 text-3xl" />}
          title="Export List for DSWD"
          subtitle="Choose a file and send to DSWD email"
          footer={`Registrants: 1,247`}
          buttonLabel="Send to DSWD"
          onClick={() => setIsExportOpen(true)}
          buttonStyle="bg-blue-600 hover:bg-blue-700"
        />

        {/* Masterlist */}
        <Card
          icon={<FaDatabase className="text-orange-500 text-3xl" />}
          title="Import Masterlist"
          subtitle="Upload the official senior list"
          footer={`Last Import: ${
            lastMasterlistImport
              ? new Date(lastMasterlistImport).toLocaleString()
              : "No imports yet"
          }`}
          buttonLabel="Import Masterlist"
          onClick={() => setIsMasterlistOpen(true)}
          buttonStyle="bg-purple-600 hover:bg-purple-700"
        />

        {/* Validation */}
        <Card
          icon={<FaUpload className="text-orange-500 text-3xl" />}
          title="Import Validation Results"
          subtitle="Upload results returned by DSWD"
          footer={`Last Import: ${
            lastImport ? new Date(lastImport).toLocaleString() : "No imports yet"
          }`}
          buttonLabel="Import Results"
          onClick={() => setIsImportOpen(true)}
          buttonStyle="bg-green-600 hover:bg-green-700"
        />
      </div>

      {/* Modals */}
      {isExportOpen && (
        <Modal
          title="Send Export List to DSWD"
          onClose={() => setIsExportOpen(false)}
          onConfirm={handleExport}
          confirmLabel="Send to DSWD"
        />
      )}
      {isMasterlistOpen && (
        <Modal
          title="Import Masterlist"
          onClose={() => setIsMasterlistOpen(false)}
          onConfirm={handleImportMasterlist}
          confirmLabel={loading ? "Importing..." : "Import Masterlist"}
        />
      )}
      {isImportOpen && (
        <Modal
          title="Import Validation Results"
          onClose={() => setIsImportOpen(false)}
          onConfirm={handleImportValidation}
          confirmLabel={loading ? "Importing..." : "Import Results"}
        />
      )}
    </div>
  );
};

// ✅ Card Component
const Card = ({ icon, title, subtitle, footer, buttonLabel, onClick, buttonStyle }) => (
  <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center text-center space-y-4">
    {icon}
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    <p className="text-sm text-gray-600">{subtitle}</p>
    <div className="bg-gray-100 rounded-md px-4 py-2 text-gray-700 text-sm">
      {footer}
    </div>
    <button
      className={`${buttonStyle} text-white px-4 py-2 rounded-md shadow flex items-center gap-2`}
      onClick={onClick}
    >
      {buttonLabel}
    </button>
  </div>
);

// ✅ Reusable Modal
const Modal = ({ title, onClose, onConfirm, confirmLabel }) => {
  const [file, setFile] = useState(null);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">Upload a CSV/Excel file</p>
        <div className="mt-4 border-2 border-dashed border-gray-300 p-6 text-center rounded-lg">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full cursor-pointer"
          />
          {file && <p className="mt-2 text-sm">Selected: {file.name}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="px-4 py-2 bg-gray-300 rounded-lg" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
            onClick={() => file && onConfirm(file)}
            disabled={!file}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Validation;
