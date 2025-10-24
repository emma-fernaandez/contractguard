import Layout from "./Layout.jsx";

import Landing from "./Landing";

import Pricing from "./Pricing";

import Blog from "./Blog";

import Dashboard from "./Dashboard";

import Upload from "./Upload";

import Analysis from "./Analysis";

import TryFree from "./TryFree";

import AnalysisPreview from "./AnalysisPreview";

import MyAnalyses from "./MyAnalyses";

import Account from "./Account";

import 404 from "./404";

import Features from "./Features";

import PrivacyPolicy from "./PrivacyPolicy";

import Help from "./Help";

import HelpArticle from "./HelpArticle";

import HelpCategory from "./HelpCategory";

import Contact from "./Contact";

import BlogPost from "./BlogPost";

import TermsOfService from "./TermsOfService";

import RefundPolicy from "./RefundPolicy";

import CookiePolicy from "./CookiePolicy";

import Success from "./Success";

import Billing from "./Billing";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Landing: Landing,
    
    Pricing: Pricing,
    
    Blog: Blog,
    
    Dashboard: Dashboard,
    
    Upload: Upload,
    
    Analysis: Analysis,
    
    TryFree: TryFree,
    
    AnalysisPreview: AnalysisPreview,
    
    MyAnalyses: MyAnalyses,
    
    Account: Account,
    
    404: 404,
    
    Features: Features,
    
    PrivacyPolicy: PrivacyPolicy,
    
    Help: Help,
    
    HelpArticle: HelpArticle,
    
    HelpCategory: HelpCategory,
    
    Contact: Contact,
    
    BlogPost: BlogPost,
    
    TermsOfService: TermsOfService,
    
    RefundPolicy: RefundPolicy,
    
    CookiePolicy: CookiePolicy,
    
    Success: Success,
    
    Billing: Billing,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Landing />} />
                
                
                <Route path="/Landing" element={<Landing />} />
                
                <Route path="/Pricing" element={<Pricing />} />
                
                <Route path="/Blog" element={<Blog />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Upload" element={<Upload />} />
                
                <Route path="/Analysis" element={<Analysis />} />
                
                <Route path="/TryFree" element={<TryFree />} />
                
                <Route path="/AnalysisPreview" element={<AnalysisPreview />} />
                
                <Route path="/MyAnalyses" element={<MyAnalyses />} />
                
                <Route path="/Account" element={<Account />} />
                
                <Route path="/404" element={<404 />} />
                
                <Route path="/Features" element={<Features />} />
                
                <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />
                
                <Route path="/Help" element={<Help />} />
                
                <Route path="/HelpArticle" element={<HelpArticle />} />
                
                <Route path="/HelpCategory" element={<HelpCategory />} />
                
                <Route path="/Contact" element={<Contact />} />
                
                <Route path="/BlogPost" element={<BlogPost />} />
                
                <Route path="/TermsOfService" element={<TermsOfService />} />
                
                <Route path="/RefundPolicy" element={<RefundPolicy />} />
                
                <Route path="/CookiePolicy" element={<CookiePolicy />} />
                
                <Route path="/Success" element={<Success />} />
                
                <Route path="/Billing" element={<Billing />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}