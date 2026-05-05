import { useState, useEffect } from 'react';
import { CheckCircle, X, Sparkles, Star, Zap, Users, Shield, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserEmail } from '../lib/useUserEmail';
import { PLANS, consumePendingPayment, getCourseIdsForPlan, type Plan } from '../lib/payments';
import { grantPremium, getUsers } from '../lib/contentStore';
import PaymentModal from '../components/PaymentModal';

/* ── Plan Card ───────────────────────────────────────────── */
function PlanCard({ plan, onSelect }: { plan: Plan; onSelect: (p: Plan) => void }) {
  const isAmber = plan.accentColor === 'amber';

  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-2xl border-2 overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 ${
      plan.popular
        ? 'border-amber-400 shadow-xl shadow-amber-100/50 dark:shadow-amber-900/20'
        : 'border-gray-100 dark:border-gray-700 shadow-md'
    }`}>
      {plan.popular && (
        <div className={`bg-gradient-to-r ${plan.gradient} text-white text-xs font-black px-4 py-1.5 text-center tracking-wide`}>
          ⭐ MÁS POPULAR
        </div>
      )}

      <div className="p-5 sm:p-7">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${
              isAmber ? 'text-amber-500' : 'text-sky-500'
            }`}>{plan.id === 'courses' ? 'Básico' : 'Completo'}</p>
            <h3 className="text-xl font-black text-gray-900 dark:text-white">{plan.name}</h3>
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-md`}>
            {isAmber ? <Star className="w-6 h-6 text-white" /> : <Zap className="w-6 h-6 text-white" />}
          </div>
        </div>

        {/* Price */}
        <div className="flex items-end gap-1 mb-2">
          <span className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">${plan.price}</span>
          <span className="text-gray-400 dark:text-gray-500 text-sm mb-1.5">USD / {plan.period}</span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">{plan.tagline}</p>

        {/* CTA */}
        <button
          onClick={() => onSelect(plan)}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 mb-6 bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90 shadow-lg`}>
          Comenzar ahora <ArrowRight className="w-4 h-4" />
        </button>

        {/* Features */}
        <div className="space-y-2.5">
          {plan.features.map((f, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
              <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isAmber ? 'text-amber-500' : 'text-sky-500'}`} />
              {f}
            </div>
          ))}
          {plan.notIncluded.map((f, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-gray-400 dark:text-gray-600">
              <X className="w-4 h-4 shrink-0 mt-0.5" />
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── FAQ items ───────────────────────────────────────────── */
const FAQS = [
  {
    q: '¿Cómo activo mi membresía después de pagar?',
    a: 'Tu acceso se activa automáticamente al completar el pago. Si pagaste con cripto, la activación es inmediata. Con tarjeta, puede tomar unos minutos.',
  },
  {
    q: '¿Puedo cancelar en cualquier momento?',
    a: 'Sí. Contáctanos por Telegram o correo y cancelamos en menos de 24 horas. No cobramos comisiones por cancelación.',
  },
  {
    q: '¿Qué criptomonedas aceptan?',
    a: 'Aceptamos ETH, USDC, USDT y otras stablecoins en Base, Ethereum y Polygon. ThirdWeb convierte automáticamente desde tu token preferido.',
  },
  {
    q: '¿Hay garantía de devolución?',
    a: 'Sí, ofrecemos 30 días de garantía. Si no estás satisfecho, devolvemos tu dinero sin preguntas.',
  },
  {
    q: '¿El acceso es mensual o de por vida?',
    a: 'El precio indica la suscripción mensual. También ofrecemos acceso de por vida por curso individual — consúltanos.',
  },
];

/* ── Page ─────────────────────────────────────────────────── */
export default function Membership() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [successBanner, setSuccessBanner] = useState('');
  const userEmail = useUserEmail();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('stripe_success') === '1') {
      const pending = consumePendingPayment();
      if (pending) {
        const planId = PLANS.find(p => p.name === pending.productName)?.id;
        if (planId) {
          grantPremium(pending.email, getCourseIdsForPlan(planId));
          setSuccessBanner(`¡Pago exitoso! Tu acceso a "${pending.productName}" ha sido activado.`);
        }
      } else {
        setSuccessBanner('¡Pago procesado! Si tu acceso no se activó, contáctanos por Telegram.');
      }
      navigate('/membership', { replace: true });
    }
  }, [location.search, navigate]);

  const users = getUsers();
  const currentUser = userEmail ? users.find(u => u.email.toLowerCase() === userEmail.toLowerCase()) : null;
  const currentPlan = currentUser?.plan === 'premium' ? (
    currentUser.enabledCourses.includes('all') ? 'full' : 'courses'
  ) : null;

  return (
    <div>
      {/* Success banner */}
      {successBanner && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl px-5 py-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
          <p className="text-sm font-semibold text-green-800 dark:text-green-300">{successBanner}</p>
          <button onClick={() => setSuccessBanner('')} className="ml-auto p-1 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg">
            <X className="w-4 h-4 text-green-600 dark:text-green-400" />
          </button>
        </div>
      )}

      {/* Current plan badge */}
      {currentPlan && (
        <div className="mb-6 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl px-5 py-4 flex items-center gap-3">
          <Star className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Tienes activo: <span className="font-black">{PLANS.find(p => p.id === currentPlan)?.name}</span>
          </p>
        </div>
      )}

      {/* Hero */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 px-4 py-1.5 rounded-full text-xs font-bold mb-4 border border-indigo-100 dark:border-indigo-800">
          <Sparkles className="w-3.5 h-3.5" /> Membresías Key Lab Academy
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-3">
          Elige tu plan de acceso
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-md mx-auto">
          Aprende Web3, blockchain e IA con los mejores expertos. Cancela cuando quieras.
        </p>
      </div>

      {/* Trust bar */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mb-8 sm:mb-10 flex-wrap">
        {[
          { icon: Users, text: '500+ estudiantes' },
          { icon: Shield, text: '30 días de garantía' },
          { icon: Sparkles, text: 'Cripto o tarjeta' },
          { icon: CheckCircle, text: 'Cancela cuando quieras' },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <Icon className="w-3.5 h-3.5 text-indigo-400" />
            {text}
          </div>
        ))}
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-10 sm:mb-12 max-w-2xl mx-auto">
        {PLANS.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onSelect={setSelectedPlan}
          />
        ))}
      </div>

      {/* Individual courses banner */}
      <div className="bg-gradient-to-r from-gray-50 dark:from-gray-800 to-indigo-50 dark:to-indigo-900/30 rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-gray-700 mb-10 sm:mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-bold text-gray-900 dark:text-white mb-1">¿Prefieres comprar un curso individual?</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Videos desde $10 USD · Descargables desde $5 USD</p>
        </div>
        <button onClick={() => navigate('/courses')}
          className="px-5 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 hover:shadow-md transition whitespace-nowrap">
          Ver cursos →
        </button>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto mb-8">
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-5 text-center">Preguntas frecuentes</h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <details key={i} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl group/faq overflow-hidden shadow-sm">
              <summary className="px-5 py-4 cursor-pointer list-none select-none flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{faq.q}</span>
                <span className="text-gray-400 dark:text-gray-500 transition-transform group-open/faq:rotate-90 text-lg shrink-0 ml-3">›</span>
              </summary>
              <p className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>

      {selectedPlan && (
        <PaymentModal
          mode="plan"
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSuccess={() => {
            setSelectedPlan(null);
            setSuccessBanner(`¡Pago exitoso! Tu acceso a "${selectedPlan.name}" está activo.`);
          }}
        />
      )}
    </div>
  );
}
