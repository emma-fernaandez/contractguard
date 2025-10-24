import React from "react";
import { Shield, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { createAppUrl, createPublicUrl } from "@/components/domainUtils";
import { format } from 'date-fns';
import { useTranslation } from "../i18n/I18nProvider";

// Helper function to convert slug to page name
const slugToPageName = (slug) => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

export default function Footer() {
  const { t, language } = useTranslation();
  
  const { data: legalPagesData, isLoading: legalPagesLoading } = useQuery({
    queryKey: ['legalPagesList', language],
    queryFn: async () => {
      try {
        const response = await base44.functions.invoke('getNotionLegalPagesList', {
          language: language
        });
        if (response.data.success) {
          return response.data.pages || [];
        }
        return [];
      } catch (err) {
        console.error('Error fetching legal pages:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const legalPages = legalPagesData || [];

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 mb-12">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold">ContractGuard</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              {t('landing.footerDescription')}
            </p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-300"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-300"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">{t('landing.support')}</h4>
            <ul className="space-y-3">
              <li>
                <Link to={createPageUrl("Help")} className="text-gray-400 hover:text-white transition-colors">
                  {t('landing.helpCenter')}
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Contact")} className="text-gray-400 hover:text-white transition-colors">
                  {t('landing.contactUs')}
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Help") + "#browse-categories"} className="text-gray-400 hover:text-white transition-colors">
                  {t('landing.knowledgeBase')}
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  {t('landing.videoTutorials')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  {t('landing.community')}
                </a>
              </li>
              <li>
                <Link to={createPageUrl("Help") + "#browse-categories"} className="text-gray-400 hover:text-white transition-colors">
                  {t('landing.guides')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">{t('landing.company')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  {t('landing.about')}
                </a>
              </li>
              <li>
                <Link to={createPageUrl("Features")} className="text-gray-400 hover:text-white transition-colors">
                  {t('common.features')}
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Pricing")} className="text-gray-400 hover:text-white transition-colors">
                  {t('common.pricing')}
                </Link>
              </li>
              <li>
                <Link to={createPageUrl("Blog")} className="text-gray-400 hover:text-white transition-colors">
                  {t('landing.blog')}
                </Link>
              </li>
              <li>
                <a href={createAppUrl("Dashboard")} className="text-gray-400 hover:text-white transition-colors">
                  {t('landing.signUp')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col items-center gap-6">
          <div className="text-center">
            <p className="text-gray-500 text-xs italic max-w-2xl mx-auto">
              {t('landing.disclaimer')}
            </p>
          </div>
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-gray-600 text-sm">
                &copy; {format(new Date(), 'yyyy')} ContractGuard. {t('landing.allRightsReserved')}
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm justify-center">
              {/* Dynamic Legal Pages from Notion */}
              {legalPagesLoading ? (
                <span className="text-gray-500">Loading...</span>
              ) : legalPages.length > 0 ? (
                legalPages.map((page) => (
                  <Link
                    key={page.slug}
                    to={createPageUrl(slugToPageName(page.slug))}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {page.title}
                  </Link>
                ))
              ) : (
                <>
                  <Link to={createPageUrl("PrivacyPolicy")} className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                  <Link to={createPageUrl("TermsOfService")} className="text-gray-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                  <Link to={createPageUrl("RefundPolicy")} className="text-gray-400 hover:text-white transition-colors">
                    Refund Policy
                  </Link>
                  <Link to={createPageUrl("CookiePolicy")} className="text-gray-400 hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}