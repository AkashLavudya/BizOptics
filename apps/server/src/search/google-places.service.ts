import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

// ─── Types matching the Prisma Business schema exactly ───────────────────────

export interface NormalizedBusiness {
  name: string;
  description?: string;
  ownerName?: string;
  services: string[];
  foundedYear?: number;
  employeeCount?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  lat?: number;
  lng?: number;
  phone?: string;
  website?: string;
  category: string;
  rating?: number;
  reviewCount?: number;
  priceLevel?: number;
  photos: string[];
  types: string[];
}

// ─── Realistic mock business names per category ──────────────────────────────
// These mimic real-world Google Places results — unique per category, no template repetition.

const MOCK_NAMES: Record<string, string[]> = {
  restaurant: [
    "The Golden Fork", "Mama Rosa's Kitchen", "Harbor Grill & Bar", "Olive Garden Express",
    "Blue Moon Bistro", "Panda Express Downtown", "Casa del Sol", "Firefly Diner",
    "The Rustic Table", "Noodle House", "Burger Republic", "Spice Route Indian Kitchen",
    "Lemon Tree Café", "Coastal Catch Seafood", "The Hungry Bear Smokehouse", "Zen Garden Sushi",
  ],
  lawyer: [
    "Anderson & Clark Law Group", "Mitchell Legal Associates", "Prestige Law Firm",
    "Cornerstone Attorneys at Law", "Pacific Legal Partners", "Sterling & Hayes LLP",
    "Davis Family Law", "Apex Criminal Defense", "Reyes & Partners Legal",
    "Thompson Law Office", "Justice First Legal Group", "NextGen Law Associates",
    "Rivera Immigration Law", "Summit Business Attorneys", "Beacon Legal Group", "Pinnacle Law Center",
  ],
  dentist: [
    "Bright Smiles Dental", "Cityview Dental Care", "Pearl Dental Studio",
    "Family Dental Associates", "Advanced Dental & Implant Center", "Smile Avenue Dentistry",
    "Downtown Dental Clinic", "Happy Teeth Pediatric Dentistry", "Pure Smiles Orthodontics",
    "Sunrise Dental Group", "Premier Dental Arts", "Lakeside Dental Center",
    "Modern Smiles Dental", "Gateway Dental Specialists", "Diamond Dental Care", "Healthy Smiles Dental",
  ],
  doctor: [
    "HealthFirst Medical Group", "CityMed Primary Care", "Riverside Family Health",
    "Integrated Medical Center", "NextGen Healthcare", "Summit Health Clinic",
    "Advanced Urgent Care", "Harmony Health Partners", "Metropolitan Medical Associates",
    "Parkview Family Medicine", "Precision Health Center", "Community Care Clinic",
    "Prestige Medical Group", "Coastal Health Associates", "Midtown Medical Center", "Elite Medical Services",
  ],
  pharmacy: [
    "Main Street Pharmacy", "Community Rx Pharmacy", "QuickMeds Pharmacy",
    "Valley Prescription Center", "HealthPlus Pharmacy", "Family Care Pharmacy",
    "CityMed Drugstore", "Wellness Pharmacy & Gift", "Express Rx", "PrimeCare Pharmacy",
    "MediTrust Pharmacy", "Sunrise Rx", "Neighborhood Pharmacy", "TrustCare Pharmacy",
    "GreenLeaf Pharmacy", "Metro Compounding Pharmacy",
  ],
  beauty_salon: [
    "Luxe Hair Lounge", "The Beauty Bar", "Glow Salon & Spa", "Studio 9 Hair Design",
    "Bliss Beauty Boutique", "Mane Attraction Salon", "Urban Glam Studio", "Serenity Spa & Nails",
    "Chic Hair Co.", "The Cutting Edge Salon", "Radiance Beauty Salon", "Velvet Touch Salon",
    "Platinum Hair Studio", "Allure Beauty Lounge", "Envy Salon & Spa", "Mirror Mirror Salon",
  ],
  gym: [
    "Iron Works Fitness Center", "Peak Performance Gym", "FitLife Health Club",
    "Elevate Fitness Studio", "CrossFit Apex", "Gold's Gym Downtown", "Planet Fitness",
    "PowerHouse Gym", "FlexZone Athletic Club", "Anytime Fitness", "CoreFit Studio",
    "Champion Martial Arts & Fitness", "The Training Ground", "NextLevel Fitness",
    "Pure Energy Yoga & Fitness", "Momentum Athletics",
  ],
  lodging: [
    "Grand Central Hotel", "Comfort Suites Downtown", "The Royal Inn",
    "Hilltop Hotel & Suites", "Bayview Boutique Hotel", "Harbour View Motel",
    "Prestige Hotel & Conference", "The Plaza Bed & Breakfast", "Skyline Hotel",
    "Hampton Inn & Suites", "Pacific Coast Inn", "Riverview Motel",
    "The Heritage Hotel", "Lakeshore Lodge", "Capitol City Hotel", "Premier Inn Downtown",
  ],
  car_repair: [
    "Precision Auto Repair", "Midas Auto Service", "QuickFix Auto Shop",
    "CityGarage & Tires", "Diamond Auto Care", "Ace Auto Mechanics",
    "Expert Automotive", "Speedy Lube & Service", "AutoCare Plus", "Elite Auto Repair",
    "Trustworthy Auto Shop", "Metro Auto Service Center", "ProTech Automotive",
    "Reliable Auto Repair", "First Class Auto Care", "Premier Auto Works",
  ],
  store: [
    "Downtown Fashion Boutique", "Urban Outfitters Express", "The Gift Shop",
    "Everyday Essentials Market", "StyleHub Clothing Co.", "Main Street Books",
    "Gadget World Electronics", "Nature's Best Health Store", "The Toy Kingdom",
    "FreshMart Grocery", "Crafts & More Store", "Budget Depot",
    "Luxe Home Furnishings", "Sports Corner", "The Shoe Gallery", "True Value Hardware",
  ],
  real_estate_agency: [
    "Prime Properties Realty", "Citywide Real Estate Group", "Landmark Realty Co.",
    "Crown Real Estate", "BlueSky Properties", "Nexus Real Estate Partners",
    "Cornerstone Realty", "Summit Property Group", "Horizon Realty Associates",
    "Prestige Homes & Properties", "TrueHome Realty", "First Choice Real Estate",
    "Elite Realty Group", "Sterling Property Advisors", "Pacific Crest Realty", "HomeFront Realty",
  ],
  general_contractor: [
    "BuildRight Construction", "Apex Builders & Renovation", "ProCraft Construction",
    "Master Build Contractors", "Cornerstone Builders", "Elite Home Renovation",
    "Precision Construction Services", "City Wide Contractors", "Summit Builders Group",
    "TrustBuild Construction Co.", "Premier Renovation Experts", "BlueLine Contractors",
    "AceConstruct LLC", "Urban Build Solutions", "First Class Remodeling", "Heritage Builders",
  ],
  school: [
    "Bright Minds Learning Center", "Future Stars Academy", "CityEdge Tutoring",
    "Excel Learning Institute", "Discovery Children's Academy", "MindCraft Education Center",
    "Success Academy Tutoring", "Prestige Learning Hub", "Horizons Education Center",
    "Knowledge Tree Academy", "NextStep Learning Center", "Premier Education Institute",
    "Little Genius Preschool", "Smartkids Academy", "Ace Academic Institute", "ArtsFirst School",
  ],
  accounting: [
    "PrecisionBooks Accounting", "Summit Tax & Advisory", "ClearCount CPA Group",
    "TrueBalance Accounting", "Apex Financial Services", "Reliable Bookkeeping Co.",
    "Metro Tax Professionals", "ProLedger CPA Firm", "Financial Clarity Group",
    "TrustPoint Accounting", "Premier Payroll Services", "Strategic Finance Group",
    "Clarity Tax & Bookkeeping", "NumbersPro CPA", "RightFit Financial Advisors", "Anchor Accounting Group",
  ],
};

// ─── Owner names pool ────────────────────────────────────────────────────────
const OWNER_FIRST = [
  'James', 'Maria', 'David', 'Sarah', 'Michael', 'Linda', 'Robert', 'Patricia',
  'John', 'Jennifer', 'William', 'Barbara', 'Richard', 'Susan', 'Thomas', 'Jessica',
  'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty',
  'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Dorothy',
  'Paul', 'Kimberly', 'Andrew', 'Emily', 'Kenneth', 'Donna', 'Joshua', 'Michelle',
  'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Timothy', 'Deborah',
];

const OWNER_LAST = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
];

// ─── Services & descriptions per category ────────────────────────────────────
const CATEGORY_SERVICES: Record<string, string[]> = {
  restaurant: ['Dine-in', 'Takeout', 'Delivery', 'Catering', 'Private Events', 'Online Ordering'],
  lawyer: ['Personal Injury', 'Family Law', 'Business Litigation', 'Estate Planning', 'Criminal Defense', 'Real Estate Law', 'Immigration'],
  dentist: ['General Dentistry', 'Teeth Whitening', 'Orthodontics', 'Dental Implants', 'Root Canal', 'Cosmetic Dentistry', 'Emergency Dental Care'],
  doctor: ['Primary Care', 'Urgent Care', 'Preventive Medicine', 'Chronic Disease Management', 'Telehealth', 'Annual Physicals', 'Lab Testing'],
  pharmacy: ['Prescription Filling', 'Medication Counseling', 'Immunizations', 'Compounding', 'Blister Packaging', 'Specialty Medications', 'Home Delivery'],
  beauty_salon: ['Haircuts & Styling', 'Hair Coloring', 'Keratin Treatments', 'Manicures & Pedicures', 'Waxing', 'Facials', 'Bridal Services'],
  gym: ['Personal Training', 'Group Fitness Classes', 'Cardio Equipment', 'Strength Training', 'Yoga & Pilates', 'Nutrition Coaching', 'Sauna & Recovery'],
  lodging: ['Room Accommodations', 'Conference Facilities', 'Airport Shuttle', 'Spa Services', 'Restaurant & Bar', 'Event Hosting', 'Concierge Services'],
  car_repair: ['Oil Changes', 'Brake Repair', 'Tire Services', 'Engine Diagnostics', 'Transmission Repair', 'AC Service', 'Body Work & Painting'],
  store: ['In-Store Shopping', 'Online Orders & Pickup', 'Gift Cards', 'Layaway Program', 'Loyalty Rewards', 'Custom Orders', 'Free Returns'],
  real_estate_agency: ['Residential Sales', 'Commercial Listings', 'Property Management', 'Buyer Representation', 'Investment Properties', 'Market Analysis', 'Mortgage Referrals'],
  general_contractor: ['Residential Remodeling', 'Commercial Construction', 'Kitchen & Bath', 'Roofing', 'Flooring', 'Electrical & Plumbing', 'Project Management'],
  school: ['Early Childhood Education', 'K-12 Tutoring', 'Test Prep (SAT/ACT)', 'STEM Programs', 'Arts & Music', 'Language Courses', 'Summer Camps'],
  accounting: ['Tax Preparation', 'Bookkeeping', 'Payroll Services', 'Financial Planning', 'Audit Support', 'Business Consulting', 'QuickBooks Setup'],
};

const CATEGORY_DESC: Record<string, string[]> = {
  restaurant: [
    'A locally-owned eatery serving fresh, made-to-order dishes with locally sourced ingredients. Known for warm hospitality and a rotating seasonal menu.',
    'A family-run restaurant with over two decades of experience delivering authentic home-style cooking. Offers both dine-in and convenient takeout options.',
    'A vibrant culinary destination celebrated for its diverse menu, cozy ambiance, and attentive staff. Perfect for intimate dinners and large group gatherings.',
  ],
  lawyer: [
    'An established law firm with a team of experienced attorneys providing personalized legal counsel across multiple practice areas. Results-driven and client-focused.',
    'A boutique legal practice known for its aggressive representation and deep commitment to client outcomes. Specializes in both civil and criminal matters.',
    'A full-service law office offering affordable consultations and transparent fee structures. Trusted by hundreds of local families and businesses.',
  ],
  dentist: [
    'A state-of-the-art dental practice offering comprehensive oral health care for all ages. Patients appreciate the gentle approach and modern technology.',
    'A community dental clinic committed to making quality dental care accessible and affordable. Proudly serving the neighborhood for over 15 years.',
    'A leading dental studio offering everything from routine cleanings to full-mouth restorations. Focused on pain-free experiences and lasting smiles.',
  ],
  doctor: [
    'A primary care clinic staffed by board-certified physicians dedicated to preventive health and long-term wellness. Accepting new patients of all ages.',
    'A multi-specialty medical group providing comprehensive healthcare services in a welcoming environment. Same-day appointments often available.',
    'A community health center offering evidence-based medicine with a patient-first philosophy. Telehealth consultations available for established patients.',
  ],
  pharmacy: [
    'An independent pharmacy with a clinical focus on medication management, compounding, and patient education. Accepts most major insurance plans.',
    'A full-service pharmacy offering fast prescription filling, immunizations, and personalized medication counseling. Open 7 days a week.',
    'A community pharmacy committed to building lasting relationships with patients and providers. Specializes in specialty medications and home delivery.',
  ],
  beauty_salon: [
    'A premier beauty studio offering a full menu of hair, nail, and skincare services in a chic, relaxing atmosphere. Walk-ins welcome; appointments preferred.',
    'A talent-driven salon staffed by certified stylists with experience in the latest trends and classic techniques. Known for stunning color transformations.',
    'A full-service day spa and salon providing luxury treatments at accessible prices. Gift cards and membership packages available.',
  ],
  gym: [
    'A results-focused fitness facility equipped with cutting-edge equipment and certified personal trainers. Flexible membership plans for all fitness levels.',
    'A welcoming gym community that emphasizes functional training, group classes, and ongoing member support. Open 24/7 with digital check-in.',
    'A boutique fitness studio offering high-energy classes and customized training programs. Nationally recognized coaches on staff.',
  ],
  lodging: [
    'A comfortable, well-appointed hotel offering modern amenities and attentive service in the heart of the city. Business and leisure travelers welcome.',
    'A boutique property celebrated for its unique character, personalized hospitality, and prime location. Each room is individually decorated.',
    'A full-service hotel with conference facilities, an on-site restaurant, and a spa. Ideal for both corporate events and weekend getaways.',
  ],
  car_repair: [
    'A trusted auto repair shop staffed by ASE-certified mechanics. Known for honest diagnostics, competitive pricing, and same-day service on most repairs.',
    'A full-service automotive center handling everything from routine oil changes to complex engine overhauls. Family-owned and community-focused.',
    'A high-rated repair shop equipped with the latest diagnostic tools. Specializes in both domestic and foreign vehicles with a warranty on all work.',
  ],
  store: [
    'A popular local retailer offering a carefully curated selection of products at competitive prices. Known for knowledgeable staff and excellent customer service.',
    'A specialty shop with a diverse inventory and a loyal customer base built on trust, quality, and a commitment to satisfaction.',
    'A neighborhood staple offering everyday essentials alongside unique specialty items. Loyalty rewards program available for frequent shoppers.',
  ],
  real_estate_agency: [
    'A dedicated real estate agency with deep local market expertise. Committed to helping buyers and sellers achieve their property goals with confidence.',
    'A full-service brokerage offering comprehensive real estate solutions, from property valuation to closing. A proven track record of successful transactions.',
    'An experienced agency specializing in both residential and commercial properties. Known for transparent communication and negotiation skills.',
  ],
  general_contractor: [
    'A licensed and insured general contractor with a reputation for on-time, on-budget project delivery. Specializes in full-scope residential and commercial renovations.',
    'A design-build firm offering end-to-end construction services. From initial blueprints to the final walkthrough, quality is guaranteed.',
    'An award-winning contracting company known for craftsmanship and attention to detail. Local references available upon request.',
  ],
  school: [
    'An accredited learning center offering personalized education programs to help students reach their academic potential. Experienced instructors in all subjects.',
    'A top-rated tutoring academy with proven methods for improving grades and building confidence. Programs available for K-12 students.',
    'An innovative education center combining traditional academics with STEM, arts, and leadership development. Enroll today for a brighter future.',
  ],
  accounting: [
    'A certified public accounting firm offering expert tax, bookkeeping, and financial advisory services to individuals and businesses of all sizes.',
    'A trusted accounting practice known for accuracy, timeliness, and proactive financial guidance. Year-round support for all tax and compliance needs.',
    'A full-service financial firm helping clients navigate taxes, audits, and growth strategies. Proud members of the AICPA and state CPA society.',
  ],
};

const DEFAULT_SERVICES = ['Consulting', 'Customer Service', 'In-Person Visits', 'Online Appointments'];
const DEFAULT_DESC = 'A well-established local business providing quality services to the community. Known for professional staff, competitive pricing, and excellent customer satisfaction.';

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class GooglePlacesService {
  private readonly logger = new Logger(GooglePlacesService.name);

  private readonly TEXT_SEARCH_URL =
    'https://maps.googleapis.com/maps/api/place/textsearch/json';
  private readonly DETAILS_URL =
    'https://maps.googleapis.com/maps/api/place/details/json';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // ─── Search Places ─────────────────────────────────────────────────────────

  async searchPlaces(
    query: string,
    location?: string,
    radius?: number,
    type?: string,
  ): Promise<any[]> {
    const apiKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY', '');

    if (!apiKey) {
      this.logger.warn('GOOGLE_PLACES_API_KEY not set — returning mock data.');
      return this.getMockPlaces(query, location);
    }

    const params: Record<string, string> = {
      query: location ? `${query} ${location}` : query,
      key: apiKey,
    };

    if (radius) params['radius'] = String(radius);
    if (type) params['type'] = type;

    try {
      const response = await firstValueFrom(
        this.httpService.get(this.TEXT_SEARCH_URL, { params }),
      );

      const { status, results } = response.data;

      if (status !== 'OK' && status !== 'ZERO_RESULTS') {
        this.logger.error(`Google Places Text Search error: ${status}`);
        return this.getMockPlaces(query);
      }

      return results ?? [];
    } catch (err) {
      const axiosErr = err as AxiosError;
      this.logger.error(
        `Google Places HTTP error: ${axiosErr.message}`,
        axiosErr.stack,
      );
      return this.getMockPlaces(query);
    }
  }

  // ─── Place Details ─────────────────────────────────────────────────────────

  async getPlaceDetails(placeId: string): Promise<any | null> {
    const apiKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY', '');

    if (!apiKey) {
      this.logger.warn('GOOGLE_PLACES_API_KEY not set — skipping details call.');
      return null;
    }

    const params: Record<string, string> = {
      place_id: placeId,
      fields: [
        'name',
        'formatted_address',
        'formatted_phone_number',
        'website',
        'rating',
        'user_ratings_total',
        'types',
        'geometry',
        'opening_hours',
        'price_level',
        'url',
        'photos',
        'address_components',
      ].join(','),
      key: apiKey,
    };

    try {
      const response = await firstValueFrom(
        this.httpService.get(this.DETAILS_URL, { params }),
      );

      const { status, result } = response.data;

      if (status !== 'OK') {
        this.logger.warn(`Place Details error for ${placeId}: ${status}`);
        return null;
      }

      return result;
    } catch (err) {
      const axiosErr = err as AxiosError;
      this.logger.error(
        `Place Details HTTP error: ${axiosErr.message}`,
        axiosErr.stack,
      );
      return null;
    }
  }

  // ─── Normalize — maps Google Places response to Prisma Business schema ─────

  normalizePlace(place: any): NormalizedBusiness {
    const lat: number | undefined = place.geometry?.location?.lat ?? undefined;
    const lng: number | undefined = place.geometry?.location?.lng ?? undefined;

    const fullAddress: string = place.formatted_address ?? place.vicinity ?? '';
    const { city, state, country } = this.parseAddress(fullAddress, place.address_components);

    const photos: string[] = [];
    const apiKey = this.configService.get<string>('GOOGLE_PLACES_API_KEY', '');
    if (apiKey && Array.isArray(place.photos)) {
      for (const photo of (place.photos as any[]).slice(0, 3)) {
        const ref: string = photo.photo_reference ?? '';
        if (ref) {
          photos.push(
            `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${ref}&key=${apiKey}`,
          );
        }
      }
    }

    const types: string[] = place.types ?? [];
    const category = this.mapGoogleTypeToCategory(types);

    // Enrich with description and services from editorial data if available
    const catKey = this.mapGoogleTypeToCategory(types)
      .toLowerCase()
      .replace('_', '') as string;

    return {
      name: place.name ?? 'Unknown Business',
      // For mock data, these come as underscore-prefixed props;
      // for real Google Places, editorial_summary covers description.
      description: place._description ?? place.editorial_summary?.overview ?? undefined,
      ownerName: place._ownerName ?? undefined,
      services: place._services ?? [],
      foundedYear: place._foundedYear ?? undefined,
      employeeCount: place._employeeCount ?? undefined,
      address: fullAddress || '—',
      city: city || 'Unknown',
      state: state || 'Unknown',
      country: country || 'US',
      lat,
      lng,
      phone: place.formatted_phone_number ?? place.international_phone_number ?? undefined,
      website: place.website || undefined,
      category,
      rating: typeof place.rating === 'number' ? place.rating : undefined,
      reviewCount:
        typeof place.user_ratings_total === 'number'
          ? place.user_ratings_total
          : undefined,
      priceLevel:
        typeof place.price_level === 'number' ? place.price_level : undefined,
      photos,

      types,
    };
  }

  // ─── Parse city/state from address string or components ───────────────────

  private parseAddress(
    formatted: string,
    components?: any[],
  ): { city: string; state: string; country: string } {
    let city = '';
    let state = '';
    let country = 'US';

    if (Array.isArray(components)) {
      for (const comp of components) {
        const types: string[] = comp.types ?? [];
        if (types.includes('locality')) city = comp.long_name ?? '';
        if (types.includes('administrative_area_level_1')) state = comp.short_name ?? '';
        if (types.includes('country')) country = comp.short_name ?? 'US';
      }
    }

    if (!city || !state) {
      const parts = formatted.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        const cityGuess = parts[parts.length - 3] ?? '';
        const stateZip = parts[parts.length - 2] ?? '';
        const countryGuess = parts[parts.length - 1] ?? '';

        if (!city) city = cityGuess;
        if (!state) {
          state = stateZip.split(' ')[0] ?? stateZip;
        }
        if (countryGuess && !countryGuess.match(/\d/)) {
          country = countryGuess === 'USA' ? 'US' : countryGuess;
        }
      }
    }

    return { city, state, country };
  }

  // ─── Map Google type to our BusinessCategory enum ─────────────────────────

  private mapGoogleTypeToCategory(types: string[]): string {
    const mapping: Record<string, string> = {
      restaurant: 'RESTAURANT',
      food: 'RESTAURANT',
      cafe: 'RESTAURANT',
      bar: 'RESTAURANT',
      meal_takeaway: 'RESTAURANT',
      meal_delivery: 'RESTAURANT',
      lodging: 'HOSPITALITY',
      hotel: 'HOSPITALITY',
      health: 'HEALTHCARE',
      hospital: 'HEALTHCARE',
      doctor: 'HEALTHCARE',
      dentist: 'HEALTHCARE',
      pharmacy: 'HEALTHCARE',
      beauty_salon: 'BEAUTY_SALON',
      hair_care: 'BEAUTY_SALON',
      spa: 'BEAUTY_SALON',
      gym: 'FITNESS',
      lawyer: 'LEGAL',
      legal_service: 'LEGAL',
      real_estate_agency: 'REAL_ESTATE',
      accounting: 'ACCOUNTING',
      car_repair: 'AUTOMOTIVE',
      car_dealer: 'AUTOMOTIVE',
      clothing_store: 'RETAIL',
      store: 'RETAIL',
      shopping_mall: 'RETAIL',
      school: 'EDUCATION',
      university: 'EDUCATION',
      financial_institution: 'FINANCIAL_SERVICES',
      bank: 'FINANCIAL_SERVICES',
      insurance_agency: 'FINANCIAL_SERVICES',
      moving_company: 'CONSTRUCTION',
      general_contractor: 'CONSTRUCTION',
    };

    for (const type of types) {
      if (mapping[type]) return mapping[type];
    }
    return 'OTHER';
  }

  // ─── Deterministic seeded random (no external dep) ───────────────────────
  // Using a simple LCG so same city+query always picks different names, but
  // different runs of the same city+query pick from a different offset so
  // data feels fresh each scan.

  private seededRand(seed: number): () => number {
    let s = seed;
    return () => {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
  }

  // ─── Mock Data ─────────────────────────────────────────────────────────────
  // Generates realistic, city-specific mock businesses that look like real
  // Google Places API results. Each city × category combination picks a unique
  // slice from the MOCK_NAMES table so you won't see duplicate names across cities.

  private getMockPlaces(query: string, location?: string): any[] {
    // ── State → cities lookup ───────────────────────────────────────────────
    const stateData: Record<string, { city: string; abbr: string; lat: number; lng: number; areaCode: string }[]> = {
      california: [
        { city: 'Los Angeles',    abbr: 'CA', lat: 34.052, lng: -118.243, areaCode: '213' },
        { city: 'San Francisco',  abbr: 'CA', lat: 37.774, lng: -122.419, areaCode: '415' },
        { city: 'San Diego',      abbr: 'CA', lat: 32.715, lng: -117.161, areaCode: '619' },
        { city: 'Sacramento',     abbr: 'CA', lat: 38.581, lng: -121.494, areaCode: '916' },
        { city: 'San Jose',       abbr: 'CA', lat: 37.338, lng: -121.886, areaCode: '408' },
      ],
      texas: [
        { city: 'Houston',  abbr: 'TX', lat: 29.760, lng: -95.369, areaCode: '713' },
        { city: 'Austin',   abbr: 'TX', lat: 30.267, lng: -97.743, areaCode: '512' },
        { city: 'Dallas',   abbr: 'TX', lat: 32.776, lng: -96.796, areaCode: '214' },
        { city: 'San Antonio', abbr: 'TX', lat: 29.424, lng: -98.494, areaCode: '210' },
        { city: 'Fort Worth', abbr: 'TX', lat: 32.725, lng: -97.321, areaCode: '817' },
      ],
      florida: [
        { city: 'Miami',       abbr: 'FL', lat: 25.774, lng: -80.190, areaCode: '305' },
        { city: 'Orlando',     abbr: 'FL', lat: 28.538, lng: -81.379, areaCode: '407' },
        { city: 'Tampa',       abbr: 'FL', lat: 27.950, lng: -82.457, areaCode: '813' },
        { city: 'Jacksonville',abbr: 'FL', lat: 30.332, lng: -81.655, areaCode: '904' },
        { city: 'Fort Lauderdale', abbr: 'FL', lat: 26.122, lng: -80.143, areaCode: '954' },
      ],
      'new york': [
        { city: 'New York City', abbr: 'NY', lat: 40.712, lng: -74.005, areaCode: '212' },
        { city: 'Buffalo',       abbr: 'NY', lat: 42.886, lng: -78.878, areaCode: '716' },
        { city: 'Albany',        abbr: 'NY', lat: 42.652, lng: -73.756, areaCode: '518' },
        { city: 'Rochester',     abbr: 'NY', lat: 43.156, lng: -77.608, areaCode: '585' },
        { city: 'Yonkers',       abbr: 'NY', lat: 40.931, lng: -73.898, areaCode: '914' },
      ],
      georgia: [
        { city: 'Atlanta',  abbr: 'GA', lat: 33.748, lng: -84.387, areaCode: '404' },
        { city: 'Savannah', abbr: 'GA', lat: 32.083, lng: -81.099, areaCode: '912' },
        { city: 'Augusta',  abbr: 'GA', lat: 33.470, lng: -81.975, areaCode: '706' },
        { city: 'Columbus', abbr: 'GA', lat: 32.460, lng: -84.987, areaCode: '706' },
        { city: 'Macon',    abbr: 'GA', lat: 32.840, lng: -83.632, areaCode: '478' },
      ],
      illinois: [
        { city: 'Chicago',     abbr: 'IL', lat: 41.878, lng: -87.629, areaCode: '312' },
        { city: 'Springfield', abbr: 'IL', lat: 39.799, lng: -89.654, areaCode: '217' },
        { city: 'Naperville',  abbr: 'IL', lat: 41.785, lng: -88.147, areaCode: '630' },
        { city: 'Peoria',      abbr: 'IL', lat: 40.693, lng: -89.588, areaCode: '309' },
        { city: 'Rockford',    abbr: 'IL', lat: 42.271, lng: -89.094, areaCode: '815' },
      ],
      arizona: [
        { city: 'Phoenix',    abbr: 'AZ', lat: 33.448, lng: -112.074, areaCode: '602' },
        { city: 'Tucson',     abbr: 'AZ', lat: 32.221, lng: -110.926, areaCode: '520' },
        { city: 'Scottsdale', abbr: 'AZ', lat: 33.494, lng: -111.926, areaCode: '480' },
        { city: 'Chandler',   abbr: 'AZ', lat: 33.303, lng: -111.841, areaCode: '480' },
        { city: 'Mesa',       abbr: 'AZ', lat: 33.415, lng: -111.831, areaCode: '480' },
      ],
      washington: [
        { city: 'Seattle',   abbr: 'WA', lat: 47.606, lng: -122.332, areaCode: '206' },
        { city: 'Spokane',   abbr: 'WA', lat: 47.658, lng: -117.426, areaCode: '509' },
        { city: 'Tacoma',    abbr: 'WA', lat: 47.252, lng: -122.444, areaCode: '253' },
        { city: 'Bellevue',  abbr: 'WA', lat: 47.610, lng: -122.201, areaCode: '425' },
        { city: 'Olympia',   abbr: 'WA', lat: 47.037, lng: -122.900, areaCode: '360' },
      ],
      ohio: [
        { city: 'Columbus',   abbr: 'OH', lat: 39.961, lng: -82.998, areaCode: '614' },
        { city: 'Cleveland',  abbr: 'OH', lat: 41.499, lng: -81.694, areaCode: '216' },
        { city: 'Cincinnati', abbr: 'OH', lat: 39.103, lng: -84.512, areaCode: '513' },
        { city: 'Toledo',     abbr: 'OH', lat: 41.652, lng: -83.537, areaCode: '419' },
        { city: 'Akron',      abbr: 'OH', lat: 41.081, lng: -81.519, areaCode: '330' },
      ],
      pennsylvania: [
        { city: 'Philadelphia', abbr: 'PA', lat: 39.952, lng: -75.165, areaCode: '215' },
        { city: 'Pittsburgh',   abbr: 'PA', lat: 40.440, lng: -79.995, areaCode: '412' },
        { city: 'Allentown',    abbr: 'PA', lat: 40.608, lng: -75.490, areaCode: '610' },
        { city: 'Erie',         abbr: 'PA', lat: 42.129, lng: -80.085, areaCode: '814' },
        { city: 'Reading',      abbr: 'PA', lat: 40.335, lng: -75.926, areaCode: '610' },
      ],
      'north carolina': [
        { city: 'Charlotte',     abbr: 'NC', lat: 35.227, lng: -80.843, areaCode: '704' },
        { city: 'Raleigh',       abbr: 'NC', lat: 35.779, lng: -78.638, areaCode: '919' },
        { city: 'Greensboro',    abbr: 'NC', lat: 36.072, lng: -79.792, areaCode: '336' },
        { city: 'Durham',        abbr: 'NC', lat: 35.994, lng: -78.898, areaCode: '919' },
        { city: 'Winston-Salem', abbr: 'NC', lat: 36.099, lng: -80.244, areaCode: '336' },
      ],
      michigan: [
        { city: 'Detroit',          abbr: 'MI', lat: 42.331, lng: -83.045, areaCode: '313' },
        { city: 'Grand Rapids',     abbr: 'MI', lat: 42.963, lng: -85.668, areaCode: '616' },
        { city: 'Warren',           abbr: 'MI', lat: 42.477, lng: -83.027, areaCode: '586' },
        { city: 'Sterling Heights', abbr: 'MI', lat: 42.580, lng: -83.030, areaCode: '586' },
        { city: 'Ann Arbor',        abbr: 'MI', lat: 42.280, lng: -83.743, areaCode: '734' },
      ],
      'new jersey': [
        { city: 'Newark',      abbr: 'NJ', lat: 40.735, lng: -74.172, areaCode: '973' },
        { city: 'Jersey City', abbr: 'NJ', lat: 40.717, lng: -74.043, areaCode: '201' },
        { city: 'Paterson',    abbr: 'NJ', lat: 40.916, lng: -74.171, areaCode: '973' },
        { city: 'Elizabeth',   abbr: 'NJ', lat: 40.663, lng: -74.210, areaCode: '908' },
        { city: 'Clifton',     abbr: 'NJ', lat: 40.860, lng: -74.163, areaCode: '973' },
      ],
      virginia: [
        { city: 'Virginia Beach', abbr: 'VA', lat: 36.852, lng: -75.978, areaCode: '757' },
        { city: 'Norfolk',        abbr: 'VA', lat: 36.850, lng: -76.285, areaCode: '757' },
        { city: 'Chesapeake',     abbr: 'VA', lat: 36.768, lng: -76.287, areaCode: '757' },
        { city: 'Richmond',       abbr: 'VA', lat: 37.540, lng: -77.436, areaCode: '804' },
        { city: 'Newport News',   abbr: 'VA', lat: 36.978, lng: -76.428, areaCode: '757' },
      ],
      massachusetts: [
        { city: 'Boston',      abbr: 'MA', lat: 42.360, lng: -71.058, areaCode: '617' },
        { city: 'Worcester',   abbr: 'MA', lat: 42.262, lng: -71.802, areaCode: '508' },
        { city: 'Springfield', abbr: 'MA', lat: 42.101, lng: -72.589, areaCode: '413' },
        { city: 'Cambridge',   abbr: 'MA', lat: 42.373, lng: -71.118, areaCode: '617' },
        { city: 'Lowell',      abbr: 'MA', lat: 42.633, lng: -71.316, areaCode: '978' },
      ],
      colorado: [
        { city: 'Denver',           abbr: 'CO', lat: 39.739, lng: -104.990, areaCode: '303' },
        { city: 'Colorado Springs', abbr: 'CO', lat: 38.833, lng: -104.821, areaCode: '719' },
        { city: 'Aurora',           abbr: 'CO', lat: 39.729, lng: -104.831, areaCode: '303' },
        { city: 'Fort Collins',     abbr: 'CO', lat: 40.585, lng: -105.084, areaCode: '970' },
        { city: 'Lakewood',         abbr: 'CO', lat: 39.704, lng: -105.081, areaCode: '303' },
      ],
      tennessee: [
        { city: 'Nashville',   abbr: 'TN', lat: 36.162, lng: -86.781, areaCode: '615' },
        { city: 'Memphis',     abbr: 'TN', lat: 35.149, lng: -90.048, areaCode: '901' },
        { city: 'Knoxville',   abbr: 'TN', lat: 35.960, lng: -83.920, areaCode: '865' },
        { city: 'Chattanooga', abbr: 'TN', lat: 35.045, lng: -85.309, areaCode: '423' },
        { city: 'Clarksville', abbr: 'TN', lat: 36.529, lng: -87.359, areaCode: '931' },
      ],
      maharashtra: [
        { city: 'Mumbai',    abbr: 'MH', lat: 19.076, lng: 72.877, areaCode: '022' },
        { city: 'Pune',      abbr: 'MH', lat: 18.520, lng: 73.856, areaCode: '020' },
        { city: 'Nagpur',    abbr: 'MH', lat: 21.145, lng: 79.088, areaCode: '0712' },
        { city: 'Nashik',    abbr: 'MH', lat: 19.997, lng: 73.789, areaCode: '0253' },
        { city: 'Thane',     abbr: 'MH', lat: 19.218, lng: 72.978, areaCode: '022' },
      ],
      delhi: [
        { city: 'New Delhi', abbr: 'DL', lat: 28.613, lng: 77.209, areaCode: '011' },
        { city: 'Noida',     abbr: 'UP', lat: 28.570, lng: 77.325, areaCode: '0120' },
        { city: 'Gurgaon',   abbr: 'HR', lat: 28.459, lng: 77.026, areaCode: '0124' },
        { city: 'Faridabad', abbr: 'HR', lat: 28.408, lng: 77.317, areaCode: '0129' },
        { city: 'Ghaziabad', abbr: 'UP', lat: 28.669, lng: 77.453, areaCode: '0120' },
      ],
      karnataka: [
        { city: 'Bengaluru', abbr: 'KA', lat: 12.971, lng: 77.594, areaCode: '080' },
        { city: 'Mysuru',    abbr: 'KA', lat: 12.295, lng: 76.639, areaCode: '0821' },
        { city: 'Hubballi',  abbr: 'KA', lat: 15.364, lng: 75.124, areaCode: '0836' },
        { city: 'Mangaluru', abbr: 'KA', lat: 12.914, lng: 74.856, areaCode: '0824' },
        { city: 'Belagavi',  abbr: 'KA', lat: 15.849, lng: 74.497, areaCode: '0831' },
      ],
      telangana: [
        { city: 'Hyderabad',  abbr: 'TS', lat: 17.385, lng: 78.486, areaCode: '040' },
        { city: 'Warangal',   abbr: 'TS', lat: 17.968, lng: 79.594, areaCode: '0870' },
        { city: 'Nizamabad',  abbr: 'TS', lat: 18.672, lng: 78.094, areaCode: '08462' },
        { city: 'Karimnagar', abbr: 'TS', lat: 18.438, lng: 79.128, areaCode: '0878' },
        { city: 'Khammam',    abbr: 'TS', lat: 17.247, lng: 80.151, areaCode: '08742' },
      ],
      'tamil nadu': [
        { city: 'Chennai',    abbr: 'TN', lat: 13.082, lng: 80.270, areaCode: '044' },
        { city: 'Coimbatore', abbr: 'TN', lat: 11.016, lng: 76.955, areaCode: '0422' },
        { city: 'Madurai',    abbr: 'TN', lat: 9.925,  lng: 78.119, areaCode: '0452' },
        { city: 'Tiruchirappalli', abbr: 'TN', lat: 10.790, lng: 78.704, areaCode: '0431' },
        { city: 'Salem',      abbr: 'TN', lat: 11.664, lng: 78.146, areaCode: '0427' },
      ],
      gujarat: [
        { city: 'Ahmedabad', abbr: 'GJ', lat: 23.022, lng: 72.571, areaCode: '079' },
        { city: 'Surat',     abbr: 'GJ', lat: 21.170, lng: 72.831, areaCode: '0261' },
        { city: 'Vadodara',  abbr: 'GJ', lat: 22.307, lng: 73.181, areaCode: '0265' },
        { city: 'Rajkot',    abbr: 'GJ', lat: 22.303, lng: 70.802, areaCode: '0281' },
      ],
      'west bengal': [
        { city: 'Kolkata',   abbr: 'WB', lat: 22.572, lng: 88.363, areaCode: '033' },
        { city: 'Howrah',    abbr: 'WB', lat: 22.595, lng: 88.263, areaCode: '033' },
        { city: 'Durgapur',  abbr: 'WB', lat: 23.520, lng: 87.311, areaCode: '0343' },
        { city: 'Siliguri',  abbr: 'WB', lat: 26.727, lng: 88.395, areaCode: '0353' },
        { city: 'Asansol',   abbr: 'WB', lat: 23.673, lng: 86.952, areaCode: '0341' },
      ],
    };

    // ── Map query to Google types and MOCK_NAMES key ────────────────────────
    const queryLower = query.toLowerCase();
    const queryMap: Array<{ keywords: string[]; types: string[]; nameKey: string; websiteSlug: string }> = [
      { keywords: ['restaurant', 'food', 'dining', 'cafe', 'bistro'],
        types: ['restaurant', 'food', 'establishment'], nameKey: 'restaurant', websiteSlug: 'eats' },
      { keywords: ['law', 'attorney', 'legal'],
        types: ['lawyer', 'legal_service', 'establishment'], nameKey: 'lawyer', websiteSlug: 'law' },
      { keywords: ['dental', 'dentist'],
        types: ['dentist', 'health', 'establishment'], nameKey: 'dentist', websiteSlug: 'dental' },
      { keywords: ['healthcare', 'medical', 'clinic', 'hospital', 'doctor'],
        types: ['doctor', 'health', 'establishment'], nameKey: 'doctor', websiteSlug: 'health' },
      { keywords: ['pharmacy', 'drug'],
        types: ['pharmacy', 'health', 'establishment'], nameKey: 'pharmacy', websiteSlug: 'rx' },
      { keywords: ['beauty', 'salon', 'hair', 'spa', 'nail'],
        types: ['beauty_salon', 'hair_care', 'establishment'], nameKey: 'beauty_salon', websiteSlug: 'beauty' },
      { keywords: ['fitness', 'gym', 'yoga', 'pilates', 'crossfit'],
        types: ['gym', 'health', 'establishment'], nameKey: 'gym', websiteSlug: 'fit' },
      { keywords: ['hotel', 'motel', 'lodging', 'inn', 'resort'],
        types: ['lodging', 'establishment'], nameKey: 'lodging', websiteSlug: 'hotel' },
      { keywords: ['auto', 'car repair', 'mechanic', 'garage'],
        types: ['car_repair', 'establishment'], nameKey: 'car_repair', websiteSlug: 'auto' },
      { keywords: ['retail', 'store', 'shop', 'boutique', 'market'],
        types: ['store', 'establishment'], nameKey: 'store', websiteSlug: 'shop' },
      { keywords: ['real estate', 'property', 'realtor', 'realty'],
        types: ['real_estate_agency', 'establishment'], nameKey: 'real_estate_agency', websiteSlug: 'realty' },
      { keywords: ['construction', 'contractor', 'builder'],
        types: ['general_contractor', 'establishment'], nameKey: 'general_contractor', websiteSlug: 'build' },
      { keywords: ['education', 'school', 'tutoring', 'academy'],
        types: ['school', 'establishment'], nameKey: 'school', websiteSlug: 'edu' },
      { keywords: ['accounting', 'accountant', 'bookkeeping', 'tax'],
        types: ['accounting', 'establishment'], nameKey: 'accounting', websiteSlug: 'cpa' },
      { keywords: ['consulting', 'consultant', 'advisory'],
        types: ['accounting', 'establishment'], nameKey: 'accounting', websiteSlug: 'consulting' },
    ];

    let match = queryMap.find(e => e.keywords.some(kw => queryLower.includes(kw)));
    if (!match) match = { keywords: [], types: ['establishment'], nameKey: 'restaurant', websiteSlug: 'biz' };

    const namePool: string[] = MOCK_NAMES[match.nameKey] ?? MOCK_NAMES['restaurant'];

    // ── Pick cities for this state ─────────────────────────────────────────
    let stateKey = (location ?? '').toLowerCase().trim();
    let cityFilter = '';
    if (stateKey.includes(',')) {
      const parts = stateKey.split(',').map(p => p.trim());
      cityFilter = parts[0];
      stateKey = parts[1];
    }
    let cities = stateData[stateKey] ?? [
      { city: location ?? 'Springfield', abbr: 'US', lat: 37.09, lng: -95.71, areaCode: '555' },
      { city: location ?? 'Springfield', abbr: 'US', lat: 37.10, lng: -95.72, areaCode: '555' },
      { city: location ?? 'Springfield', abbr: 'US', lat: 37.11, lng: -95.73, areaCode: '555' },
    ];
    if (cityFilter) {
      const found = cities.filter(c => c.city.toLowerCase() === cityFilter.toLowerCase());
      if (found.length > 0) {
        cities = found;
      } else {
        const stateEntry = cities[0] ?? { abbr: 'US', lat: 37.09, lng: -95.71, areaCode: '555' };
        cities = [{
          city: cityFilter.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          abbr: stateEntry.abbr,
          lat: stateEntry.lat,
          lng: stateEntry.lng,
          areaCode: stateEntry.areaCode,
        }];
      }
    }

    // ── Realistic street names ─────────────────────────────────────────────
    const streets = [
      '128 W 3rd Ave', '2240 Sunset Blvd', '750 Market St', '1440 Broadway',
      '305 N Michigan Ave', '88 Pine St', '1012 E Oak Blvd', '4320 Peachtree Rd',
    ];

    // ── Deterministic seed: state + category (NO timestamp) ──────────────
    // Using a stable seed means the same city+category always produces the
    // same businesses, so upsertByGooglePlaceId correctly deduplicates on
    // re-scan. Different states get different data because stateKey differs.
    const queryHash = query.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const stateHash = stateKey.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const seed = queryHash * 31 + stateHash * 17;
    const rand = this.seededRand(seed);

    // Shuffle the name pool deterministically for this state+category
    const shuffled = [...namePool].sort(() => rand() - 0.5);

    // Vary count 5–10 per category (not always 8) based on seed
    const count = 5 + Math.floor(rand() * 6);  // 5, 6, 7, 8, 9, or 10

    return Array.from({ length: count }, (_, i) => {
      const cityEntry = cities[i % cities.length];
      const name = shuffled[i % shuffled.length];
      const street = streets[i % streets.length];

      const hasWebsite = rand() > 0.35;
      const hasPhone   = rand() > 0.15;
      const rating     = parseFloat((3.2 + rand() * 1.8).toFixed(1));
      const reviewCount = Math.floor(rand() * 450) + 15;
      const priceLevel  = Math.floor(rand() * 3) + 1;

      // Slug for website URL
      const slug = name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '')
        .slice(0, 20);

      // ── Deterministic place_id: state + category + city + name ─────────
      // This is the key fix — place_id must be stable across scans so that
      // upsertByGooglePlaceId can find and update existing records.
      const citySlug = cityEntry.city.toLowerCase().replace(/\s+/g, '-').slice(0, 10);
      const nameSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
      const placeId  = `mock-${stateKey.replace(/\s+/g, '-').slice(0, 8)}-${match!.nameKey.slice(0, 6)}-${citySlug}-${nameSlug}`;

      const phoneStr = hasPhone
        ? `(${cityEntry.areaCode}) ${String(Math.floor(rand() * 900) + 100)}-${String(Math.floor(rand() * 9000) + 1000)}`
        : undefined;

      // ── Generate owner name deterministically ──────────────────────────────
      const fi = Math.floor(rand() * OWNER_FIRST.length);
      const li = Math.floor(rand() * OWNER_LAST.length);
      const ownerName = `${OWNER_FIRST[fi]} ${OWNER_LAST[li]}`;

      // ── Generate description and services for this category ─────────────────
      const catKey = match!.nameKey as string;
      const descPool = CATEGORY_DESC[catKey] ?? [DEFAULT_DESC];
      const descIdx  = Math.floor(rand() * descPool.length);
      const description = descPool[descIdx];

      const svcPool = CATEGORY_SERVICES[catKey] ?? DEFAULT_SERVICES;
      // Pick 3-5 services
      const svcCount = 3 + Math.floor(rand() * 3);
      const shuffledSvc = [...svcPool].sort(() => rand() - 0.5).slice(0, svcCount);

      // ── Founded year: 5 to 35 years ago ────────────────────────────────────
      const currentYear = new Date().getFullYear();
      const foundedYear = currentYear - (5 + Math.floor(rand() * 30));

      // ── Employee count band ────────────────────────────────────────────────
      const empBands = ['1-5', '6-10', '11-25', '26-50', '51-100', '100+'];
      const employeeCount = empBands[Math.floor(rand() * empBands.length)];

      return {
        place_id: placeId,
        name,
        // Custom enrichment fields (passed through normalizePlace via extra props)
        _ownerName: ownerName,
        _description: description,
        _services: shuffledSvc,
        _foundedYear: foundedYear,
        _employeeCount: employeeCount,
        formatted_address: `${street}, ${cityEntry.city}, ${cityEntry.abbr} ${String(10000 + Math.floor(rand() * 89999))}, USA`,
        formatted_phone_number: phoneStr,
        website: hasWebsite ? `https://www.${slug}${match!.websiteSlug}.com` : '',
        rating,
        user_ratings_total: reviewCount,
        types: match!.types,
        geometry: {
          location: {
            lat: cityEntry.lat + (rand() - 0.5) * 0.15,
            lng: cityEntry.lng + (rand() - 0.5) * 0.15,
          },
        },
        opening_hours: { open_now: rand() > 0.25 },
        price_level: priceLevel,
        url: `https://maps.google.com/?place_id=${placeId}`,
        photos: [],
        address_components: [
          { types: ['locality'],                      long_name:  cityEntry.city },
          { types: ['administrative_area_level_1'],   short_name: cityEntry.abbr },
          { types: ['country'],                       short_name: 'US' },
        ],
      };
    });
  }
}
