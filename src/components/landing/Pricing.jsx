import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Check, Award, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useTranslation } from "../i18n/I18nProvider";
import { useQuery } from "@tanstack/react-query";

export default function Pricing() {
  const { t } = useTranslation();
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Check if user is authenticated
  const { data: user } = useQuery({
    queryKey: ['current-user-pricing-section'],
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

  const handleSubscribe = async () => {
    setLoadingCheckout(true);

    try {
      // Check if user is authenticated
      if (!user) {
        // Save the intended billing cycle in localStorage
        localStorage.setItem('pending_subscription', 'monthly');
        
        // Redirect to login with return URL
        base44.auth.redirectToLogin(window.location.pathname);
        return;
      }

      const response = await base44.functions.invoke('createCheckoutSession', {
        billingCycle: 'monthly'
      });

      if (response.data.success && response.data.url) {
        window.location.href = response.data.url;
      } else {
        alert(response.data.error || 'Error al crear sesión de pago');
        setLoadingCheckout(false);
      }
    } catch (err) {
      console.error('Error creating checkout:', err);
      alert('Error al crear sesión de pago. Por favor, inténtalo de nuevo.');
      setLoadingCheckout(false);
    }
  };

  const plans = [
    {
      name: t('landing.freePlanName'),
      price: "$0",
      period: t('landing.perMonth'),
      description: t('landing.freePlanDescription'),
      features: [
        t('pricing.feature1'),
        t('pricing.feature2'),
        t('pricing.feature3'),
        t('pricing.feature4')
      ],
      cta: t('common.getStartedFree'),
      style: "secondary",
      action: "link",
      link: createPageUrl("TryFree")
    },
    {
      name: t('landing.proPlanName'),
      price: "$9.99",
      period: t('landing.perMonth'),
      description: t('landing.proPlanDescription'),
      features: [
        t('pricing.feature5'),
        t('pricing.feature6'),
        t('pricing.feature7'),
        t('pricing.feature8'),
        t('pricing.feature9'),
        t('pricing.feature10')
      ],
      cta: t('common.startFreeTrial'),
      style: "primary",
      popular: true,
      action: "subscribe"
    },
    {
      name: t('landing.businessPlanName'),
      price: "$49",
      period: t('landing.perMonth'),
      description: t('landing.businessPlanDescription'),
      features: [
        t('pricing.feature11'),
        t('pricing.feature12'),
        t('pricing.feature13'),
        t('pricing.feature14'),
        t('pricing.feature15')
      ],
      hideButton: true,
      style: "secondary",
      comingSoon: true
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.03),transparent_60%)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3 block">
            {t('landing.simplePricing')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('landing.pricingTitle')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('landing.pricingSubtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative flex"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1.5 shadow-lg">
                    {t('landing.mostPopular')}
                  </Badge>
                </div>
              )}

              {plan.comingSoon && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-1.5 shadow-lg">
                    {t('common.comingSoon')}
                  </Badge>
                </div>
              )}

              <Card className={`w-full flex flex-col transition-all duration-300 ${
                plan.popular 
                  ? 'border-2 border-blue-600 shadow-2xl scale-105 bg-white' 
                  : 'border-0 shadow-lg hover:shadow-xl bg-white'
              }`}>
                <CardHeader className="text-center pt-10 pb-8">
                  <div className="mb-4">
                    <span className={`font-semibold uppercase tracking-widest ${
                      plan.comingSoon ? 'text-purple-600' : 'text-blue-600'
                    }`}>{plan.name}</span>
                    <p className="text-sm text-gray-500">{plan.description}</p>
                  </div>
                  <div className="mt-4">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-500">{plan.period}</span>}
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col flex-grow space-y-6">
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {!plan.hideButton ? (
                    plan.action === "link" ? (
                      <Link to={plan.link} className="block mt-auto">
                        <Button 
                          className={`w-full py-6 text-lg ${
                            plan.style === 'primary'
                              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-600/25'
                              : 'bg-gray-100 text-gray-900 hover:bg-transparent hover:border-2 hover:border-blue-600 hover:text-blue-600'
                          } transition-all duration-300`}
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                    ) : (
                      <Button 
                        onClick={handleSubscribe}
                        disabled={loadingCheckout}
                        className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-600/25 transition-all duration-300 mt-auto"
                      >
                        {loadingCheckout ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {t('pricing.processing')}
                          </>
                        ) : (
                          plan.cta
                        )}
                      </Button>
                    )
                  ) : (
                    <div className="mt-auto text-center py-4">
                      <Badge className="bg-purple-100 text-purple-700 text-sm px-4 py-2">
                        {t('common.comingSoon')}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-16 space-y-4">
          <div className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-full px-6 py-3">
            <Award className="w-5 h-5 text-green-600" />
            <p className="font-medium text-green-800">{t('landing.moneyBackGuarantee')}</p>
          </div>
          <p className="text-gray-600">{t('landing.noCreditCard')}</p>
        </div>
      </div>
    </section>
  );
}