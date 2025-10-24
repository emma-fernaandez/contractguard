
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Printer,
  Loader2,
  AlertCircle,
  Eye,
  Check,
  MessageSquare,
  Mail,
  Menu,
  X
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PublicNavbar from "../components/landing/PublicNavbar";
import Footer from "../components/landing/Footer";
import { base44 } from "@/api/base44Client";
import { useTranslation } from "../components/i18n/I18nProvider";

export default function HelpArticlePage() {
  const { t } = useTranslation();
  const [article, setArticle] = useState(null);
  const [content, setContent] = useState("");
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wasHelpful, setWasHelpful] = useState(null);
  const [tableOfContents, setTableOfContents] = useState([]);
  const [activeSection, setActiveSection] = useState("");
  const [tocOpen, setTocOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        
        if (!articleId) {
          setError(t('help.noArticleId'));
          setLoading(false);
          return;
        }

        const articlesResponse = await base44.functions.invoke('getNotionHelpArticles');
        
        if (!articlesResponse.data.success || !articlesResponse.data.articles) {
          throw new Error('Failed to load article metadata');
        }

        const foundArticle = articlesResponse.data.articles.find(a => a.id === articleId);
        
        if (!foundArticle) {
          setError(t('help.articleNotFound'));
          setLoading(false);
          return;
        }

        setArticle(foundArticle);

        const related = articlesResponse.data.articles
          .filter(a => a.id !== articleId && a.category === foundArticle.category)
          .slice(0, 3);
        setRelatedArticles(related);

        const contentResponse = await base44.functions.invoke('getNotionPostContent', { pageId: articleId });
        
        if (contentResponse.data.success && contentResponse.data.content) {
          setContent(contentResponse.data.content);
          
          // Extract table of contents from headings
          const parser = new DOMParser();
          const doc = parser.parseFromString(contentResponse.data.content, 'text/html');
          const headings = doc.querySelectorAll('h1, h2, h3');
          const toc = Array.from(headings).map((heading, index) => {
            const id = `section-${index}`;
            heading.id = id;
            return {
              id,
              text: heading.textContent,
              level: parseInt(heading.tagName.substring(1))
            };
          });
          setTableOfContents(toc);
          setContent(doc.body.innerHTML);
        } else {
          setContent('<p>Content not available</p>');
        }

      } catch (err) {
        console.error('Error loading help article:', err);
        setError(t('help.articleNotFound'));
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, []);

  // Scroll spy for TOC
  useEffect(() => {
    const handleScroll = () => {
      const sections = tableOfContents.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(tableOfContents[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tableOfContents]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatCategoryName = (catKey) => {
    return catKey.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getCategoryColorClass = (category) => {
    const colorMap = {
      [t('help.gettingStarted')]: 'bg-blue-100 text-blue-700',
      [t('help.contractAnalysis')]: 'bg-purple-100 text-purple-700',
      [t('help.billing')]: 'bg-orange-100 text-orange-700',
      [t('help.pricing')]: 'bg-orange-100 text-orange-700',
      [t('help.security')]: 'bg-green-100 text-green-700',
      [t('help.account')]: 'bg-red-100 text-red-700',
      [t('help.team')]: 'bg-yellow-100 text-yellow-700',
      [t('help.featuresAnalysis')]: 'bg-purple-100 text-purple-700',
      [t('help.legalCompliance')]: 'bg-orange-100 text-orange-700',
      [t('help.technicalSupport')]: 'bg-gray-100 text-gray-700',
      // Fallback for English names (in case data comes in English)
      'Getting Started': 'bg-blue-100 text-blue-700',
      'Contract Analysis': 'bg-purple-100 text-purple-700',
      'Billing & Plans': 'bg-orange-100 text-orange-700',
      'Billings & Plans': 'bg-orange-100 text-orange-700',
      'Pricing & Plans': 'bg-orange-100 text-orange-700',
      'Security & Privacy': 'bg-green-100 text-green-700',
      'Privacy & Security': 'bg-green-100 text-green-700',
      'Account Settings': 'bg-red-100 text-red-700',
      'Team & Business': 'bg-yellow-100 text-yellow-700',
      'Features & Analysis': 'bg-purple-100 text-purple-700',
      'Legal & Compliance': 'bg-orange-100 text-orange-700',
      'Technical Support': 'bg-gray-100 text-gray-700'
    };
    return colorMap[category] || 'bg-gray-100 text-gray-700';
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTocOpen(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-6 py-4">
            <PublicNavbar />
          </div>
        </header>
        
        <div className="container mx-auto px-6 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('help.articleNotFound')}</h1>
          <p className="text-gray-600 mb-8">{error || t('help.articleNotFoundError')}</p>
          <Link to={createPageUrl("Help")}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('help.backToHelpCenter')}
            </Button>
          </Link>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <PublicNavbar />
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to={createPageUrl("Help")} className="hover:text-blue-600">
              {t('help.help')}
            </Link>
            <span>›</span>
            <Link to={createPageUrl("HelpCategory") + "?category=" + encodeURIComponent(article.category)} className="hover:text-blue-600">
              {article.category}
            </Link>
            <span>›</span>
            <span className="text-gray-900 truncate">{article.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12 max-w-7xl">
        <div className="flex gap-8">
          {/* Table of Contents - Desktop Sidebar */}
          {tableOfContents.length > 0 && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Menu className="w-4 h-4" />
                      {t('help.tableOfContents')}
                    </h3>
                    <nav className="space-y-2">
                      {tableOfContents.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className={`block w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                            item.level === 1 ? 'font-semibold' :
                            item.level === 2 ? 'pl-6' :
                            'pl-9'
                          } ${
                            activeSection === item.id
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {item.text}
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>
            </aside>
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Article Header */}
            <Card className="border-0 shadow-xl mb-8">
              <CardContent className="p-8 md:p-12">
                <Link to={createPageUrl("Help")}>
                  <Button variant="ghost" className="mb-6 -ml-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {t('help.backToHelpCenter')}
                  </Button>
                </Link>

                <Badge className={getCategoryColorClass(article.category) + " mb-4"}>
                  {article.category}
                </Badge>
                
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  {article.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{article.readTime} {t('help.read')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{t('help.lastUpdated')} {formatDate(article.lastUpdated)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    {linkCopied ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        {t('help.linkCopied')}
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 mr-2" />
                        {t('help.share')}
                      </>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrint}>
                    <Printer className="w-4 h-4 mr-2" />
                    {t('help.print')}
                  </Button>
                  
                  {/* Mobile TOC Toggle */}
                  {tableOfContents.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="lg:hidden"
                      onClick={() => setTocOpen(!tocOpen)}
                    >
                      {tocOpen ? (
                        <>
                          <X className="w-4 h-4 mr-2" />
                          {t('help.closeToc')}
                        </>
                      ) : (
                        <>
                          <Menu className="w-4 h-4 mr-2" />
                          {t('help.tableOfContents')}
                        </>
                      )}
                    </Button>
                  )}
                </div>

                {/* Mobile TOC Dropdown */}
                {tocOpen && tableOfContents.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="lg:hidden mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <nav className="space-y-2">
                      {tableOfContents.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className={`block w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                            item.level === 1 ? 'font-semibold' :
                            item.level === 2 ? 'pl-6' :
                            'pl-9'
                          } ${
                            activeSection === item.id
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {item.text}
                        </button>
                      ))}
                    </nav>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Article Content */}
            <Card className="border-0 shadow-xl mb-8">
              <CardContent className="p-8 md:p-12">
                <div 
                  className="prose prose-lg max-w-none prose-headings:scroll-mt-24
                    prose-h1:text-3xl prose-h1:font-bold prose-h1:text-gray-900 prose-h1:mb-6
                    prose-h2:text-2xl prose-h2:font-bold prose-h2:text-gray-900 prose-h2:mt-12 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:font-bold prose-h3:text-gray-900 prose-h3:mt-8 prose-h3:mb-3
                    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-gray-900 prose-strong:font-semibold
                    prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                    prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                    prose-li:text-gray-700 prose-li:my-2
                    prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:text-gray-800
                    prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                    prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                    prose-img:rounded-lg prose-img:shadow-lg prose-img:my-8
                  "
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </CardContent>
            </Card>

            {/* Was This Helpful */}
            <Card className="border-0 shadow-xl mb-8">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t('help.wasThisHelpful')}
                </h3>
                <div className="flex justify-center gap-4">
                  <Button
                    variant={wasHelpful === true ? "default" : "outline"}
                    onClick={() => setWasHelpful(true)}
                    className="gap-2"
                  >
                    <ThumbsUp className="w-5 h-5" />
                    {t('help.yes')}
                  </Button>
                  <Button
                    variant={wasHelpful === false ? "default" : "outline"}
                    onClick={() => setWasHelpful(false)}
                    className="gap-2"
                  >
                    <ThumbsDown className="w-5 h-5" />
                    {t('help.no')}
                  </Button>
                </div>
                {wasHelpful !== null && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-600 mt-4 font-medium"
                  >
                    {t('help.thankYouFeedback')}
                  </motion.p>
                )}
              </CardContent>
            </Card>

            {/* Related Articles */}
            {relatedArticles.length > 0 && (
              <section className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {t('help.relatedArticles')}
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedArticles.map((relArticle, index) => (
                    <Link
                      key={relArticle.id}
                      to={createPageUrl("HelpArticle") + "?id=" + relArticle.id}
                    >
                      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full group cursor-pointer">
                        <CardContent className="p-6">
                          <Badge className={getCategoryColorClass(relArticle.category) + " mb-3"}>
                            {relArticle.category}
                          </Badge>
                          <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                            {relArticle.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{relArticle.readTime}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Still Need Help */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-xl">
              <CardContent className="p-8 md:p-12 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {t('help.didntFindWhatYouNeed')}
                </h2>
                <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                  {t('help.supportTeamHereToHelp')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to={createPageUrl("Contact")}>
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2">
                      <Mail className="w-5 h-5" />
                      {t('help.contactSupport')}
                    </Button>
                  </Link>
                  <Link to={createPageUrl("Help") + "#browse-categories"}>
                    <Button size="lg" variant="outline" className="gap-2">
                      <MessageSquare className="w-5 h-5" />
                      {t('help.browseMoreArticles')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
