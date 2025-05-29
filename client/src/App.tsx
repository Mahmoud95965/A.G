import { useState } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LoginModal from "@/components/auth/LoginModal";
import SignupModal from "@/components/auth/SignupModal";
import { routes } from "@/routes";

function Router() {
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
    <div className="flex flex-col min-h-screen">
      <Navbar onOpenLogin={openLoginModal} onOpenSignup={openSignupModal} />
      
      <main className="flex-grow">
        <Switch>
          {Object.entries(routes).map(([key, route]) => (
            <Route key={key} path={route.path} component={route.component} />
          ))}
        </Switch>
      </main>
      
      <Footer />
      
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
