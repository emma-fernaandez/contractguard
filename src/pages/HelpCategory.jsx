import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Loader2,
  AlertCircle,
  FileText,
  Rocket,
  CreditCard,
  Shield,
  Settings,
  UsersRound,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PublicNavbar from "../components/landing/PublicNavbar";
import Footer from "../components/landing/Footer";
import { base44 } from "@/api/base44Client";
import { useTranslation } from "../components/i18n/I18nProvider";

const normalizeCategoryKey = (categoryName) => {
  const mapping = {
    "Getting Started": "getting-started",
    "Contract Analysis": "contract-analysis",
    "Billing & Plans": "billing",
    "Billings & Plans": "billing",
    "Pricing & Plans": "pricing",
    "Security & Privacy": "security",
    "Privacy & Security": "security",
    "Account Settings": "account",
    "Team & Business": "team",
    "Features & Analysis": "features-analysis",
    "Legal & Compliance": "legal-compliance",
    "Technical Support": "technical-support"
  };
  
  return mapping[categoryName] || categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

const categoryIcons = {
  "getting-started": Rocket,
  "contract-analysis": FileText,
  "billing": CreditCard,
  "pricing": CreditCard,
  "security": Shield,
  "account": Settings,
  "team": UsersRound,
  "features-analysis": Sparkles,
  "legal-compliance": FileText,
  "technical-support": Settings
};

const categoryColors = {
  "getting-started": "blue",
  "contract-analysis": "purple",
  "billing": "orange",
  "pricing": "green",
  "security": "green",
  "account": "red",
  "team": "yellow",
  "features-analysis": "purple",
  "legal-compliance": "orange",
  "technical-support": "gray"
};

export default function HelpCategoryPage() {
  const { t } = useTranslation();
  const [categoryName, setCategoryName] = useState("");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    
    if (category) {
      setCategoryName(category);
      fetchCategoryArticles(category);
    } else {
      setError(t('help.noCategorySelected'));
      setLoading(false);
    }
  }, [t]);

  const fetchCategoryArticles = async (category) => {
    try {
      setLoading(true);
      const response = await base44.functions.invoke('getNotionHelpArticles', {
        category: category
      });
      
      if (response.data.success) {
        setArticles(response.data.articles);
      } else {
        setError(t('help.failedToLoad'));
      }
    } catch (err) {
      console.error('Error fetching category articles:', err);
      setError(t('help.unableToLoad'));
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (categoryName) => {
    const key = normalizeCategoryKey(categoryName);
    return categoryIcons[key] || FileText;
  };

  const getCategoryColor = (categoryName) => {
    const key = normalizeCategoryKey(categoryName);
    return categoryColors[key] || 'gray';
  };

  const getCategoryColorClass = (categoryName) => {
    const color = getCategoryColor(categoryName);
    const colorMap = {
      'blue': 'from-blue-500 to-blue-600',
      'purple': 'from-purple-500 to-purple-600',
      'orange': 'from-orange-500 to-orange-600',
      'green': 'from-green-500 to-green-600',
      'red': 'from-red-500 to-red-600',
      'yellow': 'from-yellow-500 to-yellow-600',
      'gray': 'from-gray-500 to-gray-600'
    };
    return colorMap[color] || 'from-gray-500 to-gray-600';
  };

  const CategoryIcon = getCategoryIcon(categoryName);
  const normalizedKey = normalizeCategoryKey(categoryName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <PublicNavbar />
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link 
              to={createPageUrl("Help")} 
              className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('help.backToHelp')}
            </Link>

            <div className="flex items-center gap-4 mb-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getCategoryColorClass(categoryName)} flex items-center justify-center shadow-lg`}>
                <CategoryIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  {t('help.' + normalizedKey)}
                </h1>
                <p className="text-blue-100 mt-2">
                  {t('help.categoryArticlesCount', { count: articles.length })}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('common.error')}
                </h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <Link to={createPageUrl("Help")}>
                  <Button>{t('help.backToHelp')}</Button>
                </Link>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('help.noArticlesYet')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('help.checkBackSoon')}
                </p>
                <Link to={createPageUrl("Help")}>
                  <Button>{t('help.browseAllCategories')}</Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {articles.map((article, index) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={createPageUrl("HelpArticle") + "?id=" + article.id}>
                      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full group cursor-pointer">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <Badge className="bg-blue-100 text-blue-700">
                              {article.category}
                            </Badge>
                            {article.featured && (
                              <Badge className="bg-yellow-100 text-yellow-700">
                                {t('help.featured')}
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                            {article.title}
                          </h3>

                          {article.excerpt && (
                            <p className="text-gray-600 mb-4 line-clamp-3">
                              {article.excerpt}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{article.readTime}</span>
                            </div>
                            {article.tags && article.tags.length > 0 && (
                              <div className="flex gap-2">
                                {article.tags.slice(0, 2).map((tag, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('help.stillNeedHelp')}
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              {t('help.cantFindAnswer')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={createPageUrl("Contact")}>
                <Button size="lg">
                  {t('help.contactSupport')}
                </Button>
              </Link>
              <Link to={createPageUrl("Help")}>
                <Button size="lg" variant="outline">
                  {t('help.browseAllCategories')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}