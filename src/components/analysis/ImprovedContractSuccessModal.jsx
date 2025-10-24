import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle2, AlertCircle, Users, Scale } from 'lucide-react';
import { useTranslation } from '@/components/i18n/I18nProvider';

const ImprovedContractSuccessModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center">
            {t('analysis.contractDownloadedTitle')}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {t('analysis.contractDownloadedDescription')}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 mb-1">{t('analysis.importantLegalNotice')}</p>
                <p className="text-sm text-amber-800">
                  {t('analysis.legalNoticeDescription')}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
              {t('analysis.nextSteps')}
            </h4>
            
            <div className="space-y-2 pl-7">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
                <p className="text-sm text-gray-700">{t('analysis.reviewChangesCarefully')}</p>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-gray-600" />
                  <p className="text-sm text-gray-700">{t('analysis.consultWithAttorney')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">3</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <p className="text-sm text-gray-700">{t('analysis.discussModifications')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">4</span>
                </div>
                <p className="text-sm text-gray-700">{t('analysis.ensureLegalValidity')}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-center gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {t('analysis.viewAnalysisAgain')}
          </Button>
          <Button
            onClick={onClose}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {t('analysis.gotIt')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImprovedContractSuccessModal;