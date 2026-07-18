// components/Landing/index.tsx
import Navbar from "./Navbar";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import FAQ from "./FAQ";
import Pricing from "./Pricing";
import CTABanner from "./CTABanner";
import Footer from "./Footer";
import { CursorProvider } from "@/components/CustomCursor";

export default function Landing() {
  return (
    // ★ Navbar now passed via `sticky` prop instead of rendered as a sibling —
    //    keeps it a CursorContext descendant (needs useCursorContext for smoother)
    //    while still staying outside #smooth-content (needs to for position:sticky)
    <CursorProvider
      targetIds={["how-it-works", "faq", "pricing", "footer"]}
      sticky={<Navbar />}
    >
      <Hero />
      <HowItWorks />
      <FAQ />
      <Pricing />
      <CTABanner />
      <Footer />
    </CursorProvider>
  );
}
