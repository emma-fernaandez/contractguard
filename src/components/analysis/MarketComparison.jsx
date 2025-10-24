
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, TrendingDown, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/components/i18n/I18nProvider';
import { base44 } from '@/api/base44Client'; // Corrected import for base44

export default function MarketComparison({ analysis, user, onUpgradeClick }) {
  const { t } = useTranslation();
  
  // Debug logs
  console.log('MarketComparison - User:', user);
  console.log('MarketComparison - User Plan:', user?.plan);
  console.log('MarketComparison - Analysis Market Data:', analysis?.market_comparison);

  // Verificar si el usuario es Pro o Business
  const isPro = user && (user.plan === 'pro' || user.plan === 'business');
  const hasMarketData = analysis?.market_comparison;

  console.log('MarketComparison - isPro:', isPro);
  console.log('MarketComparison - hasMarketData:', hasMarketData);

  const handleViewMarketComparison = () => {
    // Track feature usage
    if (user) {
      // Assuming 'base44' is globally available or imported in a parent context
      // and has a 'functions' property with an 'invoke' method.
      // If base44 is not defined, this will throw an error.
      // In a real application, you might import it or ensure it's provided via context.
      // Removed the conditional check for typeof base44 as it's now explicitly imported
      base44.functions.invoke('trackFeatureUsage', {
        featureName: 'view_market_comparison',
        success: true,
        metadata: {
          plan: user?.plan || 'free',
          source_page: 'analysis',
          has_access: isPro
        }
      }).catch(err => console.error('Failed to track feature usage:', err));
    }
  };

  // Si el usuario NO es Pro, mostrar versión bloqueada
  if (!isPro) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
        onClick={handleViewMarketComparison}
      >
        <Card className="shadow-lg border-0 bg-white relative overflow-hidden">
          {/* Badge - Positioned for mobile first, then adjusted for desktop */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-4 sm:p-6 pb-0">
            <div className="order-1 sm:order-2 mb-3 sm:mb-0">
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold cursor-default text-xs whitespace-nowrap">
                {t('analysis.proFeature')}
              </Badge>
            </div>
            
            <div className="order-2 sm:order-1 flex-1">
              <CardTitle className="flex items-start gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-lg sm:text-xl font-bold break-words">{t('analysis.marketComparisonTitle')}</div>
                  <div className="text-xs sm:text-sm font-normal text-gray-500 mt-1">
                    {t('analysis.marketComparisonSubtitle')}
                  </div>
                </div>
              </CardTitle>
            </div>
          </div>

          <CardContent className="p-4 sm:p-6 pt-4">
            <div className="relative">
              {/* Blurred content */}
              <div className="filter blur-sm pointer-events-none select-none">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">{t('analysis.costAssessment')}</span>
                      <Badge className="bg-green-100 text-green-800">{t('analysis.marketRate')}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{t('analysis.placeholderMarketData')}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">{t('analysis.contractTerms')}</span>
                      <Badge className="bg-gray-100 text-gray-800">{t('analysis.standard')}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{t('analysis.placeholderTermsData')}</p>
                  </div>
                </div>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <div className="text-center p-6">
                  <Lock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {t('analysis.upgradeToProMarketComparison')}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t('analysis.marketComparisonDescription')}
                  </p>
                  <Button 
                    onClick={onUpgradeClick}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {t('analysis.upgradeNow')}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Usuario es Pro pero no hay datos de market comparison
  if (!hasMarketData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
        onClick={handleViewMarketComparison}
      >
        <Card className="shadow-lg border-0 bg-white relative">
          {/* Badge - Positioned for mobile first, then adjusted for desktop */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-4 sm:p-6 pb-0">
            <div className="order-1 sm:order-2 mb-3 sm:mb-0">
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold cursor-default text-xs whitespace-nowrap">
                {t('analysis.proFeature')}
              </Badge>
            </div>
            
            <div className="order-2 sm:order-1 flex-1">
              <CardTitle className="flex items-start gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                  <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-lg sm:text-xl font-bold break-words">{t('analysis.marketComparisonTitle')}</div>
                  <div className="text-xs sm:text-sm font-normal text-gray-500 mt-1">
                    {t('analysis.marketComparisonSubtitle')}
                  </div>
                </div>
              </CardTitle>
            </div>
          </div>

          <CardContent className="p-4 sm:p-6 pt-4">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('analysis.marketDataNotAvailable')}
              </h3>
              <p className="text-sm text-gray-600">
                {t('analysis.marketDataNotAvailableDescription')}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Usuario es Pro Y hay datos - mostrar contenido completo
  const marketData = analysis.market_comparison;

  // Helper functions with translations
  const getCostBadge = (assessment) => {
    switch (assessment) {
      case 'above_market':
        return { label: t('analysis.aboveMarket'), color: 'bg-red-100 text-red-800 border-red-200' };
      case 'below_market':
        return { label: t('analysis.belowMarket'), color: 'bg-blue-100 text-blue-800 border-blue-200' };
      default:
        return { label: t('analysis.marketRate'), color: 'bg-green-100 text-green-800 border-green-200' };
    }
  };

  const getTermsBadge = (assessment) => {
    switch (assessment) {
      case 'favorable':
        return { label: t('analysis.favorable'), color: 'bg-green-100 text-green-800 border-green-200' };
      case 'unfavorable':
        return { label: t('analysis.unfavorable'), color: 'bg-red-100 text-red-800 border-red-200' };
      default:
        return { label: t('analysis.standard'), color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const costBadge = getCostBadge(marketData.cost_comparison?.assessment);
  const termsBadge = getTermsBadge(marketData.terms_comparison?.assessment);
  const conditionsBadge = getTermsBadge(marketData.conditions_comparison?.assessment);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
      onClick={handleViewMarketComparison}
    >
      <Card className="shadow-lg border-0 bg-white relative">
        {/* Badge - Positioned for mobile first, then adjusted for desktop */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-4 sm:p-6 pb-0">
          <div className="order-1 sm:order-2 mb-3 sm:mb-0">
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold cursor-default text-xs whitespace-nowrap">
              {t('analysis.proFeature')}
            </Badge>
          </div>
          
          <div className="order-2 sm:order-1 flex-1">
            <CardTitle className="flex items-start gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <BarChart3 className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-lg sm:text-xl font-bold break-words">{t('analysis.marketComparisonTitle')}</div>
                <div className="text-xs sm:text-sm font-normal text-gray-500 mt-1">
                  {t('analysis.marketComparisonSubtitle')}
                </div>
              </div>
            </CardTitle>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6 pt-4 space-y-4">
          {/* Cost Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">{t('analysis.costAssessment')}</span>
              <div className="flex items-center gap-2">
                {marketData.cost_comparison?.percentage && (
                  <span className={`text-sm font-bold ${
                    marketData.cost_comparison.assessment === 'above_market' ? 'text-red-600' : 
                    marketData.cost_comparison.assessment === 'below_market' ? 'text-blue-600' : 
                    'text-green-600'
                  }`}>
                    {marketData.cost_comparison.percentage}
                  </span>
                )}
                <Badge className={`${costBadge.color} border-2 font-semibold cursor-default`}>
                  {costBadge.label}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {marketData.cost_comparison?.explanation || t('analysis.noCostComparisonData')}
            </p>
          </motion.div>

          {/* Terms Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">{t('analysis.contractTerms')}</span>
              <Badge className={`${termsBadge.color} border-2 font-semibold cursor-default`}>
                {termsBadge.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {marketData.terms_comparison?.explanation || t('analysis.noTermsComparisonData')}
            </p>
          </motion.div>

          {/* Conditions Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border-2 border-gray-100"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">{t('analysis.contractConditions')}</span>
              <Badge className={`${conditionsBadge.color} border-2 font-semibold cursor-default`}>
                {conditionsBadge.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {marketData.conditions_comparison?.explanation || t('analysis.noConditionsComparisonData')}
            </p>
          </motion.div>

          {/* Overall Verdict */}
          {marketData.summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="p-5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200"
            >
              <div className="flex items-start gap-3">
                {marketData.verdict === 'favorable' ? (
                  <TrendingUp className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                )}
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">{t('analysis.overallMarketVerdict')}</h4>
                  <p className="text-sm text-blue-800 leading-relaxed font-medium">
                    {marketData.summary}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
