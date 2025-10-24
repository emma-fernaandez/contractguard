import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, Download, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/components/i18n/I18nProvider';

const ImprovedContractCallout = ({ totalChanges, onDownload, isDownloading }) => {
  const { t } = useTranslation();
  
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-200 rounded-full filter blur-3xl opacity-20 -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200 rounded-full filter blur-3xl opacity-20 -ml-32 -mb-32"></div>
      
      <CardContent className="p-6 sm:p-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="flex-shrink-0">
            <motion.div
              animate={{ 
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1
              }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-xl"
            >
              <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </motion.div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                ✨ {t('analysis.improvedVersionAvailable')}
              </h3>
            </div>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              {t('analysis.improvedVersionSubtitle', { totalChanges })}
            </p>
          </div>
          
          <div className="flex-shrink-0 w-full sm:w-auto">
            <Button
              onClick={onDownload}
              disabled={isDownloading}
              size="lg"
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all gap-2 text-base font-semibold"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('analysis.generating')}
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  {t('analysis.downloadImprovedContract')}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImprovedContractCallout;