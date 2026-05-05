import { base } from 'thirdweb/chains';
import { getCourses } from './contentStore';

/* ── Admin wallet (receives crypto payments) ─────────────── */
export const ADMIN_WALLET = (import.meta.env.VITE_ADMIN_WALLET || '') as string;
export const PAYMENT_CHAIN = base;
export const PAYMENT_TOKEN = 'USDC'; // USDC on Base

/* ── Stripe ──────────────────────────────────────────────── */
/** true → muestra checkout simulado en lugar de redirigir a Stripe */
export const STRIPE_SANDBOX = import.meta.env.VITE_STRIPE_SANDBOX === 'true';

export const STRIPE_LINKS = {
  courses: (import.meta.env.VITE_STRIPE_LINK_COURSES || '') as string,
  full:    (import.meta.env.VITE_STRIPE_LINK_FULL || '')    as string,
};

/* ── Plan definitions ────────────────────────────────────── */
export interface Plan {
  id: 'courses' | 'full';
  name: string;
  price: number;
  period: string;
  tagline: string;
  description: string;
  features: string[];
  notIncluded: string[];
  gradient: string;
  accentColor: string;
  popular?: boolean;
  /** which course types are accessible */
  allowedTypes: Array<'video' | 'download' | 'live'>;
}

export const PLANS: Plan[] = [
  {
    id: 'courses',
    name: 'Plan Cursos',
    price: 10,
    period: 'mes',
    tagline: 'Para quienes quieren aprender a su ritmo',
    description: 'Acceso completo a todos los cursos en video y sesiones en vivo.',
    features: [
      'Todos los cursos en video',
      'Eventos y sesiones en vivo',
      'Acceso de por vida al contenido comprado',
      'Soporte via Telegram',
      'Comunidad privada',
    ],
    notIncluded: ['Recursos y templates descargables'],
    gradient: 'from-sky-400 to-indigo-500',
    accentColor: 'sky',
    allowedTypes: ['video', 'live'],
  },
  {
    id: 'full',
    name: 'Plan Completo',
    price: 25,
    period: 'mes',
    tagline: 'La experiencia completa de Key Lab',
    description: 'Todo el Plan Cursos más acceso a todos los recursos y templates descargables.',
    features: [
      'Todo lo del Plan Cursos',
      'Recursos y templates descargables',
      'Guías en PDF (Solidity, DeFi, NFT…)',
      'Kit de inicio Web3 (10 templates)',
      'Actualizaciones prioritarias',
      'Soporte prioritario',
    ],
    notIncluded: [],
    gradient: 'from-amber-400 to-orange-500',
    accentColor: 'amber',
    popular: true,
    allowedTypes: ['video', 'live', 'download'],
  },
];

/* ── Get course IDs by allowed types ─────────────────────── */
export function getCourseIdsForPlan(planId: 'courses' | 'full'): string[] | 'all' {
  if (planId === 'full') return 'all';
  const plan = PLANS.find(p => p.id === planId)!;
  const courses = getCourses();
  return courses
    .filter(c => plan.allowedTypes.includes(c.type))
    .map(c => c.id);
}

/* ── Pending payment helpers (for Stripe redirect flow) ──── */
const PENDING_KEY = 'kl_pending_payment';

export interface PendingPayment {
  planId: 'courses' | 'full' | string;
  productName: string;
  price: number;
  email: string;
  courseId?: string; // for individual course purchases
  timestamp: number;
}

export function storePendingPayment(p: Omit<PendingPayment, 'timestamp'>) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify({ ...p, timestamp: Date.now() }));
}

export function consumePendingPayment(): PendingPayment | null {
  const raw = sessionStorage.getItem(PENDING_KEY);
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as PendingPayment;
    // Expire after 1 hour
    if (Date.now() - p.timestamp > 3600_000) {
      sessionStorage.removeItem(PENDING_KEY);
      return null;
    }
    sessionStorage.removeItem(PENDING_KEY);
    return p;
  } catch {
    return null;
  }
}

/* ── Build Stripe Payment Link URL ───────────────────────── */
export function buildStripeUrl(baseUrl: string, email?: string): string {
  if (!baseUrl) return '';
  const url = new URL(baseUrl);
  if (email) url.searchParams.set('prefilled_email', email);
  // Configure the success_url in your Stripe Dashboard Payment Link settings
  // pointing to: https://your-app.com/membership?stripe_success=1
  return url.toString();
}
