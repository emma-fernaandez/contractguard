
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { User, Mail, Calendar, CheckCircle2, AlertCircle, Download, Trash2, Shield, Lock } from "lucide-react";
import { format } from "date-fns";
import { es, it } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/components/i18n/I18nProvider";

export default function Account() {
  const queryClient = useQueryClient();
  const { t, language } = useTranslation();
  
  // Get the correct locale for date formatting
  const getLocale = () => {
    switch (language) {
      case 'es': return es;
      case 'it': return it;
      default: return undefined; // English is default
    }
  };
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAutoDeleteModal, setShowAutoDeleteModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [autoDeleteDays, setAutoDeleteDays] = useState(null);
  const [savingPrivacySettings, setSavingPrivacySettings] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
    onSuccess: (data) => {
      setFullName(data.full_name || "");
      setAutoDeleteDays(data.auto_delete_days || null);
    }
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ['user-contracts'],
    queryFn: async () => {
      const userEmail = (await base44.auth.me()).email;
      return base44.entities.Contract.filter({ created_by: userEmail });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (userData) => base44.auth.updateMe(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      setIsEditing(false);
      setSuccessMessage(t('account.profileUpdatedSuccessfully'));
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: () => {
      setErrorMessage(t('account.failedToUpdateProfile'));
      setTimeout(() => setErrorMessage(""), 3000);
    }
  });

  const updatePrivacyMutation = useMutation({
    mutationFn: (userData) => base44.auth.updateMe(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      setSuccessMessage(t('account.privacySettingsSavedSuccessfully'));
      setTimeout(() => setSuccessMessage(""), 3000);
      setSavingPrivacySettings(false);
      setShowAutoDeleteModal(false);
    },
    onError: () => {
      setErrorMessage(t('account.failedToUpdatePrivacySettings'));
      setTimeout(() => setErrorMessage(""), 3000);
      setSavingPrivacySettings(false);
    }
  });

  const handleSave = () => {
    updateMutation.mutate({ full_name: fullName });
  };

  const handleCancel = () => {
    setFullName(user?.full_name || "");
    setIsEditing(false);
  };

  const handleAutoDeleteChange = (value) => {
    const newValue = value === 'never' ? null : parseInt(value);

    if (user?.auto_delete_days === null && newValue !== null) {
      setAutoDeleteDays(newValue);
      setShowAutoDeleteModal(true);
    } else {
      setAutoDeleteDays(newValue);
    }
  };

  const savePrivacySettings = () => {
    setSavingPrivacySettings(true);
    updatePrivacyMutation.mutate({ auto_delete_days: autoDeleteDays });
  };

  const getAutoDeleteLabel = () => {
    if (autoDeleteDays === null) return t('account.keepIndefinitely');
    if (autoDeleteDays === 30) return t('account.autoDeleteAfter30Days');
    if (autoDeleteDays === 60) return t('account.autoDeleteAfter60Days');
    if (autoDeleteDays === 90) return t('account.autoDeleteAfter90Days');
    if (autoDeleteDays === 365) return t('account.autoDeleteAfter1Year');
    return t('account.keepIndefinitely');
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const exportData = {
        account: {
          email: user?.email,
          full_name: user?.full_name,
          role: user?.role,
          created_date: user?.created_date,
          auto_delete_days: user?.auto_delete_days,
          exported_at: new Date().toISOString()
        },
        contracts: contracts.map((contract) => ({
          id: contract.id,
          title: contract.title,
          type: contract.type,
          status: contract.status,
          created_date: contract.created_date,
          analysis: contract.analysis
        })),
        statistics: {
          total_analyses: contracts.length,
          account_age_days: user?.created_date ?
          Math.floor((Date.now() - new Date(user.created_date).getTime()) / (1000 * 60 * 60 * 24)) :
          0
        }
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contractguard-data-export-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMessage(t('account.dataExportedSuccessfully'));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setErrorMessage(t('account.failedToExportData'));
      setTimeout(() => setErrorMessage(""), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setErrorMessage(t('account.contactSupportToDeleteAccount'));
      setShowDeleteDialog(false);
    } catch (error) {
      setErrorMessage(t('account.failedToDeleteAccount'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('account.accountSettings')}</h1>
          <p className="text-sm sm:text-base text-gray-600">{t('account.manageAccountInformation')}</p>
        </motion.div>

        {successMessage &&
        <Alert className="mb-4 sm:mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 text-sm">{successMessage}</AlertDescription>
          </Alert>
        }

        {errorMessage &&
        <Alert className="mb-4 sm:mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{errorMessage}</AlertDescription>
          </Alert>
        }

        {/* Profile Information */}
        <Card className="border-0 shadow-lg bg-white mb-4 sm:mb-6">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl font-bold">{t('account.profileInformation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-700 font-bold text-2xl sm:text-3xl">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0)}
                </span>
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{user?.full_name || t('account.user')}</h2>
                <p className="text-sm sm:text-base text-gray-600 break-all">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName" className="text-sm sm:text-base">{t('account.fullName')}</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditing}
                    className={`text-sm sm:text-base ${!isEditing ? 'bg-gray-50' : ''}`} />
                </div>
              </div>

              <div>
                <Label className="text-sm sm:text-base">{t('account.emailAddress')}</Label>
                <div className="flex items-center gap-2 sm:gap-3 mt-2 p-3 bg-gray-50 rounded-lg">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-700 break-all">{user?.email}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('account.emailCannotBeChanged')}</p>
              </div>

              <div>
                <Label className="text-sm sm:text-base">{t('account.memberSince')}</Label>
                <div className="flex items-center gap-2 sm:gap-3 mt-2 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-700">
                    {user?.created_date ?
                    format(new Date(user.created_date), "MMMM d, yyyy", { locale: getLocale() }) :
                    '-'
                    }
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-sm sm:text-base">{t('account.accountType')}</Label>
                <div className="flex items-center gap-2 sm:gap-3 mt-2 p-3 bg-gray-50 rounded-lg">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <span className="text-sm sm:text-base text-gray-700 capitalize">
                    {user?.role || t('account.user')}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {!isEditing ?
              <Button
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm sm:text-base">
                  {t('account.editProfile')}
                </Button> :
              <>
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isLoading}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm sm:text-base">
                    {updateMutation.isLoading ? t('account.saving') : t('account.saveChanges')}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="w-full sm:w-auto text-sm sm:text-base">
                    {t('account.cancel')}
                  </Button>
                </>
              }
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Data Management */}
        <Card className="border-0 shadow-lg bg-white mb-4 sm:mb-6">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg sm:text-xl font-bold">{t('account.privacyDataManagement')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
            {/* Auto-Delete Settings */}
            <div className="border-2 border-blue-100 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-white">
              <div className="flex items-start gap-2 sm:gap-3 mb-4">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1">{t('account.automaticDeletion')}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    {t('account.controlHowLongAnalysesStored')}
                  </p>

                  {/* Current Setting Badge */}
                  <div className="mb-4">
                    <span className="text-xs sm:text-sm text-gray-600">{t('account.currentSetting')}: </span>
                    <Badge className="bg-blue-100 text-blue-700 text-xs sm:text-sm">
                      {getAutoDeleteLabel()}
                    </Badge>
                  </div>

                  {/* Radio Options */}
                  <div className="space-y-2 sm:space-y-3">
                    <label className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-blue-50 cursor-pointer border-2 border-transparent hover:border-blue-200 transition-all">
                      <input
                        type="radio"
                        name="autoDelete"
                        value="never"
                        checked={autoDeleteDays === null}
                        onChange={(e) => handleAutoDeleteChange(e.target.value)}
                        className="mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-gray-900">{t('account.neverDefault')}</div>
                        <div className="text-xs sm:text-sm text-gray-600">{t('account.keepAnalysesIndefinitely')}</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-blue-50 cursor-pointer border-2 border-transparent hover:border-blue-200 transition-all">
                      <input
                        type="radio"
                        name="autoDelete"
                        value="30"
                        checked={autoDeleteDays === 30}
                        onChange={(e) => handleAutoDeleteChange(e.target.value)}
                        className="mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-gray-900">{t('account.autoDelete30Days')}</div>
                        <div className="text-xs sm:text-sm text-gray-600">{t('account.autoDelete30DaysDescription')}</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-blue-50 cursor-pointer border-2 border-transparent hover:border-blue-200 transition-all">
                      <input
                        type="radio"
                        name="autoDelete"
                        value="60"
                        checked={autoDeleteDays === 60}
                        onChange={(e) => handleAutoDeleteChange(e.target.value)}
                        className="mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-gray-900">{t('account.autoDelete60Days')}</div>
                        <div className="text-xs sm:text-sm text-gray-600">{t('account.autoDelete60DaysDescription')}</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-blue-50 cursor-pointer border-2 border-transparent hover:border-blue-200 transition-all">
                      <input
                        type="radio"
                        name="autoDelete"
                        value="90"
                        checked={autoDeleteDays === 90}
                        onChange={(e) => handleAutoDeleteChange(e.target.value)}
                        className="mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-gray-900">{t('account.autoDelete90Days')}</div>
                        <div className="text-xs sm:text-sm text-gray-600">{t('account.autoDelete90DaysDescription')}</div>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-blue-50 cursor-pointer border-2 border-transparent hover:border-blue-200 transition-all">
                      <input
                        type="radio"
                        name="autoDelete"
                        value="365"
                        checked={autoDeleteDays === 365}
                        onChange={(e) => handleAutoDeleteChange(e.target.value)}
                        className="mt-1 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-gray-900">{t('account.autoDelete1Year')}</div>
                        <div className="text-xs sm:text-sm text-gray-600">{t('account.autoDelete1YearDescription')}</div>
                      </div>
                    </label>
                  </div>

                  {/* Info Callout */}
                  <div className="mt-3 sm:mt-4 bg-blue-100 border border-blue-200 rounded-lg p-2 sm:p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm text-blue-900">
                      {t('account.autoDeleteInfo')}
                    </p>
                  </div>

                  {/* Save Button */}
                  {autoDeleteDays !== (user?.auto_delete_days || null) && !showAutoDeleteModal &&
                  <Button
                    onClick={savePrivacySettings}
                    disabled={savingPrivacySettings}
                    className="mt-3 sm:mt-4 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm sm:text-base">
                      {savingPrivacySettings ? t('account.saving') : t('account.saveSettings')}
                    </Button>
                  }
                </div>
              </div>
            </div>

            {/* Data Export & Account Deletion */}
            <div className="space-y-3">
              <div>
                <Button
                  onClick={handleExportData}
                  disabled={isExporting}
                  variant="outline"
                  className="w-full sm:w-auto gap-2 text-sm sm:text-base">
                  <Download className="w-4 h-4" />
                  {isExporting ? t('account.exporting') : t('account.exportMyData')}
                </Button>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  {t('account.exportDataDescription')}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  onClick={() => setShowDeleteDialog(true)}
                  variant="outline"
                  className="w-full sm:w-auto gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 text-sm sm:text-base">
                  <Trash2 className="w-4 h-4" />
                  {t('account.deleteMyAccount')}
                </Button>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                  {t('account.deleteAccountDescription')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention Policy */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 mb-2">{t('account.dataRetentionPolicy')}</h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {t('account.dataRetentionDescription')}{" "}
                  <a href="/privacy-policy" className="text-blue-600 hover:text-blue-700 underline">{t('account.privacyPolicy')}</a>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">{t('account.deleteAccountTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-sm sm:text-base">
              <p>
                {t('account.deleteAccountDescription')}
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                <li>{t('account.deleteAccountList1')}</li>
                <li>{t('account.deleteAccountList2')}</li>
                <li>{t('account.deleteAccountList3')}</li>
                <li>{t('account.deleteAccountList4')}</li>
              </ul>
              <p className="font-semibold mt-4 text-sm sm:text-base">
                {t('account.deleteAccountContact')}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto text-sm sm:text-base">{t('account.deleteAccountCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-sm sm:text-base">
              {t('account.deleteAccountConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Auto-Delete Confirmation Modal */}
      <AlertDialog open={showAutoDeleteModal} onOpenChange={setShowAutoDeleteModal}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">{t('account.autoDeleteModalTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-sm sm:text-base">
              <p>
                {t('account.autoDeleteModalDescription')} <strong>{autoDeleteDays} {t('account.autoDeleteModalDays')}</strong>
              </p>
              <p className="font-semibold text-gray-900">
                {t('account.autoDeleteModalApplies')}
              </p>
              <p className="text-xs sm:text-sm">
                {t('account.autoDeleteModalChange')}
              </p>
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3">
                <p className="text-xs sm:text-sm text-yellow-900">
                  ⚠️ <strong>{t('account.autoDeleteModalWarning')}</strong> {autoDeleteDays} {t('account.autoDeleteModalWarningDays')}
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              onClick={() => {
                setAutoDeleteDays(user?.auto_delete_days || null);
                setShowAutoDeleteModal(false);
              }}
              className="w-full sm:w-auto text-sm sm:text-base">
              {t('account.autoDeleteModalCancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={savePrivacySettings}
              disabled={savingPrivacySettings}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-sm sm:text-base">
              {savingPrivacySettings ? t('account.autoDeleteModalEnabling') : t('account.autoDeleteModalConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
