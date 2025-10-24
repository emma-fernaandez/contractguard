
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Clock,
  AlertTriangle,
  Share2,
  Printer,
  Check,
  Mail,
  Loader2,
  Trash2,
  FileText,
  Sparkles,
  Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ScoreCard from "../components/analysis/ScoreCard";
import QuickSummary from "../components/analysis/QuickSummary";
import RedFlags from "../components/analysis/RedFlags";
import CostBreakdown from "../components/analysis/CostBreakdown";
import Recommendations from "../components/analysis/Recommendations";
import ProFeaturesCta from "../components/analysis/ProFeaturesCta";
import ReportActions from "../components/analysis/ReportActions";
import UpgradeModal from "../components/analysis/UpgradeModal";
import DeleteConfirmModal from "../components/analysis/DeleteConfirmModal";
import MarketComparison from "../components/analysis/MarketComparison";
import ImprovedContractCallout from "../components/analysis/ImprovedContractCallout";
import ImprovedContractSuccessModal from "../components/analysis/ImprovedContractSuccessModal";
import ImprovedContractDownload from "../components/analysis/ImprovedContractDownload"; // Added import
import { format } from "date-fns";
import { es, it } from "date-fns/locale";
import { useToast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "@/components/i18n/I18nProvider";

// Import print styles
import "../styles/print.css";

// Base44 decoding function (custom implementation for base44.com)
function decodeBase44(str) {
  console.log('Attempting base44 decode for string length:', str.length);
  console.log('First 50 characters:', str.substring(0, 50));
  
  // Base44 uses 44 characters: A-Z, a-z, 0-9, +, /
  const base44Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const base44Map = {};
  
  // Create mapping
  for (let i = 0; i < base44Chars.length; i++) {
    base44Map[base44Chars[i]] = i;
  }
  
  let result = [];
  let bits = 0;
  let value = 0;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '=') break; // Padding character
    
    if (!(char in base44Map)) {
      console.error(`Invalid base44 character at position ${i}: "${char}" (char code: ${char.charCodeAt(0)})`);
      throw new Error(`Invalid base44 character: ${char}`);
    }
    
    value = (value << 6) | base44Map[char];
    bits += 6;
    
    while (bits >= 8) {
      result.push((value >> (bits - 8)) & 0xFF);
      bits -= 8;
    }
  }
  
  console.log('Base44 decode successful, result length:', result.length);
  return new Uint8Array(result);
}

// Function to validate PDF data
function validatePdfData(data) {
  if (!data || data.length === 0) {
    return { valid: false, error: 'No data provided' };
  }
  
  // Check PDF header
  if (data.length < 4) {
    return { valid: false, error: 'Data too short to be a valid PDF' };
  }
  
  const header = String.fromCharCode(...data.slice(0, 4));
  if (header !== '%PDF') {
    return { valid: false, error: `Invalid PDF header: "${header}"` };
  }
  
  // Check for PDF end marker
  const dataStr = String.fromCharCode(...data);
  if (!dataStr.includes('%%EOF')) {
    console.warn('Warning: PDF does not contain %%EOF marker');
  }
  
  return { valid: true };
}

export default function AnalysisPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t, language } = useTranslation();
  
  // Get the correct locale for date formatting
  const getLocale = () => {
    switch (language) {
      case 'es': return es;
      case 'it': return it;
      default: return undefined; // English is default
    }
  };
  const urlParams = new URLSearchParams(window.location.search);
  const contractId = urlParams.get('id');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [shareButtonText, setShareButtonText] = useState(t('analysis.share'));
  const [isSharing, setIsSharing] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingImproved, setIsDownloadingImproved] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const { data: contract, isLoading } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: async () => {
      if (!contractId) return null;
      const contracts = await base44.entities.Contract.filter({ id: contractId });
      return contracts[0] || null;
    },
    enabled: !!contractId,
  });

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.Contract.delete(id);
    },
    onSuccess: () => {
      toast({
        title: t('analysis.analysisDeleted'),
        description: t('analysis.analysisDeletedDescription'),
      });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['all-contracts'] });
      navigate(createPageUrl('MyAnalyses'));
    },
    onError: () => {
      toast({
        title: t('analysis.deleteFailed'),
        description: t('analysis.deleteFailedDescription'),
        variant: "destructive",
      });
    },
  });

  const shareMutation = useMutation({
    mutationFn: async (contractId) => {
      const shareToken = crypto.randomUUID();
      await base44.entities.Contract.update(contractId, {
        share_token: shareToken,
        shared_at: new Date().toISOString()
      });
      return shareToken;
    },
    onSuccess: (shareToken) => {
      const shareUrl = `${window.location.origin}/AnalysisPreview?share_token=${shareToken}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareButtonText(t('analysis.linkCopied'));
        setTimeout(() => {
          setShareButtonText(t('analysis.share'));
        }, 3000);
      }).catch(() => {
        alert(`${t('analysis.shareThisLink')}:\n${shareUrl}`);
      }).finally(() => {
        setIsSharing(false);
      });
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
    },
    onError: (error) => {
      console.error('Error sharing analysis:', error);
      toast({
        title: t('analysis.shareFailed'),
        description: t('analysis.shareFailedDescription'),
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSharing(false);
    }
  });

  const handleShare = async () => {
    if (!contract) return;
    setIsSharing(true);
    
    // Track feature usage
    base44.functions.invoke('trackFeatureUsage', {
      featureName: 'share_analysis',
      analysisId: contract.id,
      success: true,
      metadata: {
        contract_type: contract.type,
        plan: user?.plan || 'free',
        source_page: 'analysis',
        share_method: 'link'
      }
    }).catch(err => console.error('Failed to track feature usage:', err));

    if (contract.share_token) {
      const shareUrl = `${window.location.origin}/AnalysisPreview?share_token=${contract.share_token}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareButtonText(t('analysis.linkCopied'));
        setTimeout(() => {
          setShareButtonText(t('analysis.share'));
        }, 3000);
      }).catch(() => {
        alert(`${t('analysis.shareThisLink')}:\n${shareUrl}`);
      }).finally(() => {
        setIsSharing(false);
      });
    } else {
      shareMutation.mutate(contract.id);
    }
  };

  const handleShareByEmail = async () => {
    if (!contract) return;
    setIsSendingEmail(true);
    
    // Track feature usage
    base44.functions.invoke('trackFeatureUsage', {
      featureName: 'share_by_email',
      analysisId: contract.id,
      success: true,
      metadata: {
        contract_type: contract.type,
        plan: user?.plan || 'free',
        source_page: 'analysis',
        share_method: 'email'
      }
    }).catch(err => console.error('Failed to track feature usage:', err));

    try {
      let shareToken = contract.share_token;
      if (!shareToken) {
        const newToken = crypto.randomUUID();
        await base44.entities.Contract.update(contract.id, {
          share_token: newToken,
          shared_at: new Date().toISOString()
        });
        shareToken = newToken;
        await queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
      }

      const shareUrl = `${window.location.origin}/AnalysisPreview?share_token=${shareToken}`;
      const analysis = contract.analysis || {};
      const contractTitle = contract.title || t('analysis.contractAnalysis');
      const overallScore = analysis.overall_score || 0;
      const riskLevel = analysis.risk_level || 'Medium';
      const redFlags = analysis.red_flags || [];
      const costBreakdown = analysis.cost_breakdown || {};

      const riskLevelMap = {
        'Low': t('analysis.lowRisk'),
        'Medium': t('analysis.mediumRisk'),
        'High': t('analysis.highRisk')
      };
      const riskLevelText = riskLevelMap[riskLevel] || riskLevel;

      const subject = `${t('analysis.contractAnalysis')}: ${contractTitle}`;

      let body = `${t('analysis.emailGreeting')},\n\n${t('analysis.emailIntro', { contractTitle })}:\n\n`;
      body += `📊 ${t('analysis.emailScore')}: ${overallScore}/100 (${riskLevelText})\n\n`;
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

      if (costBreakdown.initial_costs || costBreakdown.recurring_costs) {
        body += `💰 ${t('analysis.emailCosts')}:\n`;
        if (costBreakdown.initial_costs) {
          body += `- ${t('analysis.emailInitial')}: ${t('common.currencySymbol')}${costBreakdown.initial_costs.toLocaleString('en-US')}\n`;
        }
        if (costBreakdown.recurring_costs) {
          const frequency = costBreakdown.recurring_frequency === 'monthly' ? t('analysis.emailMonthly') : t('analysis.emailYearly');
          body += `- ${frequency}: ${t('common.currencySymbol')}${costBreakdown.recurring_costs.toLocaleString('en-US')}\n`;
        }
        body += `\n`;
      }

      body += `👉 ${t('analysis.emailViewFull')}:\n${shareUrl}\n\n`;
      body += `---\n${t('analysis.emailAnalyzedWith')}\ngetcontractguard.com`;

      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoUrl;

      setTimeout(() => {
        setIsSendingEmail(false);
      }, 500);
    } catch (error) {
      console.error('Error sharing by email:', error);
      
      // Track failed usage
      base44.functions.invoke('trackFeatureUsage', {
        featureName: 'share_by_email',
        analysisId: contract.id,
        success: false,
        errorMessage: error.message,
        metadata: {
          contract_type: contract.type,
          plan: user?.plan || 'free',
          source_page: 'analysis',
          share_method: 'email'
        }
      }).catch(err => console.error('Failed to track feature usage:', err));
      
      toast({
        title: t('analysis.emailShareFailed'),
        description: t('analysis.emailShareFailedDescription'),
        variant: "destructive",
      });
      setIsSendingEmail(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!contract) return;
    setIsDownloadingPdf(true);
    
    // Track feature usage
    const trackingPromise = base44.functions.invoke('trackFeatureUsage', {
      featureName: 'export_pdf',
      analysisId: contract.id,
      success: true,
      metadata: {
        contract_type: contract.type,
        plan: user?.plan || 'free',
        source_page: 'analysis'
      }
    }).catch(err => console.error('Failed to track feature usage:', err));

    try {
      // Device detection
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
      const isMobileWidth = window.innerWidth <= 768;
      const isMobile = isMobileUA || isMobileWidth;

      const currentLanguage = language || 'en-US';
      const formatCurrency = (amount) => {
        try {
          return new Intl.NumberFormat(currentLanguage, { style: 'currency', currency: 'EUR' }).format(Number(amount || 0));
        } catch {
          return `${amount}`;
        }
      };

      const analysis = contract.analysis || {};

      const analysisHtml = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; max-width: 900px; margin: 0 auto; padding: 40px 30px; line-height: 1.6;">
    
    <!-- HEADER PROFESIONAL CON LOGO -->
    <div style="border-bottom: 3px solid #2563eb; padding-bottom: 30px; margin-bottom: 40px;">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div style="flex: 1;">
          <div style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 8px 16px; border-radius: 6px; font-size: 11pt; font-weight: 600; margin-bottom: 12px;">
            ContractGuard
          </div>
          <h1 style="color: #1a1a1a; margin: 12px 0 8px 0; font-size: 32pt; font-weight: 700; letter-spacing: -0.5px;">
            ${contract.title || 'Contract Analysis'}
          </h1>
          <p style="color: #6b7280; margin: 0; font-size: 11pt;">
            ${t('analysis.analyzedOn')}: ${new Date(contract.created_date).toLocaleDateString(currentLanguage, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style="text-align: right;">
          <div style="background: ${analysis.overall_score >= 80 ? '#dcfce7' : analysis.overall_score >= 60 ? '#fef3c7' : '#fee2e2'}; padding: 20px; border-radius: 12px; min-width: 140px;">
            <div style="font-size: 48pt; font-weight: 900; color: ${analysis.overall_score >= 80 ? '#16a34a' : analysis.overall_score >= 60 ? '#ca8a04' : '#dc2626'}; line-height: 1;">
              ${analysis.overall_score}
            </div>
            <div style="font-size: 11pt; color: #6b7280; font-weight: 600; margin-top: 8px;">
              ${t('analysis.overallScore')}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- EXECUTIVE SUMMARY CARD -->
    <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 30px;">
      <h2 style="color: #1e293b; font-size: 16pt; font-weight: 700; margin: 0 0 16px 0; display: flex; align-items: center; gap: 10px;">
        <span style="display: inline-block; width: 8px; height: 8px; background: #2563eb; border-radius: 50%;"></span>
        Executive Summary
      </h2>
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
        <div>
          <div style="color: #64748b; font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
            Risk Level
          </div>
          <div style="display: inline-block; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 10pt; color: white; background: ${analysis.risk_level === 'Low' ? '#16a34a' : analysis.risk_level === 'Medium' ? '#f59e0b' : '#ef4444'};">
            ${analysis.risk_level === 'Low' ? '✓ ' : '⚠ '}${analysis.risk_level === 'Low' ? t('analysis.lowRisk') : analysis.risk_level === 'Medium' ? t('analysis.mediumRisk') : t('analysis.highRisk')}
          </div>
        </div>
        <div>
          <div style="color: #64748b; font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
            Issues Found
          </div>
          <div style="font-size: 20pt; font-weight: 700; color: #1e293b;">
            ${analysis.red_flags?.length || 0}
          </div>
        </div>
        <div>
          <div style="color: #64748b; font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
            Quality Rating
          </div>
          <div style="font-size: 20pt; color: #f59e0b;">
            ${'★'.repeat(Math.floor((analysis.overall_score / 100) * 5))}${'☆'.repeat(5 - Math.floor((analysis.overall_score / 100) * 5))}
          </div>
        </div>
      </div>
    </div>

    ${analysis.score_reasoning ? `
      <div style="background: white; border-left: 4px solid #2563eb; padding: 20px 24px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 0 8px 8px 0;">
        <p style="color: #475569; margin: 0; font-size: 11pt; line-height: 1.7;">
          ${analysis.score_reasoning}
        </p>
      </div>
    ` : ''}

    <!-- KEY FINDINGS -->
    ${analysis?.summary_points && analysis.summary_points.length > 0 ? `
      <div style=\"margin-bottom: 35px;\">
        <h2 style=\"color: #1e293b; font-size: 18pt; font-weight: 700; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0;\">
          ${t('analysis.quickSummary')}
        </h2>
        <div style=\"display: grid; gap: 12px;\">
          ${analysis.summary_points.map((point, index) => `
            <div style=\"display: flex; gap: 16px; align-items: start;\">
              <div style=\"flex-shrink: 0; width: 32px; height: 32px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 10pt;\">
                ${index + 1}
              </div>
              <p style=\"color: #334155; margin: 6px 0 0 0; font-size: 11pt; line-height: 1.6;\">
                ${point}
              </p>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- CRITICAL ISSUES -->
    ${analysis?.red_flags && analysis.red_flags.length > 0 ? `
      <div style=\"margin-bottom: 35px; page-break-inside: avoid;\">
        <h2 style=\"color: #1e293b; font-size: 18pt; font-weight: 700; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0; display: flex; align-items: center; gap: 10px;\">
          <span style=\"color: #ef4444;\">🚩</span>
          ${t('analysis.issuesFoundTitle')}
        </h2>
        ${analysis.red_flags.map((flag, index) => `
          <div style=\"margin-bottom: 16px; border: 2px solid ${flag.severity === 'critical' ? '#fca5a5' : flag.severity === 'warning' ? '#fcd34d' : '#93c5fd'}; border-radius: 10px; overflow: hidden; page-break-inside: avoid;\">
            <div style=\"background: ${flag.severity === 'critical' ? '#fef2f2' : flag.severity === 'warning' ? '#fffbeb' : '#eff6ff'}; padding: 16px 20px; border-bottom: 1px solid ${flag.severity === 'critical' ? '#fca5a5' : flag.severity === 'warning' ? '#fcd34d' : '#93c5fd'};\">
              <div style=\"display: flex; justify-content: space-between; align-items: center;\">
                <h3 style=\"color: #1e293b; font-size: 12pt; font-weight: 700; margin: 0;\">
                  ${index + 1}. ${flag.title || 'Issue'}
                </h3>
                <span style=\"background: ${flag.severity === 'critical' ? '#ef4444' : flag.severity === 'warning' ? '#f59e0b' : '#3b82f6'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 8pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;\">
                  ${flag.severity || 'info'}
                </span>
              </div>
            </div>
            <div style=\"padding: 16px 20px; background: white;\">
              <p style=\"color: #475569; margin: 0; line-height: 1.7; font-size: 10pt;\">
                ${flag.problem || flag.description || 'No description available'}
              </p>
              ${flag.recommendation ? `
                <div style=\"margin-top: 12px; padding: 12px; background: #f8fafc; border-left: 3px solid #2563eb; border-radius: 4px;\">
                  <div style=\"color: #64748b; font-size: 8pt; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;\">
                    💡 Recommendation
                  </div>
                  <p style=\"color: #334155; margin: 0; font-size: 10pt; line-height: 1.6;\">
                    ${flag.recommendation}
                  </p>
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- RECOMMENDATIONS -->
    ${analysis?.recommendations && analysis.recommendations.length > 0 ? `
      <div style=\"margin-bottom: 35px; page-break-inside: avoid;\">
        <h2 style=\"color: #1e293b; font-size: 18pt; font-weight: 700; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0; display: flex; align-items: center; gap: 10px;\">
          <span style=\"color: #f59e0b;\">💡</span>
          ${t('analysis.recommendationsTitle')}
        </h2>
        <div style=\"display: grid; gap: 12px;\">
          ${analysis.recommendations.map((rec, index) => {
            const priority = typeof rec === 'object' ? rec.priority : 'Medium';
            const action = typeof rec === 'object' ? rec.action : rec;
            return `
              <div style=\"background: ${priority === 'High' ? '#fef2f2' : priority === 'Low' ? '#f0fdf4' : '#fffbeb'}; border: 2px solid ${priority === 'High' ? '#fca5a5' : priority === 'Low' ? '#bbf7d0' : '#fcd34d'}; border-radius: 8px; padding: 16px 20px; page-break-inside: avoid;\">
                <div style=\"display: flex; gap: 12px; align-items: start;\">
                  <span style=\"font-size: 18pt;\">${priority === 'High' ? '🔥' : priority === 'Low' ? '✅' : '⚡'}</span>
                  <div style=\"flex: 1;\">
                    <div style=\"display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;\">
                      <p style=\"color: #1e293b; font-weight: 600; margin: 0; font-size: 11pt; line-height: 1.5;\">
                        ${action}
                      </p>
                      <span style=\"background: ${priority === 'High' ? '#ef4444' : priority === 'Low' ? '#16a34a' : '#f59e0b'}; color: white; padding: 3px 10px; border-radius: 10px; font-size: 8pt; font-weight: 700; white-space: nowrap; margin-left: 12px;\">
                        ${priority}
                      </span>
                    </div>
                    ${typeof rec === 'object' && rec.suggested_language ? `
                      <div style=\"margin-top: 10px; padding: 10px; background: white; border-left: 3px solid #2563eb; border-radius: 4px;\">
                        <p style=\"color: #64748b; margin: 0 0 4px 0; font-size: 8pt; font-weight: 600; text-transform: uppercase;\">
                          Suggested Language:
                        </p>
                        <p style=\"color: #475569; margin: 0; font-size: 9pt; font-style: italic; line-height: 1.5;\">
                          \"${rec.suggested_language}\"
                        </p>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}

    <!-- COST ANALYSIS -->
    ${analysis?.cost_breakdown ? `
      <div style=\"margin-bottom: 35px; page-break-inside: avoid;\">
        <h2 style=\"color: #1e293b; font-size: 18pt; font-weight: 700; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0; display: flex; align-items: center; gap: 10px;\">
          <span style=\"color: #16a34a;\">💰</span>
          ${t('analysis.costBreakdownTitle')}
        </h2>
        
        <div style=\"background: white; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden;\">
          <table style=\"width: 100%; border-collapse: collapse;\">
            ${Array.isArray(analysis.cost_breakdown.initial_costs) && analysis.cost_breakdown.initial_costs.length > 0 ? `
              <tr>
                <td colspan=\"2\" style=\"background: #f8fafc; padding: 12px 20px; border-bottom: 1px solid #e2e8f0;\">
                  <div style=\"font-weight: 700; color: #1e293b; font-size: 11pt;\">
                    ${t('analysis.initialCosts')}
                  </div>
                </td>
              </tr>
              ${analysis.cost_breakdown.initial_costs.map(cost => `
                <tr>
                  <td style=\"padding: 10px 20px; color: #64748b; font-size: 10pt; border-bottom: 1px solid #f1f5f9;\">
                    ${cost.concept}
                  </td>
                  <td style=\"padding: 10px 20px; text-align: right; font-weight: 600; color: #1e293b; font-size: 10pt; border-bottom: 1px solid #f1f5f9;\">
                    ${formatCurrency(cost.amount)}
                  </td>
                </tr>
              `).join('')}
            ` : ''}
            
            ${Array.isArray(analysis.cost_breakdown.recurring_costs) && analysis.cost_breakdown.recurring_costs.length > 0 ? `
              <tr>
                <td colspan=\"2\" style=\"background: #f8fafc; padding: 12px 20px; border-bottom: 1px solid #e2e8f0;\">
                  <div style=\"font-weight: 700; color: #1e293b; font-size: 11pt;\">
                    ${t('analysis.recurringCosts')}
                    <span style=\"color: #64748b; font-weight: 400; font-size: 9pt; margin-left: 6px;\">
                      (${analysis.cost_breakdown.recurring_frequency === 'monthly' ? t('analysis.monthly') : t('analysis.yearly')})
                    </span>
                  </div>
                </td>
              </tr>
              ${analysis.cost_breakdown.recurring_costs.map(cost => `
                <tr>
                  <td style=\"padding: 10px 20px; color: #64748b; font-size: 10pt; border-bottom: 1px solid #f1f5f9;\">
                    ${cost.concept}
                  </td>
                  <td style=\"padding: 10px 20px; text-align: right; font-weight: 600; color: #1e293b; font-size: 10pt; border-bottom: 1px solid #f1f5f9;\">
                    ${formatCurrency(cost.amount)}
                  </td>
                </tr>
              `).join('')}
            ` : ''}
            
            ${analysis.cost_breakdown.potential_penalties > 0 ? `
              <tr>
                <td colspan=\"2\" style=\"background: #fef2f2; padding: 12px 20px; border-bottom: 1px solid #fca5a5;\">
                  <div style=\"font-weight: 700; color: #dc2626; font-size: 11pt; display: flex; align-items: center; gap: 8px;\">
                    <span>⚠️</span>
                    ${t('analysis.potentialPenalties')}
                  </div>
                </td>
              </tr>
              <tr>
                <td style=\"padding: 10px 20px; color: #991b1b; font-size: 10pt; background: #fef2f2;\">
                  Maximum Penalty
                </td>
                <td style=\"padding: 10px 20px; text-align: right; font-weight: 700; color: #dc2626; font-size: 10pt; background: #fef2f2;\">
                  ${formatCurrency(analysis.cost_breakdown.potential_penalties)}
                </td>
              </tr>
            ` : ''}
            
            <tr style=\"background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);\">
              <td style=\"padding: 16px 20px; color: white; font-weight: 700; font-size: 12pt;\">
                ${t('analysis.estimatedTotal')} (${t('analysis.firstYear')})
              </td>
              <td style=\"padding: 16px 20px; text-align: right; color: white; font-weight: 900; font-size: 14pt;\">
                ${formatCurrency(analysis.cost_breakdown.total_first_year || 0)}
              </td>
            </tr>
          </table>
        </div>
      </div>
    ` : ''}

    <!-- MARKET COMPARISON -->
    ${analysis?.market_comparison && typeof analysis.market_comparison === 'object' ? `
      <div style=\"margin-bottom: 35px; page-break-inside: avoid;\">
        <h2 style=\"color: #1e293b; font-size: 18pt; font-weight: 700; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0; display: flex; align-items: center; gap: 10px;\">
          <span style=\"color: #8b5cf6;\">📊</span>
          ${t('analysis.marketComparisonTitle')}
        </h2>
        <div style=\"background: linear-gradient(135deg, #faf5ff 0%, #ffffff 100%); border: 2px solid #e9d5ff; border-radius: 12px; padding: 24px;\">
          ${analysis.market_comparison.summary ? `
            <p style=\"color: #475569; margin: 0 0 20px 0; font-size: 11pt; line-height: 1.7;\">
              ${analysis.market_comparison.summary}
            </p>
          ` : ''}
          <div style=\"display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;\">
            ${analysis.market_comparison.cost_comparison ? `
              <div style=\"background: white; padding: 16px; border-radius: 8px; border: 1px solid #e9d5ff;\">
                <div style=\"color: #64748b; font-size: 9pt; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;\">
                  Cost vs Market
                </div>
                <div style=\"font-size: 18pt; font-weight: 700; color: ${analysis.market_comparison.cost_comparison.assessment === 'below_market' ? '#16a34a' : analysis.market_comparison.cost_comparison.assessment === 'above_market' ? '#dc2626' : '#64748b'}; margin-bottom: 4px;\">
                  ${analysis.market_comparison.cost_comparison.percentage || 'Standard'}
                </div>
                <div style=\"font-size: 9pt; color: #64748b;\">
                  ${analysis.market_comparison.cost_comparison.explanation || ''}
                </div>
              </div>
            ` : ''}
            ${analysis.market_comparison.terms_comparison ? `
              <div style=\"background: white; padding: 16px; border-radius: 8px; border: 1px solid #e9d5ff;\">
                <div style=\"color: #64748b; font-size: 9pt; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;\">
                  Terms
                </div>
                <div style=\"font-size: 18pt; font-weight: 700; color: ${analysis.market_comparison.terms_comparison.assessment === 'favorable' ? '#16a34a' : analysis.market_comparison.terms_comparison.assessment === 'unfavorable' ? '#dc2626' : '#64748b'}; margin-bottom: 4px;\">
                  ${analysis.market_comparison.terms_comparison.assessment === 'favorable' ? '✓' : analysis.market_comparison.terms_comparison.assessment === 'unfavorable' ? '✗' : '−'}
                </div>
                <div style=\"font-size: 9pt; color: #64748b;\">
                  ${analysis.market_comparison.terms_comparison.explanation || ''}
                </div>
              </div>
            ` : ''}
            ${analysis.market_comparison.conditions_comparison ? `
              <div style=\"background: white; padding: 16px; border-radius: 8px; border: 1px solid #e9d5ff;\">
                <div style=\"color: #64748b; font-size: 9pt; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;\">
                  Conditions
                </div>
                <div style=\"font-size: 18pt; font-weight: 700; color: ${analysis.market_comparison.conditions_comparison.assessment === 'favorable' ? '#16a34a' : analysis.market_comparison.conditions_comparison.assessment === 'unfavorable' ? '#dc2626' : '#64748b'}; margin-bottom: 4px;\">
                  ${analysis.market_comparison.conditions_comparison.assessment === 'favorable' ? '✓' : analysis.market_comparison.conditions_comparison.assessment === 'unfavorable' ? '✗' : '−'}
                </div>
                <div style=\"font-size: 9pt; color: #64748b;\">
                  ${analysis.market_comparison.conditions_comparison.explanation || ''}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    ` : ''}

    <!-- FOOTER PROFESIONAL -->
    <div style="margin-top: 50px; padding-top: 30px; border-top: 2px solid #e2e8f0;">
      <div style="display: flex; justify-content: space-between; align-items: center; color: #94a3b8; font-size: 9pt;">
        <div>
          <div style="font-weight: 700; color: #64748b; margin-bottom: 4px;">Generated by ContractGuard</div>
          <div>${new Date().toLocaleDateString(currentLanguage, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-weight: 700; color: #64748b; margin-bottom: 4px;">getcontractguard.com</div>
          <div>Report ID: ${contract.id?.substring(0, 8)}</div>
        </div>
      </div>
      <div style="margin-top: 20px; padding: 16px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px;">
        <p style="margin: 0; color: #78350f; font-size: 9pt; line-height: 1.5;">
          <strong>⚠️ Disclaimer:</strong> This analysis is for informational purposes only and does not constitute legal advice. For specific legal guidance, please consult with a qualified attorney.
        </p>
      </div>
    </div>
  </div>
`;

      const htmlDocument = `
        <!DOCTYPE html>
        <html lang="${currentLanguage}">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contract Analysis - ${contract.title || 'Contract'}</title>
          <style>
            @page { margin: 20mm; size: A4; }
            body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11pt; line-height: 1.6; color: #1f2937; margin: 0; padding: 20px; background: white; }
            @media screen and (max-width: 768px) {
              body { padding: 10px; font-size: 10pt; }
              .download-instructions { padding: 12px; font-size: 12px; margin-bottom: 15px; }
            }
            .download-instructions { background: #f3f4f6; border: 1px solid #d1d5db; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 14px; color: #374151; }
            .download-instructions h3 { margin: 0 0 8px 0; color: #1f2937; font-size: 16px; }
            .download-instructions ol { margin: 8px 0 0 0; padding-left: 20px; }
            .download-instructions li { margin: 4px 0; }
          </style>
        </head>
        <body>
          <div class="download-instructions">
            <h3>📱 ${t('analysis.howToSavePdfMobile')}</h3>
            <ol>
              <li>${t('analysis.tapShareButton')}</li>
              <li>${t('analysis.selectPrintSaveFiles')}</li>
              <li>${t('analysis.chooseSaveAsPdf')}</li>
              <li>${t('analysis.saveToDevice')}</li>
            </ol>
          </div>
          ${analysisHtml}
        </body>
        </html>
      `;

      const fileName = contract.title ? contract.title.replace(/[^a-z0-9\s-]/gi, '').trim().replace(/\s+/g, '_') : 'contract_analysis';

      if (isMobile) {
        const blob = new Blob([htmlDocument], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${fileName}_analysis.html`;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        toast({ title: t('analysis.analysisDownloaded'), description: t('analysis.analysisGeneratedSuccessfully') });
      } else {
        const printWindow = window.open('', '_blank');
        if (!printWindow) throw new Error('Popup blocked');
        printWindow.document.open();
        printWindow.document.write(htmlDocument);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => printWindow.close(), 1500);
        }, 600);
      }

    } catch (error) {
      console.error("PDF Download Error:", error);
      console.error("PDF Error details:", {
        message: error.message,
        stack: error.stack,
        contractId: contract?.id,
        contractTitle: contract?.title
      });
      
      // Track failed usage
      base44.functions.invoke('trackFeatureUsage', {
        featureName: 'export_pdf',
        analysisId: contract.id,
        success: false,
        errorMessage: error.message,
        metadata: {
          contract_type: contract.type,
          plan: user?.plan || 'free',
          source_page: 'analysis'
        }
      }).catch(err => console.error('Failed to track feature usage:', err));
      
      toast({
        title: t('analysis.downloadFailed'),
        description: error.message || t('analysis.downloadFailedDescription'),
        variant: "destructive",
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadImprovedContract = async () => {
    if (!contract) return;
    
    setIsDownloadingImproved(true);
    
    // Track feature usage
    base44.functions.invoke('trackFeatureUsage', {
      featureName: 'export_improved_contract',
      analysisId: contract.id,
      success: true,
      metadata: {
        contract_type: contract.type,
        plan: user?.plan || 'free',
        source_page: 'analysis'
      }
    }).catch(err => console.error('Failed to track feature usage:', err));

    try {
      console.log('Starting improved contract generation for contract:', contract.id);
      
      // First, try to generate improved contract on demand if it doesn't exist
      if (!hasImprovedContract) {
        console.log('No improved contract exists, generating on demand...');
        const generateResponse = await base44.functions.invoke('generateImprovedContractOnDemand', { 
          contractId: contract.id,
          language: language
        });

        console.log('Generate response received:', generateResponse);
        
        if (!generateResponse || !generateResponse.data || !generateResponse.data.success) {
          throw new Error(generateResponse?.data?.error || 'Failed to generate improved contract');
        }

        // Refresh the contract data to get the updated analysis
        await queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
        
        console.log('Improved contract generated successfully');
      }
      
      // Detect if we're on mobile - improved detection
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(userAgent);
      const isMobileWidth = window.innerWidth <= 768;
      const isIOS = /iphone|ipad|ipod/i.test(userAgent);
      const isMobile = isMobileUA || isMobileWidth;
      
      console.log('Device detection:', {
        userAgent: navigator.userAgent,
        windowWidth: window.innerWidth,
        isMobileUA: isMobileUA,
        isMobileWidth: isMobileWidth,
        isMobile: isMobile,
        isIOS: isIOS
      });
      
      if (isMobile) {
        // For mobile, use HTML generation (same as desktop) since PDF generation has issues
        console.log('Mobile detected, using HTML generation instead of PDF...');
      console.log('Current language:', language);
      const htmlResponse = await base44.functions.invoke('generateImprovedContractHtml', { 
        contractId: contract.id,
          language: language
        });

        console.log('HTML Response received:', htmlResponse);
        
        if (!htmlResponse || !htmlResponse.data) {
          throw new Error('No HTML data received from server');
        }

        // The backend returns { html: "..." }, so we need to extract the html property
        let htmlContent;
        if (typeof htmlResponse.data === 'string') {
          // If it's already a string, use it directly
          htmlContent = htmlResponse.data;
        } else if (htmlResponse.data && typeof htmlResponse.data.html === 'string') {
          // If it's an object with html property, extract it
          htmlContent = htmlResponse.data.html;
        } else {
          console.error('Unexpected HTML response format:', htmlResponse.data);
          throw new Error('Invalid HTML response format');
        }

        console.log('HTML content length:', htmlContent.length);
        console.log('HTML content preview:', htmlContent.substring(0, 200));

        // For mobile, create a downloadable HTML file instead of print window
        console.log('Creating downloadable HTML file for mobile...');
        
        const htmlDocument = `
  <!DOCTYPE html>
  <html lang="${language}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Improved Contract - ${contract.title || 'Contract'}</title>
    <style>
      @page {
        margin: 20mm;
        size: A4;
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
        font-size: 11pt;
        line-height: 1.7;
        color: #1a1a1a;
        margin: 0;
        padding: ${isMobile ? '20px' : '0'};
        background: white;
      }
      
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        
        .no-print {
          display: none !important;
        }
      }
      
      /* Mobile responsive */
      @media screen and (max-width: 768px) {
        body { padding: 15px; font-size: 10pt; }
        .header-badge { font-size: 9pt !important; padding: 6px 12px !important; }
        .header-title { font-size: 20pt !important; }
        .changes-summary { padding: 12px !important; font-size: 10pt !important; }
        h1 { font-size: 18pt !important; }
        h2 { font-size: 14pt !important; }
      }
      
      /* Download instructions */
      .download-instructions {
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border: 2px solid #3b82f6;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 30px;
        font-size: 13px;
        color: #1e293b;
      }
      
      .download-instructions h3 {
        margin: 0 0 12px 0;
        color: #1e3a8a;
        font-size: 16px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .download-instructions ol {
        margin: 12px 0 0 0;
        padding-left: 24px;
      }
      
      .download-instructions li {
        margin: 6px 0;
        line-height: 1.6;
      }
      
      /* Professional header */
      .contract-header {
        border-bottom: 4px solid #10b981;
        padding-bottom: 30px;
        margin-bottom: 40px;
        background: linear-gradient(to bottom, #ffffff 0%, #f0fdf4 100%);
        padding: 30px;
        border-radius: 12px 12px 0 0;
      }
      
      .header-badge {
        display: inline-block;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 10pt;
        font-weight: 700;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
      }
      
      .header-title {
        color: #1a1a1a;
        font-size: 28pt;
        font-weight: 800;
        margin: 12px 0;
        letter-spacing: -0.5px;
      }
      
      .header-subtitle {
        color: #64748b;
        font-size: 11pt;
        margin: 8px 0 0 0;
      }
      
      /* Changes summary */
      .changes-summary {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border: 2px solid #fbbf24;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 30px;
        box-shadow: 0 2px 8px rgba(251, 191, 36, 0.15);
      }
      
      .changes-summary-title {
        font-size: 14pt;
        font-weight: 700;
        color: #78350f;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .changes-summary-content {
        color: #92400e;
        font-size: 11pt;
        line-height: 1.7;
      }
      
      .changes-list {
        margin-top: 12px;
        padding-left: 0;
        list-style: none;
      }
      
      .changes-list li {
        padding: 8px 0;
        border-bottom: 1px solid #fcd34d;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .changes-list li:last-child {
        border-bottom: none;
      }
      
      .change-badge {
        background: #f59e0b;
        color: white;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 9pt;
        font-weight: 700;
        white-space: nowrap;
      }
      
      /* Contract content */
      .contract-content {
        max-width: 900px;
        margin: 0 auto;
        padding: 30px;
        background: white;
      }
      
      /* Section styling */
      .contract-section {
        margin-bottom: 30px;
        page-break-inside: avoid;
      }
      
      .section-number {
        display: inline-block;
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: white;
        padding: 6px 14px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 12pt;
        margin-bottom: 12px;
      }
      
      .section-title {
        font-size: 16pt;
        font-weight: 700;
        color: #1e293b;
        margin: 16px 0 12px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #e2e8f0;
      }
      
      .section-content {
        color: #334155;
        font-size: 11pt;
        line-height: 1.8;
        text-align: justify;
      }
      
      /* Improved clause highlighting */
      .improved-clause {
        background: linear-gradient(to right, #dcfce7 0%, #f0fdf4 100%);
        border-left: 4px solid #10b981;
        padding: 16px 20px;
        margin: 16px 0;
        border-radius: 0 8px 8px 0;
        position: relative;
        box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
      }
      
      .improvement-tag {
        position: absolute;
        top: -10px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 9pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
      }
      
      .improved-clause-label {
        color: #065f46;
        font-weight: 700;
        font-size: 10pt;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .improved-clause-content {
        color: #064e3b;
        line-height: 1.8;
      }
      
      .improvement-explanation {
        margin-top: 12px;
        padding: 12px;
        background: white;
        border-left: 3px solid #34d399;
        border-radius: 0 6px 6px 0;
        font-size: 10pt;
        color: #065f46;
        font-style: italic;
      }
      
      /* Lists */
      ul, ol {
        margin: 12px 0;
        padding-left: 30px;
      }
      
      li {
        margin: 6px 0;
        line-height: 1.8;
      }
      
      /* Tables */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        border-radius: 8px;
        overflow: hidden;
      }
      
      th {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        color: white;
        padding: 14px;
        text-align: left;
        font-weight: 700;
        font-size: 11pt;
      }
      
      td {
        padding: 12px 14px;
        border-bottom: 1px solid #e2e8f0;
        color: #334155;
      }
      
      tr:last-child td {
        border-bottom: none;
      }
      
      tr:nth-child(even) {
        background: #f8fafc;
      }
      
      /* Signatures */
      .signatures {
        margin-top: 60px;
        page-break-inside: avoid;
      }
      
      .signature-box {
        margin: 30px 0;
        padding: 20px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        background: #f8fafc;
      }
      
      .signature-line {
        border-top: 2px solid #1e293b;
        margin-top: 40px;
        padding-top: 10px;
        font-weight: 600;
      }
      
      /* Footer */
      .contract-footer {
        margin-top: 60px;
        padding-top: 30px;
        border-top: 3px solid #e2e8f0;
      }
      
      .footer-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #94a3b8;
        font-size: 9pt;
        margin-bottom: 20px;
      }
      
      .footer-disclaimer {
        background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
        border: 2px solid #fcd34d;
        border-radius: 8px;
        padding: 16px;
        margin-top: 20px;
      }
      
      .footer-disclaimer-title {
        color: #78350f;
        font-weight: 700;
        font-size: 10pt;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .footer-disclaimer-text {
        color: #92400e;
        font-size: 9pt;
        line-height: 1.6;
        margin: 0;
      }
      
      strong {
        color: #1e293b;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    ${isMobile ? `
    <div class="download-instructions no-print">
      <h3>📱 ${t('analysis.howToSavePdfMobile')}</h3>
      <ol>
        <li><strong>${t('analysis.tapShareButton')}</strong></li>
        <li><strong>${t('analysis.selectPrintSaveFiles')}</strong></li>
        <li><strong>${t('analysis.chooseSaveAsPdf')}</strong></li>
        <li><strong>${t('analysis.saveToDevice')}</strong></li>
      </ol>
    </div>
    ` : ''}
    
    <div class="contract-content">
      <!-- Professional Header -->
      <div class="contract-header">
        <div class="header-badge">
          ✓ ${t('analysis.improvedContract') || 'IMPROVED CONTRACT'}
        </div>
        <h1 class="header-title">
          ${contract.title || 'Contract'}
        </h1>
        <p class="header-subtitle">
          ${t('analysis.improvedVersion') || 'Improved Version'} • ${new Date().toLocaleDateString(language, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <!-- Changes Summary -->
      ${analysis.improved_contract_full?.total_changes > 0 ? `
      <div class="changes-summary no-print">
        <div class="changes-summary-title">
          <span>📝</span>
          ${t('analysis.changesSummary') || 'Changes Summary'}
        </div>
        <p class="changes-summary-content">
          ${t('analysis.totalChangesApplied', { count: analysis.improved_contract_full.total_changes }) || `${analysis.improved_contract_full.total_changes} improvements applied`}
        </p>
        ${analysis.improved_contract_full?.changes_applied?.length > 0 ? `
        <ul class="changes-list">
          ${analysis.improved_contract_full.changes_applied.slice(0, 5).map(change => `
            <li>
              <span class="change-badge">${change.section || 'Section'}</span>
              <span>${change.improved?.substring(0, 80) || change.original?.substring(0, 80) || 'Improvement applied'}...</span>
            </li>
          `).join('')}
          ${analysis.improved_contract_full.changes_applied.length > 5 ? `
            <li style="border-bottom: none; padding-top: 8px;">
              <span style="color: #78350f; font-style: italic;">
                ${t('analysis.andMoreChanges', { count: analysis.improved_contract_full.changes_applied.length - 5 }) || `And ${analysis.improved_contract_full.changes_applied.length - 5} more changes...`}
              </span>
            </li>
          ` : ''}
        </ul>
        ` : ''}
      </div>
      ` : ''}

      <!-- Contract Content -->
      ${htmlContent}

      <!-- Professional Footer -->
      <div class="contract-footer">
        <div class="footer-info">
          <div>
            <div style="font-weight: 700; color: #64748b; margin-bottom: 4px;">
              ${t('analysis.generatedBy') || 'Generated by ContractGuard'}
            </div>
            <div>
              ${new Date().toLocaleDateString(language, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; color: #64748b; margin-bottom: 4px;">
              getcontractguard.com
            </div>
            <div>
              ${t('analysis.contractId') || 'Contract ID'}: ${contract.id?.substring(0, 8)}
            </div>
          </div>
        </div>
        
        <div class="footer-disclaimer">
          <div class="footer-disclaimer-title">
            <span>⚠️</span>
            ${t('analysis.importantDisclaimer') || 'Important Disclaimer'}
          </div>
          <p class="footer-disclaimer-text">
            ${t('analysis.improvedContractDisclaimer') || 'This improved contract is a suggestion based on AI analysis. It should be reviewed by a qualified attorney before use. ContractGuard is not responsible for any legal consequences.'}
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
`;
        
        // Create a blob with the HTML content
        const blob = new Blob([htmlDocument], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        
        // Create download link
        const fileName = contract.title ? contract.title.replace(/[^a-z0-9\s-]/gi, '').trim().replace(/\s+/g, '_') : 'improved_contract';
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `improved_${fileName}.html`;
        downloadLink.style.display = 'none';
        
        // Add to DOM, click, and remove
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Also open in new window for viewing
        const viewWindow = window.open(url, '_blank');
        if (viewWindow) {
          console.log('HTML file opened in new window for viewing');
        }
        
        // Clean up
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);

        console.log('HTML file download initiated on mobile');
        setIsSuccessModalOpen(true);
        
        toast({
          title: t('analysis.pdfDownloaded'),
          description: t('analysis.improvedContractGeneratedSuccessfully'),
        });
        
      } else {
        // For desktop, use HTML generation with print window
        console.log('DESKTOP MODE - This should NOT be executing on mobile!');
        console.log('Desktop detected, using HTML generation...');
        console.log('Current language:', language);
        const htmlResponse = await base44.functions.invoke('generateImprovedContractHtml', { 
          contractId: contract.id,
          language: language
      });

      console.log('HTML Response received:', htmlResponse);
      
      if (!htmlResponse || !htmlResponse.data) {
        throw new Error('No HTML data received from server');
      }

      // The backend returns { html: "..." }, so we need to extract the html property
      let htmlContent;
      if (typeof htmlResponse.data === 'string') {
        // If it's already a string, use it directly
        htmlContent = htmlResponse.data;
      } else if (htmlResponse.data && typeof htmlResponse.data.html === 'string') {
        // If it's an object with html property, extract it
        htmlContent = htmlResponse.data.html;
      } else {
        console.error('Unexpected HTML response format:', htmlResponse.data);
        throw new Error('Invalid HTML response format');
      }

      console.log('HTML content length:', htmlContent.length);
      console.log('HTML content preview:', htmlContent.substring(0, 200));

      // Create a new window with the HTML content and trigger print
      const printWindow = window.open('', '_blank');
        
        if (!printWindow) {
          throw new Error('Unable to open print window. Please allow popups for this site.');
        }
      
      // Write the complete HTML document
      printWindow.document.write(`
        <!DOCTYPE html>
  <html lang="${language}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Improved Contract - ${contract.title || 'Contract'}</title>
    <style>
      @page {
        margin: 20mm;
        size: A4;
      }
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
        font-size: 11pt;
        line-height: 1.7;
        color: #1a1a1a;
        margin: 0;
        padding: ${isMobile ? '20px' : '0'};
        background: white;
      }
      
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        
        .no-print {
          display: none !important;
        }
      }
      
      /* Mobile responsive */
      @media screen and (max-width: 768px) {
        body { padding: 15px; font-size: 10pt; }
        .header-badge { font-size: 9pt !important; padding: 6px 12px !important; }
        .header-title { font-size: 20pt !important; }
        .changes-summary { padding: 12px !important; font-size: 10pt !important; }
        h1 { font-size: 18pt !important; }
        h2 { font-size: 14pt !important; }
      }
      
      /* Download instructions */
      .download-instructions {
        background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        border: 2px solid #3b82f6;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 30px;
        font-size: 13px;
        color: #1e293b;
      }
      
      .download-instructions h3 {
        margin: 0 0 12px 0;
        color: #1e3a8a;
        font-size: 16px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .download-instructions ol {
        margin: 12px 0 0 0;
        padding-left: 24px;
      }
      
      .download-instructions li {
        margin: 6px 0;
        line-height: 1.6;
      }
      
      /* Professional header */
      .contract-header {
        border-bottom: 4px solid #10b981;
        padding-bottom: 30px;
        margin-bottom: 40px;
        background: linear-gradient(to bottom, #ffffff 0%, #f0fdf4 100%);
        padding: 30px;
        border-radius: 12px 12px 0 0;
      }
      
      .header-badge {
        display: inline-block;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 10pt;
        font-weight: 700;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
      }
      
      .header-title {
        color: #1a1a1a;
        font-size: 28pt;
        font-weight: 800;
        margin: 12px 0;
        letter-spacing: -0.5px;
      }
      
      .header-subtitle {
        color: #64748b;
        font-size: 11pt;
        margin: 8px 0 0 0;
      }
      
      /* Changes summary */
      .changes-summary {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        border: 2px solid #fbbf24;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 30px;
        box-shadow: 0 2px 8px rgba(251, 191, 36, 0.15);
      }
      
      .changes-summary-title {
        font-size: 14pt;
        font-weight: 700;
        color: #78350f;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .changes-summary-content {
        color: #92400e;
        font-size: 11pt;
        line-height: 1.7;
      }
      
      .changes-list {
        margin-top: 12px;
        padding-left: 0;
        list-style: none;
      }
      
      .changes-list li {
        padding: 8px 0;
        border-bottom: 1px solid #fcd34d;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .changes-list li:last-child {
        border-bottom: none;
      }
      
      .change-badge {
        background: #f59e0b;
        color: white;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 9pt;
        font-weight: 700;
        white-space: nowrap;
      }
      
      /* Contract content */
      .contract-content {
        max-width: 900px;
        margin: 0 auto;
        padding: 30px;
        background: white;
      }
      
      /* Section styling */
      .contract-section {
        margin-bottom: 30px;
        page-break-inside: avoid;
      }
      
      .section-number {
        display: inline-block;
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        color: white;
        padding: 6px 14px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 12pt;
        margin-bottom: 12px;
      }
      
      .section-title {
        font-size: 16pt;
        font-weight: 700;
        color: #1e293b;
        margin: 16px 0 12px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #e2e8f0;
      }
      
      .section-content {
        color: #334155;
        font-size: 11pt;
        line-height: 1.8;
        text-align: justify;
      }
      
      /* Improved clause highlighting */
      .improved-clause {
        background: linear-gradient(to right, #dcfce7 0%, #f0fdf4 100%);
        border-left: 4px solid #10b981;
        padding: 16px 20px;
        margin: 16px 0;
        border-radius: 0 8px 8px 0;
        position: relative;
        box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
      }
      
      .improvement-tag {
        position: absolute;
        top: -10px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 9pt;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
      }
      
      .improved-clause-label {
        color: #065f46;
        font-weight: 700;
        font-size: 10pt;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .improved-clause-content {
        color: #064e3b;
        line-height: 1.8;
      }
      
      .improvement-explanation {
        margin-top: 12px;
        padding: 12px;
        background: white;
        border-left: 3px solid #34d399;
        border-radius: 0 6px 6px 0;
        font-size: 10pt;
        color: #065f46;
        font-style: italic;
      }
      
      /* Lists */
      ul, ol {
        margin: 12px 0;
        padding-left: 30px;
      }
      
      li {
        margin: 6px 0;
        line-height: 1.8;
      }
      
      /* Tables */
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        border-radius: 8px;
        overflow: hidden;
      }
      
      th {
        background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        color: white;
        padding: 14px;
        text-align: left;
        font-weight: 700;
        font-size: 11pt;
      }
      
      td {
        padding: 12px 14px;
        border-bottom: 1px solid #e2e8f0;
        color: #334155;
      }
      
      tr:last-child td {
        border-bottom: none;
      }
      
      tr:nth-child(even) {
        background: #f8fafc;
      }
      
      /* Signatures */
      .signatures {
        margin-top: 60px;
        page-break-inside: avoid;
      }
      
      .signature-box {
        margin: 30px 0;
        padding: 20px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        background: #f8fafc;
      }
      
      .signature-line {
        border-top: 2px solid #1e293b;
        margin-top: 40px;
        padding-top: 10px;
        font-weight: 600;
      }
      
      /* Footer */
      .contract-footer {
        margin-top: 60px;
        padding-top: 30px;
        border-top: 3px solid #e2e8f0;
      }
      
      .footer-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: #94a3b8;
        font-size: 9pt;
        margin-bottom: 20px;
      }
      
      .footer-disclaimer {
        background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
        border: 2px solid #fcd34d;
        border-radius: 8px;
        padding: 16px;
        margin-top: 20px;
      }
      
      .footer-disclaimer-title {
        color: #78350f;
        font-weight: 700;
        font-size: 10pt;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .footer-disclaimer-text {
        color: #92400e;
        font-size: 9pt;
        line-height: 1.6;
        margin: 0;
      }
      
      strong {
        color: #1e293b;
        font-weight: 700;
      }
    </style>
  </head>
  <body>
    ${isMobile ? `
    <div class="download-instructions no-print">
      <h3>📱 ${t('analysis.howToSavePdfMobile')}</h3>
      <ol>
        <li><strong>${t('analysis.tapShareButton')}</strong></li>
        <li><strong>${t('analysis.selectPrintSaveFiles')}</strong></li>
        <li><strong>${t('analysis.chooseSaveAsPdf')}</strong></li>
        <li><strong>${t('analysis.saveToDevice')}</strong></li>
      </ol>
    </div>
    ` : ''}
    
    <div class="contract-content">
      <!-- Professional Header -->
      <div class="contract-header">
        <div class="header-badge">
          ✓ ${t('analysis.improvedContract') || 'IMPROVED CONTRACT'}
        </div>
        <h1 class="header-title">
          ${contract.title || 'Contract'}
        </h1>
        <p class="header-subtitle">
          ${t('analysis.improvedVersion') || 'Improved Version'} • ${new Date().toLocaleDateString(language, { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <!-- Changes Summary -->
      ${analysis.improved_contract_full?.total_changes > 0 ? `
      <div class="changes-summary no-print">
        <div class="changes-summary-title">
          <span>📝</span>
          ${t('analysis.changesSummary') || 'Changes Summary'}
        </div>
        <p class="changes-summary-content">
          ${t('analysis.totalChangesApplied', { count: analysis.improved_contract_full.total_changes }) || `${analysis.improved_contract_full.total_changes} improvements applied`}
        </p>
        ${analysis.improved_contract_full?.changes_applied?.length > 0 ? `
        <ul class="changes-list">
          ${analysis.improved_contract_full.changes_applied.slice(0, 5).map(change => `
            <li>
              <span class="change-badge">${change.section || 'Section'}</span>
              <span>${change.improved?.substring(0, 80) || change.original?.substring(0, 80) || 'Improvement applied'}...</span>
            </li>
          `).join('')}
          ${analysis.improved_contract_full.changes_applied.length > 5 ? `
            <li style="border-bottom: none; padding-top: 8px;">
              <span style="color: #78350f; font-style: italic;">
                ${t('analysis.andMoreChanges', { count: analysis.improved_contract_full.changes_applied.length - 5 }) || `And ${analysis.improved_contract_full.changes_applied.length - 5} more changes...`}
              </span>
            </li>
          ` : ''}
        </ul>
        ` : ''}
      </div>
      ` : ''}

      <!-- Contract Content -->
      ${htmlContent}

      <!-- Professional Footer -->
      <div class="contract-footer">
        <div class="footer-info">
          <div>
            <div style="font-weight: 700; color: #64748b; margin-bottom: 4px;">
              ${t('analysis.generatedBy') || 'Generated by ContractGuard'}
            </div>
            <div>
              ${new Date().toLocaleDateString(language, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: 700; color: #64748b; margin-bottom: 4px;">
              getcontractguard.com
            </div>
            <div>
              ${t('analysis.contractId') || 'Contract ID'}: ${contract.id?.substring(0, 8)}
            </div>
          </div>
        </div>
        
        <div class="footer-disclaimer">
          <div class="footer-disclaimer-title">
            <span>⚠️</span>
            ${t('analysis.importantDisclaimer') || 'Important Disclaimer'}
          </div>
          <p class="footer-disclaimer-text">
            ${t('analysis.improvedContractDisclaimer') || 'This improved contract is a suggestion based on AI analysis. It should be reviewed by a qualified attorney before use. ContractGuard is not responsible for any legal consequences.'}
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
      `);
      
      printWindow.document.close();
      
      // Wait for content to load, then trigger print
      setTimeout(() => {
        printWindow.print();
        
        // Close the window after a delay to allow printing
        setTimeout(() => {
          printWindow.close();
        }, 2000);
      }, 1000);

      console.log('HTML to PDF conversion initiated');
      setIsSuccessModalOpen(true);
      
      toast({
        title: t('analysis.pdfDownloaded'),
          description: t('analysis.improvedContractGeneratedSuccessfully'),
      });
      }

    } catch (error) {
      console.error("Improved Contract Download Error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        contractId: contract?.id,
        contractTitle: contract?.title
      });
      
      // Track failed usage
      base44.functions.invoke('trackFeatureUsage', {
        featureName: 'export_improved_contract',
        analysisId: contract.id,
        success: false,
        errorMessage: error.message,
        metadata: {
          contract_type: contract.type,
          plan: user?.plan || 'free',
          source_page: 'analysis'
        }
      }).catch(err => console.error('Failed to track feature usage:', err));
      
      toast({
        title: t('analysis.downloadFailed'),
        description: error.message || t('analysis.improvedContractDownloadFailedDescription'),
        variant: "destructive",
      });
    } finally {
      setIsDownloadingImproved(false);
    }
  };

  const handlePrintAnalysis = async () => {
    if (!contract) return;
    
    setIsPrinting(true);
    
    // Track feature usage
    base44.functions.invoke('trackFeatureUsage', {
      featureName: 'print_analysis',
      analysisId: contract.id,
      success: true,
      metadata: {
        contract_type: contract.type,
        plan: user?.plan || 'free',
        source_page: 'analysis'
      }
    }).catch(err => console.error('Failed to track feature usage:', err));

    try {
      // Simple print functionality - print the current page as is
      window.print();
    } catch (error) {
      console.error('Error printing analysis:', error);
      
      // Track failed usage
      base44.functions.invoke('trackFeatureUsage', {
        featureName: 'print_analysis',
        analysisId: contract.id,
        success: false,
        errorMessage: error.message,
        metadata: {
          contract_type: contract.type,
          plan: user?.plan || 'free',
          source_page: 'analysis'
        }
      }).catch(err => console.error('Failed to track feature usage:', err));

      toast({
        title: t('analysis.printError'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsPrinting(false);
    }
  };



  const handleDelete = () => {
    setIsDeleteModalOpen(true);
    
    // Track feature usage attempt
    base44.functions.invoke('trackFeatureUsage', {
      featureName: 'delete_analysis',
      analysisId: contract.id,
      success: true,
      metadata: {
        contract_type: contract.type,
        plan: user?.plan || 'free',
        source_page: 'analysis',
        action: 'initiated'
      }
    }).catch(err => console.error('Failed to track feature usage:', err));
  };

  const confirmDelete = () => {
    if (contract) {
      deleteMutation.mutate(contract.id);
    }
  };

  if (isLoading || !contractId || !contract) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-lg sm:text-xl font-semibold text-gray-900">{t('analysis.loadingAnalysis')}</p>
        </div>
      </div>
    );
  }

  if (contract.status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center text-center p-6">
          <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{t('analysis.analysisErrorTitle')}</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md">
            {t('analysis.analysisErrorMessage')}
          </p>
          <Button onClick={() => navigate(createPageUrl('Upload'))}>
            {t('analysis.uploadAnotherContract')}
          </Button>
      </div>
    );
  }

  const analysis = contract.analysis || {};
  const isPro = user?.plan === 'pro' || user?.plan === 'business';
  const hasImprovedContract = analysis?.improved_contract_full?.full_text;
  const hasImprovedContractInterface = isPro && analysis?.improved_contract_full;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-4">
          <div className="flex flex-col gap-4">
            {/* Title Row */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(createPageUrl('Dashboard'))}
                className="hover:bg-gray-100 flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate" title={contract.title}>
                  {contract.title}
                </h1>
                <p className="text-sm sm:text-sm text-gray-500 truncate">
                  {t('analysis.analyzedOn')} {format(new Date(contract.created_date), "MMMM d, yyyy", { locale: getLocale() })}
                </p>
              </div>
            </div>

            {/* Actions Row - Full width on mobile */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs sm:text-sm px-3 w-full sm:w-auto"
                onClick={handleShareByEmail}
                disabled={isSendingEmail}
              >
                {isSendingEmail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
                <span>{isSendingEmail ? t('analysis.preparing') : t('analysis.email')}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs sm:text-sm px-3 w-full sm:w-auto"
                onClick={handleShare}
                disabled={isSharing}
              >
                {shareButtonText === t('analysis.linkCopied') ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
                <span>{shareButtonText === t('analysis.linkCopied') ? t('analysis.linkCopied') : t('analysis.share')}</span>
              </Button>

              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 text-xs sm:text-sm px-3 w-full sm:w-auto"
                onClick={handlePrintAnalysis}
                disabled={isPrinting}
              >
                <Printer className="w-4 h-4" />
                <span>{isPrinting ? t('analysis.printing') : t('analysis.print')}</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs sm:text-sm px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 w-full sm:w-auto col-span-2 sm:col-span-1"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('analysis.delete')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1600px]">
        {hasImprovedContractInterface && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <ImprovedContractCallout
              totalChanges={analysis.improved_contract_full?.total_changes || 0}
              onDownload={handleDownloadImprovedContract}
              isDownloading={isDownloadingImproved}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <ScoreCard analysis={analysis} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8"
        >
          <QuickSummary summary={analysis.summary_points} />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <RedFlags flags={analysis.red_flags} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Recommendations recommendations={analysis.recommendations} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <MarketComparison 
                analysis={analysis} 
                user={user}
                onUpgradeClick={() => setIsUpgradeModalOpen(true)}
              />
            </motion.div>
          </div>

          <div className="lg:col-span-1 lg:min-w-[320px] space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:sticky lg:top-24 space-y-4 sm:space-y-6"
            >
              <CostBreakdown costs={analysis.cost_breakdown} />
              {!isPro && (
                <ProFeaturesCta onUpgradeClick={() => setIsUpgradeModalOpen(true)} />
              )}
              <ReportActions
                contractId={contract.id}
                contract={contract}
                isPreview={false}
              />
            </motion.div>
          </div>
        </div>
      </main>

      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        contractTitle={contract.title}
        isDeleting={deleteMutation.isLoading}
      />
      <ImprovedContractSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </div>
  );
}
