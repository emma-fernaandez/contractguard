import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, MessageSquare, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/components/i18n/I18nProvider';

const Recommendations = ({ recommendations = [] }) => {
  const { t } = useTranslation();
  
  // Function to translate recommendation content from backend
  const translateRecommendationContent = (content, type = 'action') => {
    if (!content) return content;
    
    const lowerContent = content.toLowerCase();
    
    // Common patterns to translate
    const translations = {
      'add termination clause': t('analysis.recommendationsTranslations.add_termination_clause'),
      'limit penalties': t('analysis.recommendationsTranslations.limit_penalties'),
      'clarify payment terms': t('analysis.recommendationsTranslations.clarify_payment_terms'),
      'add liability limitation': t('analysis.recommendationsTranslations.add_liability_limitation'),
      'balance intellectual property': t('analysis.recommendationsTranslations.balance_intellectual_property'),
      'strengthen confidentiality': t('analysis.recommendationsTranslations.strengthen_confidentiality'),
      'fair dispute resolution': t('analysis.recommendationsTranslations.fair_dispute_resolution'),
      'favorable governing law': t('analysis.recommendationsTranslations.favorable_governing_law'),
      'define force majeure': t('analysis.recommendationsTranslations.define_force_majeure'),
      'flexible amendments': t('analysis.recommendationsTranslations.flexible_amendments'),
      'comprehensive agreement': t('analysis.recommendationsTranslations.comprehensive_agreement'),
      'preserve severability': t('analysis.recommendationsTranslations.preserve_severability'),
      'allow assignments': t('analysis.recommendationsTranslations.allow_assignments'),
      'reasonable warranties': t('analysis.recommendationsTranslations.reasonable_warranties'),
      'balanced indemnification': t('analysis.recommendationsTranslations.balanced_indemnification'),
      'adequate insurance': t('analysis.recommendationsTranslations.adequate_insurance'),
      'reasonable compliance': t('analysis.recommendationsTranslations.reasonable_compliance'),
      'clear performance': t('analysis.recommendationsTranslations.clear_performance'),
      'specific deliverables': t('analysis.recommendationsTranslations.specific_deliverables'),
      'realistic timeline': t('analysis.recommendationsTranslations.realistic_timeline'),
      'reasonable penalties': t('analysis.recommendationsTranslations.reasonable_penalties'),
      'fair bonus terms': t('analysis.recommendationsTranslations.fair_bonus_terms'),
      'flexible renewal': t('analysis.recommendationsTranslations.flexible_renewal'),
      'gradual default': t('analysis.recommendationsTranslations.gradual_default'),
      'comprehensive remedies': t('analysis.recommendationsTranslations.comprehensive_remedies')
    };
    
    // Check for exact match
    if (translations[lowerContent]) {
      return translations[lowerContent];
    }
    
    // Check for partial matches (in case the backend sends longer descriptions)
    for (const [key, translation] of Object.entries(translations)) {
      if (lowerContent.includes(key)) {
        return content.replace(new RegExp(key, 'gi'), translation);
      }
    }
    
    // If no translation found, return original
    return content;
  };
  
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'High': 
        return { 
          color: 'bg-red-100 text-red-700 border-red-200', 
          gradient: 'from-red-50 to-white',
          icon: '🔥'
        };
      case 'Medium': 
        return { 
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
          gradient: 'from-yellow-50 to-white',
          icon: '⚠️'
        };
      case 'Low': 
        return { 
          color: 'bg-blue-100 text-blue-700 border-blue-200', 
          gradient: 'from-blue-50 to-white',
          icon: 'ℹ️'
        };
      default: 
        return { 
          color: 'bg-gray-100 text-gray-700 border-gray-200', 
          gradient: 'from-gray-50 to-white',
          icon: '📌'
        };
    }
  };

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-start gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <Lightbulb className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg sm:text-xl font-bold break-words">{t('analysis.recommendationsTitle')}</div>
            <div className="text-xs sm:text-sm font-normal text-gray-500 mt-1">
              {t('analysis.recommendationsSubtitle')}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {recommendations.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {recommendations.map((rec, index) => {
              const priorityInfo = getPriorityInfo(rec.priority);
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-2 p-4 sm:p-5 rounded-xl bg-gradient-to-br ${priorityInfo.gradient} hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{priorityInfo.icon}</span>
                      <p className="font-bold text-gray-900 text-base sm:text-lg break-words">{translateRecommendationContent(rec.action)}</p>
                    </div>
                    <Badge className={`${priorityInfo.color} font-semibold text-xs flex-shrink-0`}>
                      {rec.priority}
                    </Badge>
                  </div>
                  {rec.suggested_language && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white rounded-lg border-2 border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        <p className="text-xs sm:text-sm font-semibold text-gray-700">{t('analysis.suggestedLanguage')}:</p>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-800 italic leading-relaxed pl-4 sm:pl-6 border-l-4 border-blue-500 break-words">
                        {translateRecommendationContent(rec.suggested_language)}
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">{t('analysis.noRecommendations')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Recommendations;