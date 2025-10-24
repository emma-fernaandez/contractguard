import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Search, MessageSquare, DollarSign, BarChart3 } from "lucide-react";
import { useTranslation } from "../i18n/I18nProvider";

export default function Features() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Search,
      title: t('landing.redFlagDetectionTitle'),
      description: t('landing.redFlagDetectionDescription'),
      color: "red",
      gradient: "from-red-500 to-rose-600"
    },
    {
      icon: MessageSquare,
      title: t('landing.clearSummariesTitle'),
      description: t('landing.clearSummariesDescription'),
      color: "blue",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      icon: DollarSign,
      title: t('landing.costBreakdownTitle'),
      description: t('landing.costBreakdownDescription'),
      color: "green",
      gradient: "from-green-500 to-emerald-600"
    },
    {
      icon: BarChart3,
      title: t('landing.marketComparisonTitle'),
      description: t('landing.marketComparisonDescription'),
      color: "purple",
      gradient: "from-purple-500 to-violet-600"
    }
  ];

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-3 block">
            {t('landing.powerfulFeatures')}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('landing.featuresTitle')}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('landing.featuresSubtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg h-full hover:-translate-y-1 bg-white">
                <CardHeader className="pb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}