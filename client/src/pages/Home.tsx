import React, { useState } from "react";
import HomeHero from "@/components/home/HomeHero";
import FeaturesSection from "@/components/home/FeaturesSection";
import RecentContentSection from "@/components/home/RecentContentSection";
import DepartmentsSection from "@/components/home/DepartmentsSection";
import StatisticsSection from "@/components/home/StatisticsSection";
import CallToAction from "@/components/home/CallToAction";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";

export default function Home() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);

  const openLoginModal = () => {
    setLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalOpen(false);
  };

  const openSignupModal = () => {
    setSignupModalOpen(true);
  };

  const closeSignupModal = () => {
    setSignupModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <HomeHero />
      <FeaturesSection />
      <RecentContentSection />
      <DepartmentsSection />
      <StatisticsSection />
      <CallToAction onOpenLogin={openLoginModal} onOpenSignup={openSignupModal} />
      
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={closeLoginModal} 
        onOpenSignup={openSignupModal} 
      />
      
      <SignupModal 
        isOpen={signupModalOpen} 
        onClose={closeSignupModal} 
        onOpenLogin={openLoginModal} 
      />
    </div>
  );
}
