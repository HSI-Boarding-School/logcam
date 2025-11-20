import { useStudent } from "@/hooks/useStudent"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

// Helper function for get current user
function getCurrentUser() {
  try {
    const userString = localStorage.getItem('user')
    if (!userString) return null
    return JSON.parse(userString)
  } catch (error) {
    console.error('Error parsing user:', error)
    return null
  }
}

export default function StudentsList() {
  const { data: users, isLoading, isError } = useStudent()
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")

  // Get current user and check role
  const currentUser = getCurrentUser()
  const isAdmin = currentUser?.role === 'ADMIN'
  
  console.log('👤 Current user:', currentUser)
  console.log('🔑 Is admin?', isAdmin)

  console.log('users:', users)
  console.log('users type:', typeof users)
  console.log('users is array?', Array.isArray(users))

  // === EARLY RETURNS ===
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground animate-pulse">
        Loading user data...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-80 text-red-500">
        Failed to load user data.
      </div>
    )
  }

  // Check if users there is not or not array
  if (!users || !Array.isArray(users) || users.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 text-muted-foreground">
        No student data available.
      </div>
    )
  }

  // === SAFE: Extract options ===
  const branchOptions = Array.from(new Set(users.map((u) => u.branch_name)))
  const classOptions = Array.from(new Set(users.map((u) => u.tipe_class)))
  
  console.log('✅ Branch options:', branchOptions)
  console.log('✅ Class options:', classOptions)

  // === FILTERING LOGIC ===
  let filteredData = users

  // Filter by branch (jika admin memilih)
  if (selectedBranch && selectedBranch !== "all") {
    filteredData = filteredData.filter((u) => u.branch_name === selectedBranch)
  }

  // Filter by class (jika dipilih)
  if (selectedClass && selectedClass !== "all") {
    filteredData = filteredData.filter((u) => u.tipe_class === selectedClass)
  }

  console.log('📊 Filtered data count:', filteredData.length)

  // === RENDER UI ===
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1440px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            <span className="text-gradient-primary">Students</span> List
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-secondary mt-2">
            View all students and their class information
          </p>
        </div>

        <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
          Add New Student
        </Button>
      </div>

      {/* FILTERS */}
      <div className="flex gap-4">
        {/* Branch Filter - HANYA UNTUK ADMIN */}
        {isAdmin && (
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branchOptions.map((branch, idx) => (
                <SelectItem key={idx} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Class Filter - UNTUK SEMUA */}
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {classOptions.map((kelas, idx) => (
              <SelectItem key={idx} value={kelas}>
                {kelas}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
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
                    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-medium">X</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{user.tipe_class}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-800">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">Delete</Button>
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
  )
}