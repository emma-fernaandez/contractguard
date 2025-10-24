import React from "react";

import HeroSection from "../components/landing/HeroSection";
import HowItWorks from "../components/landing/HowItWorks";
import Features from "../components/landing/Features";
// import Testimonials from "../components/landing/Testimonials";
import Pricing from "../components/landing/Pricing";
import FAQ from "../components/landing/FAQ";
import Footer from "../components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <HeroSection />
      <HowItWorks />
      <Features />
      {/* <Testimonials /> */}
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  );
}