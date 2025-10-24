
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Star, TrendingUp, TrendingDown, HelpCircle, 
  CheckCircle2, AlertCircle, AlertTriangle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/components/i18n/I18nProvider';

export default function ScoreCard({ analysis }) {
  const { t } = useTranslation();
  const score = analysis?.overall_score || 0;
  const riskLevel = analysis?.risk_level || "Medium";
  const scoreReasoning = analysis?.score_reasoning || "";
  
  const rating = Math.max(0.5, Math.round((score / 100) * 5 * 2) / 2);

  const getScoreColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = () => {
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-yellow-500 to-orange-600";
    return "from-red-500 to-rose-600";
  };

  const getScoreLabel = () => {
    if (score >= 80) return t('analysis.excellentDescription');
    if (score >= 60) return t('analysis.goodDescription');
    if (score >= 40) return t('analysis.fairDescription');
    return t('analysis.poorDescription');
  };

  const getScoreDescription = (scoreValue) => {
    if (scoreValue >= 80) return t('analysis.excellentDescription');
    if (scoreValue >= 60) return t('analysis.goodDescription');
    if (scoreValue >= 40) return t('analysis.fairDescription');
    return t('analysis.poorDescription');
  };

  const getRiskBadgeColor = () => {
    if (riskLevel === "Low") return "bg-green-100 text-green-800 border-green-200";
    if (riskLevel === "Medium") return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  const getRiskIcon = () => {
    if (riskLevel === "Low") return <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />;
    if (riskLevel === "Medium") return <AlertCircle className="w-7 h-7 sm:w-8 sm:h-8" />;
    return <AlertTriangle className="w-7 h-7 sm:w-8 sm:h-8" />;
  };

  const getRiskDescription = (riskLevelValue) => {
    if (riskLevelValue === "Low") return t('analysis.standardTerms');
    if (riskLevelValue === "Medium") return t('analysis.reviewCarefully');
    return t('analysis.consultAttorney');
  };

  const getRiskDisplayInfo = () => {
    switch (riskLevel) {
      case 'High':
        return { 
          color: getRiskBadgeColor(), 
          icon: getRiskIcon(), 
          label: t('analysis.criticalFilter') + ' ' + t('analysis.riskLevel'),
          gradient: 'from-red-500 to-red-600',
          lightBg: 'bg-red-50'
        };
      case 'Medium':
        return { 
          color: getRiskBadgeColor(), 
          icon: getRiskIcon(), 
          label: t('analysis.warningFilter') + ' ' + t('analysis.riskLevel'),
          gradient: 'from-yellow-500 to-yellow-600',
          lightBg: 'bg-yellow-50'
        };
      case 'Low':
        return { 
          color: getRiskBadgeColor(), 
          icon: getRiskIcon(), 
          label: t('analysis.infoFilter') + ' ' + t('analysis.riskLevel'),
          gradient: 'from-green-500 to-green-600',
          lightBg: 'bg-green-50'
        };
      default:
        return { 
          color: "bg-gray-100 text-gray-800 border-gray-200", 
          icon: <HelpCircle className="w-7 h-7 sm:w-8 sm:h-8" />, 
          label: t('analysis.undetermined'),
          gradient: 'from-gray-500 to-gray-600',
          lightBg: 'bg-gray-50'
        };
    }
  };

  const riskDisplayInfo = getRiskDisplayInfo();
  const currentScoreColor = getScoreColor();
  const scoreTrendIcon = score >= 70 ? <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" /> : <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />;

  return (
    <TooltipProvider>
      <Card className="shadow-2xl border-0 bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="grid sm:grid-cols-3 gap-0">
            {/* Score Section */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center justify-center p-6 sm:p-8 sm:border-r border-gray-200 bg-gradient-to-br from-blue-50 to-white"
            >
              <div className="relative mb-3 sm:mb-4">
                <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-2xl"></div>
                <div className={`relative text-5xl sm:text-6xl lg:text-7xl font-black ${currentScoreColor} flex items-center gap-2`}>
                  {score}
                  <span className="text-2xl sm:text-3xl text-gray-400">/100</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-600 font-semibold text-sm sm:text-base">
                {scoreTrendIcon}
                <span>{t('analysis.overallScore')}</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-4 bg-white shadow-xl border border-gray-200">
                    <div className="space-y-2 text-left">
                      <p className="font-bold text-sm flex items-center gap-1">
                        📊 {t('analysis.scoringSystem')}:
                      </p>
                      <div className="space-y-1 text-xs text-gray-700">
                        <p><strong className="text-green-600">80-100:</strong> {getScoreDescription(80)}</p>
                        <p><strong className="text-yellow-600">60-79:</strong> {getScoreDescription(60)}</p>
                        <p><strong className="text-orange-600">40-59:</strong> {getScoreDescription(40)}</p>
                        <p><strong className="text-red-600">0-39:</strong> {getScoreDescription(30)}</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center max-w-[200px] break-words">
                {scoreReasoning}
              </p>
            </motion.div>

            {/* Rating Section */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center justify-center p-6 sm:p-8 sm:border-r border-gray-200"
            >
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <Star
                      className={`w-8 h-8 sm:w-10 sm:h-10 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  </motion.div>
                ))}
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{rating}/5.0</p>
              <p className="text-sm sm:text-base text-gray-600 mt-1 font-semibold">{t('analysis.rating')}</p>
            </motion.div>

            {/* Risk Level */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`flex flex-col items-center justify-center p-6 sm:p-8 ${riskDisplayInfo.lightBg}`}
            >
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${riskDisplayInfo.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                <div className="text-white flex items-center justify-center">
                  {riskDisplayInfo.icon}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-sm sm:text-base px-4 sm:px-6 py-1.5 sm:py-2 border-2 ${riskDisplayInfo.color} font-semibold cursor-default`}>
                  {riskDisplayInfo.label}
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-gray-400 hover:text-blue-600 transition-colors">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-4 bg-white shadow-xl border border-gray-200">
                    <div className="space-y-2 text-left">
                      <p className="font-bold text-sm flex items-center gap-1">
                        ⚠️ {t('analysis.riskLevels')}:
                      </p>
                      <div className="space-y-1 text-xs text-gray-700">
                        <p><strong className="text-green-600">{t('analysis.infoFilter')} {t('analysis.riskLevel')} (80-100):</strong> {getRiskDescription("Low")}</p>
                        <p><strong className="text-yellow-600">{t('analysis.warningFilter')} {t('analysis.riskLevel')} (50-79):</strong> {getRiskDescription("Medium")}</p>
                        <p><strong className="text-red-600">{t('analysis.criticalFilter')} {t('analysis.riskLevel')} (0-49):</strong> {getRiskDescription("High")}</p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                {t('analysis.riskLevelAssessed')}
              </p>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
