
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Upload, 
  Star,
  Eye,
  Search,
  AlertCircle,
  Trash2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { es, it } from "date-fns/locale";
import DeleteConfirmModal from "../components/analysis/DeleteConfirmModal";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "@/components/i18n/I18nProvider";

export default function MyAnalyses() {
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
  
  // Translate contract status
  const translateContractStatus = (status) => {
    const statusMap = {
      'completed': 'completed',
      'processing': 'processing',
      'error': 'error'
    };
    
    const translationKey = statusMap[status] || 'processing';
    return t(`myanalyses.${translationKey}`);
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);
  const itemsPerPage = 20;

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['all-contracts'],
    queryFn: async () => {
      const userEmail = (await base44.auth.me()).email;
      return base44.entities.Contract.filter({ created_by: userEmail }, '-created_date');
    },
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.Contract.delete(id);
    },
    onSuccess: () => {
      toast({
        title: t('myanalyses.analysisDeleted'),
        description: t('myanalyses.analysisDeletedDescription'),
      });
      queryClient.invalidateQueries({ queryKey: ['all-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      setDeleteModalOpen(false);
      setContractToDelete(null);
    },
    onError: () => {
      toast({
        title: t('myanalyses.deleteFailed'),
        description: t('myanalyses.deleteFailedDescription'),
        variant: "destructive",
      });
    },
  });

  const handleDeleteClick = (contract) => {
    setContractToDelete(contract);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (contractToDelete) {
      deleteMutation.mutate(contractToDelete.id);
    }
  };

  // Filter contracts
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesType = typeFilter === 'all' || contract.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const paginatedContracts = filteredContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getTypeIcon = (type) => {
    return <FileText className="w-4 h-4" />;
  };

  const getRating = (score) => {
    return Math.max(0.5, Math.round((score / 100) * 5 * 2) / 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('myanalyses.myAnalyses')}</h1>
            <p className="text-gray-600 mt-1">{t('myanalyses.totalContracts', { count: filteredContracts.length })}</p>
          </div>
          
          <Link to={createPageUrl("Upload")}>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              <Upload className="w-5 h-5 mr-2" />
              {t('myanalyses.uploadNew')}
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6 border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder={t('myanalyses.searchContracts')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('myanalyses.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('myanalyses.allStatus')}</SelectItem>
                  <SelectItem value="completed">{t('myanalyses.completed')}</SelectItem>
                  <SelectItem value="processing">{t('myanalyses.processing')}</SelectItem>
                  <SelectItem value="error">{t('myanalyses.error')}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t('myanalyses.type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('myanalyses.allTypes')}</SelectItem>
                  <SelectItem value="rental_lease">{t('myanalyses.rentalLease')}</SelectItem>
                  <SelectItem value="employment">{t('myanalyses.employment')}</SelectItem>
                  <SelectItem value="freelance_service">{t('myanalyses.freelance')}</SelectItem>
                  <SelectItem value="subscription">{t('myanalyses.subscription')}</SelectItem>
                  <SelectItem value="purchase_agreement">{t('myanalyses.purchase')}</SelectItem>
                  <SelectItem value="other">{t('myanalyses.other')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Retention Notice */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-700">
                <strong>{t('myanalyses.dataRetention')}:</strong> {t('myanalyses.dataRetentionDescription')}{" "}
                <Link to={createPageUrl("Account")} className="text-blue-600 hover:text-blue-700 underline font-semibold">
                  {t('myanalyses.accountSettings')}
                </Link>
                . {t('myanalyses.dataRetentionNote')}
              </p>
            </div>
          </div>
        </div>

        {/* Contracts Table */}
        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">{t('myanalyses.loadingContracts')}</p>
              </div>
            ) : filteredContracts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('myanalyses.noContractsFound')}
                </h3>
                <p className="text-gray-600">
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' 
                    ? t('myanalyses.tryAdjustingFilters') 
                    : t('myanalyses.uploadFirstContract')}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('myanalyses.contract')}</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('myanalyses.type')}</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('myanalyses.date')}</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('myanalyses.status')}</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">{t('myanalyses.score')}</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">{t('myanalyses.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {paginatedContracts.map((contract, index) => (
                          <motion.tr
                            key={contract.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ delay: index * 0.02 }}
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
                              <Badge
                                className={
                                  contract.status === 'completed' ? 'bg-green-100 text-green-700' :
                                  contract.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                  'bg-red-100 text-red-700'
                                }
                              >
                                {translateContractStatus(contract.status)}
                              </Badge>
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
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => navigate(createPageUrl("Analysis") + "?id=" + contract.id)}
                                >
                                  <Eye className="w-4 h-4" />
                                  <span className="hidden sm:inline">{t('myanalyses.view')}</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
                                  onClick={() => handleDeleteClick(contract)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span className="hidden sm:inline">{t('myanalyses.delete')}</span>
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
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
                      {t('myanalyses.previous')}
                    </Button>
                    {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                      const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (page > totalPages) return null;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      {t('myanalyses.next')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setContractToDelete(null);
        }}
        onConfirm={confirmDelete}
        contractTitle={contractToDelete?.title || ''}
        isDeleting={deleteMutation.isLoading}
      />
    </div>
  );
}
