import { AppShell } from "../ui/AppShell";
import ProfileClient from "./profile_client";

export const dynamic = "force-dynamic";

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfileClient />
    </AppShell>
  );
}
