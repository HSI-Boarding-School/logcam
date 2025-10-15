import axios from "axios";
import { Laptop, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

export interface Logbook {
  id: number;
  user_id: number;
  name: string;
  tipe: "LAPTOP" | "HP";
  mengambil: "SUDAH" | "BELUM";
  mengembalikan: "SUDAH" | "BELUM";
  created_at: string;
  raw_date: string;
  only_date: string;
  kelas?: string;
}

interface User {
  id: number;
  name: string;
  kelas?: string;
  tipe_class?: string;
}

export default function LogbookPage() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedAction, setSelectedAction] = useState<string>("Semua Aksi");
  const [selectedDevice, setSelectedDevice] =
    useState<string>("Semua Perangkat");
  const [selectedClass, setSelectedClass] = useState<string>("Semua Kelas");
  const [logs, setLogs] = useState<Logbook[]>([]);

  function convertToWIB(datetimeStr: string) {
    const utcDate = new Date(datetimeStr.replace(" ", "T") + "Z");
    return utcDate.toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour12: false,
    });
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [laptopRes, hpRes, usersRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/users/all/log-laptop"),
          axios.get("http://127.0.0.1:8000/users/all/log-hp"),
          axios.get("http://127.0.0.1:8000/users/all/users"),
        ]);

        const usersData = usersRes.data.users || usersRes.data;

        const laptopLogs = laptopRes.data["log-laptop"];
        const hpLogs = hpRes.data["log-hp"];

        const mergedLogs = [...laptopLogs, ...hpLogs].map((log: Logbook) => {
          const utcDate = new Date(log.created_at.replace(" ", "T") + "Z");
          const dd = String(utcDate.getDate()).padStart(2, "0");
          const mm = String(utcDate.getMonth() + 1).padStart(2, "0");
          const yyyy = utcDate.getFullYear();
          const onlyDate = `${dd}/${mm}/${yyyy}`;

          // Cari kelas user berdasarkan user_id
          const user = usersData.find((u: User) => u.id === log.user_id);
          const kelas = user ? user.kelas || user.tipe_class || "-" : "-";

          return {
            ...log,
            kelas,
            raw_date: log.created_at,
            created_at: convertToWIB(log.created_at),
            only_date: onlyDate,
          };
        });

        setLogs(mergedLogs);
      } catch (error) {
        console.error("Gagal fetch data:", error);
      }
    };

    fetchData();
  }, []);

  // buat opsi kelas unik dari data logs
  const classOptions: string[] = Array.from(
    new Set(
      logs
        .map((l) => (l.kelas ? String(l.kelas).trim() : ""))
        .filter((v) => v !== "")
    )
  );

  const filteredLogs = logs.filter((log) => {
    let match = true;

    // filter tanggal
    if (selectedDate) {
      const [yyyy, mm, dd] = selectedDate.split("-");
      const formatted = `${dd}/${mm}/${yyyy}`;
      if (log.only_date !== formatted) match = false;
    }

    // filter perangkat
    if (selectedDevice !== "Semua Perangkat") {
      if (log.tipe !== selectedDevice.toUpperCase()) match = false;
    }

    // filter aksi
    if (selectedAction === "Ambil Perangkat" && log.mengambil !== "SUDAH") {
      match = false;
    }
    if (
      selectedAction === "Kembalikan Perangkat" &&
      log.mengembalikan !== "SUDAH"
    ) {
      match = false;
    }

    // filter kelas
    if (selectedClass !== "Semua Kelas") {
      const logKelas = (log.kelas ?? "").toString().trim().toLowerCase();
      const sel = selectedClass.toString().trim().toLowerCase();
      if (logKelas !== sel) match = false;
    }

    return match;
  });

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Logbook</h3>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />

          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option>Semua Aksi</option>
            <option>Ambil Perangkat</option>
            <option>Kembalikan Perangkat</option>
          </select>

          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option>Semua Perangkat</option>
            <option>Laptop</option>
            <option>HP</option>
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="Semua Kelas">Semua Kelas</option>
            {classOptions.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kelas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mengambil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mengembalikan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Waktu
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.map((riwayat, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {riwayat.user_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                        {riwayat.name.charAt(0)}
                      </div>
                      {riwayat.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {riwayat.kelas || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    <div className="flex items-center">
                      {riwayat.tipe === "LAPTOP" ? (
                        <Laptop className="text-blue-500 mr-2" size={16} />
                      ) : (
                        <Smartphone
                          className="text-purple-500 mr-2"
                          size={16}
                        />
                      )}
                      {riwayat.tipe}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        riwayat.mengambil === "SUDAH"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {riwayat.mengambil}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        riwayat.mengembalikan === "BELUM"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {riwayat.mengembalikan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {riwayat.created_at}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
