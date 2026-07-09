import Navbar from "./Navbar";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import FAQ from "./FAQ";
import Pricing from "./Pricing";
import CTABanner from "./CTABanner";
import Footer from "./Footer";

export default function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <FAQ />
      <Pricing />
      <CTABanner />
      <Footer />
    </>
  );
}
