import React, { useState, useCallback, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload as UploadIcon,
  FileText,
  AlertCircle,
  X,
  Loader2,
  Shield,
  CheckCircle2,
  Info
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PublicNavbar from "../components/landing/PublicNavbar";
import Footer from "../components/landing/Footer";
import { useTranslation } from "../components/i18n/I18nProvider";
import { localStorageUtils } from "../components/localStorage";

const contractTypes = [
  { value: "rental", label: "Rental Lease" },
  { value: "employment", label: "Employment" },
  { value: "freelance", label: "Freelance Service" },
  { value: "subscription", label: "Subscription" },
  { value: "purchase", label: "Purchase Agreement" },
  { value: "other", label: "Other" }
];

export default function TryFreePage() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [contractType, setContractType] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    const checkFreeTrialUsage = () => {
      const storageKey = 'contractguard_free_trial_usage';
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        const usage = JSON.parse(stored);
        const now = new Date();
        const lastUsed = new Date(usage.lastUsedDate);

        const isSameMonthAndYear =
          now.getMonth() === lastUsed.getMonth() &&
          now.getFullYear() === lastUsed.getFullYear();

        if (isSameMonthAndYear && usage.count >= 1) {
          setLimitReached(true);
          setError(t('tryFree.errorLimitReached'));
        }
      }
    };

    checkFreeTrialUsage();
  }, [t]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if ((droppedFile.type === "application/pdf" || droppedFile.type.startsWith("image/")) && droppedFile.size <= 10 * 1024 * 1024) {
        setFile(droppedFile);
        setError(null);
      } else {
        setError(t('tryFree.errorInvalidFile'));
      }
    }
  }, [t]);

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if ((selectedFile.type === "application/pdf" || selectedFile.type.startsWith("image/")) && selectedFile.size <= 10 * 1024 * 1024) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError(t('tryFree.errorInvalidFile'));
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError(t('tryFree.errorUploadFile'));
      return;
    }

    if (!contractType) {
      setError(t('tryFree.errorSelectType'));
      return;
    }

    if (limitReached) {
      setError(t('tryFree.errorLimitReached'));
      return;
    }

    setAnalyzing(true);
    setError(null);
    setProgress(0);

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 5, 80));
    }, 300);

    try {
      console.log('[TryFree] Starting analysis process...');
      console.log('[TryFree] File:', { name: file.name, type: file.type, size: file.size });
      console.log('[TryFree] Contract type:', contractType);

      // Capture file metadata
      const fileSizeKb = Math.round(file.size / 1024);
      const fileExtension = file.name.split('.').pop().toLowerCase();
      
      // Step 1: Upload file
      console.log('[TryFree] Step 1: Uploading file...');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      console.log('[TryFree] File uploaded successfully:', file_url);
      setProgress(30);
      
      // Step 2: Extract text from file
      console.log('[TryFree] Step 2: Extracting text from file...');
      let fileContent = '';
      try {
        if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
          const extractionResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
            file_url: file_url,
            json_schema: {
              type: "object",
              properties: {
                full_text: {
                  type: "string",
                  description: "Complete text content of the contract document"
                }
              }
            }
          });
          
          if (extractionResult.status === 'success' && extractionResult.output) {
            fileContent = extractionResult.output.full_text || '';
          }
        }
        
        if (!fileContent || fileContent.length < 100) {
          throw new Error(t('upload.unableToExtractText'));
        }
        
        console.log('[TryFree] Text extracted successfully, length:', fileContent.length);
        setProgress(50);
      } catch (extractError) {
        console.error("[TryFree] Text extraction error:", extractError);
        clearInterval(progressInterval); 
        setProgress(0);
        setAnalyzing(false);
        throw new Error(t('upload.unableToExtractText'));
      }
      
      // Step 3: Analyze with Claude
      console.log('[TryFree] Step 3: Analyzing contract with AI...');
      const analysisResponse = await base44.functions.invoke('publicAnalyzeContract', {
        fileContent: fileContent,
        contractType: contractType,
        contractTitle: file.name,
        responseLanguage: language,
        fileSize: fileSizeKb,
        fileType: fileExtension
      });
      
      setProgress(90);
      
      if (!analysisResponse.data || !analysisResponse.data.success) {
        throw new Error(analysisResponse.data?.error || t('upload.analysisFailed'));
      }

      const analysis = analysisResponse.data.analysis;
      console.log('[TryFree] Analysis completed successfully');

      // Step 4: Create temporary analysis object
      const tempAnalysisId = crypto.randomUUID();
      const now = new Date();
      
      const tempAnalysis = {
        id: tempAnalysisId,
        contractTitle: file.name,
        contractType: contractType,
        file_url: file_url,
        analysis: analysis,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };

      console.log('[TryFree] Temporary analysis object created:', {
        id: tempAnalysis.id,
        title: tempAnalysis.contractTitle,
        type: tempAnalysis.contractType,
        hasFileUrl: !!tempAnalysis.file_url,
        hasAnalysis: !!tempAnalysis.analysis,
        expiresAt: new Date(tempAnalysis.expiresAt).toISOString()
      });

      // Step 5: Store in localStorage
      localStorageUtils.setItem(`analysis_${tempAnalysisId}`, JSON.stringify(tempAnalysis));
      console.log('[TryFree] Analysis stored in localStorage');

      // Update free trial usage
      const storageKey = 'contractguard_free_trial_usage';
      const now2 = new Date();
      const stored = localStorage.getItem(storageKey);

      let usage = { count: 0, lastUsedDate: now2.toISOString() };

      if (stored) {
        const existingUsage = JSON.parse(stored);
        const lastUsed = new Date(existingUsage.lastUsedDate);

        const isSameMonthAndYear =
          now2.getMonth() === lastUsed.getMonth() &&
          now2.getFullYear() === lastUsed.getFullYear();

        if (isSameMonthAndYear) {
          usage.count = existingUsage.count + 1;
        } else {
          usage.count = 1;
        }
      } else {
        usage.count = 1;
      }

      usage.lastUsedDate = now2.toISOString();
      localStorage.setItem(storageKey, JSON.stringify(usage));
      console.log('[TryFree] Free trial usage updated:', usage);

      clearInterval(progressInterval);
      setProgress(100);

      setTimeout(() => {
        console.log('[TryFree] Navigating to analysis preview...');
        navigate(createPageUrl("AnalysisPreview") + "?temp_id=" + tempAnalysisId);
      }, 300);

    } catch (err) {
      clearInterval(progressInterval);
      console.error('[TryFree] Error during analysis:', err);
      setError(err.message || t('tryFree.errorFailed'));
      setAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 shadow-sm pt-2">
        <div className="container mx-auto px-4 sm:px-6">
          <PublicNavbar />
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-4 px-4 py-1.5 text-sm font-semibold">
            ⚡ {t('tryFree.badge')}
          </Badge>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t('tryFree.title')}{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
              {t('tryFree.titleHighlight')}
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8">
            {t('tryFree.subtitle')}
          </p>
        </motion.div>

        {limitReached && (
          <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-xl mb-6">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('tryFree.limitReachedTitle')}
              </h3>
              <p className="text-gray-700 mb-6">
                {t('tryFree.limitReachedMessage')}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link to={createPageUrl("Dashboard")} className="w-full sm:w-auto">
                  <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    {t('common.createFreeAccount')}
                  </Button>
                </Link>
                <Link to={createPageUrl("Pricing")} className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full">
                    {t('common.pricing')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Image Quality Alert */}
        <Alert className="mb-6 border-blue-200 bg-blue-50">
          <Info className="h-5 w-5 text-blue-600" />
          <AlertDescription className="text-sm text-gray-700 ml-2">
            <strong className="font-semibold text-gray-900">{t('upload.imageQualityTitle')}</strong>
            <br />
            {t('upload.imageQualityMessage')}
          </AlertDescription>
        </Alert>

        <Card className={`bg-white rounded-2xl shadow-2xl p-8 md:p-12 ${limitReached ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="mb-8">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
              }`}
              onClick={() => document.getElementById('file-upload-free')?.click()}
            >
              <input
                type="file"
                id="file-upload-free"
                accept=".pdf,image/jpeg,image/png"
                onChange={handleFileInput}
                className="hidden"
                disabled={analyzing || limitReached}
              />

              {file ? (
                <div className="flex flex-col items-center justify-center gap-4">
                  <FileText className="w-16 h-16 text-blue-600" />
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 text-lg">{file.name}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={(e) => {e.stopPropagation(); setFile(null);}}
                    disabled={analyzing || limitReached}
                  >
                    <X className="w-4 h-4 mr-1" /> {t('tryFree.remove')}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <UploadIcon className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <p className="text-gray-700 font-semibold text-xl mb-2">
                    {t('tryFree.uploadZonePlaceholder')}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {t('tryFree.uploadZoneFormats')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mb-8">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              {t('tryFree.contractType')}
            </label>
            <Select value={contractType} onValueChange={setContractType} disabled={analyzing || limitReached}>
              <SelectTrigger className="w-full h-14 text-base">
                <SelectValue placeholder={t('tryFree.selectContractType')} />
              </SelectTrigger>
              <SelectContent>
                {contractTypes.map((ct) => (
                  <SelectItem key={ct.value} value={ct.value}>
                    {ct.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {analyzing && (
            <div className="space-y-2 mb-6">
              <Progress value={progress} />
              <p className="text-sm text-center text-gray-600">{t('tryFree.analyzing')}</p>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={!file || !contractType || analyzing || limitReached}
            className="w-full h-16 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-lg font-semibold shadow-lg shadow-blue-600/25"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t('tryFree.analyzing')}
              </>
            ) : limitReached ? (
              t('tryFree.createAccountToContinue')
            ) : (
              t('tryFree.analyzeButton')
            )}
          </Button>
        </Card>

        {!limitReached && (
          <div className="text-center mt-8 space-y-3">
            <p className="text-gray-600">
              {t('tryFree.alreadyHaveAccount')}{" "}
              <Link
                to={createPageUrl("Dashboard")}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                {t('tryFree.logIn')}
              </Link>
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}