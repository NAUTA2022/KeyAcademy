import { useState } from 'react';
import { CheckoutWidget } from 'thirdweb/react';
import {
  X, CreditCard, CheckCircle, Sparkles, Lock,
  ExternalLink, Shield, Zap, Star, AlertCircle,
} from 'lucide-react';
import { client } from '../lib/thirdweb';
import {
  ADMIN_WALLET, PAYMENT_CHAIN,
  STRIPE_SANDBOX, STRIPE_LINKS,
  getCourseIdsForPlan,
  storePendingPayment, buildStripeUrl,
  type Plan,
} from '../lib/payments';
import {
  grantPremium, upsertUser, getUsers, saveUsers,
  type UserRecord,
} from '../lib/contentStore';
import { useUserEmail } from '../lib/useUserEmail';
import type { Course } from '../lib/supabase';
import StripeSandbox from './StripeSandbox';

/* USDC on Base */
const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

/* ── Props ───────────────────────────────────────────────────── */
export interface PaymentModalProps {
  mode: 'plan' | 'course';
  plan?: Plan;
  course?: Course;
  defaultTab?: 'crypto' | 'card';
  onClose: () => void;
  onSuccess?: () => void;
}

/* ── Success Screen ──────────────────────────────────────────── */
function SuccessScreen({ title, subtitle, onClose }: {
  title: string; subtitle: string; onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-5 shadow-lg shadow-green-200">
        <CheckCircle className="w-10 h-10 text-white" />
      </div>
      <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">¡Pago exitoso!</h3>
      <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">{title}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-xs">{subtitle}</p>
      <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl px-5 py-3 text-sm text-green-700 dark:text-green-400 font-medium mb-6">
        Tu acceso está activo. Recarga la página si no ves los cambios.
      </div>
      <button onClick={onClose}
        className="px-8 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold rounded-xl hover:opacity-90 transition shadow-lg">
        Explorar cursos →
      </button>
    </div>
  );
}

/* ── Stripe Card Tab (real link) ─────────────────────────────── */
function StripeTab({ amount, productName, stripeLink, email, onEmailChange, courseId }: {
  amount: number;
  productName: string;
  stripeLink: string;
  email: string;
  onEmailChange: (e: string) => void;
  courseId?: string;
}) {
  const hasLink = Boolean(stripeLink);

  function handlePay() {
    if (!email.trim()) { alert('Ingresa tu correo electrónico para continuar.'); return; }
    storePendingPayment({ planId: productName, productName, price: amount, email, courseId });
    const url = buildStripeUrl(stripeLink, email);
    window.open(url || '#', '_blank');
  }

  return (
    <div className="space-y-5">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-3">Resumen del pago</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">{productName}</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">${amount} USD</span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm font-bold text-gray-900 dark:text-white">Total</span>
          <span className="text-lg font-black text-gray-900 dark:text-white">${amount} USD</span>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
          Correo electrónico *
        </label>
        <input
          type="email"
          value={email}
          onChange={e => onEmailChange(e.target.value)}
          placeholder="tu@correo.com"
          className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
        />
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Se usará para activar tu acceso después del pago.
        </p>
      </div>

      {hasLink ? (
        <button onClick={handlePay}
          className="w-full py-4 rounded-xl font-bold text-white text-sm transition flex items-center justify-center gap-2 shadow-lg"
          style={{ background: 'linear-gradient(135deg, #635bff, #0570de)' }}>
          <CreditCard className="w-4 h-4" />
          Pagar ${amount} USD con tarjeta
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </button>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-center">
          <AlertCircle className="w-5 h-5 text-amber-500 mx-auto mb-2" />
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 mb-1">Link de pago en configuración</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            Mientras se configura Stripe, contáctanos para pagar con tarjeta.
          </p>
          <a href="https://t.me/keylabacademy" target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 underline">
            Contactar por Telegram <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 pt-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          <Lock className="w-3.5 h-3.5" /> SSL Seguro
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          <Shield className="w-3.5 h-3.5" /> Powered by Stripe
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          <CheckCircle className="w-3.5 h-3.5" /> 30-day guarantee
        </div>
      </div>
    </div>
  );
}

/* ── Main Modal ──────────────────────────────────────────────── */
export default function PaymentModal({ mode, plan, course, defaultTab = 'crypto', onClose, onSuccess }: PaymentModalProps) {
  const userEmail = useUserEmail();
  const [payTab, setPayTab] = useState<'crypto' | 'card'>(defaultTab);
  const [success, setSuccess] = useState(false);
  const [emailInput, setEmailInput] = useState(userEmail || '');

  const amount = mode === 'plan' ? (plan?.price ?? 0) : (course?.price ?? 0);
  const productName = mode === 'plan' ? (plan?.name ?? '') : (course?.title ?? '');
  // For plans use the plan's Stripe link; for individual courses use content_url if it looks like a Stripe link
  const stripeLink = mode === 'plan'
    ? (STRIPE_LINKS[plan?.id as 'courses' | 'full'] ?? '')
    : (course?.content_url?.includes('stripe.com') || course?.content_url?.includes('buy.stripe') ? (course.content_url ?? '') : '');
  const effectiveEmail = userEmail || emailInput;
  const hasCryptoConfig = Boolean(ADMIN_WALLET);

  function handlePaymentSuccess() {
    const email = effectiveEmail;
    if (!email) { setSuccess(true); return; }

    if (mode === 'plan' && plan) {
      const courseIds = getCourseIdsForPlan(plan.id);
      grantPremium(email, courseIds);
    } else if (mode === 'course' && course) {
      const users = getUsers();
      const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      const now = new Date().toISOString();
      if (existing) {
        const newCourses = existing.enabledCourses.includes('all')
          ? ['all']
          : [...new Set([...existing.enabledCourses, course.id])];
        const updated: UserRecord = { ...existing, plan: 'premium', enabledCourses: newCourses, updatedAt: now };
        saveUsers(users.map(u => u.email.toLowerCase() === email.toLowerCase() ? updated : u));
      } else {
        upsertUser({ email, plan: 'premium', enabledCourses: [course.id] });
      }
    }
    setSuccess(true);
    onSuccess?.();
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md">
          <SuccessScreen
            title={productName}
            subtitle={`Tu acceso a "${productName}" ha sido activado en ${effectiveEmail || 'tu cuenta'}.`}
            onClose={onClose}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 sm:px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${
              plan ? plan.gradient : 'from-sky-400 to-indigo-500'
            }`}>
              {plan?.popular ? <Star className="w-5 h-5 text-white" /> : <Zap className="w-5 h-5 text-white" />}
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Obtener acceso</p>
              <p className="font-bold text-gray-900 dark:text-white">{productName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">${amount}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{mode === 'plan' ? '/mes' : 'USD'}</span>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition ml-1">
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Feature chips for plan mode */}
        {mode === 'plan' && plan && (
          <div className="px-5 sm:px-6 py-3 border-b border-gray-50 dark:border-gray-800">
            <div className="flex flex-wrap gap-2">
              {plan.features.slice(0, 3).map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2.5 py-1 rounded-full border border-gray-100 dark:border-gray-700">
                  <CheckCircle className="w-3 h-3 text-green-500 shrink-0" /> {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Payment tabs */}
        <div className="px-5 sm:px-6 pt-5">
          <div className="flex gap-2 mb-5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button onClick={() => setPayTab('crypto')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition ${
                payTab === 'crypto'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}>
              <Sparkles className="w-4 h-4 text-indigo-500" /> Cripto
            </button>
            <button onClick={() => setPayTab('card')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition ${
                payTab === 'card'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}>
              <CreditCard className="w-4 h-4 text-sky-500" /> Tarjeta / Fiat
            </button>
          </div>

          {/* ── Crypto tab ── */}
          {payTab === 'crypto' && (
            <div className="pb-6">
              {hasCryptoConfig ? (
                <>
                  {!userEmail && (
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                        Correo electrónico para activar acceso *
                      </label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="tu@correo.com"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                      />
                    </div>
                  )}

                  <CheckoutWidget
                    client={client}
                    chain={PAYMENT_CHAIN}
                    tokenAddress={USDC_BASE}
                    amount={amount.toString()}
                    seller={ADMIN_WALLET as `0x${string}`}
                    name={productName}
                    description={mode === 'plan' ? `Membresía Key Lab — ${productName}` : `Curso individual: ${productName}`}
                    theme="light"
                    onSuccess={() => handlePaymentSuccess()}
                  />

                  <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-3">
                    Paga con ETH, USDC u otros tokens. Powered by{' '}
                    <a href="https://thirdweb.com" target="_blank" rel="noreferrer" className="font-semibold text-indigo-500">ThirdWeb</a>
                  </p>
                </>
              ) : (
                <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-2xl p-6 text-center">
                  <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                  <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Pagos con cripto</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Para pagar con ETH, USDC u otras criptomonedas, configura{' '}
                    <code className="bg-indigo-100 dark:bg-indigo-900 px-1 rounded text-indigo-700 dark:text-indigo-400 text-xs">VITE_ADMIN_WALLET</code>{' '}
                    en tu archivo <code className="bg-indigo-100 dark:bg-indigo-900 px-1 rounded text-indigo-700 dark:text-indigo-400 text-xs">.env</code>
                  </p>
                  <a href="https://t.me/keylabacademy" target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition">
                    Pagar por Telegram <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* ── Card tab ── */}
          {payTab === 'card' && (
            <div className="pb-6">
              {STRIPE_SANDBOX ? (
                <StripeSandbox
                  amount={amount}
                  productName={productName}
                  onSuccess={handlePaymentSuccess}
                  onCancel={onClose}
                />
              ) : (
                <StripeTab
                  amount={amount}
                  productName={productName}
                  stripeLink={stripeLink}
                  email={userEmail || emailInput}
                  onEmailChange={setEmailInput}
                  courseId={mode === 'course' ? course?.id : undefined}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
