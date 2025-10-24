import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Sparkles, Lock, Loader2 } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslation } from '@/components/i18n/I18nProvider';

const ImprovedContractDownload = ({ 
  isPro, 
  hasImprovedContract, 
  hasImprovedContractInterface,
  isDownloading, 
  onDownload, 
  onUpgradeClick,
  totalChanges 
}) => {
  const { t } = useTranslation();
  
  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg font-bold text-gray-900 gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
            <span className="truncate">{t('analysis.improvedContract')}</span>
          </div>
          <Badge className="bg-purple-600 text-white font-semibold text-xs whitespace-nowrap flex-shrink-0 cursor-default">
            {t('analysis.proFeature')}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-3">
        {hasImprovedContractInterface && hasImprovedContract && (
          <p className="text-sm text-gray-700 leading-relaxed">
            {t('analysis.improvedContractDescription', { totalChanges })}
          </p>
        )}

        {!isPro && (
          <p className="text-sm text-gray-700 leading-relaxed">
            {t('analysis.improvedContractUpgradeDescription')}
          </p>
        )}

        {hasImprovedContractInterface && !hasImprovedContract && (
          <p className="text-sm text-gray-700 leading-relaxed">
            {t('analysis.improvedContractReadyToGenerate')}
          </p>
        )}

        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <div>
                <Button
                  onClick={() => {
                    if (!isPro) {
                      onUpgradeClick();
                    } else {
                      onDownload();
                    }
                  }}
                  disabled={isDownloading || !hasImprovedContractInterface}
                  className={`w-full justify-start gap-3 h-14 border-0 transition-all ${
                    hasImprovedContractInterface
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-purple-100 to-blue-100 hover:from-purple-200 hover:to-blue-200 text-purple-700 border-2 border-purple-300'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    hasImprovedContractInterface
                      ? 'bg-white/20'
                      : 'bg-purple-200'
                  }`}>
                    {isDownloading ? (
                      <Loader2 className={`w-5 h-5 animate-spin ${hasImprovedContractInterface ? 'text-white' : 'text-purple-600'}`} />
                    ) : !isPro ? (
                      <Lock className="w-5 h-5 text-purple-600" />
                    ) : (
                      <>
                        <FileText className="w-5 h-5 text-white" />
                      </>
                    )}
                  </div>
                  <div className="text-left flex-1">
                    <span className="font-semibold block text-sm">
                      {isDownloading 
                        ? t('analysis.generating') 
                        : !isPro 
                        ? t('analysis.unlockImprovedVersion')
                        : hasImprovedContract
                        ? t('analysis.downloadImprovedContract')
                        : t('analysis.downloadImprovedContract')}
                    </span>
                    {!isPro && (
                      <span className="text-xs opacity-90">
                        {t('analysis.upgradeToProToAccess')}
                      </span>
                    )}
                  </div>
                  {!isPro && <Sparkles className="w-5 h-5 text-purple-600" />}
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent className="z-[9999]">
              <p>
                {!isPro
                  ? t('analysis.tooltipUpgradeToPro')
                  : t('analysis.tooltipDownloadImproved')}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {hasImprovedContractInterface && hasImprovedContract && (
          <div className="pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>{t('analysis.note')}:</strong> {t('analysis.improvedContractDisclaimer')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImprovedContractDownload;