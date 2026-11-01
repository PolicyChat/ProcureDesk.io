import { CheckoutSuccess } from "@/components/CheckoutSuccess";

export default function SuccessPage({ searchParams }: { searchParams: { session_id?: string; demo?: string; plan?: string } }) {
  return <CheckoutSuccess sessionId={searchParams.session_id} plan={searchParams.plan} />;
}
