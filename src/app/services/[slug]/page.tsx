import { Button } from "@/components/ui/button";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { Star, CheckCircle, Phone, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const serviceData: Record<string, any> = {
  "emergency-plumbing": {
    title: "Emergency Plumber Birmingham",
    subtitle: "Water Emergency? We Respond Within Hours - 24/7 Service",
    description: "Leaking pipes, burst radiators, or blocked toilets - we handle all plumbing emergencies with speed and professionalism. Based in Wylde Green, we serve all of Birmingham including Sutton Coldfield and Erdington.",
    features: [
      "Response within 1-4 hours",
      "Fixed pricing for peace of mind",
      "Gas Safe Registered engineers",
      "Clean and tidy workmanship"
    ],
    cta: "Call for Emergency Response",
    reviews: [
      { author: "Sarah M.", content: "Arrived within 2 hours of my call about a leak. Fixed it quickly and cleaned up everything. Brilliant service!", rating: 5 },
      { author: "David L.", content: "James was professional throughout. Sorted our blocked toilet on a Sunday evening. Highly recommend.", rating: 5 }
    ]
  },
  "bathroom-transformations": {
    title: "Bathroom Fitting & Renovations",
    subtitle: "From Old & Tired to Modern & Contemporary",
    description: "Our high-revenue bathroom transformations are what we're best known for. We handle everything from design to tiling and final plumbing. Turn your dream bathroom into a reality with Birmingham's most trusted team.",
    features: [
      "Complete design & installation",
      "High-quality tiling & finishes",
      "Modern contemporary styles",
      "Work tirelessly to meet deadlines"
    ],
    cta: "Book a Free Design Consultation",
    reviews: [
      { author: "Emma W.", content: "Transformed our outdated bathroom into a clean and modern space. The attention to detail is amazing.", rating: 5 },
      { author: "Chris P.", content: "Rick and the team worked tirelessly. Left everything spotless every evening. Love our new shower!", rating: 5 }
    ]
  },
  "boiler-servicing-repair": {
    title: "Boiler Service & Central Heating",
    subtitle: "Stay Warm & Safe with Annual Maintenance",
    description: "Proactive boiler servicing is essential for safety and efficiency. We provide thorough checks, repairs, and full system installations across Birmingham and Sutton Coldfield.",
    features: [
      "Gas Safe Registered (Required by law)",
      "System efficiency checks",
      "Emergency boiler repairs",
      "Radiator & heating upgrades"
    ],
    cta: "Book My Boiler Service",
    reviews: [
      { author: "Robert J.", content: "Reliable and prompt. James explained everything clearly during the boiler service. Great price too.", rating: 5 },
      { author: "Karen S.", content: "TJ fixed our boiler after another plumber failed. Courteous and professional throughout.", rating: 5 }
    ]
  },
  "kitchen-plumbing": {
    title: "Kitchen Plumbing & Installations",
    subtitle: "Expert Sink, Tap, and Appliance Connections",
    description: "From leaky taps to full dishwasher and washing machine installations. We ensure your kitchen plumbing is reliable, efficient, and professionally installed.",
    features: [
      "Sink & tap replacements",
      "Appliance installations",
      "Waste pipe repairs",
      "Kitchen renovation plumbing"
    ],
    cta: "Get a Kitchen Quote",
    reviews: [
      { author: "Mike T.", content: "Fixed a previous plumber's shoddy work on our sink. Prompt and reasonably priced.", rating: 5 },
      { author: "Linda H.", content: "Courteous and kindness shown throughout the installation. Everything left spotless.", rating: 5 }
    ]
  }
};

export async function generateStaticParams() {
  return Object.keys(serviceData).map((slug) => ({
    slug: slug,
  }));
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const service = serviceData[resolvedParams.slug];

  if (!service) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <Link href="/" className="text-blue-300 hover:text-white mb-8 inline-block">← Back to Home</Link>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">{service.title}</h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl">{service.subtitle}</p>
              <div className="flex flex-wrap gap-4">
                <Button variant="secondary" size="lg" className="gap-2">
                  <Phone className="w-5 h-5" />
                  Call 0121 XXX XXXX
                </Button>
                <div className="flex items-center gap-2 bg-blue-800/50 px-4 py-2 rounded-full border border-blue-700">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-sm">42+ Five-Star Reviews</span>
                </div>
              </div>
            </div>
            <div className="flex-1 w-full max-w-md">
               <QuoteForm />
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Why J.Avery for {service.title}?</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                {service.description}
              </p>
              <ul className="space-y-4">
                {service.features.map((feature: string) => (
                  <li key={feature} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              <div className="mt-12 p-8 bg-slate-50 rounded-2xl border border-slate-100">
                <h3 className="text-xl font-bold mb-4">"We Fix Other Plumbers' Mistakes"</h3>
                <p className="text-slate-600 mb-6 italic">
                  Often we're called out to fix DIY disasters or shoddy work from other tradespeople. 
                  We take pride in doing it right the first time.
                </p>
                <Button variant="outline" className="gap-2">
                  See Our Work Gallery <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">What Our Customers Say</h2>
              <div className="space-y-6">
                {service.reviews.map((review: any, index: number) => (
                  <div key={index} className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex gap-1 mb-3">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-4 font-medium italic">"{review.content}"</p>
                    <p className="text-slate-500 font-bold text-sm">— {review.author}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                 <p className="text-slate-500 text-sm mb-4">Trusted by Birmingham families for over 10 years.</p>
                 <img src="/trust-badges.png" alt="Trust Badges" className="mx-auto h-12 grayscale opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Help with {service.title} Today?</h2>
          <p className="text-slate-400 mb-8">Don't wait. Our team is ready to assist you now.</p>
          <div className="flex justify-center gap-4">
             <Button variant="emergency" size="lg">Call for Help</Button>
             <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-slate-900">Get a Quote</Button>
          </div>
        </div>
      </section>
    </main>
  );
}
