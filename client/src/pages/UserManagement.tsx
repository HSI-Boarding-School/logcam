import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Search,
  Trash2,
  UserCog,
  Crown,
  GraduationCap,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserProfile, UserRole } from "@/types/users";
import { useUsers } from "@/hooks/user/useUsers";
import { useDeleteUserById } from "@/hooks/user/useDeleteUser";
import { EditUserDialog } from "@/components/EditUserDialog";

export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useUsers();

  const deleteMutation = useDeleteUserById();

  // ==========================================
  // FILTER LOGIC (Client-side)
  // ==========================================
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((user) =>
        user.role?.includes(roleFilter as UserRole)
      );
    }

    return filtered;
  }, [users, searchQuery, roleFilter]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleDeleteUser = (userId: string) => {
    deleteMutation.mutate(userId);
  };

  const handleEditUser = (user: UserProfile) => {
    setEditUser(user);
    setIsEditDialogOpen(true);
  };

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "default";
      case "TEACHER":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return <Crown className="h-3 w-3" />;
      case "TEACHER":
        return <GraduationCap className="h-3 w-3" />;
      case "STUDENT":
        return <Users className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  // ==========================================
  // STATS CALCULATION
  // ==========================================
  const stats = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((u) => u.role?.includes("ADMIN")).length,
      teachers: users.filter((u) => u.role?.includes("TEACHER")).length,
    }),
    [users]
  );

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================
  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-destructive text-4xl">⚠️</div>
            <h3 className="font-bold text-lg">Failed to Load Users</h3>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "An error occurred"}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
            <span className="text-gradient-primary">User</span> Management
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-secondary mt-2">
            Manage users, roles, and permissions
          </p>
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-2 card-hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-secondary">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-gradient-primary">
                  {stats.total}
                </p>
              </div>
              <Users className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 card-hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-secondary">
                  Admins
                </p>
                <p className="text-2xl font-bold text-gradient-primary">
                  {stats.admins}
                </p>
              </div>
              <Crown className="h-8 w-8 text-primary opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 card-hover-lift">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-secondary">
                  Teachers
                </p>
                <p className="text-2xl font-bold text-gradient-accent">
                  {stats.teachers}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-accent opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
                <SelectItem value="TEACHER">Teachers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-2 card-hover-lift">
        <CardHeader className="border-b bg-muted/30 p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            All Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-2">
                    <TableHead className="font-bold text-foreground">
                      User
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      Email
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      Roles
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      Branch
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      Status
                    </TableHead>
                    <TableHead className="font-bold text-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-muted/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border-2 border-primary/20">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-semibold">
                              {getInitials(user.name, user.email)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-semibold">
                            {user.name || "No name"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-secondary text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <Badge
                            key={user.id}
                            variant={getRoleBadgeVariant(user.role as UserRole)}
                            className="font-semibold text-xs flex items-center gap-1"
                          >
                            {getRoleIcon(user.role as UserRole)}
                            {user.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-secondary text-muted-foreground text-sm">
                        Branch {user.branch_id}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.is_active ? "default" : "secondary"}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="gap-1"
                          >
                            <UserCog className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteUserId(user.id)}
                            disabled={deleteMutation.isPending}
                            className="gap-1"
                          >
                            {deleteMutation.isPending &&
                            deleteUserId === user.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteUserId}
        onOpenChange={(open) => !open && setDeleteUserId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this user and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditUserDialog
        user={editUser}
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditUser(null);
        }}
      />
    </div>
  );
}
