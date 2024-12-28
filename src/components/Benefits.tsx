import { Button } from "@/components/ui/button";

export const Benefits = () => {
  return (
    <section id="benefits" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* For Brands */}
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-sm font-semibold text-primary mb-3">
                For Brands
              </h2>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Amplify your brand's reach
              </h3>
              <p className="text-lg text-gray-600">
                Connect with authentic creators who align with your brand values
                and reach your target audience effectively.
              </p>
            </div>

            <ul className="space-y-4">
              {[
                "Access to verified influencers",
                "Detailed audience analytics",
                "Campaign performance tracking",
                "Seamless collaboration tools",
              ].map((benefit) => (
                <li key={benefit} className="flex items-center">
                  <svg
                    className="h-5 w-5 text-primary mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => console.log("Brand signup clicked")}
            >
              Get Started as a Brand
            </Button>
          </div>

          {/* For Creators */}
          <div className="space-y-8 animate-fadeIn" style={{ animationDelay: "200ms" }}>
            <div>
              <h2 className="text-sm font-semibold text-primary mb-3">
                For Creators
              </h2>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Monetize your influence
              </h3>
              <p className="text-lg text-gray-600">
                Find brands that match your style and values, while maintaining
                creative freedom and authenticity.
              </p>
            </div>

            <ul className="space-y-4">
              {[
                "Direct brand partnerships",
                "Fair compensation",
                "Creative freedom",
                "Professional growth tools",
              ].map((benefit) => (
                <li key={benefit} className="flex items-center">
                  <svg
                    className="h-5 w-5 text-primary mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
              onClick={() => console.log("Creator signup clicked")}
            >
              Join as a Creator
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};