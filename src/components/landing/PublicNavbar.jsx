
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { createAppUrl } from "@/components/domainUtils";
import { useTranslation } from "../i18n/I18nProvider";
import LanguageSelector from "../i18n/LanguageSelector";

export default function PublicNavbar() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center py-4">

        <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">ContractGuard</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to={createPageUrl("Landing")} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
            {t('common.home')}
          </Link>
          <Link to={createPageUrl("Features")} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
            {t('common.features')}
          </Link>
          <Link to={createPageUrl("Pricing")} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
            {t('common.pricing')}
          </Link>
          <Link to={createPageUrl("Help")} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
            {t('common.help')}
          </Link>
          
          <LanguageSelector variant="outline" size="sm" showFullName={true} />
          
          <a href={createAppUrl("Dashboard")}>
            <Button variant="outline" className="border-gray-300 hover:border-blue-600 hover:text-blue-600">
              {t('common.signIn')}
            </Button>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">

          {mobileMenuOpen ?
          <X className="w-6 h-6 text-gray-900" /> :

          <Menu className="w-6 h-6 text-gray-900" />
          }
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen &&
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden mb-6 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

            <div className="flex flex-col p-4 space-y-3">
              <Link
              to={createPageUrl("Landing")}
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium px-4 py-3 rounded-lg transition-colors">

                {t('common.home')}
              </Link>
              <Link
              to={createPageUrl("Features")}
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium px-4 py-3 rounded-lg transition-colors">

                {t('common.features')}
              </Link>
              <Link
              to={createPageUrl("Pricing")}
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium px-4 py-3 rounded-lg transition-colors">

                {t('common.pricing')}
              </Link>
              <Link
              to={createPageUrl("Help")}
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 font-medium px-4 py-3 rounded-lg transition-colors">

                {t('common.help')}
              </Link>
              
              <div className="pt-3 border-t border-gray-200 space-y-3">
                <LanguageSelector variant="outline" size="sm" showFullName={true} />
                
                <a href={createAppUrl("Dashboard")} onClick={() => setMobileMenuOpen(false)}>
                  <Button className="bg-gradient-to-r text-primary-foreground mt-2 px-4 py-2 text-sm font-medium rounded-md inline-flex items-center justify-center gap-2 whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-primary/90 h-10 w-full from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    {t('common.signIn')}
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        }
      </AnimatePresence>
    </>);

}