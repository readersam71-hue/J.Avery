import { Hero } from "@/components/sections/Hero";
import { BeforeAfter } from "@/components/sections/BeforeAfter";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { Star, Clock, Shield, ThumbsUp, MapPin } from "lucide-react";
import { areas } from "@/lib/areas";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      
      {/* Trust Bar */}
      <section className="bg-blue-900 py-8 text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center md:justify-between gap-8 items-center opacity-80">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-300" />
              <span className="font-bold">Next-Day Service Standard</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-300" />
              <span className="font-bold">Gas Safe Registered</span>
            </div>
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-blue-300 fill-blue-300" />
              <span className="font-bold">42 Five-Star Reviews</span>
            </div>
            <div className="flex items-center gap-3">
              <ThumbsUp className="w-6 h-6 text-blue-300" />
              <span className="font-bold">100% Satisfaction Guarantee</span>
            </div>
          </div>
        </div>
      </section>

      <BeforeAfter />
      
      {/* Services Section */}
      <section className="py-20 bg-white" id="services">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">Our Professional Services</h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-12 text-lg">
            High-quality plumbing and heating solutions tailored for the Birmingham market.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard 
              title="Emergency Plumbing" 
              desc="Burst pipes, leaks, and blocked toilets. We respond within hours."
              href="/services/emergency-plumbing"
            />
            <ServiceCard 
              title="Bathroom Refits" 
              desc="Complete transformations from outdated to modern luxury suites."
              href="/services/bathroom-transformations"
            />
            <ServiceCard 
              title="Boiler Services" 
              desc="Annual checks and repairs to keep your home warm and efficient."
              href="/services/boiler-servicing-repair"
            />
            <ServiceCard 
              title="Kitchen Plumbing" 
              desc="Expert sink, tap, and appliance installations with spotless cleanup."
              href="/services/kitchen-plumbing"
            />
          </div>
        </div>
      </section>

      {/* Areas Section */}
      <section className="py-20 bg-slate-900 text-white" id="areas">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Areas We Serve</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Based in Wylde Green, we provide fast response plumbing services across Birmingham and Sutton Coldfield.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-6xl mx-auto">
            {areas.map((area) => (
              <Link 
                key={area.slug} 
                href={`/areas/${area.slug}`}
                className="p-6 bg-slate-800 rounded-xl hover:bg-blue-900 transition-all border border-slate-700 flex flex-col items-center gap-3 group text-center"
              >
                <MapPin className="w-6 h-6 text-blue-400 group-hover:text-white" />
                <span className="font-bold text-lg">{area.name}</span>
                <span className="text-xs text-slate-400 group-hover:text-blue-200">{area.reviewCount} Reviews</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-16 items-center">
             <div className="flex-1">
                <h2 className="text-4xl font-bold text-slate-900 mb-6">Ready to Start Your Project?</h2>
                <p className="text-lg text-slate-600 mb-8">
                  Whether it's an urgent repair or a dream bathroom renovation, 
                  we're here to help. Fill out the form and we'll get back to you with a transparent, competitive quote.
                </p>
                <div className="space-y-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                         <Star className="w-5 h-5 fill-current" />
                      </div>
                      <span className="font-semibold text-slate-700 text-lg">Average 5.0 Rating</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                         <Clock className="w-5 h-5" />
                      </div>
                      <span className="font-semibold text-slate-700 text-lg">Fast Call-Back Promise</span>
                   </div>
                </div>
             </div>
             <div className="flex-1 w-full">
                <QuoteForm />
             </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ServiceCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <div className="p-8 border border-slate-100 rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all group">
      <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
      <p className="text-slate-500 mb-6 text-sm leading-relaxed">{desc}</p>
      <a href={href} className="text-blue-900 font-bold flex items-center justify-center gap-2 group-hover:gap-4 transition-all">
        Learn More <Star className="w-4 h-4 fill-current" />
      </a>
    </div>
  );
}
