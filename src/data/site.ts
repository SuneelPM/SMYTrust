/**
 * Single source of truth for all site content.
 * Sourced from https://smyservices.org (Sri Matha Yellamanba Services).
 */

export const org = {
  name: 'Sri Matha Yellamanba Services',
  shortName: 'SMY Services',
  initials: 'SMY',
  tagline: 'Spreading compassion, serving humanity with love.',
  motto: 'Prayer in action is love, love in action is service.',
  csr: 'CSR00116527',
  phone: '+91 9032229748',
  phoneHref: 'tel:+919032229748',
  email: 'smyservice888@gmail.com',
  emailHref: 'mailto:smyservice888@gmail.com',
  address: {
    line1: 'Door No: 21-10/2-257/4H, Srinivasam',
    line2: 'Near SS Towers, Pandiri Road, GVR Nagar',
    line3: 'Behind Trendset Meadows',
    city: 'Vijayawada',
    pin: '520003',
    state: 'Andhra Pradesh, India',
  },
  addressOneLine:
    'Door No: 21-10/2-257/4H, Srinivasam, Near SS Towers, Pandiri Road, GVR Nagar, Behind Trendset Meadows, Vijayawada - 520003',
  mapQuery:
    'Door+No+21-10%2F2-257%2F4H,+Srinivasam,+Near+SS+Towers,+Pandiri+Road,+GVR+Nagar,+Behind+Trendset+Meadows,+Vijayawada+520003',
  copyright: '© 2024 Upendra & Co',
  logo: '/images/logo-removebg-preview.png',
} as const;

export type SocialLink = { name: string; href: string | null; icon: string };

/**
 * The original site shows these icons but never links them to real profiles.
 * `href: null` means the organisation has not supplied a URL yet. Those entries
 * are filtered out of the rendered output rather than shipped as a link to the
 * platform's homepage, which would look like the charity's page to a donor and
 * take them to Facebook's front door instead. Fill in a real profile URL and
 * the icon appears automatically. See CONTENT-TODO.md item 5.
 */
export const social: SocialLink[] = [
  { name: 'Facebook', href: null, icon: 'facebook' },
  { name: 'X', href: null, icon: 'x' },
  { name: 'Instagram', href: null, icon: 'instagram' },
  { name: 'YouTube', href: null, icon: 'youtube' },
];

/** Only profiles with a real URL are rendered anywhere on the site. */
export const activeSocial = social.filter(
  (s): s is SocialLink & { href: string } => typeof s.href === 'string' && s.href.length > 0,
);

export const nav = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about/' },
  { label: 'Services', href: '/services/' },
  { label: 'Activities', href: '/activities/' },
  { label: 'Gallery', href: '/gallery/' },
  { label: 'Certificate', href: '/certificate/' },
  { label: 'CSR Fund', href: '/csr-fund/' },
  { label: 'Contact', href: '/contact/' },
] as const;

export const legalNav = [
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Terms & Conditions', href: '/terms-conditions/' },
  { label: 'Refund & Cancellation Policy', href: '/refund-policy/' },
] as const;

/** Rotating hero statements. Headline claims trace back to the source site. */
export const heroSlides = [
  {
    eyebrow: 'Child Protection & Relief',
    title: 'Protecting childhood.',
    titleAccent: 'Responding with compassion.',
    body: 'We shield children from harm and move fast when crisis hits — food, shelter, medical aid and a route back to school.',
    cta: 'Be a lifeline',
    image: '/images/joyful-children-playing-holi-festival-scaled.jpg',
  },
  {
    eyebrow: 'Women Empowerment',
    title: 'Empower a woman,',
    titleAccent: 'empower a nation.',
    body: 'Self-help groups, microloans, skills training and legal aid — the practical scaffolding a woman needs to stand on her own.',
    cta: 'Support her journey',
    image: '/images/woman-teaching-classroom-scaled.jpg',
  },
  {
    eyebrow: 'Health & Nutrition',
    title: 'Care that reaches',
    titleAccent: 'the last village.',
    body: 'Health camps, paediatric care and nutrition programmes for families the nearest hospital was never going to reach.',
    cta: 'Fund a health camp',
    image: '/images/portrait-female-pediatrician-work-scaled.jpg',
  },
  {
    eyebrow: 'Environment & Sustainability',
    title: 'Our planet.',
    titleAccent: 'Our responsibility.',
    body: 'Afforestation, clean water and waste management — run by the communities who live with the results.',
    cta: 'Join the green mission',
    image: '/images/environment-scaled.jpg',
  },
] as const;

/** Programme areas shown as a compact grid. All grounded in the listed services. */
export const causes = [
  {
    title: 'Education',
    body: 'Learning support, scholarships and school resources for underprivileged and differently-abled children.',
    icon: 'book',
  },
  {
    title: 'Child Protection',
    body: 'Safeguarding children from harm, abuse and neglect through prevention, education and rapid response.',
    icon: 'shield',
  },
  {
    title: 'Healthcare',
    body: 'Health camps, paediatric care and nutrition programmes for vulnerable rural families.',
    icon: 'heart',
  },
  {
    title: 'Environment',
    body: 'Tree plantations, clean-up drives and climate action led together with local communities.',
    icon: 'leaf',
  },
  {
    title: 'Women Empowerment',
    body: 'Financial independence, leadership training and advocacy for gender equality and safety.',
    icon: 'women',
  },
  {
    title: 'Disaster Relief',
    body: 'Swift humanitarian aid when floods, pandemics or conflict strike — within hours, not weeks.',
    icon: 'life-ring',
  },
] as const;

export const about = {
  kicker: 'About Us',
  heading: 'Give a Helping Hand for Needy People',
  subheading: 'Kindness is the key — help the needy today and light the path ahead.',
  lead: 'A little help goes a long way. Extend your hand today and bring hope, food, and education to those who need it most.',
  body: [
    'Sri Matha Yellamanba Services is a registered service organisation based in Vijayawada, Andhra Pradesh. We work at the intersection of education, child health, women empowerment, environmental sustainability and disaster relief.',
    'Our work is built on a simple conviction: true progress begins with empowerment. Rather than one-off charity, we build long-term capability in the communities we serve — skills, education, health and dignity.',
    'Every rupee contributed is tracked against measurable outcomes, and every contributor receives a receipt, a tax exemption certificate, and periodic updates on the projects their support made possible.',
  ],
  image: '/images/Orphans-in-India-1500x996-1.jpg',
  secondaryImage: '/images/image-19.jpg',
} as const;

export const stats = [
  { value: 100, suffix: '+', label: 'Volunteers' },
  { value: 1150, suffix: '+', label: 'Products & Gifts' },
  { value: 200, suffix: '+', label: 'Donors' },
] as const;

export const services = [
  {
    slug: 'digital-education',
    title: 'Digital Education',
    icon: 'book',
    summary:
      'Making government-school classrooms more digitally capable, usable and worth returning to every morning.',
    body: 'We assess school needs first, then fund and maintain digital education support that closes real classroom gaps instead of supplying convenient one-off commodities.',
    points: [
      'School-level infrastructure assessment',
      'Digital learning tools and classroom support',
      'Maintenance for the full partnership term',
      'Usage monitoring and evidence-backed reporting',
      'Accountability to schools, government and funding partners',
    ],
    image: '/images/woman-teaching-classroom-scaled.jpg',
  },
  {
    slug: 'environment-sustainability',
    title: 'Environment & Sustainability',
    icon: 'leaf',
    summary:
      'Engaging communities in resource preservation, climate action and everyday sustainability.',
    body: 'Environmental protection drives our sustainability initiatives. We engage communities directly in resource preservation and climate action, so the change outlasts the campaign.',
    points: [
      'Tree planting and afforestation',
      'Waste management and recycling',
      'Clean water and sanitation development',
      'Climate change awareness',
      'Renewable energy and eco-friendly practices',
    ],
    image: '/images/environment-scaled.jpg',
  },
  {
    slug: 'women-empowerment',
    title: 'Women Empowerment',
    icon: 'women',
    summary:
      'Helping women build confidence, practical skills and stronger participation in family and community decisions.',
    body: 'Women empowerment programmes focus on capability that lasts: skills, awareness, dignity, and support systems that help women participate safely and independently.',
    points: [
      'Skills and livelihood readiness',
      'Awareness and confidence-building sessions',
      'Health and hygiene support',
      'Leadership and community participation',
      'Referral support where specialist help is needed',
    ],
    image: '/images/person-doing-diy-activity-online-content-creation-scaled.jpg',
  },
  {
    slug: 'disaster-management',
    title: 'Disaster Management',
    icon: 'shield',
    summary:
      'Prepared, practical support for communities during floods, emergencies and disruption.',
    body: 'Disaster management work focuses on readiness, response and responsible follow-through so urgent aid reaches people quickly and recovery does not stop after the first distribution.',
    points: [
      'Emergency needs assessment',
      'Food, water and essential relief support',
      'Coordination with local institutions',
      'Post-crisis follow-up and documentation',
    ],
    image: '/images/campaign-02.jpg',
  },
] as const;

export interface TeamMember {
  readonly name: string;
  readonly role: string;
  readonly image: string;
  readonly email?: string;
  readonly phone?: string;
  readonly phoneHref?: string;
  readonly bio: string;
  readonly source: string;
  readonly verified: boolean;
}

export const team: readonly TeamMember[] = [
  {
    name: 'Mopuri Aushish Kumar',
    role: 'Chairman',
    image: '/images/Leadership/IMG-20260904-WA0021.jpg',
    email: org.email,
    phone: org.phone,
    phoneHref: org.phoneHref,
    bio: 'Leads the trust with a focus on transparency, accountable partnerships and programmes that create lasting community capability.',
    source: 'Role verified from the supplied chairman message.',
    verified: true,
  },
  {
    name: 'CH. Gopal Krishna',
    role: 'Treasurer',
    image: '/images/Leadership/IMG-20260904-WA0022.jpg',
    email: org.email,
    phone: org.phone,
    phoneHref: org.phoneHref,
    bio: 'Profile details will be updated after final confirmation from the organisation.',
    source: 'Role verified from the public SMY Services website; portrait pending confirmation.',
    verified: false,
  },
  {
    name: 'CH. Venkata Lakshmi',
    role: 'President',
    image: '/images/Leadership/Gemini_Generated_Image_9chgej9chgej9chg.png',
    email: org.email,
    phone: org.phone,
    phoneHref: org.phoneHref,
    bio: 'Profile details will be updated after final confirmation from the organisation.',
    source: 'Role verified from the public SMY Services website; portrait pending confirmation.',
    verified: false,
  },
  {
    name: 'CH. Hemalatha Devi',
    role: 'Secretary',
    image: '/images/Leadership/manohar image2.jpg',
    email: org.email,
    phone: org.phone,
    phoneHref: org.phoneHref,
    bio: 'Profile details will be updated after final confirmation from the organisation.',
    source: 'Role verified from the public SMY Services website; portrait pending confirmation.',
    verified: false,
  },
  {
    name: 'CH. Lokesh Kumar',
    role: 'Managing Director',
    image: '/images/Leadership/IMG-20260905-WA0015.jpg',
    email: org.email,
    phone: org.phone,
    phoneHref: org.phoneHref,
    bio: 'Profile details will be updated after final confirmation from the organisation.',
    source: 'Role verified from the public SMY Services website; portrait pending confirmation.',
    verified: false,
  },
  {
    name: 'Sajja Venkata Siva Kumar',
    role: 'Leadership details pending',
    image: '/images/Leadership/IMG-20260904-WA0062.jpg',
    email: org.email,
    phone: org.phone,
    phoneHref: org.phoneHref,
    bio: 'Profile details will be updated after final confirmation from the organisation.',
    source: 'Background from supplied member note; trust position pending confirmation.',
    verified: false,
  },
];

export const csr = {
  heading: 'Partner With Us Through CSR',
  lead: 'True progress begins with empowerment. We invite corporations to partner with us on programmes in women empowerment and child care.',
  reasons: [
    {
      title: 'Transparent Impact',
      body: 'Every contribution is tracked against measurable, reportable outcomes.',
    },
    {
      title: 'Aligned with National Priorities',
      body: 'Our programmes address UN Sustainable Development Goals 4, 5, 8 and 10.',
    },
    {
      title: 'Scalable Projects',
      body: 'Designed from the outset for long-term community development, not one-off events.',
    },
  ],
  focusAreas: [
    {
      title: 'Women Empowerment',
      points: [
        'Skill development in tailoring, handicrafts, digital literacy and entrepreneurship',
        'Financial inclusion through self-help groups and micro-financing',
        'Health and awareness programmes',
      ],
    },
    {
      title: 'Child Care & Development',
      points: [
        'Education scholarships and digital learning support',
        'Nutrition and health camps',
        'Safe learning environments',
      ],
    },
  ],
  models: [
    'Project adoption',
    'Co-branded campaigns',
    'Employee engagement programmes',
    'Capacity-building partnerships',
  ],
} as const;

export const donate = {
  heading: 'Support a Cause. Change a Life.',
  lead: 'At SMY Services, we believe that meaningful change begins with collective action. Every donation — big or small — creates measurable impact.',
  body: 'We ensure that every contribution is utilised responsibly, transparently, and effectively.',
  trust: [
    'Confirmation receipt for every contribution',
    'Tax exemption certificate',
    'Periodic updates on project impact',
  ],
  /**
   * Bank details are injected from the environment, never committed. The trust
   * publishes these on its own site, but keeping them out of a public git
   * history means they cannot be scraped from this repository or resurrected
   * from an old commit. Set them in .env (see .env.example); without them the
   * donate page shows a "details available on request" panel instead.
   */
  bank: {
    accountName: import.meta.env.PUBLIC_BANK_ACCOUNT_NAME ?? 'Sri Matha Yellamanba Services',
    account: import.meta.env.PUBLIC_BANK_ACCOUNT ?? '',
    cif: import.meta.env.PUBLIC_BANK_CIF ?? '',
    ifsc: import.meta.env.PUBLIC_BANK_IFSC ?? '',
    micr: import.meta.env.PUBLIC_BANK_MICR ?? '',
    product: import.meta.env.PUBLIC_BANK_PRODUCT ?? '',
    currency: 'INR',
    email: import.meta.env.PUBLIC_BANK_EMAIL ?? 'smyservice888@gmail.com',
  },
} as const;

export const certificates = [
  { title: 'Registration Certificate', image: '/images/Untitled-6_page-0001.jpg' },
  { title: 'CSR Registration — CSR00116527', image: '/images/Web_Photo_Editor.jpg' },
] as const;
