'use client';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X, User, Lock } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export function MockEsewaPayment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'login' | 'payment' | 'success' | 'failed'>('login');
  
  // eSewa login
  const [esewaid, setEsewaid] = useState('');
  const [esewaPwd, setEsewaPwd] = useState('');
  const [mpin, setMpin] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Get payment details from URL params
  const amount = searchParams.get('amount');
  const ticketId = searchParams.get('ticketId');
  const eventId = searchParams.get('eventId');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!esewaid || !esewaPwd) {
      alert('Please enter eSewa ID and Password');
      return;
    }

    const validEsewaIds = [
      '9806800001',
      '9806800002',
      '9806800003',
      '9806800004',
      '9806800005',
    ];

    if (!validEsewaIds.includes(esewaid)) {
      alert('Invalid eSewa ID. Use test IDs: 9806800001-9806800005');
      return;
    }

    if (esewaPwd !== 'Nepal@123') {
      alert('Invalid password. Test password: Nepal@123');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setStep('payment');
      setLoading(false);
    }, 1000);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!mpin) {
      alert('Please enter your MPIN');
      return;
    }

    if (mpin !== '1122') {
      alert('Invalid MPIN. Test MPIN: 1122');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setStep('success');
      setLoading(false);
      setTimeout(() => {
        router.push(`/events/payment-success?ticketId=${ticketId}&quantity=1`);
      }, 2000);
    }, 1500);
  };

  const handleCancel = () => {
    router.push(`/events/payment-failed?ticketId=${ticketId}`);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0">
      <div className="w-screen h-screen bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative px-4 py-3 md:px-6 md:py-4 border-b border-slate-700 flex items-center justify-between bg-slate-900 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-base md:text-lg">e</span>
            </div>
            <span className="text-white font-bold text-base md:text-lg">Sewa</span>
          </div>
          <button onClick={handleCancel} className="text-gray-400 hover:text-white transition p-1">
            <X size={24} />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="min-h-full flex">
            {/* Left Side - Payment Summary (Hidden on Mobile) */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-b from-slate-800 to-slate-750 p-6 flex-col justify-center items-center border-r border-slate-700">
              <div className="w-full max-w-xs text-center">
                <div className="mb-6">
                  <p className="text-gray-400 text-xs mb-2">Total Amount to Pay</p>
                  <div className="flex items-baseline justify-center gap-1 mb-4">
                    <span className="text-green-400 font-semibold text-sm">NPR.</span>
                    <span className="text-4xl md:text-5xl font-bold text-white">{amount}</span>
                    <span className="text-gray-400 text-sm">.00</span>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="bg-slate-700/50 rounded-lg p-4 space-y-2 mb-6 text-sm">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-600">
                    <span className="text-gray-400">Product Amount</span>
                    <span className="text-white font-semibold">NPR {amount}.00</span>
                  </div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-300 font-semibold">Total Amount</span>
                    <span className="text-green-400 font-bold">NPR {amount}.00</span>
                  </div>
                </div>

                {/* Event Details */}
                <div className="bg-gradient-to-r from-green-900/20 to-teal-900/20 rounded-lg p-4 text-left text-xs">
                  <p className="text-gray-400 text-xs mb-2">Event Details</p>
                  <div className="space-y-1 text-white">
                    <p><span className="text-gray-400">Event:</span> <span className="font-semibold ml-1">Event Ticket</span></p>
                    <p><span className="text-gray-400">Billing Cycle:</span> <span className="font-semibold ml-1">One-time</span></p>
                    <p><span className="text-gray-400">Transaction ID:</span> <span className="font-semibold ml-1 text-xs">{ticketId?.substring(0, 15)}...</span></p>
                  </div>
                </div>

                {/* LINK & PAY Logo */}
                <div className="mt-8 pt-4 border-t border-slate-700">
                  <div className="text-center mb-2">
                    <p className="text-green-400 text-lg font-bold">LINK</p>
                    <p className="text-red-500 text-lg font-bold">& PAY</p>
                  </div>
                  <p className="text-gray-500 text-xs">Powered by eSewa</p>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 px-4 py-6 md:px-8 md:py-8 overflow-auto flex flex-col justify-center">
              <div className="w-full max-w-sm mx-auto">
                {/* Step 1: eSewa Login */}
                {step === 'login' && (
                  <motion.form
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onSubmit={handleLogin}
                    className="space-y-4"
                  >
                    <h2 className="text-lg md:text-2xl font-bold text-white mb-6">Sign in to eSewa</h2>

                    {/* eSewa ID */}
                    <div>
                      <label className="text-gray-300 text-xs font-medium mb-1.5 block">eSewa ID</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder="98068XXXXX"
                          value={esewaid}
                          onChange={(e) => setEsewaid(e.target.value)}
                          className="w-full bg-slate-700 text-white pl-9 pr-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition text-sm"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="text-gray-300 text-xs font-medium mb-1.5 block">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                          type="password"
                          placeholder="Enter password"
                          value={esewaPwd}
                          onChange={(e) => setEsewaPwd(e.target.value)}
                          className="w-full bg-slate-700 text-white pl-9 pr-3 py-2 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition text-sm"
                        />
                      </div>
                    </div>

                    {/* Test Credentials */}
                    <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 text-xs">
                      <p className="text-blue-300 font-semibold mb-1">Test Credentials:</p>
                      <p className="text-blue-200">ID: 9806800001-9806800005</p>
                      <p className="text-blue-200">Password: Nepal@123</p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-6"
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancel}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-gray-200 font-semibold py-2 rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </motion.form>
                )}

                {/* Step 2: Payment (MPIN) */}
                {step === 'payment' && (
                  <motion.form
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onSubmit={handlePayment}
                    className="space-y-4"
                  >
                    <h2 className="text-lg md:text-2xl font-bold text-white mb-6">Verify Transaction</h2>
                    <p className="text-gray-400 text-sm mb-6">Enter your MPIN to confirm the payment</p>

                    {/* MPIN */}
                    <div>
                      <label className="text-gray-300 text-xs font-medium mb-1.5 block">MPIN</label>
                      <input
                        type="password"
                        placeholder="Enter 4-digit MPIN"
                        value={mpin}
                        onChange={(e) => setMpin(e.target.value)}
                        maxLength={4}
                        className="w-full bg-slate-700 text-white px-3 py-3 rounded-lg border border-slate-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30 transition text-center text-3xl tracking-widest"
                      />
                    </div>

                    {/* Test MPIN */}
                    <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 text-xs">
                      <p className="text-blue-200 font-semibold">Test MPIN: 1122</p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-6"
                    >
                      {loading ? 'Processing...' : 'Confirm Payment'}
                    </button>

                    <button
                      type="button"
                      onClick={handleCancel}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-gray-200 font-semibold py-2 rounded-lg transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </motion.form>
                )}

                {/* Success Screen */}
                {step === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="bg-green-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto"
                    >
                      <CheckCircle className="w-10 h-10 text-white" />
                    </motion.div>

                    <div>
                      <h2 className="text-white text-2xl font-bold">Payment Successful!</h2>
                      <p className="text-gray-400 text-sm mt-2">Your event ticket has been confirmed</p>
                    </div>

                    <div className="bg-slate-700/50 rounded-lg p-4 space-y-2 text-sm text-left">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount Paid:</span>
                        <span className="text-green-400 font-bold">NPR {amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Ticket ID:</span>
                        <span className="text-gray-300 text-xs">{ticketId?.substring(0, 15)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-green-400 font-semibold">Confirmed</span>
                      </div>
                    </div>

                    <p className="text-gray-500 text-xs">Redirecting to dashboard...</p>
                  </motion.div>
                )}

                {/* Failed Screen */}
                {step === 'failed' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring' }}
                      className="bg-red-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto"
                    >
                      <AlertCircle className="w-10 h-10 text-white" />
                    </motion.div>

                    <div>
                      <h2 className="text-white text-2xl font-bold">Payment Failed</h2>
                      <p className="text-gray-400 text-sm mt-2">Unable to process your payment</p>
                    </div>

                    <button
                      onClick={() => {
                        setStep('login');
                        setEsewaid('');
                        setEsewaPwd('');
                        setMpin('');
                      }}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors"
                    >
                      Try Again
                    </button>

                    <button
                      onClick={handleCancel}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-gray-200 font-semibold py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
