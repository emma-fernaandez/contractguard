

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Upload,
  FileText,
  Shield,
  LogOut,
  Menu,
  X,
  User,
  CreditCard,
  Loader2,
  HelpCircle
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import CookieConsentBanner from "../components/CookieConsentBanner";
import {
  isOnPublicDomain,
  isOnAppDomain,
  createPublicUrl,
  createAppUrl,
  isPublicPage,
  isAppPage,
  isPublicAppPage,
  PUBLIC_PAGES,
  isBase44Preview
} from "@/components/domainUtils";
import { I18nProvider, useTranslation } from "./components/i18n/I18nProvider";
import LanguageSelector from "./components/i18n/LanguageSelector";
import { localStorageUtils } from "./components/localStorage";
import UtmTracker from "./components/UtmTracker";

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = React.useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  console.log('[Layout] Current page:', currentPageName);
  console.log('[Layout] Location pathname:', location.pathname);

  // Detect and redirect PWA mode
  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                  window.navigator.standalone ||
                  document.referrer.includes('android-app://');

    if (isPWA) {
      const currentUrl = window.location.href;
      const urlParams = new URLSearchParams(window.location.search);
      const alreadyRedirected = urlParams.get('pwa_redirect');

      if (!alreadyRedirected) {
        const browserUrl = currentUrl.includes('?')
          ? `${currentUrl}&pwa_redirect=true`
          : `${currentUrl}?pwa_redirect=true`;

        alert('For the best experience, please use ContractGuard from your browser instead of the installed app.\n\nYou can uninstall the app from your device settings.');
        window.location.href = browserUrl;
      }
    }
  }, []);

  // Domain-based redirection logic
  useEffect(() => {
    if (isBase44Preview()) {
      console.log('[Layout] Preview mode, domain redirections disabled');
      return;
    }

    const currentPageLower = currentPageName.toLowerCase();

    if (isPublicAppPage(currentPageLower)) {
      console.log('[Layout] Public app page, no redirect:', currentPageName);
      return;
    }

    if (isOnPublicDomain() && isAppPage(currentPageLower)) {
      console.log('[Layout] On public domain, redirecting to app domain');
      setIsRedirecting(true);
      window.location.href = createAppUrl(currentPageName);
      return;
    }

    if (isOnAppDomain() && isPublicPage(currentPageLower)) {
      console.log('[Layout] On app domain, redirecting to public domain');
      setIsRedirecting(true);
      window.location.href = createPublicUrl(currentPageName);
      return;
    }
  }, [currentPageName]);

  // Fetch user data with improved auth check
  React.useEffect(() => {
    const checkAuth = async () => {
      console.log('[Layout] Starting auth check...');
      console.log('[Layout] Current URL:', window.location.href);
      console.log('[Layout] Current pathname:', location.pathname);
      console.log('[Layout] Current search:', location.search);
      setLoadingUser(true);
      
      try {
        // First check if authenticated
        const isAuth = await base44.auth.isAuthenticated();
        console.log('[Layout] Is authenticated:', isAuth);
        
        if (isAuth) {
          // If authenticated, get user data
          const userData = await base44.auth.me();
          console.log('[Layout] User data retrieved:', userData ? { email: userData.email, plan: userData.plan } : null);
          setUser(userData);
        } else {
          console.log('[Layout] Not authenticated, user set to null');
          setUser(null);
        }
      } catch (error) {
        console.error('[Layout] Error checking auth:', error);
        console.error('[Layout] Error details:', error.message);
        setUser(null);
      } finally {
        setLoadingUser(false);
        setAuthCheckComplete(true);
        console.log('[Layout] Auth check complete');
      }
    };

    checkAuth();
  }, [location.pathname]); // Re-check when pathname changes (e.g., after login redirect)

  // Close sidebar on navigation
  React.useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Handle authentication redirects for protected pages
  React.useEffect(() => {
    console.log('[Layout] ===== AUTH REDIRECT CHECK START =====');
    console.log('[Layout] Current URL:', window.location.href);
    console.log('[Layout] authCheckComplete:', authCheckComplete);
    console.log('[Layout] loadingUser:', loadingUser);
    console.log('[Layout] user:', user ? { email: user.email, plan: user.plan } : null);
    console.log('[Layout] currentPageName:', currentPageName);
    console.log('[Layout] location.pathname:', location.pathname);
    console.log('[Layout] location.search:', location.search);
    
    // Don't do anything until auth check is complete
    if (!authCheckComplete || loadingUser) {
      console.log('[Layout] Waiting for auth check to complete...');
      return;
    }

    const currentPageLower = currentPageName.toLowerCase();
    const isProtectedPage = !PUBLIC_PAGES.includes(currentPageLower) && !isPublicAppPage(currentPageLower);
    
    console.log('[Layout] isProtectedPage:', isProtectedPage);
    console.log('[Layout] isBase44Preview:', isBase44Preview());
    console.log('[Layout] PUBLIC_PAGES:', PUBLIC_PAGES);
    console.log('[Layout] isPublicAppPage result:', isPublicAppPage(currentPageLower));

    // Check if there's a pending analysis to save in localStorage
    const pendingAnalysisId = localStorageUtils.getItem('pending_save_analysis');
    console.log('[Layout] pendingAnalysisId from localStorage:', pendingAnalysisId);

    if (!user && isProtectedPage && !isBase44Preview()) {
      console.log('[Layout] ❌ User not authenticated for protected page, redirecting to login...');
      
      // Determine the next URL based on whether there's a pending analysis
      let nextUrlToRedirect = location.pathname + location.search;
      if (pendingAnalysisId && currentPageLower !== 'dashboard') { // If there's a pending analysis, always go to Dashboard after login
        console.log('[Layout] Pending analysis found in localStorage. Redirecting to Dashboard after login.');
        nextUrlToRedirect = createPageUrl('Dashboard');
      } else {
        console.log('[Layout] No pending analysis in localStorage. Redirecting to current page after login.');
      }
      console.log('[Layout] Redirect URL will be:', nextUrlToRedirect);
      
      // Increased delay to prevent immediate redirect loops and give time for session to establish
      setTimeout(() => {
        console.log('[Layout] Executing redirect to login after delay...');
        base44.auth.redirectToLogin(nextUrlToRedirect);
      }, 500); // Increased from 100ms to 500ms
    } else {
      console.log('[Layout] ✅ No redirect needed');
      console.log('[Layout] Reasons:');
      console.log('[Layout] - Has user:', !!user);
      console.log('[Layout] - Is protected page:', isProtectedPage);
      console.log('[Layout] - Is Base44 preview:', isBase44Preview());
    }
    console.log('[Layout] ===== AUTH REDIRECT CHECK END =====');
  }, [authCheckComplete, loadingUser, user, currentPageName, location.pathname, location.search]);

  // Handle domain redirects
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">{t('common.redirecting')}...</p>
        </div>
      </div>
    );
  }

  // Render public pages immediately
  if (PUBLIC_PAGES.includes(currentPageName.toLowerCase()) || isPublicAppPage(currentPageName.toLowerCase())) {
    return (
      <div>
        <UtmTracker />
        {children}
        <CookieConsentBanner />
      </div>
    );
  }

  // For protected pages: Show loading while checking authentication
  if (loadingUser || !authCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">{t('common.loading')}...</p>
        </div>
      </div>
    );
  }

  // If auth check complete and no user, show loading while redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">{t('common.redirectingToLogin')}...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    base44.auth.logout();
  };

  const navigationItems = [
    {
      title: t('common.dashboard'),
      url: createPageUrl("Dashboard"),
      icon: LayoutDashboard,
    },
    {
      title: t('common.myAnalyses'),
      url: createPageUrl("MyAnalyses"),
      icon: FileText,
    },
    {
      title: t('common.uploadNew'),
      url: createPageUrl("Upload"),
      icon: Upload,
    },
    {
      title: t('common.account'),
      url: createPageUrl("Account"),
      icon: User,
    },
  ];

  // Add Billing link only for Pro/Business users
  const isPro = user?.plan === 'pro' || user?.plan === 'business';
  if (isPro) {
    navigationItems.push({
      title: t('common.billing'),
      url: createPageUrl("Billing"),
      icon: CreditCard,
    });
  }

  navigationItems.push({
    title: t('common.help'),
    url: createPublicUrl("Help"),
    icon: HelpCircle,
  });

  return (
    <div className="min-h-screen flex w-full bg-gray-50">
      <UtmTracker />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-xl
          transform transition-transform duration-300 ease-in-out
          xl:translate-x-0 xl:static xl:shadow-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="border-b border-gray-100 p-6 flex items-center justify-between">
          <Link to={createPageUrl("Landing")} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">ContractGuard</h2>
              <p className="text-xs text-gray-500">{t('common.smartAnalysis')}</p>
            </div>
          </Link>

          <button
            onClick={() => setSidebarOpen(false)}
            className="xl:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-3 flex-1 overflow-y-auto">
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 py-2">
              {t('common.navigation')}
            </p>
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${location.pathname === item.url
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                    }
                  `}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="border-t border-gray-100 p-4">
          {user && (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-semibold text-sm">
                    {user.full_name?.charAt(0) || user.email?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {user.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              
              <LanguageSelector variant="outline" size="sm" />
              
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-gray-600 hover:text-red-600 hover:border-red-200"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                {t('common.logout')}
              </Button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 w-full xl:w-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-4 xl:hidden sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-900" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">ContractGuard</h1>
            </div>
            <div className="ml-auto">
              <LanguageSelector variant="ghost" size="sm" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
      <CookieConsentBanner />
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <I18nProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </I18nProvider>
  );
}

