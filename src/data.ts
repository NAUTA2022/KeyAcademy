export const navItems = [
  { label: 'Home', href: '#', icon: 'home', active: true },
  { label: 'Events', href: '#events', icon: 'calendar' },
  { label: 'Content', href: '#content', icon: 'circle' },
  { label: 'Communities', href: '#communities', icon: 'users' },
  { label: "What's new", href: '#', icon: 'bookmark' },
];

export const navGroups = [
  {
    label: 'Stories',
    icon: 'book-open',
    children: ['Success Stories', 'Case Studies', 'Blog'],
  },
  {
    label: 'Work',
    icon: 'layout-grid',
    children: ['Enterprise', 'Teams', 'Individuals'],
  },
  {
    label: 'Education',
    icon: 'monitor',
    children: ['Students', 'Teachers', 'Institutions'],
  },
];

export const navBottom = [
  { label: 'Small business', icon: 'briefcase' },
  { label: 'Nonprofits', icon: 'gift' },
  { label: 'Government', icon: 'building' },
  { label: 'News organizations', icon: 'newspaper' },
  { label: 'Help', icon: 'help-circle' },
];

export const features = [
  {
    title: 'Expert & Community-Led Learning',
    description:
      'Engage with OpenAI experts and external innovators to explore real-world AI applications and the latest industry trends.',
  },
  {
    title: 'Connections & Collaboration',
    description:
      'Build meaningful relationships with peers, innovators, and industry leaders through discussions, shared learning, and community-driven projects.',
  },
  {
    title: 'Stay Ahead with AI',
    description:
      'Learn about new products and the latest cutting-edge solutions directly from OpenAI experts—keeping you informed and ready to innovate.',
  },
];

export const events = [
  {
    id: 1,
    badge: 'Live in 1 day',
    time: '12:00 PM - 1:00 PM, Apr 24 GMT-5',
    title: 'Codex for Admins and IT',
  },
  {
    id: 2,
    badge: 'Live in 6 days',
    time: '8:00 AM - 8:45 AM, Apr 29 GMT-5',
    title: 'ChatGPT for Work 102: Leveraging AI to do your best work (EMEA)',
  },
  {
    id: 3,
    badge: 'Live in 6 days',
    time: '1:00 PM - 1:45 PM, Apr 29 GMT-5',
    title: 'ChatGPT for Work 101: A guide to your AI superassistant (AMER)',
  },
  {
    id: 4,
    badge: 'Live in 12 days',
    time: '12:00 PM - 12:30 PM, May 5 GMT-5',
    title: 'Skill Lab: Build Your First Workspace Agent',
  },
];

export const contentItems = [
  {
    id: 1,
    type: 'video',
    duration: '1:00:00',
    title: 'Codex for Beginners',
    date: 'Apr 22nd, 2026',
    views: 2914,
    thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80',
  },
  {
    id: 2,
    type: 'video',
    duration: '7:54',
    title: 'Codex on Campus',
    date: 'Apr 21st, 2026',
    views: 113,
    thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&q=80',
  },
  {
    id: 3,
    type: 'resource',
    title: 'OpenAI Academy Abilene Resource Hub',
    description:
      'A shared hub for the Abilene event, bringing together slide decks, workshop materials, and curated OpenAI Academy resources.',
    date: 'Apr 15th, 2026',
    views: 805,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80',
  },
];

export const aboutCards = [
  {
    icon: 'calendar',
    title: 'Events',
    description:
      'Join virtual and in-person gatherings in your community to learn, network, and collaborate with peers and experts.',
  },
  {
    icon: 'book-open',
    title: 'Knowledge Hub',
    description:
      'Explore quick videos, tutorials, and resources—from AI basics to more advanced content.',
  },
  {
    icon: 'users',
    title: 'Community Groups',
    description:
      'Connect with peers by interest or location for discussions, shared learning, and collaboration.',
  },
  {
    icon: 'message-circle',
    title: 'Connect',
    description:
      'Message fellow members to exchange ideas, build relationships, and grow your network.',
  },
];

export const communities = [
  { id: 1, name: 'India', members: 27156, events: 4, color: 'from-orange-400 to-pink-500' },
  { id: 2, name: 'Work Users', members: 27156, events: 4, color: 'from-blue-400 to-cyan-500' },
  { id: 3, name: 'Admins', members: 4734, events: 2, color: 'from-purple-400 to-indigo-500' },
  { id: 4, name: 'Champions', members: 6351, events: 1, color: 'from-green-400 to-teal-500' },
  { id: 5, name: 'Builders', members: 17471, events: 9, color: 'from-yellow-400 to-orange-500' },
];

export const faqs = [
  {
    q: "What is OpenAI's mission?",
    a: "OpenAI's mission is to ensure artificial intelligence benefits all of humanity. We aim to create AI tools that empower people, solve hard problems, and drive progress across communities.",
  },
  {
    q: 'Why was OpenAI Academy created?',
    a: 'We launched OpenAI Academy to democratize access to AI knowledge. Our goal is to empower individuals from all backgrounds to confidently integrate AI into their lives, work, and communities.',
  },
  {
    q: 'Who can join OpenAI Academy?',
    a: 'OpenAI Academy is open to everyone, with free enrollment to ensure broad access. Some specialized community groups may require invitations or referrals.',
  },
  {
    q: 'Does OpenAI Academy offer certifications?',
    a: "We're going to expand the OpenAI Academy by offering certifications for different levels of AI fluency, from the basics of prompt engineering to AI-enabled work. We plan to pilot OpenAI Certifications starting in late 2025 / early 2026.",
  },
  {
    q: 'In what languages is OpenAI Academy available?',
    a: 'Currently, OpenAI Academy programming is available in English, with plans to expand to additional languages soon.',
  },
  {
    q: 'Can I host an OpenAI Academy in my community?',
    a: 'We are always looking for motivated hosts across the country and around the world. Ideal hosts include academic institutions and community groups eager to help their members embrace and adopt AI. Contact us at academy@openai.com.',
  },
  {
    q: 'Where can I find out about local events?',
    a: 'Once you join OpenAI Academy, navigate to the Events section in the left-hand menu bar to explore upcoming virtual and in-person gatherings.',
  },
];
