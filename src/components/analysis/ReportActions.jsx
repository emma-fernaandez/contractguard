
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, PlusCircle, Share2, Download, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/components/i18n/I18nProvider';

const ReportActions = ({ contractId, contract, isPreview = false, isShared = false }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isGeneratingShareLink, setIsGeneratingShareLink] = useState(false);

  const handleDownloadPdf = async () => {
    if (!contractId) {
      alert(t('analysis.contractIdNotAvailable'));
      return;
    }

    setIsDownloadingPdf(true);
    try {
      const response = await base44.entities.Contract.downloadPdf(contractId);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const filename = contract?.title ? `${contract.title}-Analysis.pdf` : `contract-analysis-${contractId}.pdf`;

      // Create a link element
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert(t('analysis.pdfDownloadStarted'));
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert(t('analysis.pdfDownloadFailed'));
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleShareByEmail = async () => {
    if (!contract) {
      alert(t('analysis.contractDataNotAvailable'));
      return;
    }
    
    setIsSendingEmail(true);
    
    try {
      // Ensure we have a share token
      let shareToken = contract.share_token;
      
      if (!shareToken) {
        // Generate new share token
        shareToken = crypto.randomUUID();
        await base44.entities.Contract.update(contract.id, {
          share_token: shareToken,
          shared_at: new Date().toISOString()
        });
        // Refresh contract data
        await queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
      }
      
      // Build share URL
      const shareUrl = `${window.location.origin}/AnalysisPreview?share_token=${shareToken}`;
      
      // Extract analysis data
      const analysis = contract.analysis || {};
      const contractTitle = contract.title || t('analysis.contractAnalysis');
      const overallScore = analysis.overall_score || 0;
      const riskLevel = analysis.risk_level || 'Medium';
      const redFlags = analysis.red_flags || [];
      const costBreakdown = analysis.cost_breakdown || {};
      
      // Translate risk level
      const riskLevelMap = {
        'Low': t('analysis.lowRisk'),
        'Medium': t('analysis.mediumRisk'),
        'High': t('analysis.highRisk')
      };
      const riskLevelText = riskLevelMap[riskLevel] || riskLevel;
      
      // Build email subject
      const subject = `${t('analysis.contractAnalysis')}: ${contractTitle}`;
      
      // Build email body
      let body = `${t('analysis.emailGreeting')},\n\n${t('analysis.emailIntro', { contractTitle })}:\n\n`;
      body += `📊 ${t('analysis.emailScore')}: ${overallScore}/100 (${riskLevelText})\n\n`;
      
      // Red flags section
      body += `🚩 ${t('analysis.emailIssuesFound')}: ${redFlags.length}\n`;
      if (redFlags.length > 0) {
        const flagsToShow = redFlags.slice(0, 2);
        flagsToShow.forEach(flag => {
          body += `- ${flag.title}\n`;
        });
        if (redFlags.length > 2) {
          body += `... ${t('analysis.emailAndMoreIssues', { count: redFlags.length - 2 })}\n`;
        }
      } else {
        body += `${t('analysis.emailNoIssues')} ✅\n`;
      }
      body += `\n`;
      
      // Costs section
      if (costBreakdown.initial_costs || costBreakdown.recurring_costs) {
        body += `💰 ${t('analysis.emailCosts')}:\n`;
        if (costBreakdown.initial_costs) {
          body += `- ${t('analysis.emailInitial')}: ${t('common.currencySymbol')}${costBreakdown.initial_costs.toLocaleString()}\n`;
        }
        if (costBreakdown.recurring_costs) {
          const frequency = costBreakdown.recurring_frequency === 'monthly' ? t('analysis.emailMonthly') : t('analysis.emailYearly');
          body += `- ${frequency}: ${t('common.currencySymbol')}${costBreakdown.recurring_costs.toLocaleString()}\n`;
        }
        body += `\n`;
      }
      
      // Share link
      body += `👉 ${t('analysis.emailViewFull')}:\n${shareUrl}\n\n`;
      body += `---\n${t('analysis.emailAnalyzedWith')}\ngetcontractguard.com`;
      
      // Open email client
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;
      
      // Show success feedback
      setTimeout(() => {
        setIsSendingEmail(false);
        // Removed alert here as per the fix to prevent interrupting user flow
      }, 500);
      
    } catch (error) {
      console.error('Error sharing by email:', error);
      alert(t('analysis.emailPreparationFailed'));
      setIsSendingEmail(false);
    }
  };

  const handleGenerateShareLink = async () => {
    if (!contract) {
      alert(t('analysis.contractDataNotAvailable'));
      return;
    }

    setIsGeneratingShareLink(true);
    try {
      let shareToken = contract.share_token;

      if (!shareToken) {
        shareToken = crypto.randomUUID();
        await base44.entities.Contract.update(contract.id, {
          share_token: shareToken,
          shared_at: new Date().toISOString()
        });
        await queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
      }

      const shareUrl = `${window.location.origin}/AnalysisPreview?share_token=${shareToken}`;
      
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        alert(t('analysis.shareLinkCopied'));
      } else {
        // Fallback for browsers that don't support navigator.clipboard
        prompt(t('analysis.copyLinkToShare'), shareUrl);
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      alert(t('analysis.shareLinkGenerationFailed'));
    } finally {
      setIsGeneratingShareLink(false);
    }
  };

  return (
    <Card className="shadow-xl border-0 bg-gradient-to-br from-gray-50 to-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-900">{t('analysis.reportActions')}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {(isPreview || isShared) ? (
          <>
            <Button 
              onClick={handleDownloadPdf}
              variant="outline"
              className="w-full justify-start gap-3 h-14 border-2 hover:border-blue-600 hover:bg-blue-50 transition-all"
              disabled
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Download className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <span className="font-semibold block text-sm text-gray-900">
                  {t('analysis.downloadPdf')}
                </span>
                <span className="text-xs text-gray-500">
                  {t('analysis.requiresAccount')}
                </span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-14 border-2 hover:border-green-600 hover:bg-green-50 transition-all"
              disabled
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <span className="font-semibold block text-sm text-gray-900">{t('analysis.sendByEmail')}</span>
                <span className="text-xs text-gray-500">{t('analysis.requiresAccount')}</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3 h-14 border-2 hover:border-purple-600 hover:bg-purple-50 transition-all"
              disabled
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Share2 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <span className="font-semibold block text-sm text-gray-900">{t('analysis.shareReport')}</span>
                <span className="text-xs text-gray-500">{t('analysis.requiresAccount')}</span>
              </div>
            </Button>
          </>
        ) : (
          <>
            <Button 
              onClick={handleDownloadPdf}
              variant="outline" 
              className="w-full justify-start gap-3 h-14 border-2 hover:border-blue-600 hover:bg-blue-50 transition-all"
              disabled={isDownloadingPdf || !contractId}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                {isDownloadingPdf ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <Download className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div className="text-left">
                <span className="font-semibold block text-sm text-gray-900">
                  {isDownloadingPdf ? t('analysis.preparingPdf') : t('analysis.downloadPdf')}
                </span>
                <span className="text-xs text-gray-500">{t('analysis.fullReport')}</span>
              </div>
            </Button>

            <Button 
              onClick={handleShareByEmail}
              variant="outline" 
              className="w-full justify-start gap-3 h-14 border-2 hover:border-green-600 hover:bg-green-50 transition-all"
              disabled={isSendingEmail || !contract}
            >
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                {isSendingEmail ? (
                  <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                ) : (
                  <Mail className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div className="text-left">
                <span className="font-semibold block text-sm text-gray-900">
                  {isSendingEmail ? t('analysis.preparingEmail') : t('analysis.sendByEmail')}
                </span>
                <span className="text-xs text-gray-500">{t('analysis.shareWithOthers')}</span>
              </div>
            </Button>
            
            <Button 
              onClick={handleGenerateShareLink}
              variant="outline" 
              className="w-full justify-start gap-3 h-14 border-2 hover:border-purple-600 hover:bg-purple-50 transition-all"
              disabled={isGeneratingShareLink || !contract}
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                {isGeneratingShareLink ? (
                  <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                ) : (
                  <Share2 className="w-5 h-5 text-purple-600" />
                )}
              </div>
              <div className="text-left">
                <span className="font-semibold block text-sm text-gray-900">
                  {isGeneratingShareLink ? t('analysis.generatingLink') : t('analysis.shareReport')}
                </span>
                <span className="text-xs text-gray-500">{t('analysis.generatePublicLink')}</span>
              </div>
            </Button>
          </>
        )}
        
        <div className="pt-2 border-t border-gray-200">
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-14 border-2 hover:border-orange-600 hover:bg-orange-50 transition-all"
            onClick={() => navigate(createPageUrl((isPreview || isShared) ? 'TryFree' : 'Upload'))}
          >
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="text-left">
              <span className="font-semibold block text-sm text-gray-900">{t('analysis.analyzeAnotherContract')}</span>
              <span className="text-xs text-gray-500">{t('analysis.uploadNewFile')}</span>
            </div>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportActions;
