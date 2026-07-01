// src/app/(admin)/admin/users/page.tsx
import { getUsers } from "./actions";
import { UsersClient } from "./users-client";

export default async function UsersPage() {
  const users = await getUsers();
  return <UsersClient users={users} />;
}
