// components/Landing/index.tsx
import Navbar from "./Navbar";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import FAQ from "./FAQ";
import Pricing from "./Pricing";
import CTABanner from "./CTABanner";
import Footer from "./Footer";
import { CursorProvider, BlobCursor } from "@/components/CustomCursor";

export default function Landing() {
  return (
    <CursorProvider targetIds={["how-it-works", "faq", "pricing"]}>
      <Navbar />
      <Hero />
      <HowItWorks />
      <FAQ />
      <Pricing />
      <CTABanner />
      <Footer />
      {/* Cursor rendered OUTSIDE smooth-wrapper */}
      <BlobCursor />
    </CursorProvider>
  );
}
