import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StepExperience from "@/components/home/StepExperience";
import TemplateShowcase from "@/components/home/TemplateShowcase";
import Reactions from "@/components/home/Reactions";
import TrustStrip from "@/components/home/TrustStrip";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="top">
        <Hero />
        <StepExperience />
        <TemplateShowcase />
        <Reactions />
        <TrustStrip />
        <HowItWorks />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
