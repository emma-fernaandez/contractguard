
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n/I18nProvider';

const ProFeaturesCta = ({ onUpgradeClick }) => {
  const { t } = useTranslation();

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-400 via-purple-500 to-violet-600 overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDZwdjJoLTYweiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30"></div>
      
      <CardContent className="p-5 sm:p-6 text-center relative z-10">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl"
        >
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500" />
        </motion.div>
        
        <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
          {t('proFeaturesCta.title')}
        </h3>
        <p className="text-xs sm:text-sm text-purple-100 mb-4 sm:mb-5 font-medium">
          {t('proFeaturesCta.subtitle')}
        </p>
        
        <div className="space-y-2 mb-4 sm:mb-5">
          <div className="flex items-center justify-between p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs sm:text-sm cursor-default">
            <span className="font-medium">{t('proFeaturesCta.downloadImprovedVersion')}</span>
            <Lock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          </div>
          <div className="flex items-center justify-between p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs sm:text-sm cursor-default">
            <span className="font-medium">{t('proFeaturesCta.chatAboutContract')}</span>
            <Lock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          </div>
          <div className="flex items-center justify-between p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-lg text-white text-xs sm:text-sm cursor-default">
            <span className="font-medium">{t('proFeaturesCta.unlimitedAnalyses')}</span>
            <Lock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          </div>
        </div>
        
        <Button 
          onClick={onUpgradeClick} 
          className="w-full bg-white text-purple-600 hover:bg-purple-50 font-bold text-base sm:text-lg py-5 sm:py-6 shadow-xl"
        >
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          {t('proFeaturesCta.upgradeToPro')}
        </Button>
        
        <p className="text-[10px] sm:text-xs text-purple-100 mt-2 sm:mt-3">
          {t('proFeaturesCta.fromOnly')}
        </p>
      </CardContent>
    </Card>
  );
};

export default ProFeaturesCta;
