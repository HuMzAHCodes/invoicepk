import Navbar from "./Navbar";
import Hero from "./Hero";
import HowItWorks from "./HowItWorks";
import BuiltForPakistan from "./BuiltForPakistan";
import Pricing from "./Pricing";
import FAQ from "./FAQ";
import CTABanner from "./CTABanner";
import Footer from "./Footer";

export default function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <BuiltForPakistan />
      <Pricing />
      <FAQ />
      <CTABanner />
      <Footer />
    </>
  );
}
