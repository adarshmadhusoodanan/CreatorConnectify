import { Card } from "@/components/ui/card";
import { Sparkles, Target, Trophy, Users } from "lucide-react";

const features = [
  {
    title: "Smart Matching",
    description:
      "Our AI-powered algorithm connects you with the perfect partners based on your brand values and audience demographics.",
    icon: Sparkles,
  },
  {
    title: "Targeted Reach",
    description:
      "Access detailed analytics and insights to ensure your campaigns reach the right audience at the right time.",
    icon: Target,
  },
  {
    title: "Proven Results",
    description:
      "Track campaign performance in real-time and measure ROI with comprehensive reporting tools.",
    icon: Trophy,
  },
  {
    title: "Growing Community",
    description:
      "Join a thriving ecosystem of brands and creators committed to authentic partnerships and meaningful engagement.",
    icon: Users,
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold text-primary mb-3">Features</h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to succeed
          </h3>
          <p className="text-lg text-gray-600">
            Powerful tools and features designed to make influencer marketing
            seamless and effective.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="p-6 hover:shadow-lg transition-shadow duration-300 animate-fadeIn"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
              <p className="text-gray-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};