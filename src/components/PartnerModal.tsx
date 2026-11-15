import React, { useState } from 'react';
import { 
  X, 
  Flame, 
  ShieldCheck, 
  Heart, 
  CheckCircle2, 
  CreditCard, 
  Smartphone, 
  Printer, 
  Share2, 
  Lock, 
  Copy,
  Check,
  MessageCircle,
  KeyRound
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { useTheme } from '../context/ThemeContext';
import { 
  PAYSTACK_CURRENCIES, 
  initiatePaystackPayment 
} from '../services/paystack';
import { PaystackCurrency, PaystackTransactionResult } from '../types';

interface PartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFundId?: string;
}

export const PartnerModal: React.FC<PartnerModalProps> = ({ 
  isOpen, 
  onClose,
  initialFundId 
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { content } = useCMS();
  const givingInitiatives = content.givingInitiatives;
  const mobileMoneyDetails = content.mobileMoneyDetails;

  // Modal active tab: 'paystack' (online card & automated momo) or 'momo' (direct MTN transfer)
  const [activeTab, setActiveTab] = useState<'paystack' | 'momo'>('paystack');

  // Payment form states
  const [currency, setCurrency] = useState<PaystackCurrency>('GHS');
  const [frequency, setFrequency] = useState<'monthly' | 'one-time'>('monthly');
  const [selectedFund, setSelectedFund] = useState(initialFundId || givingInitiatives[0]?.id || 'crusades');
  const [amount, setAmount] = useState('100');
  const [customAmount, setCustomAmount] = useState('');
  
  // Donor details for Paystack
  const [donorName, setDonorName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [prayerRequest, setPrayerRequest] = useState('');

  // UI & Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaystackTransactionResult | null>(null);
  const [customApiKey, setCustomApiKey] = useState('');
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [copiedMomo, setCopiedMomo] = useState(false);

  if (!isOpen) return null;

  const currentCurrencyConfig = PAYSTACK_CURRENCIES.find((c) => c.code === currency) || PAYSTACK_CURRENCIES[0];
  const finalAmount = Number(customAmount) > 0 ? Number(customAmount) : Number(amount) || 100;
  const currentFundObj = givingInitiatives.find((f) => f.id === selectedFund) || givingInitiatives[0] || {
    id: 'general',
    title: 'General Kingdom Mandate',
    badge: 'PARTNERSHIP',
    description: '',
  };

  const handleCopyMomo = () => {
    navigator.clipboard.writeText(mobileMoneyDetails.rawNumber);
    setCopiedMomo(true);
    setTimeout(() => setCopiedMomo(false), 2500);
  };

  const handlePaystackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !donorName) {
      alert('Please provide your name and email address to proceed with Paystack payment.');
      return;
    }

    setIsProcessing(true);

    try {
      await initiatePaystackPayment({
        email,
        amount: finalAmount,
        currency,
        donorName,
        phone,
        fund: `${currentFundObj.title} (${currentFundObj.badge})`,
        frequency,
        prayerRequest,
        customPublicKey: customApiKey.trim() || undefined,
        onSuccess: (result) => {
          setIsProcessing(false);
          setPaymentResult(result);
        },
        onClose: () => {
          setIsProcessing(false);
        },
        onError: (err) => {
          setIsProcessing(false);
          alert(`Paystack connection notice: ${err.message}`);
        },
      });
    } catch {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setPaymentResult(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className={`relative w-full max-w-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92svh] transition-colors ${
        isLight ? 'bg-white border-gray-200 text-gray-900' : 'bg-[#050505] border-white/10 text-[#F5F7F5]'
      }`}>
        {/* Header with Badging */}
        <div className={`flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b shrink-0 ${
          isLight ? 'bg-[#0B2418] text-white border-emerald-900' : 'bg-[#0B2418]/90 text-white border-white/10'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#168A45]/30 flex items-center justify-center border border-[#63D98A]/30">
              <Flame className="w-4 h-4 text-[#63D98A]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-white">
                  Kingdom Giving Portal
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00C3F7]/20 text-[#00C3F7] border border-[#00C3F7]/30">
                  PAYSTACK & MTN MOMO
                </span>
              </div>
              <p className="text-[10px] text-white/70 font-light">
                MTN MoMo • Cards • Bank Transfer
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection: Paystack vs Direct MTN MoMo */}
        {!paymentResult && (
          <div className="grid grid-cols-2 border-b border-gray-200 dark:border-white/10 text-[11px] sm:text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('paystack')}
              className={`py-3 px-2 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 border-b-2 transition-all min-h-[44px] cursor-pointer ${
                activeTab === 'paystack'
                  ? 'border-[#168A45] text-[#168A45] dark:text-[#63D98A] bg-[#168A45]/5 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 shrink-0" />
              <span className="truncate">PAYSTACK GATEWAY</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('momo')}
              className={`py-3 px-2 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 border-b-2 transition-all min-h-[44px] cursor-pointer ${
                activeTab === 'momo'
                  ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-500/5 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">DIRECT MTN MOMO</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6">
          {paymentResult ? (
            /* ========================================================
               PAYSTACK VERIFIED PAYMENT RECEIPT
               ======================================================== */
            <div className="space-y-6 animate-fade-in">
              <div className={`p-6 sm:p-8 border text-center space-y-4 ${
                isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-[#0B2418]/50 border-[#168A45]/40'
              }`}>
                <div className="w-14 h-14 rounded-full bg-[#168A45] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#168A45]/30 animate-pulse">
                  <CheckCircle2 className="w-8 h-8 text-[#63D98A]" />
                </div>
                
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#168A45] dark:text-[#63D98A] font-semibold">
                    Covenant Transaction Verified
                  </span>
                  <h3 className={`font-serif-luxury text-2xl sm:text-3xl font-medium ${
                    isLight ? 'text-neutral-950' : 'text-white'
                  }`}>
                    THANK YOU FOR YOUR KINGDOM SEED
                  </h3>
                  <p className={`text-xs max-w-md mx-auto ${isLight ? 'text-gray-600' : 'text-white/70'}`}>
                    Your generous sacrifice has been received into <strong>{paymentResult.fund}</strong>. May God multiply your seed sown according to 2 Corinthians 9:10.
                  </p>
                </div>

                <div className={`p-4 border font-mono text-xs max-w-md mx-auto text-left space-y-2 ${
                  isLight ? 'bg-white border-emerald-200 text-gray-800' : 'bg-black/60 border-white/10 text-white/90'
                }`}>
                  <div className="flex justify-between border-b pb-1 border-gray-200 dark:border-white/10">
                    <span className="text-gray-400">Reference:</span>
                    <span className="font-bold text-[#168A45] dark:text-[#63D98A]">{paymentResult.reference}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 border-gray-200 dark:border-white/10">
                    <span className="text-gray-400">Amount Paid:</span>
                    <span className="font-bold">{paymentResult.currency} {paymentResult.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 border-gray-200 dark:border-white/10">
                    <span className="text-gray-400">Donor Name:</span>
                    <span>{paymentResult.donorName}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1 border-gray-200 dark:border-white/10">
                    <span className="text-gray-400">Schedule:</span>
                    <span className="capitalize">{paymentResult.frequency} Partnership</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Processed By:</span>
                    <span className="text-[#00C3F7] font-semibold">Paystack Gateway</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className={`w-full sm:w-auto px-4 py-3 border text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 min-h-[44px] cursor-pointer transition-colors ${
                      isLight ? 'bg-white border-gray-300 hover:bg-gray-100' : 'bg-white/5 border-white/15 hover:bg-white/10'
                    }`}
                  >
                    <Printer className="w-4 h-4 text-[#168A45]" />
                    <span>Print Receipt</span>
                  </button>

                  <a
                    href={`https://wa.me/${mobileMoneyDetails.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Shalom Prophet John Lord, I have just completed a Paystack kingdom seed of ${paymentResult.currency} ${paymentResult.amount} (Ref: ${paymentResult.reference}). Please lift my seed and family in prayer!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto sm:flex-1 py-3 px-4 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 shadow-md cursor-pointer min-h-[44px]"
                  >
                    <Share2 className="w-4 h-4 text-[#63D98A]" />
                    <span>Share on WhatsApp</span>
                  </a>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-8 py-2.5 text-xs font-semibold uppercase tracking-widest text-[#168A45] hover:underline cursor-pointer"
                >
                  Done / Close Window
                </button>
              </div>
            </div>
          ) : activeTab === 'momo' ? (
            /* ========================================================
               DIRECT MTN MOBILE MONEY TAB
               ======================================================== */
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-widest text-amber-500 font-bold block">
                  DIRECT SUBSCRIBER TRANSFER
                </span>
                <h3 className={`font-serif-luxury text-2xl sm:text-3xl font-medium ${isLight ? 'text-neutral-950' : 'text-white'}`}>
                  MTN MOBILE MONEY (MOMO)
                </h3>
                <p className={`text-xs font-light leading-relaxed ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
                  Send your tithe, seed, or covenant partner donation directly to the official MTN Mobile Money account.
                </p>
              </div>

              {/* MoMo Account Card */}
              <div className={`p-5 sm:p-6 border ${
                isLight ? 'bg-amber-50/70 border-amber-300' : 'bg-black/60 border-amber-500/40'
              } space-y-4`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
                  <div className="min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFCC00] text-black">
                      {mobileMoneyDetails.network}
                    </span>
                    <div className="text-xl sm:text-3xl font-bold font-mono tracking-wider text-amber-500 mt-1 break-all">
                      {mobileMoneyDetails.displayNumber}
                    </div>
                    <div className="text-xs font-medium mt-0.5">
                      Account Name: <strong className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">{mobileMoneyDetails.accountName}</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyMomo}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#FFCC00] hover:bg-[#e6b800] text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer min-h-[44px]"
                  >
                    {copiedMomo ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-800" />
                        <span>COPIED NUMBER!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-black" />
                        <span>COPY {mobileMoneyDetails.rawNumber}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Step-by-step instructions */}
                <div className="space-y-2 text-xs">
                  <span className="font-semibold text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                    Step-by-Step Instructions:
                  </span>
                  <ol className="space-y-1.5 font-light text-neutral-700 dark:text-white/80">
                    {mobileMoneyDetails.ussdSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Confirmation on WhatsApp */}
              <div className={`p-4 border space-y-3 ${
                isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-[#0B2418]/40 border-emerald-500/30'
              }`}>
                <div className="flex items-center gap-2 text-[#168A45] dark:text-[#63D98A] text-xs font-semibold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Your Seed & Share Prayer Request</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-white/70 leading-relaxed font-light">
                  Once your transfer is completed, notify Prophet John Lord directly via WhatsApp to receive apostolic prayer and blessing for your seed.
                </p>
                <a
                  href={mobileMoneyDetails.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-colors min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>NOTIFY ON WHATSAPP ({mobileMoneyDetails.internationalNumber})</span>
                </a>
              </div>
            </div>
          ) : (
            /* ========================================================
               PAYSTACK PAYMENT FORM
               ======================================================== */
            <form onSubmit={handlePaystackSubmit} className="space-y-5 sm:space-y-6">
              <div className="space-y-1">
                <h3 className={`font-serif-luxury text-2xl sm:text-3xl font-medium ${isLight ? 'text-neutral-950' : 'text-white'}`}>
                  SEED INTO THE PROPHETIC MANDATE
                </h3>
                <p className={`text-xs font-light leading-relaxed ${isLight ? 'text-gray-600' : 'text-white/60'}`}>
                  Processed securely via Paystack with instant receipt and confirmation.
                </p>
              </div>

              {/* Currency Selector Tabs */}
              <div className="space-y-1.5">
                <label className={`block text-[11px] uppercase tracking-wider font-semibold ${
                  isLight ? 'text-gray-700' : 'text-white/80'
                }`}>
                  Select Giving Currency
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {PAYSTACK_CURRENCIES.map((c) => {
                    const isSelected = currency === c.code;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => {
                          setCurrency(c.code);
                          setAmount(String(c.defaultAmounts[1] || c.defaultAmounts[0]));
                          setCustomAmount('');
                        }}
                        className={`p-2 rounded border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#168A45] text-white border-[#168A45] shadow-sm font-semibold'
                            : isLight
                            ? 'bg-gray-50 border-gray-200 text-gray-700 hover:border-[#168A45]'
                            : 'bg-white/5 border-white/10 text-white/70 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        <div className="text-sm">{c.flag}</div>
                        <div className="text-xs font-mono font-bold mt-0.5">{c.code}</div>
                        <div className="text-[9px] truncate opacity-75">{c.symbol}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`block text-[11px] uppercase tracking-wider font-semibold ${
                    isLight ? 'text-gray-700' : 'text-white/80'
                  }`}>
                    Amount ({currency})
                  </label>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Selected: {currentCurrencyConfig.symbol}{finalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {currentCurrencyConfig.defaultAmounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setAmount(String(val));
                        setCustomAmount('');
                      }}
                      className={`py-2.5 text-xs font-mono font-semibold border transition-all min-h-[44px] cursor-pointer ${
                        amount === String(val) && !customAmount
                          ? 'border-[#168A45] bg-[#168A45] text-white shadow-md'
                          : isLight
                          ? 'border-gray-200 bg-gray-50 text-gray-800 hover:border-gray-400'
                          : 'border-white/10 bg-white/5 text-white/80 hover:border-white/30'
                      }`}
                    >
                      {currentCurrencyConfig.symbol}{val.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="pt-1">
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-xs font-mono text-gray-400">
                      {currentCurrencyConfig.symbol}
                    </span>
                    <input
                      type="number"
                      min="1"
                      placeholder={`Or enter custom amount in ${currency}`}
                      value={customAmount}
                      onChange={(e) => {
                        setCustomAmount(e.target.value);
                        setAmount('');
                      }}
                      className={`w-full pl-8 pr-4 py-2.5 border text-base sm:text-xs outline-none focus:border-[#168A45] transition-all min-h-[44px] ${
                        isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black/60 border-white/15 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Frequency & Fund Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Frequency */}
                <div className="space-y-1.5">
                  <label className={`block text-[11px] uppercase tracking-wider font-semibold ${
                    isLight ? 'text-gray-700' : 'text-white/80'
                  }`}>
                    Giving Schedule
                  </label>
                  <div className={`grid grid-cols-2 gap-1.5 p-1 border ${
                    isLight ? 'bg-gray-100 border-gray-200' : 'bg-white/5 border-white/10'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setFrequency('monthly')}
                      className={`py-2 text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        frequency === 'monthly'
                          ? 'bg-[#168A45] text-white shadow-xs'
                          : isLight ? 'text-gray-600' : 'text-white/60'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrequency('one-time')}
                      className={`py-2 text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                        frequency === 'one-time'
                          ? 'bg-[#168A45] text-white shadow-xs'
                          : isLight ? 'text-gray-600' : 'text-white/60'
                      }`}
                    >
                      One-Time
                    </button>
                  </div>
                </div>

                {/* Fund */}
                <div className="space-y-1.5">
                  <label className={`block text-[11px] uppercase tracking-wider font-semibold ${
                    isLight ? 'text-gray-700' : 'text-white/80'
                  }`}>
                    Kingdom Allocation
                  </label>
                  <select
                    value={selectedFund}
                    onChange={(e) => setSelectedFund(e.target.value)}
                    className={`w-full px-3 py-2.5 border text-base sm:text-xs outline-none focus:border-[#168A45] min-h-[44px] ${
                      isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-[#0B2418]/40 border-white/15 text-white'
                    }`}
                  >
                    {givingInitiatives.map((fund) => (
                      <option key={fund.id} value={fund.id} className={isLight ? 'bg-white text-gray-900' : 'bg-neutral-900 text-white'}>
                        {fund.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Donor Contact Details (Required by Paystack) */}
              <div className="space-y-3 pt-1 border-t border-gray-100 dark:border-white/5">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#168A45] dark:text-[#63D98A] block">
                  Donor Identification & Paystack Receipt Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kwame Mensah"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      className={`w-full px-3 py-2.5 border text-base sm:text-xs outline-none focus:border-[#168A45] min-h-[44px] ${
                        isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black/60 border-white/15 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="kwame@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full px-3 py-2.5 border text-base sm:text-xs outline-none focus:border-[#168A45] min-h-[44px] ${
                        isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black/60 border-white/15 text-white'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                      Phone Number (MoMo / SMS)
                    </label>
                    <input
                      type="tel"
                      placeholder="+233 24 XXX XXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={`w-full px-3 py-2.5 border text-base sm:text-xs outline-none focus:border-[#168A45] min-h-[44px] ${
                        isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black/60 border-white/15 text-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                      Prayer Request / Seed Note
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Breakthrough, Healing, Family"
                      value={prayerRequest}
                      onChange={(e) => setPrayerRequest(e.target.value)}
                      className={`w-full px-3 py-2.5 border text-base sm:text-xs outline-none focus:border-[#168A45] min-h-[44px] ${
                        isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black/60 border-white/15 text-white'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Paystack Public Key Config Toggle */}
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowKeyConfig(!showKeyConfig)}
                  className="text-[10px] text-gray-400 hover:text-[#168A45] inline-flex items-center gap-1 cursor-pointer"
                >
                  <KeyRound className="w-3 h-3" />
                  <span>{showKeyConfig ? 'Hide Custom Key' : 'Configure Paystack Key'}</span>
                </button>
              </div>

              {showKeyConfig && (
                <div className={`p-3 border text-xs space-y-1.5 ${
                  isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'
                }`}>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-gray-500">
                    Custom Paystack Public Key (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="pk_live_... or pk_test_..."
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className={`w-full px-3 py-1.5 border text-xs font-mono outline-none focus:border-[#168A45] ${
                      isLight ? 'bg-white border-gray-300 text-gray-900' : 'bg-black border-white/20 text-white'
                    }`}
                  />
                  <p className="text-[10px] text-gray-400">
                    If left blank, the app will use `VITE_PAYSTACK_PUBLIC_KEY` or standard preview mode.
                  </p>
                </div>
              )}

              {/* Paystack Trust & Supported Channels Banner */}
              <div className={`p-3 border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
                isLight ? 'bg-gray-50 border-gray-200 text-gray-600' : 'bg-white/5 border-white/10 text-white/70'
              }`}>
                <div className="flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-[#168A45] shrink-0" />
                  <span className="text-[11px]">
                    256-Bit SSL Encrypted • Powered by <strong>Paystack</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                    MTN MoMo
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    Visa / Mastercard
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Bank Transfer
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-4 bg-[#168A45] hover:bg-[#13743a] text-white text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center gap-2.5 shadow-[0_4px_25px_rgba(22,138,69,0.4)] min-h-[48px] cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>CONNECTING TO PAYSTACK GATEWAY...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-[#63D98A]" />
                    <span>PAY WITH PAYSTACK ({currentCurrencyConfig.symbol}{finalAmount.toLocaleString()})</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
