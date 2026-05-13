export interface Area {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  reviewCount: number;
  description: string;
  commonIssues?: string;
}

export const areas: Area[] = [
  {
    slug: "sutton-coldfield",
    name: "Sutton Coldfield",
    lat: 52.563,
    lng: -1.822,
    reviewCount: 12,
    description: "Providing expert plumbing and heating services to the historic Royal Town of Sutton Coldfield. From Victorian manor houses near Sutton Park to modern developments, we know the area's unique plumbing needs.",
    commonIssues: "Many older properties in Sutton Coldfield experience low water pressure or require modern boiler upgrades to improve efficiency. We frequently work on heating systems near the Gracechurch Centre."
  },
  {
    slug: "erdington",
    name: "Erdington",
    lat: 52.523,
    lng: -1.841,
    reviewCount: 8,
    description: "Reliable, local plumbing services for Erdington residents. From the High Street to the residential streets near Spaghetti Junction, we offer next-day service as standard for all boiler repairs.",
    commonIssues: "Erdington homes often see issues with aging pipework and require professional power flushing to maintain heating performance."
  },
  {
    slug: "wylde-green",
    name: "Wylde Green",
    lat: 52.535,
    lng: -1.828,
    reviewCount: 15,
    description: "Based right here on Chester Road in Wylde Green, we are your truly local plumbers. We take pride in serving our neighbors near Wylde Green station with spotless, professional workmanship.",
    commonIssues: "We frequently handle bathroom transformations in Wylde Green, turning tired spaces into modern luxury suites."
  },
  {
    slug: "boldmere",
    name: "Boldmere",
    lat: 52.544,
    lng: -1.844,
    reviewCount: 6,
    description: "Fast response plumbing and heating in Boldmere. Whether it's a leaky tap on Boldmere Road or a full boiler install near the park entrance, Rick and the team are ready to help.",
    commonIssues: "Commonly called for emergency drain unblocking and radiator replacements in the Boldmere area."
  },
  {
    slug: "four-oaks",
    name: "Four Oaks",
    lat: 52.584,
    lng: -1.834,
    reviewCount: 9,
    description: "Premium plumbing solutions for Four Oaks. We specialize in high-end bathroom refits and high-efficiency heating systems for larger family homes across the Four Oaks Estate and Mere Green.",
    commonIssues: "Four Oaks Victorian homes often require specialized care when upgrading central heating systems to preserve original features."
  },
  {
    slug: "streetly",
    name: "Streetly",
    lat: 52.583,
    lng: -1.884,
    reviewCount: 5,
    description: "Professional plumbers serving Streetly and surrounding areas. From Streetly Village to the Foley Arms, we are Gas Safe registered and fully insured for your peace of mind.",
    commonIssues: "Frequent boiler servicing and annual safety checks for Streetly homeowners."
  },
  {
    slug: "little-aston",
    name: "Little Aston",
    lat: 52.597,
    lng: -1.868,
    reviewCount: 4,
    description: "Discreet and professional plumbing services for Little Aston. We provide high-quality installations near Little Aston Park with absolute attention to detail.",
    commonIssues: "High-spec bathroom installations and complex underfloor heating systems are common requests in Little Aston."
  },
  {
    slug: "walmley",
    name: "Walmley",
    lat: 52.548,
    lng: -1.798,
    reviewCount: 7,
    description: "Your local Walmley plumbing experts. We respond within hours to emergencies near Walmley Village and Pype Hayes Park.",
    commonIssues: "Walmley residents often call us for kitchen plumbing upgrades and energy-efficient boiler replacements."
  }
];

export function getAreaBySlug(slug: string) {
  return areas.find(a => a.slug === slug);
}
