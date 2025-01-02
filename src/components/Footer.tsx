import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              CreatorConnectify
            </span>
            <p className="mt-4 text-sm text-gray-600">
              Connecting brands with authentic creators for meaningful partnerships.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Brands</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-primary">
                  Find Creators
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Campaign Management
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Analytics
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Creators</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-primary">
                  Brand Partnerships
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Creator Tools
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Success Stories
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Resources
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-primary">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">
              © 2024 CreatorConnectify. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-600 hover:text-primary">
                Terms
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                Privacy
              </a>
              <a href="#" className="text-gray-600 hover:text-primary">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};