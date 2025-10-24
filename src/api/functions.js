import { base44 } from './base44Client';


export const getNotionBlogPosts = base44.functions.getNotionBlogPosts;

export const getNotionPostContent = base44.functions.getNotionPostContent;

export const getNotionHelpArticles = base44.functions.getNotionHelpArticles;

export const getNotionLegalPage = base44.functions.getNotionLegalPage;

export const getNotionLegalPagesList = base44.functions.getNotionLegalPagesList;

export const cleanupOldAnalyses = base44.functions.cleanupOldAnalyses;

export const generatePdf = base44.functions.generatePdf;

export const generateImprovedContractPdf = base44.functions.generateImprovedContractPdf;

export const systemPrompt = base44.functions.systemPrompt;

export const analyzeContract = base44.functions.analyzeContract;

export const generateImprovedContractHtml = base44.functions.generateImprovedContractHtml;

export const generateImprovedContractOnDemand = base44.functions.generateImprovedContractOnDemand;

export const publicAnalyzeContract = base44.functions.publicAnalyzeContract;

export const createCheckoutSession = base44.functions.createCheckoutSession;

export const handleStripeWebhook = base44.functions.handleStripeWebhook;

export const createCustomerPortalSession = base44.functions.createCustomerPortalSession;

export const canUserAnalyze = base44.functions.canUserAnalyze;

export const cancelSubscription = base44.functions.cancelSubscription;

export const trackFeatureUsage = base44.functions.trackFeatureUsage;

