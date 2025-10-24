import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, RefreshCw, AlertCircle, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/components/i18n/I18nProvider';

const CostBreakdown = ({ costs = {} }) => {
  const { t, language } = useTranslation();
  const { 
    initial_costs = [], 
    recurring_costs = [], 
    recurring_frequency = 'monthly', 
    potential_penalties = 0, 
    total_first_year = 0 
  } = costs;

  const formatCurrency = (value) => {
    const currencySymbol = t('common.currencySymbol');
    return `${currencySymbol}${value.toLocaleString('en-US')}`;
  };

  // Calculate totals
  const totalInitial = Array.isArray(initial_costs) 
    ? initial_costs.reduce((sum, cost) => sum + (cost.amount || 0), 0)
    : 0;
    
  const totalRecurring = Array.isArray(recurring_costs)
    ? recurring_costs.reduce((sum, cost) => sum + (cost.amount || 0), 0)
    : 0;
  
  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="pb-4 p-6">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5 text-white" />
          </div>
          <span>{t('analysis.costBreakdownTitle')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-6 pt-0">
        {/* Initial Costs */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-gray-700 font-medium text-sm">{t('analysis.initialCosts')}</span>
          </div>
          
          {Array.isArray(initial_costs) && initial_costs.length > 0 ? (
            <div className="ml-13 space-y-1">
              {initial_costs.map((cost, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{cost.concept}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(cost.amount)}</span>
                </div>
              ))}
              <div className="border-t border-blue-200 mt-2 pt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-bold text-gray-900 text-xl">{formatCurrency(totalInitial)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="font-bold text-gray-900 text-xl ml-13">{formatCurrency(0)}</p>
          )}
        </motion.div>

        {/* Recurring Costs */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-gradient-to-r from-purple-50 to-white rounded-xl border border-purple-100"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <span className="text-gray-700 font-medium text-sm block">{t('analysis.recurringCosts')}</span>
              <span className="text-xs text-gray-500">({recurring_frequency === 'monthly' ? t('analysis.monthly') : t('analysis.yearly')})</span>
            </div>
          </div>
          
          {Array.isArray(recurring_costs) && recurring_costs.length > 0 ? (
            <div className="ml-13 space-y-1">
              {recurring_costs.map((cost, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{cost.concept}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(cost.amount)}</span>
                </div>
              ))}
              <div className="border-t border-purple-200 mt-2 pt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-900">Total:</span>
                  <span className="font-bold text-gray-900 text-xl">{formatCurrency(totalRecurring)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="font-bold text-gray-900 text-xl ml-13">{formatCurrency(0)}</p>
          )}
        </motion.div>

        {/* Potential Penalties */}
        {potential_penalties > 0 && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-gradient-to-r from-red-50 to-white rounded-xl border-2 border-red-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-red-700 font-medium text-sm">{t('analysis.potentialPenalties')}</span>
            </div>
            <p className="font-bold text-red-800 text-xl ml-13">{formatCurrency(potential_penalties)}</p>
          </motion.div>
        )}

        {/* Separator */}
        <div className="border-t-2 border-gray-200 my-3" />

        {/* Estimated Total */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg text-white"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-medium text-sm block">{t('analysis.estimatedTotal')}</span>
              <span className="text-xs text-blue-100">{t('analysis.firstYear')}</span>
            </div>
          </div>
          <p className="font-bold text-white text-xl ml-13">{formatCurrency(total_first_year)}</p>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default CostBreakdown;