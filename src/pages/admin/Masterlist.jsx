import React, { useState } from "react";

const Masterlist = () => {
  const [activeTab, setActiveTab] = useState("overall");

  const data = [
    {
      name: "Isabela Morales",
      barangay: "Barangay Binusuan",
      status: "Eligible",
      rfidStatus: "Not Registered",
      pensionReceived: "No",
      missed: 0,
      lastClaim: "Never",
    },
    {
      name: "Roberto Mendoza",
      barangay: "Barangay Cawigaan",
      status: "Eligible",
      rfidStatus: "Registered",
      pensionReceived: "No",
      missed: 1,
      lastClaim: "11/01/2023",
    },
    // Add more rows...
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Masterlist</h1>
      <p className="text-gray-600">
        Official Validated Senior Citizens
      </p>

      {/* Search + Filters */}
      <div className="mt-4 flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search by name..."
          className="border px-3 py-2 rounded-md w-64"
        />
        <select className="border px-3 py-2 rounded-md">
          <option>All Barangays</option>
          <option>Barangay Binusuan</option>
          <option>Barangay Cawigaan</option>
        </select>
        <select className="border px-3 py-2 rounded-md">
          <option>All Statuses</option>
          <option>Eligible</option>
          <option>Not Eligible</option>
          <option>Removed</option>
        </select>
        <button className="border border-gray-400 px-3 py-2 rounded-md">
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
            {data.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="px-4 py-2">{row.name}</td>
                <td className="px-4 py-2">{row.barangay}</td>
                <td
                  className={`px-4 py-2 font-medium ${
                    row.status === "Eligible"
                      ? "text-green-600"
                      : row.status === "Removed"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {row.status}
                </td>
                <td
                  className={`px-4 py-2 ${
                    row.rfidStatus === "Registered"
                      ? "text-blue-600"
                      : "text-red-500"
                  }`}
                >
                  {row.rfidStatus}
                </td>
                <td>{row.pensionReceived}</td>
                <td>{row.missed}</td>
                <td>{row.lastClaim}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span>Showing 1 to 20 of 270 results</span>
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
