import { LossLedger } from "@/components/LossLedger";
import { NeedsCase } from "@/components/NeedsCase";

export default function LossPage() {
  return (
    <NeedsCase need="none">
      <LossLedger />
    </NeedsCase>
  );
}
