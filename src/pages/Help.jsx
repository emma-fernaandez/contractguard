
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Search,
  Mail,
  MessageSquare,
  BookOpen,
  Video,
  ChevronDown,
  ChevronUp,
  Clock,
  Lightbulb,
  ExternalLink,
  Rocket,
  FileText,
  CreditCard,
  Shield,
  Settings,
  UsersRound,
  Loader2,
  AlertCircle,
  X,
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

const faqData = [
  {
    category: "help.gettingStarted",
    icon: Rocket,
    color: "blue",
    faqs: [
      {
        question: "help.howDoIAnalyze",
        answer: "help.faqAnswer1"
      },
      {
        question: "help.whatFileFormats",
        answer: "help.faqAnswer2"
      },
      {
        question: "help.needAccount",
        answer: "help.faqAnswer3"
      },
      {
        question: "help.howLongAnalysis",
        answer: "help.faqAnswer4"
      }
    ]
  },
  {
    category: "help.featuresAnalysis",
    icon: Sparkles,
    color: "purple",
    faqs: [
      {
        question: "help.whatIncluded",
        answer: "help.faqAnswer5"
      },
      {
        question: "help.howReliable",
        answer: "help.faqAnswer6"
      },
      {
        question: "help.whatTypes",
        answer: "help.faqAnswer7"
      },
      {
        question: "help.canDownload",
        answer: "help.faqAnswer8"
      },
      {
        question: "help.improvedContract",
        answer: "help.faqAnswer9"
      }
    ]
  },
  {
    category: "help.pricingPlans",
    icon: CreditCard,
    color: "green",
    faqs: [
      {
        question: "help.freeIncluded",
        answer: "help.faqAnswer10"
      },
      {
        question: "help.proBenefits",
        answer: "help.faqAnswer11"
      },
      {
        question: "help.cancelAnytime",
        answer: "help.faqAnswer12"
      },
      {
        question: "help.refunds",
        answer: "help.faqAnswer13"
      },
      {
        question: "help.businessAvailable",
        answer: "help.faqAnswer14"
      }
    ]
  },
  {
    category: "help.privacySecurity",
    icon: Shield,
    color: "red",
    faqs: [
      {
        question: "help.dataSecure",
        answer: "help.faqAnswer15"
      },
      {
        question: "help.whoCanSee",
        answer: "help.faqAnswer16"
      },
      {
        question: "help.howLongStore",
        answer: "help.faqAnswer17"
      },
      {
        question: "help.canDeleteData",
        answer: "help.faqAnswer18"
      },
      {
        question: "help.sellData",
        answer: "help.faqAnswer19"
      }
    ]
  },
  {
    category: "help.legalCompliance",
    icon: FileText,
    color: "orange",
    faqs: [
      {
        question: "help.isLegalAdvice",
        answer: "help.faqAnswer20"
      },
      {
        question: "help.useInCourt",
        answer: "help.faqAnswer21"
      },
      {
        question: "help.licensedAttorneys",
        answer: "help.faqAnswer22"
      },
      {
        question: "help.foundMistake",
        answer: "help.faqAnswer23"
      }
    ]
  },
  {
    category: "help.technicalSupport",
    icon: Settings,
    color: "gray",
    faqs: [
      {
        question: "help.uploadFailing",
        answer: "help.faqAnswer24"
      },
      {
        question: "help.takingLong",
        answer: "help.faqAnswer25"
      },
      {
        question: "help.cantLogin",
        answer: "help.faqAnswer26"
      },
      {
        question: "help.incompleteAnalysis",
        answer: "help.faqAnswer27"
      },
      {
        question: "help.reportBugHow",
        answer: "help.faqAnswer28"
      }
    ]
  }
];

export default function HelpPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState({});
  const [articles, setArticles] = useState([]);
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFaqIndexes, setOpenFaqIndexes] = useState({});

  useEffect(() => {
    const fetchHelpArticles = async () => {
      try {
        setLoading(true);
        const response = await base44.functions.invoke('getNotionHelpArticles');
        
        if (response.data.success) {
          setCategories(response.data.categories);
          setArticles(response.data.articles);
          
          const featured = response.data.articles.filter(a => a.featured);
          if (featured.length >= 6) {
            setFeaturedArticles(featured.slice(0, 6));
          } else {
            setFeaturedArticles(response.data.articles.slice(0, 6));
          }
        } else {
          setError('Failed to load help articles');
        }
      } catch (err) {
        console.error('Error fetching help articles:', err);
        setError('Unable to load help articles');
      } finally {
        setLoading(false);
      }
    };

    fetchHelpArticles();
  }, []);

  const quickActions = [
    {
      icon: Mail,
      title: "help.contactSupport",
      description: "help.getHelpFromTeam",
      button: "help.sendMessageButton",
      badge: "help.responseIn24h",
      color: "blue",
      linkTo: createPageUrl("Contact")
    },
    {
      icon: MessageSquare,
      title: "help.liveChatTitle",
      description: "help.chatWithUs",
      button: "help.availableSoon",
      badge: "help.availableSoon",
      color: "green",
      disabled: true
    },
    {
      icon: BookOpen,
      title: "help.knowledgeBaseTitle",
      description: "help.browseHelpArticles",
      button: "help.viewArticlesButton",
      badge: "help.fiftyPlusGuides",
      color: "purple"
    },
    {
      icon: Video,
      title: "help.videoTutorialsTitle",
      description: "help.watchHowToVideos",
      button: "help.availableSoon",
      badge: "help.availableSoon",
      color: "orange",
      disabled: true
    }
  ];

  const toggleFaq = (key) => {
    setOpenFaqIndexes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
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
      'blue': 'bg-blue-100 text-blue-700',
      'purple': 'bg-purple-100 text-purple-700',
      'orange': 'bg-orange-100 text-orange-700',
      'green': 'bg-green-100 text-green-700',
      'red': 'bg-red-100 text-red-700',
      'yellow': 'bg-yellow-100 text-yellow-700',
      'gray': 'bg-gray-100 text-gray-700'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-700';
  };

  const searchArticles = () => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return articles.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.excerpt?.toLowerCase().includes(query) ||
      article.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  };

  const searchFAQs = () => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const allFaqs = [];
    faqData.forEach(categoryGroup => {
      categoryGroup.faqs.forEach((faq, index) => {
        allFaqs.push({
          ...faq,
          category: categoryGroup.category,
          _uniqueKey: `${categoryGroup.category}-${index}`
        });
      });
    });

    return allFaqs.filter(faq =>
      t(faq.question).toLowerCase().includes(query) ||
      t(faq.answer).toLowerCase().includes(query)
    );
  };

  const articleResults = searchArticles();
  const faqResults = searchFAQs();
  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasResults = articleResults.length > 0 || faqResults.length > 0;

  const handlePopularSearchClick = (searchTerm) => {
    setSearchQuery(searchTerm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <PublicNavbar />
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-600 to-blue-700 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {t('help.title')}
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              {t('help.subtitle')}
            </p>

            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder={t('help.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-2xl border-0 shadow-xl text-gray-900 placeholder:text-gray-500"
              />
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <Badge 
                className="bg-white/20 hover:bg-white/30 text-white border-0 cursor-pointer"
                onClick={() => handlePopularSearchClick(t('help.uploadContract'))}
              >
                {t('help.uploadContract')}
              </Badge>
              <Badge 
                className="bg-white/20 hover:bg-white/30 text-white border-0 cursor-pointer"
                onClick={() => handlePopularSearchClick(t('help.redFlags'))}
              >
                {t('help.redFlags')}
              </Badge>
              <Badge 
                className="bg-white/20 hover:bg-white/30 text-white border-0 cursor-pointer"
                onClick={() => handlePopularSearchClick(t('help.pricing'))}
              >
                {t('help.pricing')}
              </Badge>
              <Badge 
                className="bg-white/20 hover:bg-white/30 text-white border-0 cursor-pointer"
                onClick={() => handlePopularSearchClick(t('help.cancelSubscription'))}
              >
                {t('help.cancelSubscription')}
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {hasSearchQuery && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  {t('help.searchResultsFor')} "{searchQuery}"
                </h2>
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  <X className="w-4 h-4 mr-2" />
                  {t('help.clearSearch')}
                </Button>
              </div>

              {!hasResults ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('help.noResultsTitle')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t('help.noResultsMessage', { query: searchQuery })}
                  </p>
                  <Button onClick={() => setSearchQuery("")}>
                    {t('help.browseAllCategories')}
                  </Button>
                </div>
              ) : (
                <div className="space-y-12">
                  {articleResults.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-blue-600" />
                        {t('help.articles')} ({articleResults.length})
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {articleResults.map((article, index) => (
                          <motion.div
                            key={article.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link to={createPageUrl("HelpArticle") + "?id=" + article.id}>
                              <Card className="border-2 border-gray-100 hover:border-blue-600 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                                <CardContent className="p-6">
                                  <Badge className={getCategoryColorClass(article.category) + " mb-3"}>
                                    {t('help.' + normalizeCategoryKey(article.category))}
                                  </Badge>
                                  <h4 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {article.title}
                                  </h4>
                                  {article.excerpt && (
                                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                      {article.excerpt}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Clock className="w-3 h-3" />
                                    <span>{article.readTime}</span>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {faqResults.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Lightbulb className="w-6 h-6 text-yellow-600" />
                        {t('help.faqs')} ({faqResults.length})
                      </h3>
                      <div className="space-y-3">
                        {faqResults.map((faq, index) => {
                          const faqKey = faq._uniqueKey || `search-faq-${index}`;
                          const isOpen = openFaqIndexes[faqKey];

                          return (
                            <motion.div
                              key={faqKey}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <div
                                onClick={() => toggleFaq(faqKey)}
                                className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-600 transition-all cursor-pointer"
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex-1">
                                    <Badge className="bg-gray-100 text-gray-700 mb-2">
                                      {t(faq.category)} FAQ
                                    </Badge>
                                    <h4 className="font-semibold text-gray-900 text-lg">
                                      {t(faq.question)}
                                    </h4>
                                  </div>
                                  {isOpen ? (
                                    <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                                  ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                                  )}
                                </div>
                                {isOpen && (
                                  <p className="text-gray-600 mt-4 leading-relaxed">
                                    {t(faq.answer)}
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {!hasSearchQuery && (
        <>
          <section className="py-16 -mt-10 relative z-10">
            <div className="container mx-auto px-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                      <CardContent className="p-6 text-center">
                        <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${
                          action.color === 'blue' ? 'from-blue-500 to-blue-600' :
                          action.color === 'green' ? 'from-green-500 to-green-600' :
                          action.color === 'purple' ? 'from-purple-500 to-purple-600' :
                          'from-orange-500 to-orange-600'
                        } flex items-center justify-center mx-auto mb-4`}>
                          <action.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{t(action.title)}</h3>
                        <p className="text-sm text-gray-600 mb-4">{t(action.description)}</p>
                        <Badge className={`mb-4 ${action.disabled ? 'bg-gray-100 text-gray-600' : 'bg-gray-100 text-gray-700'} hover:bg-gray-100`}>
                          {t(action.badge)}
                        </Badge>
                        {action.disabled ? (
                          <Button className="w-full hover:bg-gray-200" variant="outline" disabled>
                            {t(action.button)}
                          </Button>
                        ) : action.title === "help.knowledgeBaseTitle" ? (
                          <a href="#browse-categories">
                            <Button className="w-full hover:bg-blue-700">{t(action.button)}</Button>
                          </a>
                        ) : action.linkTo ? (
                          <Link to={action.linkTo}>
                            <Button className="w-full hover:bg-blue-700">{t(action.button)}</Button>
                          </Link>
                        ) : (
                          <Button className="w-full hover:bg-blue-700">{t(action.button)}</Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          <section id="browse-categories" className="py-16 bg-white">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {t('help.browseByCategory')}
                </h2>
                <p className="text-xl text-gray-600">
                  {t('help.browseSubtitle')}
                </p>
              </motion.div>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600">{error}</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                  {Object.keys(categories).map((categoryName, index) => {
                    const CategoryIcon = getCategoryIcon(categoryName);
                    const color = getCategoryColor(categoryName);
                    const catArticles = categories[categoryName] || [];
                    const normalizedKey = normalizeCategoryKey(categoryName);
                    
                    return (
                      <motion.div
                        key={categoryName}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link to={createPageUrl("HelpCategory") + "?category=" + encodeURIComponent(categoryName)}>
                          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full group cursor-pointer">
                            <CardContent className="p-6">
                              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                                color === 'blue' ? 'from-blue-500 to-blue-600' :
                                color === 'purple' ? 'from-purple-500 to-purple-600' :
                                color === 'orange' ? 'from-orange-500 to-orange-600' :
                                color === 'green' ? 'from-green-500 to-green-600' :
                                color === 'red' ? 'from-red-500 to-red-600' :
                                color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
                                'from-gray-500 to-gray-600'
                              } flex items-center justify-center mb-4`}>
                                <CategoryIcon className="w-6 h-6 text-white" />
                              </div>

                              <h3 className="font-bold text-xl text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {t('help.' + normalizedKey)}
                              </h3>
                              
                              <Badge className="mb-4 bg-gray-100 text-gray-700 hover:bg-gray-100">
                                {t('help.articlesCount', { count: catArticles.length })}
                              </Badge>

                              <ul className="space-y-2 mb-4">
                                {catArticles.slice(0, 4).map((article, i) => (
                                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                                    <span className="text-blue-500 flex-shrink-0">•</span>
                                    <span className="flex-1 leading-snug">{article.title}</span>
                                  </li>
                                ))}
                              </ul>

                              <div className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1">
                                {t('help.viewAll')}
                                <ExternalLink className="w-4 h-4" />
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {t('help.faqTitle')}
                </h2>
                <p className="text-xl text-gray-600">
                  {t('help.faqSubtitle')}
                </p>
              </motion.div>

              <div className="max-w-4xl mx-auto space-y-8">
                {faqData.map((categoryGroup) => (
                  <div key={categoryGroup.category}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <categoryGroup.icon className={`w-6 h-6 text-${categoryGroup.color}-600`} />
                      {t(categoryGroup.category)}
                    </h3>
                    <div className="space-y-3">
                      {categoryGroup.faqs.map((faq, faqIndex) => {
                        const faqKey = `${categoryGroup.category}-${faqIndex}`;
                        const isOpen = openFaqIndexes[faqKey];

                        return (
                          <motion.div
                            key={faqKey}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                          >
                            <div
                              onClick={() => toggleFaq(faqKey)}
                              className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-blue-600 transition-all cursor-pointer"
                            >
                              <div className="flex justify-between items-start gap-4">
                                <h4 className="font-semibold text-gray-900 text-lg">
                                  {t(faq.question)}
                                </h4>
                                {isOpen ? (
                                  <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0 mt-1" />
                                )}
                              </div>
                              {isOpen && (
                                <p className="text-gray-600 mt-4 leading-relaxed">
                                  {t(faq.answer)}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-16 bg-white">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {t('help.stillNeedHelp')}
                </h2>
                <p className="text-xl text-gray-600">
                  {t('help.stillNeedHelpSubtitle')}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 text-4xl">
                        📧
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t('help.emailSupportTitle')}</h3>
                      <p className="text-blue-600 font-semibold mb-4">support@contractguard.com</p>
                      <div className="space-y-2 text-sm text-gray-600 mb-6">
                        <p><strong>{t('contact.responseTime')}:</strong> {t('contact.within24h')}</p>
                        <p><strong>{t('contact.bestFor')}:</strong> {t('contact.detailedQuestions')}</p>
                      </div>
                      <a href="mailto:support@contractguard.com">
                        <Button className="w-full">{t('contact.sendEmail')}</Button>
                      </a>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4 text-4xl">
                        💬
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t('help.liveChatTitle')}</h3>
                      <Badge className="mb-4 bg-gray-100 text-gray-600 hover:bg-gray-100">
                        {t('contact.availableSoon')}
                      </Badge>
                      <div className="space-y-2 text-sm text-gray-600 mb-6">
                        <p><strong>{t('contact.availability')}:</strong> {t('contact.monFri9to6')}</p>
                        <p><strong>{t('contact.bestFor')}:</strong> {t('contact.quickQuestions')}</p>
                      </div>
                      <Button className="w-full bg-gray-400 hover:bg-gray-400 cursor-not-allowed" disabled>
                        {t('contact.availableSoon')}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4 text-4xl">
                        📱
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t('help.socialMediaTitle')}</h3>
                      <p className="text-sm text-gray-600 mb-4">{t('contact.followUs')}</p>
                      <div className="space-y-3 mb-6">
                        <a href="https://twitter.com/contractguard" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-700 font-medium">
                          {t('contact.twitter')}: @contractguard
                        </a>
                        <a href="https://linkedin.com/company/contractguard" target="_blank" rel="noopener noreferrer" className="block text-blue-600 hover:text-blue-700 font-medium">
                          LinkedIn: ContractGuard
                        </a>
                      </div>
                      <p className="text-xs text-gray-500">
                        <strong>{t('contact.bestFor')}:</strong> {t('contact.productUpdates')}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {t('help.additionalResources')}
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {Object.keys(categories).slice(0, 4).map((categoryName, index) => {
                  const CategoryIcon = getCategoryIcon(categoryName);
                  const color = getCategoryColor(categoryName);
                  const catArticles = categories[categoryName] || [];
                  const normalizedKey = normalizeCategoryKey(categoryName);
                  
                  return (
                    <motion.div
                      key={categoryName}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link to={createPageUrl("HelpCategory") + "?category=" + encodeURIComponent(categoryName)}>
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full group cursor-pointer">
                          <CardContent className="p-6 text-center">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                              color === 'blue' ? 'from-blue-500 to-blue-600' :
                              color === 'purple' ? 'from-purple-500 to-purple-600' :
                              color === 'orange' ? 'from-orange-500 to-orange-600' :
                              color === 'green' ? 'from-green-500 to-green-600' :
                              color === 'red' ? 'from-red-500 to-red-600' :
                              color === 'yellow' ? 'from-yellow-500 to-yellow-600' :
                              'from-gray-500 to-gray-600'
                            } flex items-center justify-center mx-auto mb-4`}>
                              <CategoryIcon className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                              {t('help.' + normalizedKey)}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">{t('help.browseHelpArticles')}</p>
                            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 mb-4">
                              {catArticles.length} {t('help.articles').toLowerCase()}
                            </Badge>
                            <Button variant="outline" className="w-full">{t('help.browseArticlesButton')}</Button>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="py-16 bg-white">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {t('help.popularGuides')}
                </h2>
                <p className="text-xl text-gray-600">
                  {t('help.popularGuidesSubtitle')}
                </p>
              </motion.div>

              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {featuredArticles.map((article, index) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link to={createPageUrl("HelpArticle") + "?id=" + article.id}>
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full group cursor-pointer">
                          <CardContent className="p-6">
                            <Badge className={getCategoryColorClass(article.category) + " mb-4"}>
                              {t('help.' + normalizeCategoryKey(article.category))}
                            </Badge>
                            <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">{article.excerpt}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{article.readTime}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {t('help.helpUsImprove')}
                </h2>
                <p className="text-xl text-gray-600">
                  {t('help.helpUsImproveSubtitle')}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mx-auto mb-4 text-4xl">
                        💡
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('help.featureRequest')}</h3>
                      <p className="text-gray-600 mb-6">{t('help.suggestFeature')}</p>
                      <Link to={createPageUrl("Contact") + "?subject=feature"}>
                        <Button className="w-full py-6 text-lg">{t('help.submitIdea')}</Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-4 text-4xl">
                        🐛
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('help.reportBug')}</h3>
                      <p className="text-gray-600 mb-6">{t('help.foundBroken')}</p>
                      <Link to={createPageUrl("Contact") + "?subject=bug"}>
                        <Button className="w-full py-6 text-lg" variant="outline">{t('help.reportIssue')}</Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
}
