import { FaUsers, FaCheckCircle, FaMoneyBillWave, FaUser } from "react-icons/fa";

const AdminDashboard = () => {
  const stats = [
    { title: "Total Senior Citizens Registered", value: "1,247", icon: <FaUsers />, color: "bg-blue-100 text-blue-600" },
    { title: "Total Eligible for Pension", value: "892", icon: <FaCheckCircle />, color: "bg-green-100 text-green-600" },
    { title: "Monthly Payout Amount", value: "₱1,000", icon: <FaMoneyBillWave />, color: "bg-orange-100 text-orange-600" },
    { title: "Total Active Beneficiaries", value: "892", icon: <FaUser />, color: "bg-yellow-100 text-yellow-600" },
  ];

  const barangays = [
    { name: "Binanuuan", count: 67 },
    { name: "Caawigan", count: 54 },
    { name: "Cahabaan", count: 42 },
    { name: "Calintaan", count: 78 },
    { name: "Del Carmen", count: 89 },
    { name: "Gabon", count: 35 },
    { name: "Itomang", count: 61 },
    { name: "Poblacion", count: 125 },
    { name: "San Francisco", count: 73 },
    { name: "San Isidro", count: 48 },
    { name: "San Jose", count: 56 },
    { name: "San Nicolas", count: 39 },
    { name: "Santa Cruz", count: 84 },
    { name: "Santa Elena", count: 71 },
    { name: "Santo Niño", count: 65 },
  ];

  const upcomingOctogenarians = [
    { name: "Maria Santos", age: 79, birthday: "March 15, 2024", barangay: "Barangay Central" },
    { name: "Jose Reyes", age: 79, birthday: "April 22, 2024", barangay: "Barangay Norte" },
    { name: "Carmen Cruz", age: 79, birthday: "May 8, 2024", barangay: "Barangay Sur" },
    { name: "Roberto Garcia", age: 79, birthday: "June 12, 2024", barangay: "Barangay Este" },
  ];

  const upcomingNonagenarians = [
    { name: "Elena Mendoza", age: 89, birthday: "July 4, 2024", barangay: "Barangay Poblacion" },
    { name: "Francisco Torres", age: 89, birthday: "August 19, 2024", barangay: "Barangay Riverside" },
    { name: "Luz Villanueva", age: 89, birthday: "September 7, 2024", barangay: "Barangay Hillside" },
  ];

  const upcomingCentenarians = [
    { name: "Esperanza Rodriguez", age: 99, birthday: "October 14, 2024", barangay: "Barangay Centro" },
    { name: "Domingo Pascual", age: 99, birthday: "December 25, 2024", barangay: "Barangay Vista" },
  ];

  // Helper: Table Component
  const BeneficiaryTable = ({ title, color, benefit, data }) => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className={`text-lg font-bold mb-4 ${color}`}>{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Age</th>
              <th className="p-3 text-left">Birthday</th>
              <th className="p-3 text-left">Barangay</th>
              <th className="p-3 text-right">Benefit</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p, i) => (
              <tr
                key={i}
                className={`border-t border-gray-200 ${
                  i % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 transition`}
              >
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.age}</td>
                <td className="p-3">{p.birthday}</td>
                <td className="p-3">{p.barangay}</td>
                <td className={`p-3 text-right font-bold ${color}`}>{benefit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white shadow rounded-xl flex items-center gap-4 p-5"
          >
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-lg ${stat.color}`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Beneficiaries per Barangay */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Active Beneficiaries Per Barangay
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {barangays.map((b, i) => (
            <div
              key={i}
              className="bg-white shadow-sm rounded-lg p-4 text-center hover:shadow-md transition"
            >
              <h3 className="font-medium text-gray-700">{b.name}</h3>
              <p className="text-orange-500 text-2xl font-bold">{b.count}</p>
              <p className="text-xs text-gray-500">Active Beneficiaries</p>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Beneficiaries */}
      <div className="space-y-6">
        <BeneficiaryTable
          title="Upcoming Octogenarians (₱10,000 Benefit)"
          color="text-orange-600"
          benefit="₱10,000"
          data={upcomingOctogenarians}
        />
        <BeneficiaryTable
          title="Upcoming Nonagenarians (₱10,000 Benefit)"
          color="text-green-600"
          benefit="₱10,000"
          data={upcomingNonagenarians}
        />
        <BeneficiaryTable
          title="Upcoming Centenarians (₱100,000 Benefit)"
          color="text-purple-600"
          benefit="₱100,000"
          data={upcomingCentenarians}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
