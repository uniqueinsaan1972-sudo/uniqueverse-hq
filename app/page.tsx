import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TemplateGrid from "@/components/TemplateGrid";
import FeaturedTemplate from "@/components/FeaturedTemplate";
import HowItWorks from "@/components/HowItWorks";
import EmotionalSection from "@/components/EmotionalSection";
import Showcase from "@/components/Showcase";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="top">
        <Hero />
        <TemplateGrid />
        <FeaturedTemplate />
        <HowItWorks />
        <EmotionalSection />
        <Showcase />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
