
import React, { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Upload as UploadIcon,
  FileText,
  AlertCircle,
  X,
  Loader2,
  ArrowLeft,
  Info
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation } from "@tanstack/react-query"; // Added useMutation
import { useTranslation } from "@/components/i18n/I18nProvider";

export default function UploadPage() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();

  // Localized contract types for the Select component
  const contractTypes = [
    { value: "rental_lease", label: t('upload.rentalLease') },
    { value: "employment", label: t('upload.employment') },
    { value: "freelance_service", label: t('upload.freelanceService') },
    { value: "subscription", label: t('upload.subscription') },
    { value: "purchase_agreement", label: t('upload.purchaseAgreement') },
    { value: "other", label: t('upload.other') }
  ];

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("other");
  const [dragActive, setDragActive] = useState(false);
  // `uploading` state will now be managed by `uploadMutation.isLoading`
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [limitReached, setLimitReached] = useState(false);

  // Fetch user data
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  // Check if user can analyze using the backend function
  const { data: canAnalyzeData, isLoading: checkingPermissions } = useQuery({
    queryKey: ['can-user-analyze', user?.id],
    queryFn: async () => {
      const response = await base44.functions.invoke('canUserAnalyze');
      return response.data; // Assuming response.data contains { canAnalyze: boolean, message: string }
    },
    enabled: !!user, // Only run this query if user data is available
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    cacheTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    retry: false, // Don't retry if it fails, as it might be a permission issue
  });

  React.useEffect(() => {
    if (canAnalyzeData) { // Only proceed if canAnalyzeData is not null/undefined
      if (!canAnalyzeData.canAnalyze) {
        setLimitReached(true);
        // Use the message from the backend, if available, otherwise a default localized message
        setError(canAnalyzeData.message || t('upload.monthlyLimitReached'));
      } else {
        setLimitReached(false);
        // Clear error if permissions are restored, but only if it was a limit error
        if (error === t('upload.monthlyLimitReached') || error === canAnalyzeData.message) {
          setError(null);
        }
      }
    }
  }, [canAnalyzeData, t, error]);

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
        if (!title) {
          setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
        }
        setError(null);
      } else {
        setError(t('upload.invalidFormat'));
      }
    }
  }, [title, t]);

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
       if ((selectedFile.type === "application/pdf" || selectedFile.type.startsWith("image/")) && selectedFile.size <= 10 * 1024 * 1024) {
        setFile(selectedFile);
        if (!title) {
          setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
        }
        setError(null);
      } else {
        setError(t('upload.invalidFormat'));
      }
    }
  };

  const uploadMutation = useMutation({
    mutationFn: async ({ file, title, type }) => {
      // Track upload initiation
      try {
        if (user) {
          await base44.functions.invoke('trackFeatureUsage', {
            featureName: 'upload_contract',
            success: true,
            metadata: {
              contract_type: type,
              file_type: file.type,
              file_size_kb: Math.round(file.size / 1024),
              plan: user?.plan || 'free',
              source_page: 'upload'
            }
          });
        }
      } catch (trackError) {
        console.error('Failed to track upload initiation:', trackError);
      }

      // Reset error and progress for the new upload attempt
      setError(null);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 5, 80));
      }, 300);

      try {
        // Capture file metadata
        const fileSizeKb = Math.round(file.size / 1024);
        const fileExtension = file.name.split('.').pop().toLowerCase();

        // Step 1: Upload file
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setUploadProgress(30);

        // Step 2: Extract text from file
        let fileContent = '';
        try {
          if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
            // Use Core.ExtractDataFromUploadedFile for PDFs and images
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

          if (!fileContent || fileContent.length < 100) { // Require at least 100 chars for meaningful analysis
            throw new Error(t('upload.unableToExtractText'));
          }

          setUploadProgress(50);
        } catch (extractError) {
          console.error("Text extraction error:", extractError);
          // Clear interval on extraction error as well
          clearInterval(progressInterval);
          setUploadProgress(0);
          throw new Error(t('upload.textExtractionFailed'));
        }

        // Step 3: Analyze with Claude - PASS CURRENT LANGUAGE + FILE METADATA
        // This function will also handle marking a free analysis as used, if applicable.
        const analysisResponse = await base44.functions.invoke('analyzeContract', {
          fileContent: fileContent,
          contractType: type,
          contractTitle: title,
          responseLanguage: language,
          fileSize: fileSizeKb,
          fileType: fileExtension
        });

        setUploadProgress(90);

        if (!analysisResponse.data || !analysisResponse.data.success) {
          throw new Error(analysisResponse.data?.error || t('upload.analysisFailed'));
        }

        const analysis = analysisResponse.data.analysis;

        // Step 4: Create contract record
        const newContract = await base44.entities.Contract.create({
          title,
          type,
          file_url,
          status: "completed",
          analysis: analysis
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        return newContract; // Return the new contract for onSuccess
      } catch (err) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        throw err; // Re-throw to be caught by onError
      }
    },
    onSuccess: (newContract) => { // `newContract` is the data returned by the `mutationFn`
      // Track successful analysis
      if (user) {
        base44.functions.invoke('trackFeatureUsage', {
          featureName: 'analyze_contract',
          analysisId: newContract.id, // Use the ID from the created contract
          success: true,
          metadata: {
            contract_type: newContract.type, // Use the type from the created contract
            plan: user?.plan || 'free',
            source_page: 'upload'
          }
        }).catch(err => console.error('Failed to track successful analysis:', err));
      }
      navigate(createPageUrl("Analysis") + "?id=" + newContract.id);
    },
    onError: (err) => {
      // Track failed analysis
      if (user) {
        base44.functions.invoke('trackFeatureUsage', {
          featureName: 'analyze_contract',
          success: false,
          errorMessage: err.message,
          metadata: {
            plan: user?.plan || 'free',
            source_page: 'upload'
          }
        }).catch(trackErr => console.error('Failed to track failed analysis:', trackErr));
      }
      setError(err.message || t('upload.uploadError'));
      console.error(err);
    }
  });

  // Alias for readability, using the isLoading state from useMutation
  const uploading = uploadMutation.isLoading;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if limit reached
    if (limitReached) {
      // The error message would have been set by the useEffect when canAnalyzeData arrived
      // We can add a fallback here if for some reason it wasn't set.
      if (!error) {
        setError(t('upload.monthlyLimitReachedMessage'));
      }
      return;
    }

    if (!file || !title) {
      setError(t('upload.fillAllFields'));
      return;
    }

    // Trigger the mutation
    uploadMutation.mutate({ file, title, type });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl w-full"
      >
        {/* Limit Reached Banner */}
        {limitReached && (
          <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50 shadow-xl mb-6">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {t('upload.monthlyLimitReachedTitle')}
              </h3>
              <p className="text-gray-700 mb-6">
                {t('upload.monthlyLimitReachedDescription')}
              </p>
              <Link to={createPageUrl("Pricing")}>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  {t('upload.viewProPlans')}
                </Button>
              </Link>
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

        <Card className={`border-0 shadow-2xl bg-white overflow-hidden ${limitReached ? 'opacity-50 pointer-events-none' : ''}`}>
          <CardHeader className="p-8 text-center">
            <CardTitle className="text-2xl font-bold">{t('upload.analyzeNewContract')}</CardTitle>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400"
                }`}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,image/jpeg,image/png"
                  onChange={handleFileInput}
                  className="hidden"
                  disabled={uploading || checkingPermissions}
                />

                {file ? (
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileText className="w-12 h-12 text-blue-600" />
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {e.stopPropagation(); setFile(null); setTitle("");}}
                        disabled={uploading || checkingPermissions}
                      >
                        <X className="w-4 h-4 mr-1" /> {t('upload.remove')}
                      </Button>
                    </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700 font-semibold text-lg mb-2">
                      {t('upload.dragContractHere')}
                    </p>
                    <p className="text-gray-500">
                      {t('upload.orClickToBrowse')}
                    </p>
                    <p className="text-xs text-gray-400 mt-4">
                      {t('upload.acceptedFormats')}
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title">{t('upload.contractName')}</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t('upload.contractNamePlaceholder')}
                      className="mt-2"
                      disabled={uploading || checkingPermissions}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">{t('upload.contractType')}</Label>
                    <Select value={type} onValueChange={setType} disabled={uploading || checkingPermissions}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
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
              </div>

              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} />
                  <p className="text-sm text-center text-gray-600">{t('upload.analyzingContract')}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={!file || !title || uploading || limitReached || checkingPermissions}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-6 text-lg shadow-lg shadow-blue-600/25"
              >
                {checkingPermissions ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('upload.checkingPermissions')}
                  </>
                ) : uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {t('upload.analyzing')}
                  </>
                ) : limitReached ? (
                  t('upload.upgradeToAnalyzeMore')
                ) : (
                  t('upload.analyzeContract')
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
