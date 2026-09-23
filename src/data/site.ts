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
  gst: '37AFHFS3406G1Z0',
  csr: 'CSR00095311',
  phone: '+91 8096399461',
  phoneHref: 'tel:+918096399461',
  email: 'info@smyservices.org',
  emailHref: 'mailto:info@smyservices.org',
  address: {
    line1: 'D.No: 52-14-2/6, Old Resapuvanipalem',
    line2: 'Tech Mahindra Back Side, NH-5 Road',
    city: 'Visakhapatnam',
    pin: '530013',
    state: 'Andhra Pradesh, India',
  },
  addressOneLine:
    'D.No: 52-14-2/6, Old Resapuvanipalem, Tech Mahindra Back Side, NH-5 Road, Visakhapatnam - 530013',
  mapQuery: 'Old+Resapuvanipalem,+Visakhapatnam,+Andhra+Pradesh+530013',
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
    title: 'Child Protection',
    body: 'Safeguarding children from harm, abuse and neglect through prevention, education and rapid response.',
    icon: 'shield',
  },
  {
    title: 'Women Empowerment',
    body: 'Financial independence, leadership training and advocacy for gender equality and safety.',
    icon: 'women',
  },
  {
    title: 'Education',
    body: 'Learning support, scholarships and school resources for underprivileged and differently-abled children.',
    icon: 'book',
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
    'Sri Matha Yellamanba Services is a registered service organisation based in Visakhapatnam, Andhra Pradesh. We work at the intersection of child welfare, women empowerment, environmental sustainability and disaster relief.',
    'Our work is built on a simple conviction: true progress begins with empowerment. Rather than one-off charity, we build long-term capability in the communities we serve — skills, education, health and dignity.',
    'Every rupee contributed is tracked against measurable outcomes, and every contributor receives a receipt, a tax exemption certificate, and periodic updates on the projects their support made possible.',
  ],
  image: '/images/Orphans-in-India-1500x996-1.jpg',
  secondaryImage: '/images/image-19.jpg',
} as const;

export const stats = [
  { value: 2500, suffix: '+', label: 'Happy Children' },
  { value: 270, suffix: '+', label: 'Volunteers' },
  { value: 3150, suffix: '+', label: 'Products & Gifts' },
  { value: 8700, suffix: '+', label: 'Worldwide Donors' },
] as const;

export const services = [
  {
    slug: 'women-empowerment',
    title: 'Women Empowerment',
    icon: 'women',
    summary:
      'Helping women achieve financial autonomy, obtain education, and build leadership competencies.',
    body: 'We assist women in achieving financial autonomy, obtaining education, and building leadership competencies. We advocate for gender parity and work to combat gender-based violence in the communities we serve.',
    points: [
      'Self-help groups and microloans',
      'Entrepreneurship and skills training',
      'Legal aid and gender rights education',
      'Safe shelters for domestic abuse survivors',
      'Menstrual health and hygiene workshops',
    ],
    image: '/images/person-doing-diy-activity-online-content-creation-scaled.jpg',
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
    slug: 'disaster-relief',
    title: 'Disaster Relief & Humanitarian Aid',
    icon: 'shield',
    summary:
      'Rapid mobilisation during natural disasters, pandemics and conflicts to deliver immediate aid.',
    body: 'We mobilise rapidly during crises — natural disasters, pandemics, or conflicts — to deliver immediate assistance to affected populations, then stay for the rebuilding.',
    points: [
      'Emergency food, water, and medical aid',
      'Temporary shelter and clothing',
      'Psychological first aid and trauma counselling',
      'Long-term rehabilitation support',
    ],
    image: '/images/campaign-02.jpg',
  },
] as const;

export interface TeamMember {
  readonly name: string;
  readonly role: string;
  readonly image: string;
}

export const team: readonly TeamMember[] = [];

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
    email: import.meta.env.PUBLIC_BANK_EMAIL ?? 'info@smyservices.org',
  },
} as const;

export const certificates = [
  { title: 'Registration Certificate', image: '/images/Untitled-6_page-0001.jpg' },
  { title: 'CSR Registration — CSR00095311', image: '/images/Web_Photo_Editor.jpg' },
  { title: 'GST Registration — 37AFHFS3406G1Z0', image: '/images/Add-a-heading.png' },
] as const;
