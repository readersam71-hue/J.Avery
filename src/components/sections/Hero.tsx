import { Button } from "@/components/ui/button";
import { Star, Phone, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative bg-slate-50 py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-6 animate-bounce">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-bold text-sm">42 Five-Star Reviews</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Birmingham's Most <span className="text-blue-900">Trusted</span> Plumber
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 max-w-2xl">
              From emergency leaks to dream bathroom transformations. 
              We're your local Wylde Green experts, serving all of Birmingham with professional, spotless service.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <a href="tel:0121XXXXXXX">
                <Button variant="emergency" size="lg" className="gap-2 w-full">
                  <Phone className="w-5 h-5" />
                  Water Emergency? Call Now
                </Button>
              </a>
              <a href="#services">
                <Button variant="outline" size="lg" className="gap-2 w-full">
                  See All Services
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
            </div>
            
            <div className="mt-8 flex items-center justify-center md:justify-start gap-4 text-slate-500 text-sm">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-green-500 text-green-500" />
                Next-day service standard
              </span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-green-500 text-green-500" />
                Gas Safe Registered
              </span>
            </div>
          </div>
          
          <div className="flex-1 relative">
            <div className="aspect-[4/3] rounded-2xl bg-slate-200 shadow-2xl overflow-hidden">
              {/* Placeholder for Hero Image */}
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 italic">
                [High-Quality Bathroom Transformation Image]
              </div>
            </div>
            {/* Trust badge overlay */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl hidden lg:block">
              <p className="text-slate-900 font-bold text-xl mb-1">5.0 Rating</p>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-500 text-sm">Verified Google Reviews</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
