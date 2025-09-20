import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../router/Firebase";

const barangays = [
  "Binanuun",
  "Caawigan",
  "Cahabaan",
  "Calintaan",
  "Del carmen",
  "Gabon",
  "Itomang",
  "Poblacion",
  "San Francisco",
  "San isidro",
  "San Jose",
  "San nicolas",
  "Sta. Cruz",
  "Sta. Elena",
  "Sto. Niño",
];

// Helper function to normalize names
const normalizeName = (first, middle, surname) => {
  return `${(first || "").trim()} ${(middle || "").trim()} ${(surname || "").trim()}`
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const Masterlist = () => {
  const [activeTab, setActiveTab] = useState("overall");
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Fetch masterlist and eligible, then merge
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const masterSnap = await getDocs(collection(db, "masterlist"));
        const eligibleSnap = await getDocs(collection(db, "eligible"));

        const masterData = masterSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const eligibleData = eligibleSnap.docs.map((doc) => ({
          ...doc.data(),
        }));

        // Normalize eligible names for matching
        const eligibleMap = eligibleData.map((e) => ({
          ...e,
          normName: normalizeName(e.firstName, e.middleName, e.surname),
        }));

        // 1️⃣ Merge into masterlist (overall)
        const mergedOverall = masterData.map((person) => {
          const normMaster = normalizeName(
            person.firstName,
            person.middleName,
            person.surname
          );
          const match = eligibleMap.find((e) => e.normName === normMaster);

          return {
            ...person,
            status: match ? "Eligible" : "Active",
            rfidStatus: match?.rfidStatus || "Not Registered",
            pensionReceived: match?.pensionReceived || "No",
            missed: match?.missed || 0,
            lastClaim: match?.lastClaim || "Never",
          };
        });

        // 2️⃣ Pensioners tab (only from eligible)
        const pensionersOnly = eligibleMap.map((e, idx) => ({
          id: `eligible-${idx}`,
          ...e,
          status: "Eligible",
          rfidStatus: e.rfidStatus || "Not Registered",
          pensionReceived: e.pensionReceived || "No",
          missed: e.missed || 0,
          lastClaim: e.lastClaim || "Never",
        }));

        setRecords({ overall: mergedOverall, pensioners: pensionersOnly });
        setFilteredRecords(mergedOverall);
      } catch (error) {
        console.error("❌ Error fetching records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  // Apply filters and tab selection
  useEffect(() => {
    if (!records || loading) return;

    let sourceData =
      activeTab === "overall" ? records.overall || [] : records.pensioners || [];

    let filtered = [...sourceData];

    // Search by name
    if (search.trim() !== "") {
      filtered = filtered.filter((row) => {
        const fullName = normalizeName(
          row.firstName,
          row.middleName,
          row.surname
        );
        return fullName.includes(search.toLowerCase());
      });
    }

    // Barangay filter
    if (barangayFilter !== "All") {
      filtered = filtered.filter(
        (row) =>
          row.barangay?.toLowerCase() === barangayFilter.toLowerCase()
      );
    }

    // Status filter (only for overall)
    if (statusFilter !== "All" && activeTab === "overall") {
      filtered = filtered.filter(
        (row) =>
          (row.status || "Active").toLowerCase() ===
          statusFilter.toLowerCase()
      );
    }

    setFilteredRecords(filtered);
  }, [search, barangayFilter, statusFilter, activeTab, records, loading]);

  const resetFilters = () => {
    setSearch("");
    setBarangayFilter("All");
    setStatusFilter("All");
    setActiveTab("overall");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Masterlist</h1>
      <p className="text-gray-600">Official Validated Senior Citizens</p>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-md w-64"
        />
        <select
          className="border px-3 py-2 rounded-md"
          value={barangayFilter}
          onChange={(e) => setBarangayFilter(e.target.value)}
        >
          <option value="All">All Barangays</option>
          {barangays.map((brgy) => (
            <option key={brgy} value={brgy}>
              {brgy}
            </option>
          ))}
        </select>
        {activeTab === "overall" && (
          <select
            className="border px-3 py-2 rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Eligible">Eligible</option>
            <option value="Active">Active</option>
            <option value="Removed">Removed</option>
          </select>
        )}
        <button
          className="border border-gray-400 px-3 py-2 rounded-md"
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex">
        <button
          onClick={() => setActiveTab("overall")}
          className={`px-6 py-2 rounded-t-lg font-semibold ${
            activeTab === "overall"
              ? "bg-orange-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Overall List
        </button>
        <button
          onClick={() => setActiveTab("pensioners")}
          className={`px-6 py-2 rounded-t-lg font-semibold ${
            activeTab === "pensioners"
              ? "bg-orange-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Pensioners
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow border border-gray-200 rounded-b-lg">
        {loading ? (
          <p className="p-4 text-center text-gray-500">Loading records...</p>
        ) : filteredRecords.length === 0 ? (
          <p className="p-4 text-center text-gray-500">No records found.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Barangay</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">RFID Status</th>
                <th className="px-4 py-2">Pension Received</th>
                <th className="px-4 py-2">Missed Consecutive</th>
                <th className="px-4 py-2">Last Claim Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((row, idx) => (
                <tr key={row.id || idx} className="border-t">
                  <td className="px-4 py-2">
                    {row.surname}, {row.firstName} {row.middleName || ""}
                  </td>
                  <td className="px-4 py-2">{row.barangay}</td>
                  <td
                    className={`px-4 py-2 font-medium ${
                      row.status === "Eligible"
                        ? "text-green-600"
                        : row.status === "Active"
                        ? "text-blue-600"
                        : row.status === "Removed"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {row.status}
                  </td>
                  <td className="px-4 py-2">{row.rfidStatus}</td>
                  <td>{row.pensionReceived}</td>
                  <td>{row.missed}</td>
                  <td>{row.lastClaim}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination (placeholder) */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span>Showing {filteredRecords.length} results</span>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded">Previous</button>
          <button className="px-3 py-1 border rounded bg-orange-500 text-white">
            1
          </button>
          <button className="px-3 py-1 border rounded">Next</button>
        </div>
      </div>
    </div>
  );
};

export default Masterlist;
