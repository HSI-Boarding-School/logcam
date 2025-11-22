import { UserProfile, UserRole } from "@/types/users";
import { resolve } from "path";

// Mock data
let mockUsers: UserProfile[] = [
  {
    id: "b7dfe843-4297-4d13-b666-d865df01ecb",
    name: "Muhammad Hamka Rifa'i",
    email: "hamkarifai49@gmail.com",
    is_active: true,
    branch_id: 1,
    created_at: new Date("2024-01-15").toISOString(),
    roles: ["ADMIN"],
  },
  {
    id: "dbafeda3-76e8-41f3-bf1d-03a177059e4d",
    name: "Muhammad Daffa",
    email: "daffa@gmail.com",
    is_active: true,
    branch_id: 2,
    created_at: new Date("2024-02-20").toISOString(),
    roles: ["TEACHER"],
  },
  {
    id: "dbafeda3-76e8-41f3-bf1d-03a177059e4d",
    name: "Andy Nur",
    email: "andynur@gmail.com",
    is_active: true,
    branch_id: 2,
    created_at: new Date("2024-02-20").toISOString(),
    roles: ["TEACHER"],
  },
];

// Helper for simulate delay
const delay = (ms: number) => new Promise((resolve => setTimeout(resolve, ms)))

// Mock API functions
export async function fetchUsers(): Promise<UserProfile[]> {
  await delay(800)
  return [...mockUsers]
}

export async function fetchUser(userId: string): Promise<UserProfile> {
  await delay(500);

  const user = mockUsers.find((u) => u.id === userId);

  if (!user) {
    throw new Error("User not found");
  }

  return { ...user };
}

export async function deleteUser(userId: string) {
  await delay(1000)
  const index = mockUsers.findIndex((u) => u.id === userId)
  if (index === -1) {
    throw new Error('Users not found')
  }
  mockUsers = mockUsers.filter((u) => u.id !== userId)
}

export async function updateUserRoles(
  userId: string,
  roles: UserRole[]
): Promise<UserProfile> {
  await delay(800);

  const userIndex = mockUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error("User not found");
  }

  mockUsers[userIndex].roles = roles;

  return { ...mockUsers[userIndex] };
}

export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<UserProfile> {
  await delay(800);
  const userIndex = mockUsers.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error("User not found");
  }

  mockUsers[userIndex] = {
    ...mockUsers[userIndex],
    ...data,
  };

  return { ...mockUsers[userIndex] };
}

export async function createUser(
  data: Omit<UserProfile, "id" | "created_at">
): Promise<UserProfile> {
  await delay(1000);

  const newUser: UserProfile = {
    ...data,
    id: Math.random().toString(36).substr(2, 9),
    created_at: new Date().toISOString(),
  };

  mockUsers.push(newUser);

  return { ...newUser };
}
