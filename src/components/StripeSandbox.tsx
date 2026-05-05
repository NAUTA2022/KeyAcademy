import { useState, useRef } from 'react';
import {
  CreditCard, Lock, CheckCircle, AlertCircle, Loader2, Shield,
} from 'lucide-react';

/* ── Test cards ─────────────────────────────────────────────── */
const TEST_CARDS = [
  { number: '4242 4242 4242 4242', brand: 'visa',   label: 'Visa (aprobada)',       result: 'success' },
  { number: '5555 5555 5555 4444', brand: 'mc',     label: 'Mastercard (aprobada)', result: 'success' },
  { number: '4000 0000 0000 0002', brand: 'visa',   label: 'Visa (declinada)',      result: 'decline' },
  { number: '4000 0000 0000 9995', brand: 'visa',   label: 'Fondos insuficientes',  result: 'insufficient' },
] as const;

type CardResult = 'success' | 'decline' | 'insufficient';

/* ── Helpers ─────────────────────────────────────────────────── */
function formatCard(raw: string) {
  return raw.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}
function formatExpiry(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
}
function detectBrand(num: string): 'visa' | 'mc' | 'amex' | 'unknown' {
  const d = num.replace(/\s/g, '');
  if (d.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(d)) return 'mc';
  if (/^3[47]/.test(d)) return 'amex';
  return 'unknown';
}
function luhn(num: string): boolean {
  const digits = num.replace(/\s/g, '').split('').map(Number).reverse();
  const sum = digits.reduce((acc, d, i) => {
    if (i % 2 !== 0) { d *= 2; if (d > 9) d -= 9; }
    return acc + d;
  }, 0);
  return sum % 10 === 0;
}

/* ── Brand icons ─────────────────────────────────────────────── */
function BrandIcon({ brand }: { brand: string }) {
  if (brand === 'visa') return (
    <span className="text-[10px] font-black tracking-tighter text-blue-700 bg-blue-50 dark:bg-blue-900/40 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-800">VISA</span>
  );
  if (brand === 'mc') return (
    <span className="flex items-center gap-0.5">
      <span className="w-4 h-4 bg-red-500 rounded-full opacity-90" />
      <span className="w-4 h-4 bg-amber-400 rounded-full -ml-2 opacity-90" />
    </span>
  );
  if (brand === 'amex') return (
    <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/40 px-1.5 py-0.5 rounded border border-sky-100 dark:border-sky-800">AMEX</span>
  );
  return <CreditCard className="w-4 h-4 text-gray-300 dark:text-gray-600" />;
}

/* ── Processing overlay ──────────────────────────────────────── */
function ProcessingOverlay({ stage }: { stage: number }) {
  const stages = [
    'Conectando con Stripe…',
    'Validando tarjeta…',
    'Procesando pago…',
    'Confirmando transacción…',
  ];
  return (
    <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4 z-10">
      <div className="relative">
        <div className="w-14 h-14 rounded-full border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 animate-spin" />
        <div className="absolute inset-2 flex items-center justify-center">
          <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" style={{ animationDuration: '0.6s' }} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{stages[Math.min(stage, stages.length - 1)]}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Modo sandbox — no se realizan cobros reales</p>
      </div>
      <div className="flex gap-1.5">
        {stages.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${
            i <= stage ? 'w-6 bg-indigo-600' : 'w-2 bg-gray-200 dark:bg-gray-700'
          }`} />
        ))}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
interface StripeSandboxProps {
  amount: number;
  productName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StripeSandbox({ amount, productName, onSuccess, onCancel }: StripeSandboxProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [procStage, setProcStage] = useState(0);
  const [error, setError] = useState('');
  const [quickFill, setQuickFill] = useState<string | null>(null);

  const expiryRef = useRef<HTMLInputElement>(null);
  const cvcRef    = useRef<HTMLInputElement>(null);
  const nameRef   = useRef<HTMLInputElement>(null);

  const brand = detectBrand(cardNumber);
  const rawNum = cardNumber.replace(/\s/g, '');
  const isCardValid = rawNum.length === 16 && luhn(cardNumber);
  const expiryDigits = expiry.replace(/\D/g, '');
  const isExpiryValid = expiryDigits.length === 4 &&
    parseInt(expiryDigits.slice(0, 2)) >= 1 &&
    parseInt(expiryDigits.slice(0, 2)) <= 12;
  const isCvcValid = cvc.length >= 3;
  const canSubmit = isCardValid && isExpiryValid && isCvcValid && name.trim().length > 2;

  function handleCardInput(val: string) {
    const formatted = formatCard(val);
    setCardNumber(formatted);
    if (formatted.replace(/\s/g, '').length === 16) expiryRef.current?.focus();
  }

  function handleExpiryInput(val: string) {
    const formatted = formatExpiry(val);
    setExpiry(formatted);
    if (formatted.replace(/\D/g, '').length === 4) cvcRef.current?.focus();
  }

  function handleCvcInput(val: string) {
    const v = val.replace(/\D/g, '').slice(0, 4);
    setCvc(v);
    if (v.length >= 3) nameRef.current?.focus();
  }

  function fillTestCard(card: typeof TEST_CARDS[number]) {
    setCardNumber(card.number);
    setExpiry('12 / 28');
    setCvc('123');
    setName('Test User');
    setQuickFill(card.number);
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');

    const matched = TEST_CARDS.find(c => c.number === cardNumber);
    const result: CardResult = matched ? (matched.result as CardResult) : 'success';

    setProcessing(true);

    for (let i = 0; i < 4; i++) {
      setProcStage(i);
      await new Promise(r => setTimeout(r, 700 + Math.random() * 400));
    }

    setProcessing(false);

    if (result === 'success') {
      onSuccess();
    } else if (result === 'decline') {
      setError('Tu tarjeta fue declinada. Por favor usa otra tarjeta.');
    } else {
      setError('Fondos insuficientes. Por favor usa otra tarjeta.');
    }
  }

  const inputBase = 'w-full px-3 py-3 text-sm border rounded-xl font-mono focus:outline-none focus:ring-2 transition bg-white dark:bg-gray-800 dark:text-gray-100';

  function cardClass() {
    if (cardNumber && !isCardValid) return `${inputBase} border-red-300 dark:border-red-700 focus:ring-red-200 dark:focus:ring-red-900`;
    if (isCardValid)               return `${inputBase} border-green-300 dark:border-green-700 focus:ring-green-200 dark:focus:ring-green-900`;
    return `${inputBase} border-gray-200 dark:border-gray-700 focus:ring-indigo-300 dark:focus:ring-indigo-700`;
  }
  function expiryClass() {
    if (expiry && !isExpiryValid) return `${inputBase} border-red-300 dark:border-red-700 focus:ring-red-200 dark:focus:ring-red-900 tracking-wider`;
    if (isExpiryValid)            return `${inputBase} border-green-300 dark:border-green-700 focus:ring-green-200 dark:focus:ring-green-900 tracking-wider`;
    return `${inputBase} border-gray-200 dark:border-gray-700 focus:ring-indigo-300 dark:focus:ring-indigo-700 tracking-wider`;
  }
  function cvcClass() {
    if (cvc && !isCvcValid) return `${inputBase} border-red-300 dark:border-red-700 focus:ring-red-200 dark:focus:ring-red-900`;
    if (isCvcValid)         return `${inputBase} border-green-300 dark:border-green-700 focus:ring-green-200 dark:focus:ring-green-900`;
    return `${inputBase} border-gray-200 dark:border-gray-700 focus:ring-indigo-300 dark:focus:ring-indigo-700`;
  }

  return (
    <div className="relative">
      {processing && <ProcessingOverlay stage={procStage} />}

      {/* Sandbox badge */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-full px-3 py-1">
          <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Sandbox Mode</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          <Lock className="w-3.5 h-3.5" />
          <span>Cifrado SSL</span>
        </div>
      </div>

      {/* Quick-fill test cards */}
      <div className="mb-4">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Tarjetas de prueba (clic para rellenar)
        </p>
        <div className="grid grid-cols-2 gap-2">
          {TEST_CARDS.map(card => (
            <button
              key={card.number}
              type="button"
              onClick={() => fillTestCard(card)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition text-left ${
                quickFill === card.number
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <BrandIcon brand={card.brand} />
              <div className="min-w-0">
                <p className="truncate leading-tight">{card.label}</p>
                <p className="text-gray-400 dark:text-gray-500 font-mono text-[10px]">{card.number.slice(-4).padStart(card.number.length, '•').slice(-9)}</p>
              </div>
              {card.result !== 'success' && (
                <AlertCircle className="w-3 h-3 text-red-400 shrink-0 ml-auto" />
              )}
              {card.result === 'success' && quickFill === card.number && (
                <CheckCircle className="w-3 h-3 text-green-500 shrink-0 ml-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Card number */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Número de tarjeta</label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={cardNumber}
              onChange={e => handleCardInput(e.target.value)}
              placeholder="1234 5678 9012 3456"
              className={`${cardClass()} pr-14 tracking-wider`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {isCardValid && <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
              <BrandIcon brand={brand} />
            </div>
          </div>
        </div>

        {/* Expiry + CVC */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Vencimiento</label>
            <input
              ref={expiryRef}
              type="text"
              inputMode="numeric"
              value={expiry}
              onChange={e => handleExpiryInput(e.target.value)}
              placeholder="MM / AA"
              className={expiryClass()}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">CVC</label>
            <input
              ref={cvcRef}
              type="text"
              inputMode="numeric"
              value={cvc}
              onChange={e => handleCvcInput(e.target.value)}
              placeholder="123"
              className={cvcClass()}
            />
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Nombre en la tarjeta</label>
          <input
            ref={nameRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nombre Apellido"
            className="w-full px-3 py-3 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 transition"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 dark:text-red-400 font-medium">{error}</p>
          </div>
        )}

        {/* Order summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">{productName}</p>
          <span className="text-base font-black text-gray-900 dark:text-white shrink-0">${amount} USD</span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit || processing}
          className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: canSubmit ? 'linear-gradient(135deg, #635bff, #0570de)' : undefined,
            backgroundColor: !canSubmit ? '#e5e7eb' : undefined,
          }}
        >
          {processing ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Procesando…</>
          ) : (
            <><Lock className="w-4 h-4" /> Pagar ${amount} USD (Sandbox)</>
          )}
        </button>

        <button type="button" onClick={onCancel}
          className="w-full py-2 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition">
          Cancelar
        </button>
      </form>

      {/* Stripe branding */}
      <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          <Shield className="w-3.5 h-3.5" />
          Powered by <span className="font-bold text-[#635bff]">Stripe</span>
        </div>
        <span className="text-gray-200 dark:text-gray-700">|</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">Entorno de pruebas</span>
      </div>
    </div>
  );
}
