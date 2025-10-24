
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import {
  CreditCard,
  Calendar,
  TrendingUp,
  ExternalLink,
  Loader2,
  AlertCircle,
  Crown,
  Infinity,
  Mail,
  RefreshCw
} from "lucide-react";
import { format } from "date-fns";
import { es, it } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useTranslation } from "../components/i18n/I18nProvider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import ChurnExitSurvey from "../components/ChurnExitSurvey"; // Added ChurnExitSurvey import

export default function BillingPage() {
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [churnSurveyOpen, setChurnSurveyOpen] = useState(false); // Added churnSurveyOpen state
  const [cancellingSubscription, setCancellingSubscription] = useState(false);

  const getLocale = () => {
    switch (language) {
      case 'es': return es;
      case 'it': return it;
      default: return undefined;
    }
  };

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const isPro = user?.plan === 'pro' || user?.plan === 'business';
  const isTrial = user?.subscription_status === 'trialing';

  const handleOpenPortal = async () => {
    setLoadingPortal(true);
    setErrorMessage(null);

    try {
      console.log('Attempting to open customer portal...');
      console.log('User stripe_customer_id:', user?.stripe_customer_id);

      const response = await base44.functions.invoke('createCustomerPortalSession');

      console.log('Portal response:', response.data);

      if (response.data.success && response.data.url) {
        console.log('Redirecting to portal:', response.data.url);
        window.location.href = response.data.url;
      } else {
        console.error('Portal creation failed:', response.data);
        setErrorMessage(response.data.error || t('billing.errorOpeningPortal'));
        setLoadingPortal(false);
      }
    } catch (err) {
      console.error('Error opening portal:', err);
      console.error('Error details:', err.response?.data);

      let errorMsg = t('billing.errorOpeningPortal');
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }

      setErrorMessage(errorMsg);
      setLoadingPortal(false);
    }
  };

  const handleRefreshData = async () => {
    await refetch();
    queryClient.invalidateQueries({ queryKey: ['current-user'] });
  };

  // New handler to transition from initial cancel dialog to survey
  const handleCancelClick = () => {
    setCancelDialogOpen(false);
    setChurnSurveyOpen(true);
    setErrorMessage(null); // Clear any previous error
  };

  // Modified function to handle survey submission and then cancellation
  const handleChurnSurveySubmit = async (surveyData) => {
    setCancellingSubscription(true);
    setErrorMessage(null);

    try {
      // Calculate user metrics
      const daysAsCustomer = user.subscription_start_date
        ? Math.floor((new Date() - new Date(user.subscription_start_date)) / (1000 * 60 * 60 * 24))
        : 0;

      // Get total analyses count
      // This assumes base44.entities.Contract is available and has a filter method
      const userContracts = await base44.entities.Contract.filter({ created_by: user.email });
      const totalAnalyses = userContracts.length;

      // Calculate total revenue (MRR * months as customer)
      const monthsAsCustomer = daysAsCustomer / 30;
      const totalRevenue = (user.mrr || 0) * monthsAsCustomer;

      // Prepare churn event data
      const churnEventData = {
        user_id: user.id,
        cancellation_reason: surveyData.cancellation_reason,
        feedback: surveyData.feedback || '',
        nps_score: surveyData.nps_score,
        days_as_customer: daysAsCustomer,
        total_analyses: totalAnalyses,
        total_revenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimals
        plan_at_cancellation: user.plan,
        billing_cycle_at_cancellation: user.billing_cycle
      };

      console.log('[Billing] Saving churn event:', churnEventData);

      // Save churn event
      // This assumes base44.entities.ChurnEvents is available and has a create method
      await base44.entities.ChurnEvents.create(churnEventData);

      // Now cancel the subscription
      const response = await base44.functions.invoke('cancelSubscription');

      if (response.data.success) {
        toast({
          title: t('billing.subscriptionCanceled'),
          description: t('billing.subscriptionCanceledDescription'),
        });

        // Refresh user data
        await refetch();
        queryClient.invalidateQueries({ queryKey: ['current-user'] });
        setChurnSurveyOpen(false); // Close the survey dialog
      } else {
        setErrorMessage(response.data.error || t('billing.errorCancelingSubscription'));
      }
    } catch (err) {
      console.error('Error canceling subscription:', err);
      setErrorMessage(err.response?.data?.error || t('billing.errorCancelingSubscription'));
    } finally {
      setCancellingSubscription(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: t('billing.active') },
      trialing: { color: 'bg-blue-100 text-blue-800', text: t('billing.trial') },
      canceled: { color: 'bg-red-100 text-red-800', text: t('billing.canceled') },
      past_due: { color: 'bg-yellow-100 text-yellow-800', text: t('billing.pastDue') }
    };

    const config = statusConfig[status] || statusConfig.active;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!isPro) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="border-2 border-blue-200 shadow-xl">
              <CardContent className="p-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {t('billing.upgradeToPro')}
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  {t('billing.upgradeDescription')}
                </p>
                <Link to={createPageUrl("Pricing")}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-6"
                  >
                    {t('billing.seePlans')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('billing.title')}</h1>
            <p className="text-gray-600">{t('billing.subtitle')}</p>
          </div>
          <Button
            onClick={handleRefreshData}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </Button>
        </motion.div>

        {errorMessage && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {!user.stripe_customer_id && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Tu suscripción está siendo procesada. Si acabas de suscribirte, espera unos segundos y haz clic en "Actualizar" arriba.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Current Plan Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-blue-600" />
                  {t('billing.currentPlan')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('billing.plan')}:</span>
                  <span className="font-bold text-gray-900 capitalize">
                    {user.plan} Plan
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">{t('billing.status')}:</span>
                  {getStatusBadge(user.subscription_status)}
                </div>

                {user.billing_cycle && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('billing.billingCycle')}:</span>
                    <span className="font-medium text-gray-900">
                      {user.billing_cycle === 'monthly' ? t('billing.monthly') : t('billing.yearly')}
                    </span>
                  </div>
                )}

                {user.current_period_end && (
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {isTrial ? t('billing.trialEndsOn') : t('billing.renewsOn')}:
                    </span>
                    <span className="font-medium text-gray-900">
                      {format(new Date(user.current_period_end), 'PPP', { locale: getLocale() })}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Usage Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  {t('billing.usage')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-3">
                    <Infinity className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {t('billing.unlimitedAnalyses')}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {t('billing.noLimits')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Manage Subscription Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                {t('billing.manageSubscription')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                {t('billing.manageDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleOpenPortal}
                  disabled={loadingPortal || !user.stripe_customer_id}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loadingPortal ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('billing.opening')}
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t('billing.openBillingPortal')}
                    </>
                  )}
                </Button>

                {isPro && user.subscription_status !== 'canceled' && (
                  <Button
                    onClick={() => setCancelDialogOpen(true)} // Modified to open the initial dialog
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    {t('billing.cancelSubscription')}
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {t('billing.portalDescription')}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Support Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">{t('billing.needHelp')}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {t('billing.helpDescription')}
                  </p>
                  <Link to={createPageUrl("Contact")}>
                    <Button variant="outline" size="sm">
                      {t('billing.contactSupport')}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Initial Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('billing.confirmCancellation')}</DialogTitle>
            <DialogDescription>
              {t('billing.cancellationWarning')}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
            <p className="text-sm text-yellow-800">
              {t('billing.cancellationNote')}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
            >
              {t('common.keepSubscription')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelClick} // Call the new handler
            >
              {t('billing.continue')} {/* Changed button text */}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Churn Exit Survey */}
      <ChurnExitSurvey
        isOpen={churnSurveyOpen}
        onClose={() => setChurnSurveyOpen(false)}
        onSubmit={handleChurnSurveySubmit}
        isSubmitting={cancellingSubscription}
        errorMessage={errorMessage} // Pass errorMessage to survey
      />
    </div>
  );
}
