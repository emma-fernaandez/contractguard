import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, XCircle, Info, AlertCircle, CheckCircle2, TrendingDown, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/components/i18n/I18nProvider';

export default function RedFlags({ flags = [] }) {
  const { t } = useTranslation();
  const [selectedSeverity, setSelectedSeverity] = useState("All");
  const [expandedFlags, setExpandedFlags] = useState({});

  // Function to translate red flag content from backend
  const translateRedFlagContent = (content, type = 'title') => {
    if (!content) return content;
    
    const lowerContent = content.toLowerCase();
    
    // Common patterns to translate
    const translations = {
      'unfair termination': t('analysis.redFlagsTranslations.unfair_termination'),
      'excessive penalties': t('analysis.redFlagsTranslations.excessive_penalties'),
      'unclear payment terms': t('analysis.redFlagsTranslations.unclear_payment_terms'),
      'missing liability limitation': t('analysis.redFlagsTranslations.missing_liability_limitation'),
      'unfair intellectual property': t('analysis.redFlagsTranslations.unfair_intellectual_property'),
      'confidentiality breach': t('analysis.redFlagsTranslations.confidentiality_breach'),
      'dispute resolution bias': t('analysis.redFlagsTranslations.dispute_resolution_bias'),
      'governing law unfavorable': t('analysis.redFlagsTranslations.governing_law_unfavorable'),
      'force majeure abuse': t('analysis.redFlagsTranslations.force_majeure_abuse'),
      'amendment restrictions': t('analysis.redFlagsTranslations.amendment_restrictions'),
      'entire agreement loophole': t('analysis.redFlagsTranslations.entire_agreement_loophole'),
      'severability issues': t('analysis.redFlagsTranslations.severability_issues'),
      'assignment restrictions': t('analysis.redFlagsTranslations.assignment_restrictions'),
      'warranty disclaimers': t('analysis.redFlagsTranslations.warranty_disclaimers'),
      'indemnification burden': t('analysis.redFlagsTranslations.indemnification_burden'),
      'insurance gaps': t('analysis.redFlagsTranslations.insurance_gaps'),
      'compliance burden': t('analysis.redFlagsTranslations.compliance_burden'),
      'performance standards unclear': t('analysis.redFlagsTranslations.performance_standards_unclear'),
      'deliverable ambiguity': t('analysis.redFlagsTranslations.deliverable_ambiguity'),
      'timeline unrealistic': t('analysis.redFlagsTranslations.timeline_unrealistic'),
      'penalty excessive': t('analysis.redFlagsTranslations.penalty_excessive'),
      'bonus conditions': t('analysis.redFlagsTranslations.bonus_conditions'),
      'renewal automatic': t('analysis.redFlagsTranslations.renewal_automatic'),
      'default acceleration': t('analysis.redFlagsTranslations.default_acceleration'),
      'remedy limitations': t('analysis.redFlagsTranslations.remedy_limitations')
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

  const toggleFlag = (index) => {
    setExpandedFlags(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "Critical":
        return <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "Warning":
        return <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />;
      case "Info":
        return <Info className="w-4 h-4 sm:w-5 sm:h-5" />;
      default:
        return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "Warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Info":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredFlags = selectedSeverity === "All"
    ? flags
    : flags.filter(flag => flag.severity === selectedSeverity);

  if (!flags || flags.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            {t('analysis.noMajorIssues')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {t('analysis.noMajorIssuesDescription')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const criticalCount = flags.filter(f => f.severity === 'Critical').length;
  const warningCount = flags.filter(f => f.severity === 'Warning').length;
  const infoCount = flags.filter(f => f.severity === 'Info').length;

  return (
    <Card className="border-0 shadow-lg bg-white">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <CardTitle className="flex items-start gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg sm:text-xl font-bold break-words">{t('analysis.issuesFoundTitle')} ({flags.length})</div>
              <div className="text-xs sm:text-sm font-normal text-gray-500 mt-1">
                {t('analysis.issuesFoundSubtitle', { critical: criticalCount, warnings: warningCount, info: infoCount })}
              </div>
            </div>
          </CardTitle>

          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('analysis.filterBySeverity')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">{t('analysis.all')} ({flags.length})</SelectItem>
              {criticalCount > 0 && <SelectItem value="Critical">{t('analysis.criticalFilter')} ({criticalCount})</SelectItem>}
              {warningCount > 0 && <SelectItem value="Warning">{t('analysis.warningFilter')} ({warningCount})</SelectItem>}
              {infoCount > 0 && <SelectItem value="Info">{t('analysis.infoFilter')} ({infoCount})</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-0">
        {filteredFlags.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            <AnimatePresence>
              {filteredFlags.map((flag, index) => {
                const isExpanded = expandedFlags[index];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className={`bg-gray-50 rounded-xl border-l-4 ${flag.severity === 'Critical' ? 'border-red-500' : flag.severity === 'Warning' ? 'border-yellow-500' : 'border-blue-500'} overflow-hidden`}
                  >
                    {/* Header - Always Visible */}
                    <button
                      onClick={() => toggleFlag(index)}
                      className="w-full p-4 sm:p-6 text-left hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="font-bold text-base sm:text-lg text-gray-900">{translateRedFlagContent(flag.title)}</h3>
                            <Badge className={`${getSeverityColor(flag.severity)} flex items-center gap-1 text-xs sm:text-sm px-2 py-1`}>
                              {getSeverityIcon(flag.severity)}
                              {flag.severity === 'Critical' ? t('analysis.critical') : 
                               flag.severity === 'Warning' ? t('analysis.warnings') : 
                               flag.severity === 'Info' ? t('analysis.informational') : flag.severity}
                            </Badge>
                          </div>
                          {flag.location && (
                            <p className="text-xs sm:text-sm text-gray-500">{t('analysis.location')} {flag.location}</p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expandable Content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                {t('analysis.problem')}
                              </h4>
                              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{translateRedFlagContent(flag.problem)}</p>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
                              <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                                <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0" />
                                {t('analysis.impact')}
                              </h4>
                              <p className="text-xs sm:text-sm text-red-800 leading-relaxed">{translateRedFlagContent(flag.impact)}</p>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                              <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                                <Lightbulb className="w-4 h-4 text-green-600 flex-shrink-0" />
                                {t('analysis.solution')}
                              </h4>
                              <p className="text-xs sm:text-sm text-green-800 leading-relaxed">{translateRedFlagContent(flag.fix)}</p>
                            </div>

                            {flag.standard && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm sm:text-base">
                                  <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                  {t('analysis.marketStandard')}
                                </h4>
                                <p className="text-xs sm:text-sm text-blue-800 leading-relaxed">{translateRedFlagContent(flag.standard)}</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8 text-sm sm:text-base">{t('analysis.noIssuesFound')}</p>
        )}
      </CardContent>
    </Card>
  );
}