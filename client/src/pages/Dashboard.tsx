import {
  Users,
  Laptop,
  Smartphone,
  Activity,
  Camera,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import { API_BASE } from "@/lib/config";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/api";
export interface Logbook {
  id: number;
  user_id: number;
  name: string;
  tipe: "LAPTOP" | "HP";
  mengambil: "SUDAH" | "BELUM";
  mengembalikan: "SUDAH" | "BELUM";
  created_at: string;
}

export default function Dashboard() {
  const [totaUser, setTotalUser] = useState<number>(0);
  const [logs, setLogs] = useState<Logbook[]>([]);
  const [borrowedLaptopCount, setBorrowedLaptopCount] = useState<number>(0);
  const [borrowedHPCount, setBorrowedHPCount] = useState<number>(0);
  const [logsCount, setLogsCount] = useState<number>(0);

  function convertToWIB(datetimeStr: string) {
    const utcDate = new Date(datetimeStr.replace(" ", "T") + "Z");

    const datePart = utcDate.toLocaleDateString("id-ID", {
      timeZone: "Asia/Jakarta",
    });
    const timePart = utcDate.toLocaleTimeString("id-ID", {
      timeZone: "Asia/Jakarta",
      hour12: false,
    });

    return `${datePart}, ${timePart}`; // example: 5/9/2025, 13:28:36
  }

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await axios.get(`${API_BASE}/students/all`);
        const countUser = res.data["users"];
        setTotalUser(countUser.length);
      } catch (err) {
        console.log("Failed To fetch data", err);
      }
    };

    fetchCount();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      const [laptopRes, hpRes] = await Promise.all([
        axios.get(`${API_BASE}/students/all/log-laptop`),
        axios.get(`${API_BASE}/students/all/log-hp`),
      ]);

      const laptopLogs = laptopRes.data["log-laptop"];
      const hpLogs = hpRes.data["log-hp"];

      const allLogs = [...laptopLogs, ...hpLogs].map((log) => ({
        ...log,
        created_at: convertToWIB(log.created_at),
      }));

      setLogs(allLogs);

      const activeLaptops = allLogs.filter(
        (item) =>
          item.tipe === "LAPTOP" &&
          item.mengambil === "SUDAH" &&
          item.mengembalikan === "BELUM"
      );

      const activeHp = allLogs.filter(
        (item) =>
          item.tipe === "HP" &&
          item.mengambil === "SUDAH" &&
          item.mengembalikan === "BELUM"
      );

      const today = new Date().toLocaleDateString("id-ID", {
        timeZone: "Asia/Jakarta",
      });

      const todayLogs = allLogs.filter((log) =>
        log.created_at.startsWith(today)
      );

      setLogsCount(todayLogs.length);
      setBorrowedLaptopCount(activeLaptops.length);
      setBorrowedHPCount(activeHp.length);
    };

    fetchLogs();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-[1440px] mx-auto">
      <div className="space-y-1 sm:space-y-2">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          Welcome to <span className="text-gradient-primary">Logcam</span>
        </h2>
        <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-secondary">
          Track attendance effortlessly with face recognition
        </p>
      </div>

      <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Active Devices"
          value={borrowedLaptopCount + borrowedHPCount}
          icon={Laptop}
          iconColor="bg-[hsl(var(--card-blue))]"
          gradient="var(--gradient-primary)"
        />
        <StatCard
          title="Face Scans Today"
          value={logsCount}
          icon={Camera}
          iconColor="bg-[hsl(var(--card-gold))]"
          gradient="var(--gradient-accent)"
        />
        <StatCard
          title="Attendance Rate"
          value={totaUser}
          icon={TrendingUp}
          iconColor="bg-[hsl(var(--card-teal))]"
          gradient="linear-gradient(135deg, hsl(173, 67%, 47%) 0%, hsl(217, 91%, 60%) 100%)"
        />
      </div>

      <div className="grid gap-6 lg:gap-8 grid-cols-1 lg:grid-cols-2">
        <Card className="card-hover-lift border-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="text-center py-12 sm:py-16 text-muted-foreground">
              {logs.length ? (
                logs.slice(0, 5).map((r, i) => {
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm sm:text-base font-medium text-foreground"
                    >
                      <Activity className="h-4 w-4 text-primary opacity-70" />
                      <span>{r.name}</span>
                    </div>
                  );
                })
              ) : (
                <>
                  <Activity className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-20" />
                  <p className="text-base sm:text-lg font-secondary">
                    No recent activities to display
                  </p>
                  <p className="text-xs sm:text-sm mt-1 sm:mt-2">
                    Device borrowing and returns will appear here
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover-lift border-2 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-[100px]" />
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
              <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
              Device Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-800 transition-transform hover:scale-[1.02]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500">
                    <Laptop className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="font-semibold text-base sm:text-lg">
                    Laptops
                  </span>
                </div>
                <span className="font-secondary font-bold text-xl sm:text-2xl text-blue-600 dark:text-blue-400">
                  {borrowedLaptopCount} / {totaUser}
                </span>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/20 border-2 border-amber-200 dark:border-amber-800 transition-transform hover:scale-[1.02]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500">
                    <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="font-semibold text-base sm:text-lg">
                    Phones
                  </span>
                </div>
                <span className="font-secondary font-bold text-xl sm:text-2xl text-amber-600 dark:text-amber-400">
                  {borrowedHPCount} / {totaUser}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-hover-lift border-2 bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl">
            Daily Attendance Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="h-48 sm:h-64 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 sm:mb-3 opacity-20" />
              <p className="font-secondary text-sm sm:text-base">
                Chart visualization coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
