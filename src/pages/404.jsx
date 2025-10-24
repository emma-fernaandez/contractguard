import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft, AlertCircle, FileQuestion, Compass } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PublicNavbar from "../components/landing/PublicNavbar";
import Footer from "../components/landing/Footer";
import { useTranslation } from "../components/i18n/I18nProvider";

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  // Log the attempted path for debugging
  useEffect(() => {
    console.log("404 - Page not found:", location.pathname);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(createPageUrl("Help") + "?search=" + encodeURIComponent(searchQuery));
    }
  };

  const quickLinks = [
    {
      title: t('notFound.home'),
      description: t('notFound.homeDescription'),
      url: createPageUrl("Landing"),
      icon: Home,
      color: "blue"
    },
    {
      title: t('notFound.tryFreeAnalysis'),
      description: t('notFound.tryFreeAnalysisDescription'),
      url: createPageUrl("TryFree"),
      icon: FileQuestion,
      color: "green"
    },
    {
      title: t('notFound.helpCenter'),
      description: t('notFound.helpCenterDescription'),
      url: createPageUrl("Help"),
      icon: Search,
      color: "purple"
    },
    {
      title: t('notFound.contactSupport'),
      description: t('notFound.contactSupportDescription'),
      url: createPageUrl("Contact"),
      icon: Compass,
      color: "orange"
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: "from-blue-500 to-blue-600 group-hover:shadow-blue-500/25",
      green: "from-green-500 to-green-600 group-hover:shadow-green-500/25",
      purple: "from-purple-500 to-purple-600 group-hover:shadow-purple-500/25",
      orange: "from-orange-500 to-orange-600 group-hover:shadow-orange-500/25"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <PublicNavbar />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            {/* 404 Illustration */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="relative inline-block">
                {/* Animated circles */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-64 h-64 border-4 border-dashed border-blue-200 rounded-full"></div>
                </motion.div>
                
                {/* Center icon */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-600/30">
                    <AlertCircle className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-7xl md:text-9xl font-black text-gray-900 mb-4">
                {t('notFound.title')}
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('notFound.pageNotFound')}
              </h2>
              <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto">
                {t('notFound.description')}
              </p>
              <p className="text-sm text-gray-500 mb-8">
                {t('notFound.requestedPath')} <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code>
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-xl mx-auto mb-12"
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder={t('notFound.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-600 shadow-lg"
                />
              </form>
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-center text-lg font-semibold text-gray-900 mb-6">
              {t('notFound.quickLinksTitle')}
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <Link to={link.url}>
                      <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-blue-200 h-full">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getColorClasses(link.color)} flex items-center justify-center mb-4 shadow-lg transition-shadow duration-300`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <h4 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-blue-600 transition-colors">
                          {link.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {link.description}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
              className="gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('notFound.backToHome')}
            </Button>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}