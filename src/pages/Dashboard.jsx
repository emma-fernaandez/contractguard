
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  FileText,
  Upload,
  TrendingUp,
  Calendar,
  Star,
  Eye,
  ArrowRight,
  Sparkles,
  Infinity
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { es, it } from "date-fns/locale";
import { useTranslation } from "@/components/i18n/I18nProvider";
import { useToast } from "@/components/ui/use-toast";
import { localStorageUtils } from "../components/localStorage";

export default function Dashboard() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Check if we came from a pending analysis
  const urlParams = new URLSearchParams(window.location.search);
  const hasPendingAnalysisParam = urlParams.get('pending_analysis') === 'true';
  
  // Get the correct locale for date formatting
  const getLocale = () => {
    switch (language) {
      case 'es': return es;
      case 'it': return it;
      default: return undefined; // English is default
    }
  };
  
  // Translate contract type
  const translateContractType = (type) => {
    if (!type) return '';
    
    // Map backend types to translation keys
    const typeMap = {
      'rental_lease': 'contractTypeRental',
      'rental': 'contractTypeRental',
      'employment': 'contractTypeEmployment', 
      'freelance': 'contractTypeFreelance',
      'freelance_service': 'contractTypeFreelance',
      'service': 'contractTypeService',
      'subscription': 'contractTypeService', // Map subscription to service
      'purchase': 'contractTypePurchase',
      'purchase_agreement': 'contractTypePurchase',
      'other': 'contractTypeOther'
    };
    
    const translationKey = typeMap[type.toLowerCase()] || 'contractTypeOther';
    return t(`common.${translationKey}`);
  };
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: contracts = [], isLoading, refetch } = useQuery({
    queryKey: ['contracts'],
    queryFn: async () => {
      const userEmail = (await base44.auth.me()).email;
      return base44.entities.Contract.filter({ created_by: userEmail }, '-created_date');
    },
    initialData: [],
  });

  // Check if there's a pending analysis to save
  React.useEffect(() => {
    const savePendingAnalysis = async () => {
      console.log('[Dashboard] ===== SAVE PENDING ANALYSIS START =====');
      console.log('[Dashboard] Current URL:', window.location.href);
      console.log('[Dashboard] userLoading:', userLoading);
      console.log('[Dashboard] user:', user ? { email: user.email, plan: user.plan } : 'null');
      console.log('[Dashboard] hasPendingAnalysisParam:', hasPendingAnalysisParam);
      console.log('[Dashboard] URL params:', Object.fromEntries(urlParams.entries()));
      console.log('[Dashboard] Timestamp:', new Date().toISOString());
      
      // Wait for user to be loaded
      if (userLoading) {
        console.log('[Dashboard] User still loading, waiting...');
        return;
      }
      
      // If we don't have a user and we're not coming from a pending analysis, don't process
      if (!user && !hasPendingAnalysisParam) {
        console.log('[Dashboard] No user and no pending analysis param, skipping');
        return;
      }
      
      // Check localStorage access first
      let pendingAnalysisId;
      try {
        // Debug localStorage state
        const debugInfo = localStorageUtils.debug();
        console.log('[Dashboard] localStorage debug info:', debugInfo);
        
        pendingAnalysisId = localStorageUtils.getItem('pending_save_analysis');
        console.log('[Dashboard] Checking for pending analysis...');
        console.log('[Dashboard] Pending analysis ID from localStorage:', pendingAnalysisId);
        
      } catch (error) {
        console.error('[Dashboard] ERROR accessing localStorage:', error);
        return;
      }
      
      if (!pendingAnalysisId) {
        console.log('[Dashboard] No pending analysis found');
        
        // If we came from a pending analysis but there's no pending analysis in localStorage,
        // clean up the URL parameter
        if (hasPendingAnalysisParam) {
          console.log('[Dashboard] Cleaning up URL parameter - no pending analysis found');
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
        
        return;
      }
      
      if (!user) {
        console.log('[Dashboard] User not loaded yet, but pending analysis exists');
        console.log('[Dashboard] This might be a problem - user should be loaded by now');
        return;
      }
      
      try {
        console.log('[Dashboard] Processing pending analysis:', pendingAnalysisId);
        console.log('[Dashboard] User data:', {
          email: user.email,
          plan: user.plan,
          monthly_count: user.monthly_analyses_count,
          free_analysis_used: user.free_analysis_used
        });
        
        let storedData;
        try {
          storedData = localStorageUtils.getItem(`analysis_${pendingAnalysisId}`);
          console.log('[Dashboard] Stored data exists:', !!storedData);
        } catch (error) {
          console.error('[Dashboard] ERROR accessing stored data:', error);
          localStorageUtils.removeItem('pending_save_analysis');
          toast({
            title: t('dashboard.errorSavingAnalysis') || 'Error',
            description: 'Error accessing stored analysis data',
            variant: 'destructive',
          });
          return;
        }
        
        if (!storedData) {
          console.error('[Dashboard] ERROR: No stored data found for pending analysis');
          console.error('[Dashboard] Looking for key:', `analysis_${pendingAnalysisId}`);
          
          // Debug localStorage state
          const debugInfo = localStorageUtils.debug();
          console.error('[Dashboard] localStorage debug info:', debugInfo);
          
          localStorageUtils.removeItem('pending_save_analysis');
          
          toast({
            title: t('dashboard.errorSavingAnalysis') || 'Error',
            description: t('dashboard.analysisDataNotFound') || 'Analysis data not found. The analysis may have expired or been cleared.',
            variant: 'destructive',
          });
          return;
        }

        let tempAnalysis;
        try {
          tempAnalysis = JSON.parse(storedData);
          console.log('[Dashboard] Parsed temporary analysis successfully');
          console.log('[Dashboard] Analysis details:', {
            id: tempAnalysis.id,
            title: tempAnalysis.title || tempAnalysis.contractTitle,
            type: tempAnalysis.type || tempAnalysis.contractType,
            hasFileUrl: !!tempAnalysis.file_url,
            hasAnalysis: !!tempAnalysis.analysis,
            expiresAt: tempAnalysis.expiresAt,
            expiresAtDate: new Date(tempAnalysis.expiresAt).toISOString()
          });
        } catch (parseError) {
          console.error('[Dashboard] ERROR parsing stored analysis:', parseError);
          localStorage.removeItem('pending_save_analysis');
          localStorage.removeItem(`analysis_${pendingAnalysisId}`);
          
          toast({
            title: t('dashboard.errorSavingAnalysis') || 'Error',
            description: 'Invalid analysis data format',
            variant: 'destructive',
          });
          return;
        }
        
        // Validate that the analysis hasn't expired
        if (tempAnalysis.expiresAt && Date.now() > tempAnalysis.expiresAt) {
          console.warn('[Dashboard] Analysis has expired, not saving');
          console.warn('[Dashboard] Expired at:', new Date(tempAnalysis.expiresAt).toISOString());
          console.warn('[Dashboard] Current time:', new Date().toISOString());
          
          localStorage.removeItem('pending_save_analysis');
          localStorage.removeItem(`analysis_${pendingAnalysisId}`);
          
          toast({
            title: t('dashboard.analysisExpired') || 'Analysis Expired',
            description: t('dashboard.analysisExpiredDescription') || 'This analysis has expired. Please create a new one.',
            variant: 'destructive',
          });
          return;
        }

        // Check for free user limit before saving
        const isPro = user?.plan === 'pro' || user?.plan === 'business';
        console.log('[Dashboard] User plan check:', { isPro, plan: user.plan });
        
        if (!isPro && user.free_analysis_used) {
          console.warn('[Dashboard] Free analysis already used for this user');
          localStorage.removeItem('pending_save_analysis');
          localStorage.removeItem(`analysis_${pendingAnalysisId}`);
          
          toast({
            title: t('dashboard.freeAnalysisUsed') || 'Free Analysis Used',
            description: t('dashboard.freeAnalysisUsedMessage') || 'You have already used your free analysis. Upgrade to save more!',
            variant: 'destructive',
          });
          return;
        }

        console.log('[Dashboard] Creating contract from temporary analysis...');

        // Prepare contract data
        const contractData = {
          title: tempAnalysis.contractTitle || tempAnalysis.title || 'Saved Analysis',
          type: tempAnalysis.contractType || tempAnalysis.type || 'other',
          file_url: tempAnalysis.file_url || '',
          status: 'completed',
          analysis: tempAnalysis.analysis || {
            overall_score: tempAnalysis.overall_score,
            risk_level: tempAnalysis.risk_level,
            score_reasoning: tempAnalysis.score_reasoning,
            summary_points: tempAnalysis.summary_points,
            red_flags: tempAnalysis.red_flags,
            cost_breakdown: tempAnalysis.cost_breakdown,
            recommendations: tempAnalysis.recommendations
          }
        };

        console.log('[Dashboard] Contract data to be created:', {
          title: contractData.title,
          type: contractData.type,
          hasFileUrl: !!contractData.file_url,
          hasAnalysis: !!contractData.analysis,
          status: contractData.status,
          analysisScore: contractData.analysis?.overall_score
        });

        // Create the contract with all analysis data
        const createdContract = await base44.entities.Contract.create(contractData);

        console.log('[Dashboard] Contract created successfully:', createdContract.id);
        console.log('[Dashboard] Created contract details:', {
          id: createdContract.id,
          title: createdContract.title,
          type: createdContract.type,
          status: createdContract.status,
          created_date: createdContract.created_date
        });

        // Mark free analysis as used for free users
        if (!isPro) {
          console.log('[Dashboard] Marking free analysis as used for user:', user.email);
          try {
            await base44.auth.updateMe({
              free_analysis_used: true
            });
            console.log('[Dashboard] User updated successfully');
            queryClient.invalidateQueries({ queryKey: ['current-user'] });
          } catch (updateError) {
            console.error('[Dashboard] ERROR updating user:', updateError);
            // Don't fail the whole process for this
          }
        }

        // Clean up localStorage
        console.log('[Dashboard] Cleaning up localStorage...');
        const cleanupSuccess1 = localStorageUtils.removeItem('pending_save_analysis');
        const cleanupSuccess2 = localStorageUtils.removeItem(`analysis_${pendingAnalysisId}`);
        
        if (cleanupSuccess1 && cleanupSuccess2) {
          console.log('[Dashboard] localStorage cleaned successfully');
        } else {
          console.warn('[Dashboard] Some localStorage cleanup operations failed');
        }

        // Refresh the contracts list
        console.log('[Dashboard] Refreshing contracts list...');
        await refetch();
        console.log('[Dashboard] Contracts list refreshed');
        
        // Show success message
        toast({
          title: t('dashboard.analysisSaved') || 'Analysis Saved!',
          description: t('dashboard.analysisSavedSuccessfully') || 'Your analysis has been saved successfully and is now available in "My Analyses".',
        });
        
        // Clean up URL parameter and navigate to the new analysis
        console.log('[Dashboard] Cleaning up URL parameter and navigating to the new analysis:', createdContract.id);
        
        // Remove the pending_analysis parameter from URL
        if (hasPendingAnalysisParam) {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
        
        setTimeout(() => {
          console.log('[Dashboard] ===== NAVIGATING TO ANALYSIS =====');
          navigate(createPageUrl("Analysis") + "?id=" + createdContract.id);
        }, 1000);
        
      } catch (err) {
        console.error('[Dashboard] ERROR saving pending analysis:', err);
        console.error('[Dashboard] Error details:', {
          message: err.message,
          stack: err.stack,
          response: err.response?.data
        });
        
        toast({
          title: t('dashboard.errorSavingAnalysis') || 'Error Saving Analysis',
          description: err.message || t('dashboard.errorSavingAnalysisDescription') || 'Error saving analysis. Please try again.',
          variant: 'destructive',
        });
      }
    };

    savePendingAnalysis();
  }, [user, userLoading, refetch, t, queryClient, toast, navigate, hasPendingAnalysisParam]);

  // Calculate stats
  const isPro = user?.plan === 'pro' || user?.plan === 'business';
  
  // Check if monthly counter needs reset
  const needsReset = React.useMemo(() => {
    if (!user?.monthly_count_reset_date) return true;
    
    const resetDate = new Date(user.monthly_count_reset_date);
    const now = new Date();
    
    return resetDate.getMonth() !== now.getMonth() || resetDate.getFullYear() !== now.getFullYear();
  }, [user]);

  // Reset counter if needed
  React.useEffect(() => {
    const resetMonthlyCounter = async () => {
      if (needsReset && user && !isPro) {
        try {
          console.log("[Dashboard] Resetting monthly analysis count for user:", user.email);
          await base44.auth.updateMe({
            monthly_analyses_count: 0,
            monthly_count_reset_date: new Date().toISOString()
          });
          queryClient.invalidateQueries({ queryKey: ['current-user'] });
        } catch (error) {
          console.error('[Dashboard] Error resetting monthly counter:', error);
        }
      }
    };
    
    resetMonthlyCounter();
  }, [needsReset, user, isPro, queryClient]);

  const contractsThisMonth = isPro ? 0 : (user?.monthly_analyses_count || 0);
  const monthlyLimit = user?.monthly_limit || 1;

  const totalAnalyses = contracts.length;
  const estimatedSavings = totalAnalyses * 250;
  const memberSince = user?.created_date ? format(new Date(user.created_date), 'MMMM yyyy', { locale: getLocale() }) : '-';

  // Pagination
  const totalPages = Math.ceil(contracts.length / itemsPerPage);
  const paginatedContracts = contracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate next reset date (first day of next month)
  const nextReset = new Date();
  nextReset.setMonth(nextReset.getMonth() + 1, 1);
  nextReset.setHours(0, 0, 0, 0); // Set to beginning of the day

  const getTypeIcon = (type) => {
    return <FileText className="w-4 h-4" />;
  };

  const getRating = (score) => {
    return Math.max(0.5, Math.round((score / 100) * 5 * 2) / 2);
  };

  // Debug component for localStorage (temporary)
  const DebugLocalStorage = () => {
    const debugInfo = localStorageUtils.debug();
    return (
      <div style={{ 
        position: 'fixed', 
        top: 10, 
        right: 10, 
        background: 'white', 
        border: '1px solid #ccc', 
        padding: '10px', 
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px',
        maxHeight: '200px',
        overflow: 'auto'
      }}>
        <h4>localStorage Debug</h4>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      {/* Temporary debug component */}
      <DebugLocalStorage />
      <div className="max-w-7xl mx-auto">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t('dashboard.welcomeMessage', { name: user?.full_name || t('dashboard.there') })} 👋
          </h1>
          <p className="text-gray-600">{t('dashboard.welcomeBack')}</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{t('dashboard.analysesThisMonth')}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {isPro ? (
                        <span className="flex items-center gap-2">
                          <Infinity className="w-8 h-8 text-blue-600" />
                        </span>
                      ) : (
                        <span>{contractsThisMonth}/{monthlyLimit}</span>
                      )}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                {!isPro && (
                  <>
                    <Progress value={(contractsThisMonth / monthlyLimit) * 100} className="h-2 mb-2" />
                    <div className="text-xs text-gray-500">
                      {contractsThisMonth >= monthlyLimit
                        ? t('dashboard.monthlyLimitReached')
                        : t('dashboard.remainingThisMonth', { remaining: monthlyLimit - contractsThisMonth })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{t('dashboard.totalAnalyses')}</p>
                    <p className="text-3xl font-bold text-gray-900">{totalAnalyses}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-xs text-gray-500">{t('dashboard.allTime')}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{t('dashboard.moneySaved')}</p>
                    <p className="text-3xl font-bold text-gray-900">{t('common.currencySymbol')}{estimatedSavings.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="text-xs text-gray-500">{t('dashboard.estimated')}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{t('dashboard.memberSince')}</p>
                    <p className="text-2xl font-bold text-gray-900">{memberSince}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Usage Widget (Free Users) */}
        {!isPro && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg mb-8">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1 w-full">
                    <h3 className="font-bold text-base md:text-lg text-gray-900 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-600" />
                      {t('dashboard.freePlanUsage')}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-700 mb-3 md:mb-4">
                      {t('dashboard.usageDescription', { used: contractsThisMonth, total: monthlyLimit })}
                    </p>
                    <Progress value={(contractsThisMonth / monthlyLimit) * 100} className="h-2 md:h-3 mb-2" />
                    <p className="text-xs text-gray-600">
                      {t('dashboard.resetsOn')}: {format(nextReset, "MMMM d, yyyy", { locale: getLocale() })}
                    </p>
                  </div>
                  <Link to={createPageUrl("Pricing")} className="w-full md:w-auto">
                    <Button className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold shadow-lg text-sm md:text-base px-4 md:px-6 py-2 md:py-3">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t('dashboard.upgradeForUnlimited')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link to={createPageUrl("Upload")} className="flex-1">
              <Button className="w-full h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg font-semibold shadow-lg shadow-blue-600/25">
                <Upload className="w-5 h-5 mr-2" />
                {t('dashboard.analyzeNewContract')}
              </Button>
            </Link>
            <Link to={createPageUrl("MyAnalyses")} className="flex-1">
              <Button variant="outline" className="w-full h-16 border-2 text-lg font-semibold hover:bg-gray-50">
                <FileText className="w-5 h-5 mr-2" />
                {t('dashboard.viewAllAnalyses')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Recent Analyses Table */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold">{t('dashboard.recentAnalyses')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">{t('dashboard.loadingContracts')}</p>
              </div>
            ) : contracts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('dashboard.noAnalysesYet')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('dashboard.uploadFirstContract')}
                </p>
                <Link to={createPageUrl("Upload")}>
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
                    <Upload className="w-5 h-5 mr-2" />
                    {t('dashboard.uploadContract')}
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('dashboard.contract')}</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('dashboard.type')}</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('dashboard.date')}</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('dashboard.score')}</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">{t('dashboard.action')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedContracts.map((contract, index) => (
                        <motion.tr
                          key={contract.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">{contract.title}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(contract.type)}
                              <span className="text-sm text-gray-600">
                                {translateContractType(contract.type)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">
                              {format(new Date(contract.created_date), 'MMM d, yyyy', { locale: getLocale() })}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            {contract.status === 'completed' && contract.analysis?.overall_score ? (
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < getRating(contract.analysis.overall_score)
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">{t('dashboard.processing')}</Badge>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => navigate(createPageUrl("Analysis") + "?id=" + contract.id)}
                            >
                              <Eye className="w-4 h-4" />
                              {t('dashboard.view')}
                            </Button>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      {t('dashboard.previous')}
                    </Button>
                    {[...Array(totalPages)].map((_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      {t('dashboard.next')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
