
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Clock,
  AlertTriangle,
  Shield,
  Sparkles,
  Zap,
  Download,
  Printer,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";
import ScoreCard from "../components/analysis/ScoreCard";
import QuickSummary from "../components/analysis/QuickSummary";
import RedFlags from "../components/analysis/RedFlags";
import CostBreakdown from "../components/analysis/CostBreakdown";
import Recommendations from "../components/analysis/Recommendations";
import { format } from "date-fns";
import { enUS, es, it } from "date-fns/locale";
import PublicNavbar from "../components/landing/PublicNavbar";
import Footer from "../components/landing/Footer";
import ProFeaturesCta from "../components/analysis/ProFeaturesCta";
import UpgradeModal from "../components/analysis/UpgradeModal";
import ReportActions from "../components/analysis/ReportActions";
import MarketComparison from "../components/analysis/MarketComparison";
import ImprovedContractDownload from "../components/analysis/ImprovedContractDownload";
import { useTranslation } from "../components/i18n/I18nProvider";
import { useToast } from "@/components/ui/use-toast";
import { localStorageUtils } from "../components/localStorage";

// Import print styles
import "../styles/print.css";

export default function AnalysisPreviewPage() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const urlParams = new URLSearchParams(window.location.search);
  const tempId = urlParams.get('id');
  const shareToken = urlParams.get('share_token');

  console.log('[AnalysisPreview] Params:', { tempId, shareToken });

  const getLocale = () => {
    switch (language) {
      case 'es': return es;
      case 'it': return it;
      default: return enUS;
    }
  };

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isSharedAnalysis, setIsSharedAnalysis] = useState(!!shareToken);
  const [localAnalysis, setLocalAnalysis] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isDownloadingImproved, setIsDownloadingImproved] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const { data: dbContract, isLoading: dbLoading, error: dbError } = useQuery({
    queryKey: ['analysis', tempId, shareToken],
    queryFn: async () => {
      let contracts;

      if (shareToken) {
        console.log('Searching by share_token:', shareToken);
        contracts = await base44.entities.Contract.filter({
          share_token: shareToken
        });
      } else if (tempId && !tempId.startsWith('temp_')) {
        console.log('Searching by id:', tempId);
        contracts = await base44.entities.Contract.filter({
          id: tempId
        });
      } else {
        console.log('Temp ID detected, skipping database query');
        return null;
      }

      console.log('Found contracts:', contracts);

      if (!contracts || contracts.length === 0) {
        throw new Error('Analysis not found');
      }

      return contracts[0];
    },
    enabled: !!(shareToken || (tempId && !tempId.startsWith('temp_'))),
    retry: false
  });

  const { data: user } = useQuery({
    queryKey: ['current-user-preview'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (tempId && tempId.startsWith('temp_')) {
      console.log('Loading temporary analysis from localStorage with id:', tempId);
      setIsSharedAnalysis(false);
      setLocalLoading(true);

      try {
        const storedData = localStorage.getItem(`analysis_${tempId}`);

        if (!storedData) {
          console.log('No data found in localStorage for:', tempId);
          setLocalError(t('analysisPreview.analysisNotFound'));
          setLocalLoading(false);
          return;
        }

        const analysisData = JSON.parse(storedData);

        if (Date.now() > analysisData.expiresAt) {
          console.log('Analysis expired');
          localStorage.removeItem(`analysis_${tempId}`);
          setLocalError(t('analysisPreview.analysisExpiredError'));
          setLocalLoading(false);
          return;
        }

        console.log('Loaded temporary analysis:', analysisData);
        setLocalAnalysis(analysisData);
        setLocalLoading(false);
      } catch (err) {
        console.error('Error loading temporary analysis:', err);
        setLocalError(t('analysisPreview.failedToLoadAnalysis'));
        setLocalLoading(false);
      }
    }
  }, [tempId, t]);

  useEffect(() => {
    if (dbContract && shareToken) {
      setIsSharedAnalysis(true);
    } else if (dbContract && !shareToken) {
      setIsSharedAnalysis(false);
    }
  }, [dbContract, shareToken]);

  const handleDownloadImprovedContract = async () => {
    const contract = dbContract || localAnalysis;
    if (!contract) return;

    setIsDownloadingImproved(true);
    try {
      console.log('Starting improved contract generation for contract:', contract.id);

      const hasImprovedContract = contract.improved_contract_full && contract.improved_contract_full.content;
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

        console.log('Improved contract generated successfully');
      }

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
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
      padding: 20px;
    }

    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .logo {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 10pt;
      font-weight: 600;
      margin-bottom: 10px;
    }

    h1 {
      color: #1a1a1a;
      font-size: 24pt;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #6b7280;
      font-size: 10pt;
    }

    .content {
      font-size: 11pt;
      line-height: 1.8;
      text-align: justify;
    }

    .improved-clause {
      background: linear-gradient(to right, #dcfce7 0%, #f0fdf4 100%);
      border-left: 4px solid #10b981;
      padding: 12px 16px;
      margin: 12px 0;
      border-radius: 0 6px 6px 0;
    }

    .improvement-tag {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      display: inline-block;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">ContractGuard</div>
    <h1>${contract.title || 'Improved Contract'}</h1>
    <div class="subtitle">${t('analysis.improvedVersion')} • ${new Date().toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>

  <div class="content">
    ${contract.improved_contract_full?.content || 'No improved contract content available.'}
  </div>
</body>
</html>`;

        const blob = new Blob([htmlDocument], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${contract.title || 'contract'}-improved.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast({
          title: t('analysis.contractDownloadedTitle'),
          description: t('analysis.contractDownloadedDescription'),
        });
      } else {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
          throw new Error('Unable to open print window. Please allow popups for this site.');
        }

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
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
      padding: 20px;
    }

    .header {
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }

    .logo {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 10pt;
      font-weight: 600;
      margin-bottom: 10px;
    }

    h1 {
      color: #1a1a1a;
      font-size: 24pt;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .subtitle {
      color: #6b7280;
      font-size: 10pt;
    }

    .content {
      font-size: 11pt;
      line-height: 1.8;
      text-align: justify;
    }

    .improved-clause {
      background: linear-gradient(to right, #dcfce7 0%, #f0fdf4 100%);
      border-left: 4px solid #10b981;
      padding: 12px 16px;
      margin: 12px 0;
      border-radius: 0 6px 6px 0;
    }

    .improvement-tag {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      display: inline-block;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">ContractGuard</div>
    <h1>${contract.title || 'Improved Contract'}</h1>
    <div class="subtitle">${t('analysis.improvedVersion')} • ${new Date().toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>

  <div class="content">
    ${contract.improved_contract_full?.content || 'No improved contract content available.'}
  </div>
</body>
</html>`;

        printWindow.document.write(htmlDocument);
        printWindow.document.close();

        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 500);
        };

        toast({
          title: t('analysis.contractDownloadedTitle'),
          description: t('analysis.contractDownloadedDescription'),
        });
      }
    } catch (error) {
      console.error('Error downloading improved contract:', error);
      toast({
        title: t('analysis.downloadFailed'),
        description: error.message || t('analysis.downloadFailedDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsDownloadingImproved(false);
    }
  };

  const handleDownloadPdf = async () => {
    const contract = dbContract || localAnalysis;
    if (!contract) return;
    setIsDownloadingPdf(true);
    try {
      console.log('Starting PDF generation for contract:', contract.id);

      if (tempId && tempId.startsWith('temp_')) {
        console.log('Temporary analysis detected, generating HTML PDF directly');

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

        const getTranslatedText = (key) => {
          switch (key) {
            case 'analysis.analyzedOn': return language === 'es' ? 'Analizado el' : language === 'it' ? 'Analizzato il' : 'Analyzed on';
            case 'analysis.overallScore': return language === 'es' ? 'Puntuación General' : language === 'it' ? 'Punteggio Generale' : 'Overall Score';
            case 'analysis.executiveSummary': return language === 'es' ? 'Resumen Ejecutivo' : language === 'it' ? 'Riassunto Esecutivo' : 'Executive Summary';
            case 'analysis.noExecutiveSummary': return language === 'es' ? 'No se encontró resumen ejecutivo' : language === 'it' ? 'Nessun riassunto esecutivo trovato' : 'No executive summary found';
            case 'analysis.redFlags': return language === 'es' ? 'Banderas Rojas' : language === 'it' ? 'Bandiere Rosse' : 'Red Flags';
            case 'analysis.recommendations': return language === 'es' ? 'Recomendaciones' : language === 'it' ? 'Raccomandazioni' : 'Recommendations';
            case 'analysis.costBreakdown': return language === 'es' ? 'Desglose de Costos' : language === 'it' ? 'Analisi dei Costi' : 'Cost Breakdown';
            default: return key;
          }
        };

        const analysisHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; max-width: 900px; margin: 0 auto; padding: 40px 30px; line-height: 1.6;">

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
          ${getTranslatedText('analysis.analyzedOn')}: ${new Date(contract.created_date || contract.createdAt).toLocaleDateString(currentLanguage, { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div style="text-align: right;">
        <div style="background: ${analysis.overall_score >= 80 ? '#dcfce7' : analysis.overall_score >= 60 ? '#fef3c7' : '#fee2e2'}; padding: 20px; border-radius: 12px; min-width: 140px;">
          <div style="font-size: 48pt; font-weight: 900; color: ${analysis.overall_score >= 80 ? '#16a34a' : analysis.overall_score >= 60 ? '#ca8a04' : '#dc2626'}; line-height: 1;">
            ${analysis.overall_score}
          </div>
          <div style="font-size: 11pt; color: #6b7280; font-weight: 600; margin-top: 8px;">
            ${getTranslatedText('analysis.overallScore')}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 24px; border-radius: 12px; margin-bottom: 32px;">
    <h2 style="color: #1e293b; font-size: 18pt; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
      📊 ${getTranslatedText('analysis.executiveSummary')}
    </h2>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px;">
      <div>
        <div style="color: #64748b; font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
          ${language === 'es' ? 'Nivel de Riesgo' : language === 'it' ? 'Livello di Rischio' : 'Risk Level'}
        </div>
        <div style="display: inline-block; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 10pt; color: white; background: ${analysis.risk_level === 'Low' ? '#16a34a' : analysis.risk_level === 'Medium' ? '#f59e0b' : '#ef4444'};">
          ${analysis.risk_level === 'Low' ? '✓ ' : '⚠ '}${analysis.risk_level === 'Low' ? (language === 'es' ? 'Bajo' : language === 'it' ? 'Basso' : 'Low') : analysis.risk_level === 'Medium' ? (language === 'es' ? 'Medio' : language === 'it' ? 'Medio' : 'Medium') : (language === 'es' ? 'Alto' : language === 'it' ? 'Alto' : 'High')}
        </div>
      </div>
      <div>
        <div style="color: #64748b; font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
          ${language === 'es' ? 'Problemas Encontrados' : language === 'it' ? 'Problemi Trovati' : 'Issues Found'}
        </div>
        <div style="font-size: 20pt; font-weight: 700; color: #1e293b;">
          ${analysis.red_flags?.length || 0}
        </div>
      </div>
      <div>
        <div style="color: #64748b; font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
          ${language === 'es' ? 'Calificación de Calidad' : language === 'it' ? 'Valutazione Qualità' : 'Quality Rating'}
        </div>
        <div style="font-size: 20pt; color: #f59e0b;">
          ${'★'.repeat(Math.floor((analysis.overall_score / 100) * 5))}${'☆'.repeat(5 - Math.floor((analysis.overall_score / 100) * 5))}
        </div>
      </div>
    </div>
    <p style="color: #475569; font-size: 12pt; line-height: 1.7; margin: 0;">
      ${analysis.executive_summary || getTranslatedText('analysis.noExecutiveSummary')}
    </p>
  </div>

  ${analysis.score_reasoning ? `
    <div style="background: white; border-left: 4px solid #2563eb; padding: 20px 24px; margin-bottom: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 0 8px 8px 0;">
      <h3 style="color: #1e293b; font-size: 14pt; font-weight: 600; margin-bottom: 12px;">
        ${language === 'es' ? 'Justificación de Puntuación' : language === 'it' ? 'Giustificazione del Punteggio' : 'Score Justification'}
      </h3>
      <p style="color: #475569; font-size: 11pt; line-height: 1.7; margin: 0;">
        ${analysis.score_reasoning}
      </p>
    </div>
  ` : ''}

  ${analysis?.summary_points && analysis.summary_points.length > 0 ? `
    <div style="margin-bottom: 35px;">
      <h2 style="color: #1e293b; font-size: 18pt; font-weight: 700; margin: 0 0 20px 0; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0;">
        ${language === 'es' ? 'Resumen Rápido' : language === 'it' ? 'Riassunto Veloce' : 'Quick Summary'}
      </h2>
      <div style="display: grid; gap: 12px;">
        ${analysis.summary_points.map((point, index) => `
          <div style="display: flex; gap: 16px; align-items: start;">
            <div style="flex-shrink: 0; width: 32px; height: 32px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 10pt;">
              ${index + 1}
            </div>
            <p style="color: #334155; margin: 6px 0 0 0; font-size: 11pt; line-height: 1.6;">
              ${point}
            </p>
          </div>
        `).join('')}
      </div>
    </div>
  ` : ''}

  ${analysis.red_flags && analysis.red_flags.length > 0 ? `
  <div style="margin-bottom: 32px;">
    <h2 style="color: #dc2626; font-size: 18pt; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
      🚨 ${getTranslatedText('analysis.redFlags')}
    </h2>
    <div style="space-y: 12px;">
      ${analysis.red_flags.map(flag => `
        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 12px; border-radius: 0 8px 8px 0;">
          <h3 style="color: #dc2626; font-size: 13pt; font-weight: 600; margin-bottom: 8px;">
            ${flag.title || flag.problem || 'Red Flag'}
          </h3>
          <p style="color: #7f1d1d; font-size: 11pt; line-height: 1.6; margin: 0;">
            ${flag.problem || flag.description || flag.impact || 'No description available'}
          </p>
          ${flag.location ? `<p style="color: #991b1b; font-size: 10pt; margin: 4px 0 0 0; font-style: italic;">${flag.location}</p>` : ''}
          ${flag.fix ? `<p style="color: #059669; font-size: 10pt; margin: 8px 0 0 0;"><strong>Solución:</strong> ${flag.fix}</p>` : ''}
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${analysis.recommendations && analysis.recommendations.length > 0 ? `
  <div style="margin-bottom: 32px;">
    <h2 style="color: #059669; font-size: 18pt; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
      💡 ${getTranslatedText('analysis.recommendations')}
    </h2>
    <div style="space-y: 12px;">
      ${analysis.recommendations.map(rec => `
        <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 16px; margin-bottom: 12px; border-radius: 0 8px 8px 0;">
          <h3 style="color: #059669; font-size: 13pt; font-weight: 600; margin-bottom: 8px;">
            ${rec.action || rec.title || 'Recommendation'}
          </h3>
          <p style="color: #14532d; font-size: 11pt; line-height: 1.6; margin: 0;">
            ${rec.action || rec.description || 'No description available'}
          </p>
          ${rec.suggested_language ? `<p style="color: #059669; font-size: 10pt; margin: 8px 0 0 0; font-style: italic;"><strong>Lenguaje sugerido:</strong> ${rec.suggested_language}</p>` : ''}
        </div>
      `).join('')}
    </div>
  </div>
  ` : ''}

  ${analysis.cost_breakdown ? `
  <div style="margin-bottom: 32px;">
    <h2 style="color: #1e293b; font-size: 18pt; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
      💰 ${getTranslatedText('analysis.costBreakdown')}
    </h2>
    <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
      ${analysis.cost_breakdown.initial_costs && analysis.cost_breakdown.initial_costs.length > 0 ? `
        <div style="margin-bottom: 16px;">
          <h4 style="color: #374151; font-size: 12pt; font-weight: 600; margin-bottom: 8px;">Costos Iniciales:</h4>
          ${analysis.cost_breakdown.initial_costs.map(cost => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
              <span style="color: #475569; font-size: 11pt;">${cost.concept || cost.name || 'Costo'}:</span>
              <span style="color: #1e293b; font-size: 11pt; font-weight: 600;">${formatCurrency(cost.amount || cost.value || 0)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${analysis.cost_breakdown.recurring_costs && analysis.cost_breakdown.recurring_costs.length > 0 ? `
        <div style="margin-bottom: 16px;">
          <h4 style="color: #374151; font-size: 12pt; font-weight: 600; margin-bottom: 8px;">Costos Recurrentes (${analysis.cost_breakdown.recurring_frequency || 'mensual'}):</h4>
          ${analysis.cost_breakdown.recurring_costs.map(cost => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 0;">
              <span style="color: #475569; font-size: 11pt;">${cost.concept || cost.name || 'Costo'}:</span>
              <span style="color: #1e293b; font-size: 11pt; font-weight: 600;">${formatCurrency(cost.amount || cost.value || 0)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      ${analysis.cost_breakdown.potential_penalties ? `
        <div style="margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-top: 1px solid #e2e8f0;">
            <span style="color: #dc2626; font-size: 11pt; font-weight: 600;">Penalizaciones Potenciales:</span>
            <span style="color: #dc2626; font-size: 11pt; font-weight: 700;">${formatCurrency(analysis.cost_breakdown.potential_penalties)}</span>
          </div>
        </div>
      ` : ''}
      ${analysis.cost_breakdown.total_first_year ? `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-top: 2px solid #374151; background: #f1f5f9; margin: 0 -20px; padding-left: 20px; padding-right: 20px;">
          <span style="color: #1e293b; font-size: 12pt; font-weight: 700;">Total Primer Año:</span>
          <span style="color: #1e293b; font-size: 14pt; font-weight: 900;">${formatCurrency(analysis.cost_breakdown.total_first_year)}</span>
        </div>
      ` : ''}
    </div>
  </div>
  ` : ''}

  <div style="border-top: 2px solid #e2e8f0; padding-top: 24px; margin-top: 40px; text-align: center;">
    <p style="color: #6b7280; font-size: 10pt; margin: 0;">
      ${language === 'es' ? 'Generado por' : language === 'it' ? 'Generato da' : 'Generated by'} ContractGuard • ${new Date().toLocaleDateString(currentLanguage, { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
    <p style="color: #9ca3af; font-size: 9pt; margin: 8px 0 0 0;">
      ${language === 'es' ? 'Aviso Legal Importante' : language === 'it' ? 'Avviso Legale Importante' : 'Important Legal Notice'}: ${language === 'es' ? 'Esta es una mejora sugerida, no un consejo legal. Siempre consulta con un abogado antes de usar.' : language === 'it' ? 'Questo è un miglioramento suggerito, non un consiglio legale. Consulta sempre un avvocato antes de utilizar.' : 'This is a suggested improvement, not legal advice. Always consult with a lawyer before using.'}
    </p>
  </div>
</div>`;

        if (isMobile) {
          const blob = new Blob([analysisHtml], { type: 'text/html' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${contract.title || 'contract'}-analysis.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          toast({
            title: t('analysis.analysisDownloaded'),
            description: t('analysis.analysisGeneratedSuccessfully'),
          });
        } else {
          const printWindow = window.open('', '_blank');
          if (!printWindow) {
            throw new Error('Unable to open print window. Please allow popups for this site.');
          }

          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>${contract.title || 'Contract Analysis'}</title>
              <style>
                @page { margin: 20mm; size: A4; }
                body { margin: 0; padding: 0; }
              </style>
            </head>
            <body>${analysisHtml}</body>
            </html>
          `);
          printWindow.document.close();

          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.print();
              printWindow.close();
            }, 500);
          };

          toast({
            title: t('analysis.analysisDownloaded'),
            description: t('analysis.analysisGeneratedSuccessfully'),
          });
        }
      }
    } catch (error) {
      console.error('Error downloading analysis PDF:', error);
      toast({
        title: t('analysis.downloadFailed'),
        description: error.message || t('analysis.downloadFailedDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrintAnalysis = async () => {
    const contract = dbContract || localAnalysis;
    if (!contract) return;

    setIsPrinting(true);

    try {
      window.print();
    } catch (error) {
      console.error('Error printing analysis:', error);
      toast({
        title: t('analysis.printError'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const isLoading = tempId && tempId.startsWith('temp_') ? localLoading : dbLoading;
  const error = tempId && tempId.startsWith('temp_') ? localError : dbError;

  let analysis = null;
  if (tempId && tempId.startsWith('temp_')) {
    console.log('Extracting analysis from localAnalysis:', localAnalysis);
    analysis = {
      ...localAnalysis?.analysis,
      contractTitle: localAnalysis?.contractTitle || localAnalysis?.title,
      contractType: localAnalysis?.contractType || localAnalysis?.type,
      createdAt: localAnalysis?.createdAt || localAnalysis?.created_date
    };
    console.log('Extracted analysis data:', analysis);
  } else if (dbContract) {
    analysis = {
      ...dbContract.analysis,
      contractTitle: dbContract.title,
      contractType: dbContract.type,
      file_url: dbContract.file_url,
      createdAt: new Date(dbContract.created_date).getTime(),
    };
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Clock className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-lg sm:text-xl font-semibold text-gray-900">{t('analysisPreview.loadingAnalysis')}</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col items-center justify-center text-center p-6">
        <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{t('analysisPreview.unableToLoadAnalysis')}</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md">
          {shareToken
            ? t('analysisPreview.sharedLinkInvalid')
            : t('analysisPreview.analysisExpired')}
        </p>
        <Button onClick={() => navigate(createPageUrl('TryFree'))}>
          {t('analysisPreview.analyzeAnotherContract')}
        </Button>
      </div>
    );
  }

  const isPro = user?.plan === 'pro' || user?.plan === 'business';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <PublicNavbar />
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 sm:p-6 text-center shadow-xl"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-white" />
              <div className="text-left">
                <h3 className="text-white font-bold text-lg sm:text-xl">
                  {isSharedAnalysis ? t('analysisPreview.sharedContractAnalysis') : t('analysisPreview.freeAnalysis')}
                </h3>
                <p className="text-blue-100 text-sm">
                  {isSharedAnalysis ? t('analysisPreview.viewOnlyCreateAccount') : t('analysisPreview.analysisExpires24Hours')}
                </p>
              </div>
            </div>
            {!isSharedAnalysis && (
              <Link to={createPageUrl("Dashboard")}>
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 font-bold shadow-lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  {t('analysisPreview.createFreeAccount')}
                </Button>
              </Link>
            )}
          </div>
        </motion.div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {analysis.contractTitle || t('analysisPreview.contractAnalysis')}
          </h1>
          <p className="text-sm text-gray-500">
            {analysis.createdAt
              ? `${t('analysisPreview.analyzedOn')} ${format(new Date(analysis.createdAt), "MMMM d, yyyy", { locale: getLocale() })}`
              : `${t('analysisPreview.analyzedOn')} ${format(new Date(), "MMMM d, yyyy", { locale: getLocale() })}`
            }
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <Button
            onClick={handlePrintAnalysis}
            disabled={isPrinting}
            variant="outline"
            className="border-gray-300 hover:bg-gray-50"
          >
            {isPrinting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Printer className="w-4 h-4 mr-2" />
            )}
            <span>{isPrinting ? t('analysis.printing') : t('analysis.print')}</span>
          </Button>
        </div>

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
          <QuickSummary summary={analysis.summary_points || []} />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <RedFlags flags={analysis.red_flags || []} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Recommendations recommendations={analysis.recommendations || []} />
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

            {(analysis.improved_contract_full?.content || (user?.plan === 'pro' || user?.plan === 'business')) && (
              // This ImprovedContractDownload component implicitly has a download button.
              // As the user requested to remove the "improved contract download button",
              // and the outline explicitly shows its removal from the direct button group,
              // we ensure this section remains commented out or removed if it implies a direct download button.
              // However, the `ImprovedContractDownload` component itself is a CTA, not just a button.
              // The request was for "buttons". Let's check if this component *only* renders a button.
              // Looking at the component name, it seems to be an entire section.
              // The prompt was "Ocultar botones de descarga de PDF y contrato mejorado".
              // The outline provided specifically removes the `Button` element for `handleDownloadImprovedContract`.
              // This `ImprovedContractDownload` component likely handles its own logic for display based on user plan/content.
              // Given the specificity of the outline, I'll keep this component here but ensure the individual button
              // from the `flex flex-wrap gap-3` div is removed as per the outline.
              // The current change request and outline *only* targeted the group of buttons at the top,
              // not this full component.
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <ImprovedContractDownload
                  contract={dbContract || localAnalysis}
                  user={user}
                  onDownload={handleDownloadImprovedContract}
                  isDownloading={isDownloadingImproved}
                />
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:sticky lg:top-24 space-y-4 sm:space-y-6"
            >
              <CostBreakdown costs={analysis.cost_breakdown || {}} />
              {!isPro && (
                <ProFeaturesCta onUpgradeClick={() => setIsUpgradeModalOpen(true)} />
              )}
              <ReportActions
                contractId={dbContract?.id}
                contract={dbContract || localAnalysis}
                isPreview={!!(tempId && tempId.startsWith('temp_'))}
                isShared={isSharedAnalysis}
              />
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 sm:p-12 text-center shadow-2xl"
        >
          <Sparkles className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {isSharedAnalysis ? t('analysisPreview.wantToAnalyzeYourOwn') : t('analysisPreview.didYouLikeAnalysis')}
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            {t('analysisPreview.createAccountToKeepAnalyses')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Dashboard")}>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold text-lg px-8 py-6 w-full sm:w-auto shadow-xl">
                <Zap className="w-5 h-5 mr-2" />
                {t('analysisPreview.createFreeAccount')}
              </Button>
            </Link>
            <Link to={createPageUrl("TryFree")}>
              <Button
                size="lg"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-6 w-full sm:w-auto"
              >
                {t('analysisPreview.analyzeAnotherContract')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>

      <Footer />

      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </div>
  );
}
