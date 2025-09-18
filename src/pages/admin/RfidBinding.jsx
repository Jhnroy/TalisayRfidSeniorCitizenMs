import React, { useState } from "react";
import { FaSearch, FaLink } from "react-icons/fa";

const RfidBinding = () => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [rfidCode, setRfidCode] = useState("");
  const [bindings, setBindings] = useState([]);

  // Mock eligible members (replace with Firebase/DB later)
  const members = [
    { id: 1, name: "Isabel Morales", age: 60, barangay: "San Antonio", status: "Eligible" },
    { id: 2, name: "Fernando Lopez", age: 65, barangay: "San Jose", status: "Eligible" },
    { id: 3, name: "Maria Rodriguez", age: 83, barangay: "Poblacion", status: "Eligible" },
    { id: 4, name: "Minerva Santos", age: 72, barangay: "San Antonio", status: "Eligible" },
    { id: 5, name: "Lucy Dy", age: 61, barangay: "San Jose", status: "Eligible" },
    { id: 6, name: "Julius Rodriguez", age: 88, barangay: "Poblacion", status: "Eligible" },
  ];

  const handleSelectMember = (member) => {
    setSelectedMember(member);
  };

  const handleBindRfid = () => {
    if (!selectedMember || !rfidCode) return alert("Select a member and scan RFID first!");
    const newBinding = {
      ...selectedMember,
      rfidCode,
      date: new Date().toLocaleDateString(),
      status: "Bound",
    };
    setBindings([...bindings, newBinding]);
    setSelectedMember(null);
    setRfidCode("");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">RFID Binding</h1>
      <p className="text-gray-500">Bind RFID cards to validated senior citizens</p>

      {/* Top Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* RFID Scanning Form */}
        <div className="bg-white shadow rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-4">RFID Scanning Form</h2>
          <div className="mb-3">
            <label className="text-sm text-gray-600">Selected Member</label>
            <input
              type="text"
              value={selectedMember ? selectedMember.name : ""}
              disabled
              className="w-full border rounded-lg p-2 mt-1 bg-gray-100"
            />
          </div>
          <div className="mb-3">
            <label className="text-sm text-gray-600">RFID Scanner Field</label>
            <input
              type="text"
              placeholder="Scanned RFID code will appear here"
              value={rfidCode}
              onChange={(e) => setRfidCode(e.target.value)}
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>
          <div className="flex space-x-3 mt-4">
            <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
              Start RFID Scan
            </button>
            <button
              onClick={handleBindRfid}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-orange-700"
            >
              <FaLink className="mr-2" /> Bind RFID
            </button>
          </div>
        </div>

        {/* RFID Bindings */}
        <div className="bg-white shadow rounded-xl p-5">
          <h2 className="font-semibold text-lg mb-4">
            RFID Bindings ({bindings.length} records)
          </h2>
          {bindings.length === 0 ? (
            <div className="text-center text-gray-400 py-10">
              <p>No RFID bindings yet</p>
              <p className="text-sm">Start by selecting a member and scanning RFID</p>
            </div>
          ) : (
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Barangay</th>
                  <th className="p-2 border">RFID Code</th>
                  <th className="p-2 border">Date</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {bindings.map((b, i) => (
                  <tr key={i}>
                    <td className="p-2 border">{b.name}</td>
                    <td className="p-2 border">{b.barangay}</td>
                    <td className="p-2 border font-mono">{b.rfidCode}</td>
                    <td className="p-2 border">{b.date}</td>
                    <td className="p-2 border text-green-600">{b.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Eligible Members */}
      <div className="bg-white shadow rounded-xl p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-lg">Eligible Members (No RFID)</h2>
          <select className="border rounded-lg p-2">
            <option>All Barangays</option>
            <option>San Antonio</option>
            <option>San Jose</option>
            <option>Poblacion</option>
          </select>
        </div>

        <div className="flex items-center border rounded-lg mb-4 p-2">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search member..."
            className="flex-1 outline-none"
          />
        </div>

        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Barangay</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td className="p-2 border">
                  {m.name}
                  <div className="text-xs text-gray-500">Age: {m.age}</div>
                </td>
                <td className="p-2 border">{m.barangay}</td>
                <td className="p-2 border text-green-600">{m.status}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => handleSelectMember(m)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      selectedMember?.id === m.id
                        ? "bg-red-100 text-red-600 border border-red-400"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    {selectedMember?.id === m.id ? "Selected" : "Select"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RfidBinding;
