import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center">
      <div className="absolute inset-0 bg-gradient-to-br from-white to-secondary/20 -z-10" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center space-y-8 animate-fadeIn">
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-primary inline-block px-4 py-1 rounded-full bg-primary/10">
              Launch Your Influence
            </h2>
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900">
              Connect Brands with
              <span className="block text-primary">Creative Influencers</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600">
              The premier platform where innovative brands meet authentic creators.
              Amplify your reach and create meaningful partnerships that drive
              results.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => navigate("/get-started")}
            >
              Get Started
            </Button>
          </div>

          <div className="pt-8">
            <p className="text-sm text-gray-500">Trusted by leading brands</p>
            <div className="mt-4 flex justify-center gap-8 grayscale opacity-50">
              {/* Add your brand logos here */}
              <div className="h-8 w-24 bg-gray-400 rounded animate-pulse" />
              <div className="h-8 w-24 bg-gray-400 rounded animate-pulse" />
              <div className="h-8 w-24 bg-gray-400 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};