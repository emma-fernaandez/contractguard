
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react'; // Changed from FileText to Sparkles
import { motion } from 'framer-motion';
import { useTranslation } from '@/components/i18n/I18nProvider';

export default function QuickSummary({ summary = [] }) { // Changed to function declaration
  const { t } = useTranslation();
  
  // Function to translate summary points from backend
  const translateSummaryPoint = (point) => {
    // Try to find a direct translation first
    const lowerPoint = point.toLowerCase();
    
    // Common patterns to translate
    const translations = {
      'contract terms': t('analysis.summaryTranslations.contract_terms'),
      'payment schedule': t('analysis.summaryTranslations.payment_schedule'),
      'termination clause': t('analysis.summaryTranslations.termination_clause'),
      'liability limitations': t('analysis.summaryTranslations.liability_limitations'),
      'intellectual property': t('analysis.summaryTranslations.intellectual_property'),
      'confidentiality': t('analysis.summaryTranslations.confidentiality'),
      'dispute resolution': t('analysis.summaryTranslations.dispute_resolution'),
      'governing law': t('analysis.summaryTranslations.governing_law'),
      'force majeure': t('analysis.summaryTranslations.force_majeure'),
      'amendment procedures': t('analysis.summaryTranslations.amendment_procedures'),
      'entire agreement': t('analysis.summaryTranslations.entire_agreement'),
      'severability': t('analysis.summaryTranslations.severability'),
      'assignment rights': t('analysis.summaryTranslations.assignment_rights'),
      'warranties': t('analysis.summaryTranslations.warranties'),
      'indemnification': t('analysis.summaryTranslations.indemnification'),
      'insurance requirements': t('analysis.summaryTranslations.insurance_requirements'),
      'compliance obligations': t('analysis.summaryTranslations.compliance_obligations'),
      'performance standards': t('analysis.summaryTranslations.performance_standards'),
      'deliverables': t('analysis.summaryTranslations.deliverables'),
      'timeline': t('analysis.summaryTranslations.timeline'),
      'penalties': t('analysis.summaryTranslations.penalties'),
      'bonuses': t('analysis.summaryTranslations.bonuses'),
      'renewal terms': t('analysis.summaryTranslations.renewal_terms'),
      'default provisions': t('analysis.summaryTranslations.default_provisions'),
      'remedies': t('analysis.summaryTranslations.remedies')
    };
    
    // Check for exact match
    if (translations[lowerPoint]) {
      return translations[lowerPoint];
    }
    
    // Check for partial matches (in case the backend sends longer descriptions)
    for (const [key, translation] of Object.entries(translations)) {
      if (lowerPoint.includes(key)) {
        return point.replace(new RegExp(key, 'gi'), translation);
      }
    }
    
    // If no translation found, return original
    return point;
  };
  
  return (
    <Card className="shadow-xl border-0 bg-white"> {/* Updated className */}
      <CardHeader> {/* Removed className from CardHeader */}
        <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl"> {/* Updated className and structure */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center"> {/* Updated className */}
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> {/* Changed icon and className */}
          </div>
          {t('analysis.quickSummary')}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2"> {/* Added new paragraph */}
          {t('analysis.summaryPointsSubtitle')}
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0"> {/* Kept original className for CardContent */}
        {summary.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-blue-300 to-blue-200"></div>
            
            <div className="space-y-3 sm:space-y-4">
              {summary.map((point, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="relative flex items-center gap-3 sm:gap-4 group"
                >
                  {/* Number badge */}
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white font-black text-base sm:text-lg">{index + 1}</span>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-blue-50 to-white p-3 sm:p-4 rounded-xl border-2 border-blue-100 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                      <p className="text-gray-900 text-sm sm:text-base leading-relaxed font-medium break-words">
                        {translateSummaryPoint(point)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-6 sm:py-8 text-xs sm:text-sm">{t('analysis.noSummaryAvailable')}</p>
        )}
      </CardContent>
    </Card>
  );
}
