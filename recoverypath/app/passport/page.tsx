import { CasePassport } from "@/components/CasePassport";
import { RequirePaid } from "@/components/RequirePaid";

export default function PassportPage() {
  return (
    <RequirePaid need="passport">
      <CasePassport />
    </RequirePaid>
  );
}
