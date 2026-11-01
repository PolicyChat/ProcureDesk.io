import { NeedsCase } from "@/components/NeedsCase";
import { Paywall } from "@/components/Paywall";

export default function PlanPage({ searchParams }: { searchParams: { canceled?: string } }) {
  return (
    <NeedsCase>
      <Paywall canceled={!!searchParams.canceled} />
    </NeedsCase>
  );
}
