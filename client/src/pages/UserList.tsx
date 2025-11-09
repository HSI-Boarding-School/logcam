import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/lib/config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: number;
  name: string;
  tipe_class: string;
  created_at: string;
}

export default function UserList() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users/all`);
        setData(res.data.users);
      } catch (err) {
        console.error("❌ Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // unique class list for dropdown
  const classOptions = Array.from(new Set(data.map((u) => u.tipe_class)));

  // filtered data
  const filteredData = selectedClass
    ? data.filter((user) => user.tipe_class === selectedClass)
    : data;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground animate-pulse">
        Loading user data...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            <span className="text-gradient-primary">Users</span> List
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-secondary mt-2">
            View all students and their class information
          </p>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
          Add New Student
        </Button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="font-medium text-sm sm:text-base">Filter by Class Type:</label>
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {classOptions.map((kelas, idx) => (
              <SelectItem key={idx} value={kelas}>
                {kelas}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-2 card-hover-lift">
        <CardHeader className="border-b bg-muted/30 p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Student List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b-2">
                  <TableHead className="font-bold text-foreground text-sm sm:text-base text-center">ID</TableHead>
                  <TableHead className="font-bold text-foreground text-sm sm:text-base">Student Name</TableHead>
                  <TableHead className="font-bold text-foreground text-sm sm:text-base text-center">Class</TableHead>
                  <TableHead className="font-bold text-foreground text-sm sm:text-base text-center">Class Type</TableHead>
                  <TableHead className="font-bold text-foreground text-sm sm:text-base text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="text-center text-sm font-medium text-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-primary/20 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-semibold text-xs sm:text-sm">
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold text-sm sm:text-base">
                            {user.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium text-sm sm:text-base">
                        X
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm">
                          {user.tipe_class}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center space-x-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-800"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No data available for this filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
