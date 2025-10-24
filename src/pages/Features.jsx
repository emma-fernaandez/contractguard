
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Shield,
  MessageSquare,
  DollarSign,
  BarChart3,
  FileEdit,
  Bot,
  Check,
  Home,
  Briefcase,
  Palette,
  Building2,
  Star,
  ArrowRight,
  FileText,
  Clock,
  Lock,
  Globe,
  Smartphone,
  ShieldAlert,
  Zap,
  Users,
  Mail,
  AlertTriangle,
  Download,
  MessageCircle,
  Share2
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import PublicNavbar from "../components/landing/PublicNavbar";
import Footer from "../components/landing/Footer";
import { useTranslation } from "../components/i18n/I18nProvider";

const initialFeatures = [ // Renamed to avoid collision with translated features array later
  {
    icon: FileText,
    title: "Instant Analysis",
    description: "Upload your contract and get comprehensive analysis in under 60 seconds. No waiting, no hassle.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop"
  },
  {
    icon: AlertTriangle,
    title: "Red Flag Detection",
    description: "Automatically identifies problematic clauses, unfair terms, hidden fees, and potential legal issues in your contracts.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop"
  },
  {
    icon: MessageSquare,
    title: "Clear Summaries",
    description: "Complex legal terminology translated into clear, understandable explanations. No law degree required.",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=500&fit=crop"
  },
  {
    icon: DollarSign,
    title: "Cost Breakdown",
    description: "See exactly what you'll pay with detailed breakdowns of initial costs, recurring fees, and potential penalties.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop"
  },
  {
    icon: BarChart3,
    title: "Market Comparison",
    description: "Know if your contract terms are better or worse than industry standards with data-driven comparisons.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop"
  },
  {
    icon: Download,
    title: "Download Improved Contracts",
    description: "Get AI-revised versions of your contracts with suggested improvements and fairer terms (Pro feature).",
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=500&fit=crop"
  },
  {
    icon: MessageCircle,
    title: "Interactive Chat Assistant",
    description: "Ask questions about your contract and get instant, detailed answers from our AI assistant (Pro feature).",
    image: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=800&h=500&fit=crop"
  },
  {
    icon: Share2,
    title: "Share & Collaborate",
    description: "Easily share analysis with lawyers, partners, or colleagues. Get public links that work anywhere.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop"
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Your contracts are protected with 256-bit encryption. GDPR compliant with automatic deletion options.",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop"
  }
];

// This `mainFeatures` array is duplicated in the previous code and removed from here as per problem statement.
// The outline states: "// ... keep existing code (secondaryFeatures, proFeatures, useCases, comparisonData, features arrays) ..."
// and then defines `mainFeatures` again with `t()` calls.
// The `features` array is also defined twice. I will ensure the final `features` and `mainFeatures` use `t()`.
// The original `mainFeatures` and `features` arrays (before `t` calls) are effectively replaced by their translated versions below.


export default function FeaturesPage() {
  const { t } = useTranslation();

const secondaryFeatures = [
    { icon: FileText, text: t('common.multipleFileFormats') },
    { icon: Zap, text: t('common.instantAnalysis60Sec') },
    { icon: Lock, text: t('common.secureStorage') },
    { icon: Globe, text: t('common.gdprCompliant') },
    { icon: Smartphone, text: t('common.mobileFriendly') },
    { icon: Shield, text: t('common.multipleContractTypes') }
];

const proFeatures = [
    { icon: Zap, text: t('common.unlimitedAnalyses') },
    { icon: FileText, text: t('common.downloadReports') },
    { icon: Clock, text: t('common.saveToDashboard') },
    { icon: Mail, text: t('common.prioritySupport') },
    { icon: BarChart3, text: t('common.marketComparisonData') },
    { icon: Download, text: t('common.downloadImprovedContracts') },
];

const useCases = [
  {
    icon: Home,
    emoji: "🏠",
      title: t('common.renters'),
      description: t('common.rentersDescription'),
      savings: t('common.averageSavings'),
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Briefcase,
    emoji: "💼",
      title: t('common.freelancers'),
      description: t('common.freelancersDescription'),
      savings: t('common.freelancersSavings'),
    color: "from-purple-500 to-purple-600"
  },
  {
      icon: Users,
      emoji: "👥",
      title: t('common.employees'),
      description: t('common.employeesDescription'),
      savings: t('common.employeesSavings'),
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: Building2,
    emoji: "🏢",
      title: t('common.smallBusiness'),
      description: t('common.smallBusinessDescription'),
      savings: t('common.smallBusinessSavings'),
    color: "from-green-500 to-green-600"
  }
];

const comparisonData = [
    { feature: t('common.cost'), contractGuard: t('common.contractGuardCost'), lawyer: t('common.lawyerCost'), diy: t('common.diyCost') },
    { feature: t('common.speed'), contractGuard: t('common.contractGuardSpeed'), lawyer: t('common.lawyerSpeed'), diy: t('common.diySpeed') },
    { feature: t('common.availability'), contractGuard: t('common.contractGuardAvailability'), lawyer: t('common.lawyerAvailability'), diy: t('common.diyAvailability') },
    { feature: t('common.expertise'), contractGuard: t('common.contractGuardExpertise'), lawyer: t('common.lawyerExpertise'), diy: t('common.diyExpertise') },
    { feature: t('common.clearExplanations'), contractGuard: t('common.contractGuardExplanations'), lawyer: t('common.lawyerExplanations'), diy: t('common.diyExplanations') },
    { feature: t('common.ongoingAccess'), contractGuard: t('common.contractGuardAccess'), lawyer: t('common.lawyerAccess'), diy: t('common.diyAccess') }
  ];

  const features = [ // This is the first `features` array, now with `t()`
    {
      icon: FileText,
      title: t('features.instantAnalysis'),
      description: t('features.instantAnalysisDescription'),
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop"
    },
    {
      icon: AlertTriangle,
      title: t('features.redFlagDetection'),
      description: t('features.redFlagDetectionDescription'),
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=500&fit=crop"
    },
    {
      icon: MessageSquare,
      title: t('features.clearSummaries'),
      description: t('features.clearSummariesDescription'),
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=500&fit=crop"
    },
    {
      icon: DollarSign,
      title: t('features.costBreakdown'),
      description: t('features.costBreakdownDescription'),
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop"
    },
    {
      icon: BarChart3,
      title: t('features.marketComparison'),
      description: t('features.marketComparisonDescription'),
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop"
    },
    {
      icon: Download,
      title: t('features.downloadImprovedContracts'),
      description: t('features.downloadImprovedContractsDescription'),
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=500&fit=crop"
    },
    {
      icon: MessageCircle,
      title: t('features.interactiveChatAssistant'),
      description: t('features.interactiveChatAssistantDescription'),
      image: "https://images.unsplash.com/photo-1587560699334-cc4ff634909a?w=800&h=500&fit=crop"
    },
    {
      icon: Share2,
      title: t('features.shareCollaborate'),
      description: t('features.shareCollaborateDescription'),
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop"
    },
    {
      icon: Shield,
      title: t('features.bankLevelSecurity'),
      description: t('features.bankLevelSecurityDescription'),
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=500&fit=crop"
    }
  ];

  const mainFeatures = [ // This is the `mainFeatures` array, now with `t()`
    {
      icon: Shield,
      iconColor: "from-red-500 to-rose-600",
      iconBg: "bg-red-50",
      title: t('features.spotProblemsInstantly'),
      subtitle: t('features.spotProblemsInstantlySubtitle'),
      description: t('features.spotProblemsInstantlyDescription'),
      bullets: [
        t('features.illegalSecurityDeposits'),
        t('features.unfairTerminationClauses'),
        t('features.hiddenPenaltyFees'),
        t('features.oneSidedTerms'),
        t('features.missingProtections')
      ]
    },
    {
      icon: MessageSquare,
      iconColor: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-50",
      title: t('features.noMoreLegalJargon'),
      subtitle: t('features.noMoreLegalJargonSubtitle'),
      description: t('features.noMoreLegalJargonDescription'),
      bullets: [
        t('features.fivePointSummary'),
        t('features.keyTermsExplained'),
        t('features.financialObligationsHighlighted'),
        t('features.responsibilitiesBrokenDown'),
        t('features.rightsProtectionsClarified')
      ]
    },
    {
      icon: DollarSign,
      iconColor: "from-green-500 to-emerald-600",
      iconBg: "bg-green-50",
      title: t('features.seeTheTrueCost'),
      subtitle: t('features.seeTheTrueCostSubtitle'),
      description: t('features.seeTheTrueCostDescription'),
      bullets: [
        t('features.initialCosts'),
        t('features.monthlyRecurringCharges'),
        t('features.potentialPenalties'),
        t('features.earlyTerminationCosts'),
        t('features.firstYearTotalProjection')
      ]
    },
    {
      icon: BarChart3,
      iconColor: "from-purple-500 to-violet-600",
      iconBg: "bg-purple-50",
      title: t('features.knowYourPosition'),
      subtitle: t('features.knowYourPositionSubtitle'),
      description: t('features.knowYourPositionDescription'),
      bullets: [
        t('features.depositComparison'),
        t('features.termsVsIndustry'),
        t('features.redFlagsBenchmark'),
        t('features.priceCompetitiveness'),
        t('features.negotiationPoints')
      ]
    },
    {
      icon: FileEdit,
      iconColor: "from-orange-500 to-amber-600",
      iconBg: "bg-orange-50",
      title: t('features.getBetterTerms'),
      subtitle: t('features.suggestedImprovements'),
      description: t('features.getBetterTermsDescription'),
      bullets: [
        t('features.alternativeLanguage'),
        t('features.negotiationTalkingPoints'),
        t('features.whatToAskFor'),
        t('features.industryStandardReplacements'),
        t('features.downloadImprovedContractPro')
      ]
    },
    {
      icon: Bot,
      iconColor: "from-cyan-500 to-blue-600",
      iconBg: "bg-cyan-50",
      title: t('features.askAnything'),
      subtitle: t('features.interactiveChatAssistant'),
      badge: t('common.proFeature'),
      description: t('features.askAnythingDescription'),
      bullets: [
        t('features.unlimitedQuestions'),
        t('features.contextAwareResponses'),
        t('features.twentyFourSevenAvailability'),
        t('features.noHourlyLawyerFees'),
        t('features.saveConversationHistory')
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <PublicNavbar />
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 pt-20 pb-32 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-6 px-4 py-1.5 text-sm font-semibold uppercase tracking-wide">
              {t('features.badge')}
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              {t('features.title')}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {t('features.titleHighlight')}
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              {t('features.subtitle')}
            </p>

            <Link to={createPageUrl("TryFree")}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-7 text-lg shadow-lg shadow-blue-600/25"
              >
                {t('features.tryFreeAnalysis')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className="relative mb-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.iconColor} flex items-center justify-center mb-4 shadow-lg`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      {feature.badge && (
                        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                          {feature.badge}
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
                      {feature.subtitle}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {feature.description}
                    </p>

                    <ul className="space-y-3 mb-6">
                      {feature.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Screenshot Placeholder */}
                    <div className={`${feature.iconBg} rounded-xl p-6 border-2 border-dashed border-gray-300 text-center`}>
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 font-medium">Screenshot Preview</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('common.builtForYourNeeds')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('common.builtSubtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-4">
              {secondaryFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-gray-800 font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4">
              {proFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-gray-800 font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('common.perfectFor')}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {useCases.map((useCase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-8 text-center">
                    <div className="text-5xl mb-4">{useCase.emoji}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {useCase.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {useCase.description}
                    </p>
                    <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${useCase.color} text-white font-semibold text-sm`}>
                      {useCase.savings}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('common.contractGuardVsTraditional')}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto overflow-x-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <th className="py-5 px-6 text-left font-bold text-lg">Feature</th>
                    <th className="py-5 px-6 text-left font-bold text-lg">ContractGuard</th>
                    <th className="py-5 px-6 text-left font-bold text-lg">Lawyer</th>
                    <th className="py-5 px-6 text-left font-bold text-lg">Do It Yourself</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                      <td className="py-5 px-6 font-semibold text-gray-900">{row.feature}</td>
                      <td className="py-5 px-6 text-green-600 font-semibold">{row.contractGuard}</td>
                      <td className="py-5 px-6 text-gray-600">{row.lawyer}</td>
                      <td className="py-5 px-6 text-gray-600">{row.diy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section Hidden */}
      {/* This section has been removed as per the request */}

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDZwdjJoLTYweiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30"></div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('common.readyToUnderstand')}
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              {t('common.joinPeople')}
            </p>

            <Link to={createPageUrl("TryFree")}>
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-10 py-7 text-lg font-bold shadow-2xl"
              >
                {t('common.tryFreeNoSignupRequired')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>

            <p className="text-blue-100 mt-6">
              {t('common.noCreditCardNeeded')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
