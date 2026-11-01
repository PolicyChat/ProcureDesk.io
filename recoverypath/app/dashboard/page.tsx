import { Dashboard } from "@/components/Dashboard";
import { RequirePaid } from "@/components/RequirePaid";

export default function DashboardPage() {
  return (
    <RequirePaid need="plan">
      <Dashboard />
    </RequirePaid>
  );
}
