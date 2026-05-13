import { Metadata } from "next";
import { notFound } from "next/navigation";
import { areas, getAreaBySlug } from "@/lib/areas";
import { Button } from "@/components/ui/button";
import { QuoteForm } from "@/components/sections/QuoteForm";
import { Star, MapPin, CheckCircle, Phone, Clock } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return areas.map((area) => ({
    slug: area.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const area = getAreaBySlug(resolvedParams.slug);
  
  if (!area) return { title: "Area Not Found" };

  return {
    title: `Expert Plumber in ${area.name} | J.Avery Plumbing & Heating`,
    description: `Trusted local plumbing and heating services in ${area.name}, Birmingham. 24/7 emergency response, boiler repairs, and bathroom transformations. ${area.reviewCount} five-star reviews in your area.`,
  };
}

export default async function AreaPage({ params }: PageProps) {
  const resolvedParams = await params;
  const area = getAreaBySlug(resolvedParams.slug);

  if (!area) {
    notFound();
  }

  // Schema.org JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Plumber",
    "name": `J.Avery Plumbing & Heating - ${area.name}`,
    "description": area.description,
    "image": "https://javeryplumbing.co.uk/logo.png",
    "telephone": "+44121XXXXXXX",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "656 Chester Rd, Wylde Green",
      "addressLocality": area.name,
      "addressRegion": "Birmingham",
      "postalCode": "B23 5TE",
      "addressCountry": "GB"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": area.lat,
      "longitude": area.lng
    },
    "url": `https://javeryplumbing.co.uk/areas/${area.slug}`,
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5.0",
      "reviewCount": area.reviewCount.toString()
    },
    "priceRange": "££"
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Hero Section */}
      <section className="bg-blue-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1 text-center lg:text-left">
              <Link href="/" className="text-blue-300 hover:text-white mb-8 inline-block">← Back to Home</Link>
              <div className="inline-flex items-center gap-2 bg-blue-800/50 px-4 py-2 rounded-full border border-blue-700 mb-6">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-sm">{area.reviewCount} Five-Star Reviews in {area.name}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                Plumbing & Heating in <span className="text-blue-300">{area.name}</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto lg:mx-0">
                {area.description} Responding within hours to all of {area.name}. We offer 24/7 emergency response and high-quality plumbing solutions with a spotless finish.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="tel:0121XXXXXXX">
                  <Button variant="emergency" size="lg" className="gap-2 w-full sm:w-auto">
                    <Phone className="w-5 h-5" />
                    Call {area.name} Team
                  </Button>
                </a>
                <a href="#quote">
                  <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-900 w-full sm:w-auto">
                    Request a Quote
                  </Button>
                </a>
              </div>
            </div>
            <div className="flex-1 w-full max-w-md" id="quote">
              <QuoteForm />
            </div>
          </div>
        </div>
      </section>

      {/* Localized Content Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Reliable Plumbing & Heating in {area.name}
              </h2>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Residents of {area.name} trust J.Avery Plumbing & Heating for our speed, professionalism, and cleanliness. 
                We understand the specific requirements of properties in this area, from modern system upgrades to emergency repairs.
              </p>
              
              {area.commonIssues && (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-blue-900" />
                    Area Note:
                  </h3>
                  <p className="text-slate-600 italic">
                    {area.commonIssues}
                  </p>
                </div>
              )}

              <ul className="space-y-4">
                {[
                  "24/7 Emergency call-outs",
                  "Local engineers based in Wylde Green",
                  "Gas Safe Registered & Fully Insured",
                  "Fixed price quotes - no surprises",
                  "Spotless cleanup after every job"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <div className="aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-inner border border-slate-200">
                {/* Embedded Google Map */}
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://maps.google.com/maps?q=${area.lat},${area.lng}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                ></iframe>
              </div>
              <div className="flex items-center justify-between p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-900 font-bold uppercase tracking-wider">Response Time</p>
                    <p className="text-slate-700 font-bold">Within 1-4 Hours</p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-500 font-bold">Serving {area.name} Residents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-8">Trusted Across Birmingham</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl mx-auto">
             <div className="space-y-4">
                <p className="text-5xl font-extrabold text-blue-400">42+</p>
                <p className="text-lg font-bold text-slate-300">5-Star Reviews</p>
             </div>
             <div className="space-y-4">
                <p className="text-5xl font-extrabold text-blue-400">100%</p>
                <p className="text-lg font-bold text-slate-300">Satisfaction Guarantee</p>
             </div>
             <div className="space-y-4">
                <p className="text-5xl font-extrabold text-blue-400">Next-Day</p>
                <p className="text-lg font-bold text-slate-300">Service Standard</p>
             </div>
          </div>
          <div className="mt-16">
            <Link href="/#services">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-slate-900">
                View All Our Services
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
