import { Card } from "@/components/ui/card";

const testimonials = [
  {
    quote:
      "This platform has transformed how we approach influencer marketing. The quality of creators and the ease of collaboration is unmatched.",
    author: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechStyle Co.",
  },
  {
    quote:
      "As a creator, I've found amazing brands to work with that truly align with my values. The platform makes everything so seamless.",
    author: "Michael Chen",
    role: "Content Creator",
    followers: "500K+ Followers",
  },
  {
    quote:
      "The analytics and reporting tools have helped us optimize our campaigns and achieve better ROI than ever before.",
    author: "Emma Thompson",
    role: "Brand Manager",
    company: "Lifestyle Brands Inc.",
  },
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold text-primary mb-3">
            Testimonials
          </h2>
          <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Trusted by leading brands and creators
          </h3>
          <p className="text-lg text-gray-600">
            See what our community has to say about their experience with our
            platform.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-8 hover:shadow-lg transition-shadow duration-300 animate-fadeIn"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="space-y-4">
                <svg
                  className="h-8 w-8 text-primary/20"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-gray-600 italic">{testimonial.quote}</p>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-gray-500">
                    {testimonial.role}
                    {testimonial.company && ` • ${testimonial.company}`}
                    {testimonial.followers && ` • ${testimonial.followers}`}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};