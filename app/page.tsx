import Hero from "@/components/Hero";
import Faq from "@/components/Faq";
import {
  FinalCta,
  HowItWorks,
  PricingPreview,
  Problem,
  Services,
  Stats,
  Testimonials,
} from "@/components/Sections";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorks />
      <Stats />
      <Services />
      <Testimonials />
      <PricingPreview />
      <Faq />
      <FinalCta />
    </>
  );
}
