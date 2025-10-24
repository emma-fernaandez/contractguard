
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Clock, FileText, Calendar, Mail, AlertCircle, Loader2, Home, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import PublicNavbar from "../components/landing/PublicNavbar";
import Footer from "../components/landing/Footer";
import { useTranslation } from "../components/i18n/I18nProvider";

export default function RefundPolicy() {
  const { language } = useTranslation();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPage() {
      setLoading(true);
      setError(null);
      
      try {
        const result = await base44.functions.invoke('getNotionLegalPage', {
          slug: 'refund-policy',
          language: language
        });
        
        if (result.data.success) {
          setPage(result.data.page);
        } else {
          setError(result.data.error || 'Failed to load refund policy');
        }
      } catch (err) {
        console.error('Error loading refund policy:', err);
        setError('Unable to load refund policy. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    loadPage();
  }, [language]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <PublicNavbar />
        </div>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600 text-lg">Loading refund policy...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-6">
          <div className="max-w-md text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Policy</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to={createPageUrl("Landing")}>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Go Back
                </Button>
              </Link>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {page && !loading && !error && (
        <>
          {/* Breadcrumb & Hero */}
          <section className="bg-gradient-to-br from-blue-50 to-white py-12 border-b border-gray-100">
            <div className="container mx-auto px-6">
              <div className="max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                  <Link to={createPageUrl("Landing")} className="hover:text-blue-600 transition-colors">
                    Home
                  </Link>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-gray-900 font-medium">Refund Policy</span>
                </div>

                {/* Page Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl mb-6 shadow-lg shadow-blue-600/20">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                    {page.title}
                  </h1>

                  {/* Meta Information */}
                  <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Last Updated: <strong>{formatDate(page.lastUpdated)}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Version: <strong>{page.version}</strong></span>
                    </div>
                    {page.effectiveDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>Effective: <strong>{formatDate(page.effectiveDate)}</strong></span>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Content Area */}
          <section className="py-16">
            <div className="container mx-auto px-6">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
              >
                <div 
                  className="prose prose-lg max-w-none legal-content"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              </motion.div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-16 bg-gray-50 border-t border-gray-200">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Questions about refunds?
                </h2>
                <p className="text-gray-600 mb-8">
                  If you have any questions or concerns about our refund policy, 
                  we're here to help.
                </p>
                <Link to={createPageUrl("Contact")}>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </>
      )}

      <Footer />

      {/* Custom Styles for Legal Content */}
      <style jsx>{`
        .legal-content {
          color: #1F2937;
          line-height: 1.7;
        }

        .legal-content h1 {
          font-size: 32px;
          font-weight: bold;
          color: #111827;
          margin-top: 48px;
          margin-bottom: 24px;
          line-height: 1.2;
        }

        .legal-content h2 {
          font-size: 24px;
          font-weight: bold;
          color: #1F2937;
          margin-top: 40px;
          margin-bottom: 16px;
          line-height: 1.3;
        }

        .legal-content h3 {
          font-size: 20px;
          font-weight: 600;
          color: #374151;
          margin-top: 32px;
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .legal-content h4 {
          font-size: 18px;
          font-weight: 600;
          color: #4B5563;
          margin-top: 24px;
          margin-bottom: 8px;
        }

        .legal-content p {
          margin-bottom: 16px;
          line-height: 1.7;
        }

        .legal-content ul,
        .legal-content ol {
          padding-left: 24px;
          margin-bottom: 16px;
        }

        .legal-content li {
          margin-bottom: 8px;
          line-height: 1.7;
        }

        .legal-content a {
          color: #2563EB;
          text-decoration: underline;
          transition: color 0.2s;
        }

        .legal-content a:hover {
          color: #1D4ED8;
        }

        .legal-content strong {
          font-weight: 600;
          color: #111827;
        }

        .legal-content code {
          background-color: #F3F4F6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.9em;
        }

        .legal-content pre {
          background-color: #1F2937;
          color: #F9FAFB;
          padding: 16px;
          border-radius: 8px;
          overflow-x: auto;
          margin-bottom: 16px;
        }

        .legal-content blockquote {
          border-left: 4px solid #2563EB;
          padding-left: 16px;
          margin-left: 0;
          margin-bottom: 16px;
          font-style: italic;
          color: #4B5563;
        }

        .legal-content hr {
          border: none;
          border-top: 1px solid #E5E7EB;
          margin: 32px 0;
        }

        .legal-content .callout {
          background-color: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 16px;
          display: flex;
          gap: 12px;
        }

        .legal-content .callout-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .legal-content .callout-content {
          flex: 1;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .legal-content {
            font-size: 16px;
          }

          .legal-content h1 {
            font-size: 28px;
          }

          .legal-content h2 {
            font-size: 22px;
          }

          .legal-content h3 {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}
