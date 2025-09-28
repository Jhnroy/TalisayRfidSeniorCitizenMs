import { useState, useEffect } from "react";
import { FaDownload, FaUpload, FaDatabase } from "react-icons/fa";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { rtdb } from "../../router/Firebase"; // RTDB only
import {
  ref,
  set as rtdbSet,
  get,
  query,
  orderByChild,
  limitToLast,
  equalTo,
} from "firebase/database";
import emailjs from "emailjs-com"; // ✅ EmailJS

const Validation = () => {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isMasterlistOpen, setIsMasterlistOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [lastImport, setLastImport] = useState(null);
  const [lastMasterlistImport, setLastMasterlistImport] = useState(null);
  const [lastExport, setLastExport] = useState(null);

  // ================== FETCH LAST IMPORTS / EXPORT ==================
  useEffect(() => {
    const fetchLastImport = async () => {
      try {
        const q = query(
          ref(rtdb, "validationImports"),
          orderByChild("importedAt"),
          limitToLast(1)
        );
        const snapshot = await get(q);
        if (snapshot.exists()) {
          const data = Object.values(snapshot.val())[0];
          setLastImport(new Date(data.importedAt));
        }
      } catch (err) {
        console.error("⚠️ Failed to fetch last validation import:", err);
      }
    };

    const fetchLastMasterlistImport = async () => {
      try {
        const q = query(
          ref(rtdb, "masterlistImports"),
          orderByChild("importedAt"),
          limitToLast(1)
        );
        const snapshot = await get(q);
        if (snapshot.exists()) {
          const data = Object.values(snapshot.val())[0];
          setLastMasterlistImport(new Date(data.importedAt));
        }
      } catch (err) {
        console.error("⚠️ Failed to fetch last masterlist import:", err);
      }
    };

    const fetchLastExport = async () => {
      try {
        const q = query(
          ref(rtdb, "validationExports"),
          orderByChild("sentAt"),
          limitToLast(1)
        );
        const snapshot = await get(q);
        if (snapshot.exists()) {
          const data = Object.values(snapshot.val())[0];
          setLastExport(new Date(data.sentAt));
        }
      } catch (err) {
        console.error("⚠️ Failed to fetch last export:", err);
      }
    };

    fetchLastImport();
    fetchLastMasterlistImport();
    fetchLastExport();
  }, []);

  // ================== DUPLICATE FILE CHECK ==================
  const isDuplicateFile = async (fileName, type) => {
    try {
      const q = query(
        ref(
          rtdb,
          type === "masterlist" ? "masterlistImports" : "validationImports"
        ),
        orderByChild("fileName"),
        equalTo(fileName)
      );
      const snapshot = await get(q);
      return snapshot.exists();
    } catch (err) {
      console.error("⚠️ Failed to check duplicate file:", err);
      return false;
    }
  };

  // ================== FILE PARSER ==================
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

  // ================== HELPER: ID GEN ==================
  const generateId = (baseId) => {
    return baseId
      ? baseId.toString()
      : `${Date.now().toString()}-${Math.random().toString(36).substr(2, 5)}`;
  };

  // ================== IMPORT VALIDATION ==================
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
        const id = generateId(row["NO"]);
        const record = {
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
          importedAt: Date.now(),
        };

        await rtdbSet(ref(rtdb, `eligible/${id}`), record);
        savedCount++;
      }

      // Log import
      const logId = generateId();
      await rtdbSet(ref(rtdb, `validationImports/${logId}`), {
        fileName: file.name,
        totalRecords: savedCount,
        importedAt: Date.now(),
      });

      setLastImport(new Date());
      alert(`✅ Successfully saved ${savedCount} eligible records!`);
      setIsImportOpen(false);
    } catch (err) {
      console.error("❌ Validation import failed:", err);
      alert("Error importing validation file. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // ================== IMPORT MASTERLIST ==================
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
        const id = generateId(row["ID NO."]);
        const record = {
          no: row["NO"] || null,
          barangay: row["BARANGAY"] || "",
          surname: row["LAST NAME"]?.trim() || "",
          firstName: row["FIRST NAME"]?.trim() || "",
          middleName: row["MIDDLE NAME"]?.trim() || "",
          purok: row["PUROK"] || "",
          birthDate: row["BIRTH DATE"] || null,
          idNo: row["ID NO."] || "",
          importedAt: Date.now(),
        };

        await rtdbSet(ref(rtdb, `masterlist/${id}`), record);
        savedCount++;
      }

      const logId = generateId();
      await rtdbSet(ref(rtdb, `masterlistImports/${logId}`), {
        fileName: file.name,
        totalRecords: savedCount,
        importedAt: Date.now(),
      });

      setLastMasterlistImport(new Date());
      alert(`✅ Successfully saved ${savedCount} masterlist records!`);
      setIsMasterlistOpen(false);
    } catch (err) {
      console.error("❌ Masterlist import failed:", err);
      alert("Error importing masterlist file. Check console.");
    } finally {
      setLoading(false);
    }
  };

  // ================== EXPORT WITH ATTACHMENT ==================
  const handleExport = (file) => {
    if (!file) return alert("⚠️ Please select a file first.");

    if (file.size > 25 * 1024 * 1024) {
      alert("❌ File too large. Max 25MB allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64File = reader.result.split(",")[1]; // strip header

      try {
        await emailjs.send(
          "service_6au9z6a", // ✅ Your EmailJS service ID
          "template_1o119d9", // ✅ Your template ID
          {
            to_email: "rascojohnroy47@gmail.com",
            name: "MSWDO System",
            time: new Date().toLocaleString(),
            message: `Attached is the export file: ${file.name}`,
          },
          "NPDvgPunvpY19VhM4", // ✅ Your Public Key
          {
            attachments: [
              {
                name: file.name,
                data: base64File,
              },
            ],
          }
        );

        // Log export
        const logId = generateId();
        const now = Date.now();
        await rtdbSet(ref(rtdb, `validationExports/${logId}`), {
          fileName: file.name,
          sentAt: now,
        });

        setLastExport(new Date(now));
        alert(`✅ Successfully sent ${file.name} with attachment!`);
        setIsExportOpen(false);
      } catch (err) {
        console.error("❌ Failed to send:", err);
        alert("Error sending file. Check console.");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">DSWD Validation</h1>
      <p className="text-gray-600 text-sm">
        External validation process management
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          icon={<FaDownload className="text-orange-500 text-3xl" />}
          title="Export List for DSWD"
          subtitle="Choose a file and send to DSWD email"
          footer={`Last Sent: ${
            lastExport ? lastExport.toLocaleString() : "No exports yet"
          }`}
          buttonLabel="Send to DSWD"
          onClick={() => setIsExportOpen(true)}
          buttonStyle="bg-blue-600 hover:bg-blue-700"
        />

        <Card
          icon={<FaDatabase className="text-orange-500 text-3xl" />}
          title="Import Masterlist"
          subtitle="Upload the official senior list"
          footer={`Last Import: ${
            lastMasterlistImport
              ? lastMasterlistImport.toLocaleString()
              : "No imports yet"
          }`}
          buttonLabel="Import Masterlist"
          onClick={() => setIsMasterlistOpen(true)}
          buttonStyle="bg-purple-600 hover:bg-purple-700"
        />

        <Card
          icon={<FaUpload className="text-orange-500 text-3xl" />}
          title="Import Validation Results"
          subtitle="Upload results returned by DSWD"
          footer={`Last Import: ${
            lastImport ? lastImport.toLocaleString() : "No imports yet"
          }`}
          buttonLabel="Import Results"
          onClick={() => setIsImportOpen(true)}
          buttonStyle="bg-green-600 hover:bg-green-700"
        />
      </div>

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

// ================== CARD COMPONENT ==================
const Card = ({
  icon,
  title,
  subtitle,
  footer,
  buttonLabel,
  onClick,
  buttonStyle,
}) => (
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

// ================== MODAL COMPONENT ==================
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
          <button
            className="px-4 py-2 bg-gray-300 rounded-lg"
            onClick={onClose}
          >
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
