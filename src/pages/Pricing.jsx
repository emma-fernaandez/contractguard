import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import Footer from "../components/landing/Footer";
import PublicNavbar from "../components/landing/PublicNavbar";
import { useTranslation } from "../components/i18n/I18nProvider";
import { useQuery } from "@tanstack/react-query";

export default function PricingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(null);

  // Check if user is authenticated
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user-pricing'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const handleSubscribe = async (billingCycle) => {
    setLoadingCheckout(billingCycle);

    try {
      // Check if user is authenticated
      if (!user) {
        // Save the intended billing cycle in localStorage
        localStorage.setItem('pending_subscription', billingCycle);
        
        // Redirect to login with return URL
        const currentUrl = window.location.pathname + window.location.search;
        base44.auth.redirectToLogin(currentUrl);
        return;
      }

      console.log('Starting checkout for:', billingCycle);
      
      const response = await base44.functions.invoke('createCheckoutSession', {
        billingCycle: billingCycle
      });

      console.log('Checkout response:', response.data);

      if (response.data.success && response.data.url) {
        console.log('Redirecting to Stripe checkout:', response.data.url);
        window.location.href = response.data.url;
      } else {
        console.error('Checkout failed:', response.data);
        alert(response.data.error || t('pricing.errorCreatingSession') || 'Error al crear sesión de pago');
        setLoadingCheckout(null);
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      console.error('Error details:', err.response?.data);
      
      let errorMessage = t('pricing.errorCreatingSession') || 'Error al crear sesión de pago';
      if (err.response?.data?.error) {
        errorMessage += ': ' + err.response.data.error;
      }
      
      alert(errorMessage);
      setLoadingCheckout(null);
    }
  };

  // Check for pending subscription after login
  React.useEffect(() => {
    const pendingSubscription = localStorage.getItem('pending_subscription');
    if (pendingSubscription && user && !userLoading) {
      console.log('Processing pending subscription:', pendingSubscription);
      localStorage.removeItem('pending_subscription');
      
      // Start the checkout process
      setTimeout(() => {
        handleSubscribe(pendingSubscription);
      }, 500);
    }
  }, [user, userLoading]);

  const plans = [
    {
      name: t('pricing.free'),
      badge: t('pricing.tryItFree'),
      badgeColor: "bg-gray-100 text-gray-700",
      monthlyPrice: 0,
      yearlyPrice: 0,
      billing: t('pricing.foreverFree'),
      description: t('pricing.perfectForOneTime'),
      included: [
        t('pricing.feature1'),
        t('pricing.redFlagDetection'),
        t('pricing.plainEnglishSummary'),
        t('pricing.costBreakdown'),
        t('pricing.emailSupport')
      ],
      notIncluded: [
        t('pricing.feature7'),
        t('pricing.interactiveChatAssistant'),
        t('pricing.marketComparison'),
        t('pricing.prioritySupport'),
        t('pricing.feature6')
      ],
      cta: t('common.getStartedFree'),
      ctaVariant: "outline",
      subtext: t('pricing.noCreditCardRequired'),
      bottomText: t('pricing.perfectForOneTime'),
      action: 'link',
      link: createPageUrl("TryFree")
    },
    {
      name: t('pricing.pro'),
      badge: t('pricing.mostPopular'),
      badgeColor: "bg-blue-600 text-white",
      monthlyPrice: 9.99,
      yearlyPrice: 94.99,
      yearlySavings: 24,
      billing: t('pricing.perMonth'),
      description: t('pricing.perfectForIndividuals'),
      popular: true,
      included: [
        t('pricing.feature5'),
        t('pricing.feature6'),
        t('pricing.feature7') + " (PDF)",
        t('pricing.interactiveChatAssistant'),
        t('pricing.marketComparison'),
        t('pricing.analysisHistory') + " - " + t('pricing.unlimited'),
        t('pricing.prioritySupport'),
        t('common.downloadPdf')
      ],
      cta: t('common.startFreeTrial'),
      ctaVariant: "default",
      subtext: t('pricing.sevenDayFreeTrial'),
      bottomText: t('pricing.perfectForIndividuals'),
      bestValue: true,
      action: 'subscribe'
    },
    {
      name: t('pricing.business'),
      badge: t('pricing.comingSoon'),
      badgeColor: "bg-purple-600 text-white",
      monthlyPrice: 49,
      yearlyPrice: 490,
      yearlySavings: 98,
      billing: t('pricing.perMonth'),
      description: t('pricing.perfectForTeams'),
      comingSoon: true,
      included: [
        t('pricing.feature11'),
        "5 " + t('pricing.teamMembers') + " " + t('pricing.included'),
        t('pricing.sharedWorkspace'),
        "Team analytics dashboard",
        "Role-based permissions",
        "API access (1,000 calls/month)",
        "Custom integrations",
        "Dedicated account manager",
        t('pricing.phoneSupport'),
        "SLA guarantee (99.9% uptime)",
        "Custom contract templates",
        "Bulk upload (up to 50 at once)"
      ],
      additionalInfo: t('pricing.additionalInfo'),
      hideButton: true,
      subtext: t('pricing.availableSoon'),
      bottomText: t('pricing.perfectForTeams')
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <PublicNavbar />
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br py-16 from-blue-50 via-white to-purple-50 relative overflow-hidden">
        <div className="bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.03),transparent_60%)] absolute inset-0" />
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-6 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide">
              {t('pricing.badge')}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('pricing.title')}
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>

            {/* Toggle Monthly/Yearly */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`font-semibold ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                {t('pricing.monthly')}
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={`relative w-16 h-8 rounded-full transition-colors ${
                  isYearly ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <motion.div
                  className="absolute top-1 w-6 h-6 bg-white rounded-full shadow"
                  animate={{ left: isYearly ? '36px' : '4px' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`font-semibold ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                {t('pricing.yearly')}
                <Badge className="ml-2 bg-green-100 text-green-700 hover:bg-green-100">
                  {t('pricing.save20')}
                </Badge>
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      ⭐ {plan.badge}
                    </div>
                  </div>
                )}
                <Card className={`h-full flex flex-col ${
                  plan.popular 
                    ? 'border-2 border-blue-600 shadow-2xl bg-white' 
                    : 'border border-gray-200 shadow-xl bg-white'
                }`}>
                  <CardHeader className="text-center pb-8 pt-12">
                    {!plan.popular && (
                      <div className="mb-4">
                        <span className={`inline-block ${plan.badgeColor} px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide`}>
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-sm text-gray-600 mb-6">{plan.description}</p>
                    
                    <div className="mb-2">
                      <span className="text-5xl font-black text-gray-900">
                        €{isYearly && plan.yearlyPrice ? (plan.yearlyPrice / 12).toFixed(2) : plan.monthlyPrice}
                      </span>
                      {plan.billing && <span className="text-gray-600 ml-2">{plan.billing}</span>}
                    </div>
                    
                    {isYearly && plan.yearlySavings && (
                      <p className="text-sm text-green-600 font-semibold">
                        {t('pricing.savePerYear', { amount: plan.yearlySavings })}
                      </p>
                    )}
                    
                    {plan.additionalInfo && (
                      <p className="text-sm text-gray-600 mt-2">{plan.additionalInfo}</p>
                    )}
                  </CardHeader>

                  <CardContent className="flex flex-col flex-grow space-y-6 px-6 pb-8">
                    {/* Included Features */}
                    <div className="flex-grow">
                      <ul className="space-y-3">
                        {plan.included.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <div className="space-y-3 mt-auto">
                      {!plan.hideButton && (
                        <>
                          {plan.action === 'link' ? (
                            <Link to={plan.link} className="block">
                              <Button
                                className={`w-full py-6 text-lg ${
                                  plan.ctaVariant === 'default'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                                    : 'bg-white border-2 border-gray-300 text-gray-900 hover:bg-transparent hover:border-blue-600 hover:text-blue-600'
                                }`}
                              >
                                {plan.cta}
                              </Button>
                            </Link>
                          ) : (
                            <Button
                              onClick={() => handleSubscribe(isYearly ? 'yearly' : 'monthly')}
                              disabled={loadingCheckout !== null}
                              className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                            >
                              {loadingCheckout === (isYearly ? 'yearly' : 'monthly') ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  {t('pricing.processing')}
                                </>
                              ) : (
                                <>
                                  <Sparkles className="w-5 h-5 mr-2" />
                                  {plan.cta}
                                </>
                              )}
                            </Button>
                          )}
                          <p className="text-xs text-gray-500 text-center">{plan.subtext}</p>
                        </>
                      )}
                      {plan.hideButton && (
                        <div className="text-center py-4">
                          <Badge className="bg-purple-100 text-purple-700 text-sm px-4 py-2">
                            {t('pricing.comingSoon')}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-600 text-center">{plan.bottomText}</p>
                    </div>

                    {plan.bestValue && (
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 justify-center py-2 rounded-lg text-center font-bold text-sm">
                        💎 {t('pricing.bestValue')}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}