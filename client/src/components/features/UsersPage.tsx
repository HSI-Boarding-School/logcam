import axios from "axios";
import { useEffect, useState } from "react";

interface UsersList {
  id: number;
  name: string;
  tipe_class: string;
  created_at: string;
}

export default function UsersPage() {
  const [data, setData] = useState<UsersList[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>(""); // ⬅️ filter aktif

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/api/users/all/users");
        setData(res.data.users);
      } catch (err) {
        console.error("❌ Error fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p>⏳ Loading...</p>;

  // 🔍 Filter data berdasarkan tipe_class
  const filteredData = selectedClass
    ? data.filter((user) => user.tipe_class === selectedClass)
    : data;

  let number = 1;

  // Ambil daftar tipe_class unik (biar dropdown dinamis)
  const classOptions = Array.from(new Set(data.map((u) => u.tipe_class)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Users List</h3>
        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          Tambah Santri Baru
        </button>
      </div>

      {/* 🔽 Dropdown Filter */}
      <div className="flex items-center gap-3">
        <label className="font-medium">Filter Tipe Kelas:</label>
        <select
          className="border rounded-md px-3 py-1"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
        >
          <option value="">Semua</option>
          {classOptions.map((kelas, idx) => (
            <option key={idx} value={kelas}>
              {kelas}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Santri
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kelas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe Kelas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((santri) => (
                <tr key={santri.id}>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    {number++}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                        {santri.name.charAt(0)}
                      </div>
                      {santri.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    X
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-gray-900">
                    {santri.tipe_class}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button className="text-green-600 hover:text-green-900 mr-4">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}

              {/* Kalau hasil filter kosong */}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    Tidak ada data untuk filter ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
