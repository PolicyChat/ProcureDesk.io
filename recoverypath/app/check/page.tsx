import { Assessment } from "@/components/Assessment";

export default function CheckPage({ searchParams }: { searchParams: { from?: string } }) {
  return <Assessment from={searchParams.from} />;
}
