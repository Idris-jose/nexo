export interface Service {
  slug: string;
  name: string;
  trade: string;
  category: string;
  icon: string;
  blurb: string;
  typicalCents: number;
}

export const SERVICES: Service[] = [
  { slug: "electrical", name: "Electrical", trade: "Electrician", category: "technical-services", icon: "zap", blurb: "DB boards, faults, lights, plugs and COCs.", typicalCents: 120000 },
  { slug: "plumbing", name: "Plumbing", trade: "Plumber", category: "home-services", icon: "droplets", blurb: "Leaks, geysers, blocked drains and fittings.", typicalCents: 80000 },
  { slug: "cleaning", name: "Cleaning", trade: "Cleaner", category: "home-services", icon: "sparkles", blurb: "Deep cleans, move-out cleans and regular help.", typicalCents: 50000 },
  { slug: "painting", name: "Painting", trade: "Painter", category: "home-services", icon: "paintbrush", blurb: "Interior and exterior painting, touch-ups.", typicalCents: 180000 },
  { slug: "moving", name: "Moving", trade: "Mover", category: "logistics-services", icon: "truck", blurb: "Furniture moves, deliveries and collections.", typicalCents: 90000 },
  { slug: "repairs", name: "Repairs", trade: "Handyman", category: "home-services", icon: "hammer", blurb: "Doors, shelves, fittings and odd jobs.", typicalCents: 60000 },
  { slug: "gardening", name: "Gardening", trade: "Gardener", category: "home-services", icon: "sprout", blurb: "Garden clean-ups, lawns and planting.", typicalCents: 45000 },
  { slug: "tutoring", name: "Tutoring", trade: "Tutor", category: "education-services", icon: "graduation-cap", blurb: "Maths, science and exam prep, at home or online.", typicalCents: 40000 },
  { slug: "massage", name: "Massage", trade: "Massage therapist", category: "wellness-services", icon: "hand-heart", blurb: "Relaxation and sports massage at home.", typicalCents: 60000 },
  { slug: "events", name: "DJ & Events", trade: "DJ", category: "leisure-entertainment", icon: "music", blurb: "DJs and event help for parties and functions.", typicalCents: 250000 },
  { slug: "admin", name: "Admin Support", trade: "Admin assistant", category: "administrative-services", icon: "clipboard-list", blurb: "Bookkeeping, filing and paperwork.", typicalCents: 70000 },
  { slug: "locksmith", name: "Locksmith", trade: "Locksmith", category: "specialised-services", icon: "key-round", blurb: "Lock-outs, lock changes and security gates.", typicalCents: 65000 },
];

export const getService = (slug?: string) => SERVICES.find((s) => s.slug === slug);
export const serviceName = (slug: string) => getService(slug)?.name ?? slug;
