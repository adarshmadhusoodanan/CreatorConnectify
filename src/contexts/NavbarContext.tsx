import { createContext, useContext, useState, ReactNode } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavbarContextType {
  isExpanded: boolean;
  toggleExpanded: () => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export function NavbarProvider({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  const toggleExpanded = () => {
    console.log("Toggling navbar state:", !isExpanded);
    setIsExpanded(!isExpanded);
  };

  return (
    <NavbarContext.Provider value={{ isExpanded, toggleExpanded }}>
      {children}
    </NavbarContext.Provider>
  );
}

export function useNavbar() {
  const context = useContext(NavbarContext);
  if (context === undefined) {
    throw new Error("useNavbar must be used within a NavbarProvider");
  }
  return context;
}