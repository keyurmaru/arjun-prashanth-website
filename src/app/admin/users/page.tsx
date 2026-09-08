import { listAdminUsers } from "@/lib/adminUsers";
import UsersPanel from "@/components/admin/UsersPanel";

export default async function AdminUsersPage() {
  const users = await listAdminUsers();
  return <UsersPanel users={users} />;
}
