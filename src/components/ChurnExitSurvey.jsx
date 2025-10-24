import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Frown, Meh, Smile } from 'lucide-react';
import { useTranslation } from './i18n/I18nProvider';

const ChurnExitSurvey = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting = false 
}) => {
  const { t } = useTranslation();
  const [cancellationReason, setCancellationReason] = useState('');
  const [feedback, setFeedback] = useState('');
  const [npsScore, setNpsScore] = useState(null);

  const cancellationReasons = [
    { value: 'too_expensive', label: t('churn.reasonTooExpensive') },
    { value: 'not_using_enough', label: t('churn.reasonNotUsing') },
    { value: 'found_alternative', label: t('churn.reasonFoundAlternative') },
    { value: 'missing_features', label: t('churn.reasonMissingFeatures') },
    { value: 'technical_issues', label: t('churn.reasonTechnicalIssues') },
    { value: 'poor_results', label: t('churn.reasonPoorResults') },
    { value: 'temporary_pause', label: t('churn.reasonTemporaryPause') },
    { value: 'other', label: t('churn.reasonOther') }
  ];

  const handleSubmit = () => {
    if (!cancellationReason) {
      alert(t('churn.pleaseSelectReason'));
      return;
    }

    if (npsScore === null) {
      alert(t('churn.pleaseProvideNPS'));
      return;
    }

    onSubmit({
      cancellation_reason: cancellationReason,
      feedback: feedback.trim(),
      nps_score: npsScore
    });
  };

  const getNPSColor = (score) => {
    if (score <= 6) return 'text-red-600';
    if (score <= 8) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getNPSIcon = (score) => {
    if (score <= 6) return <Frown className="w-5 h-5" />;
    if (score <= 8) return <Meh className="w-5 h-5" />;
    return <Smile className="w-5 h-5" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t('churn.title')}</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {t('churn.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cancellation Reason */}
          <div className="space-y-3">
            <Label htmlFor="reason" className="text-base font-semibold">
              {t('churn.whyCancelling')} *
            </Label>
            <Select value={cancellationReason} onValueChange={setCancellationReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder={t('churn.selectReason')} />
              </SelectTrigger>
              <SelectContent>
                {cancellationReasons.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* NPS Score */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              {t('churn.npsQuestion')} *
            </Label>
            <p className="text-sm text-gray-600">
              {t('churn.npsScale')}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                <button
                  key={score}
                  onClick={() => setNpsScore(score)}
                  className={`w-12 h-12 rounded-lg border-2 font-semibold transition-all ${
                    npsScore === score
                      ? 'border-blue-600 bg-blue-600 text-white scale-110'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {score}
                </button>
              ))}
            </div>
            {npsScore !== null && (
              <div className={`flex items-center gap-2 ${getNPSColor(npsScore)}`}>
                {getNPSIcon(npsScore)}
                <span className="font-medium">
                  {npsScore <= 6 && t('churn.npsDetractor')}
                  {npsScore > 6 && npsScore <= 8 && t('churn.npsPassive')}
                  {npsScore > 8 && t('churn.npsPromoter')}
                </span>
              </div>
            )}
          </div>

          {/* Feedback */}
          <div className="space-y-3">
            <Label htmlFor="feedback" className="text-base font-semibold">
              {t('churn.additionalFeedback')}
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t('churn.feedbackPlaceholder')}
              className="h-32 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {t('common.keepSubscription')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !cancellationReason || npsScore === null}
            variant="destructive"
            className="w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('churn.processing')}
              </>
            ) : (
              t('churn.confirmCancellation')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChurnExitSurvey;