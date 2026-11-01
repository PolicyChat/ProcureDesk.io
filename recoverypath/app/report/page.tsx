import { RecoveryReport } from "@/components/RecoveryReport";
import { RequirePaid } from "@/components/RequirePaid";

export default function ReportPage() {
  return (
    <RequirePaid need="plan">
      <RecoveryReport />
    </RequirePaid>
  );
}
