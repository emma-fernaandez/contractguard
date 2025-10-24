
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Upload,
  X,
  Loader2,
  Twitter,
  Send
} from "lucide-react";
import PublicNavbar from "../components/landing/PublicNavbar";
import Footer from "../components/landing/Footer";
import { base44 } from "@/api/base44Client";
import { useTranslation } from "../components/i18n/I18nProvider";

export default function ContactPage() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const characterCount = message.length;
  const maxCharacters = 1000;

  const subjects = [
    { value: "general", label: t('contact.subjectGeneral') },
    { value: "support", label: t('contact.subjectSupport') },
    { value: "billing", label: t('contact.subjectBilling') },
    { value: "feature", label: t('contact.subjectFeature') },
    { value: "bug", label: t('contact.subjectBug') },
    { value: "other", label: t('contact.subjectOther') }
  ];

  const quickFAQs = [
    {
      question: "How do I upload a contract?",
      link: "/help/article/upload-contract"
    },
    {
      question: "What file formats are supported?",
      link: "/help/article/file-formats"
    },
    {
      question: "How do I upgrade to Pro?",
      link: "/help/article/upgrade-pro"
    },
    {
      question: "Can I cancel my subscription?",
      link: "/help/article/cancel-subscription"
    },
    {
      question: "Is my data secure?",
      link: "/help/article/data-security"
    }
  ];

  const createPageUrl = (pageName) => {
    switch (pageName) {
      case "Help":
        return "/Help";
      default:
        return "/";
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subjectParam = urlParams.get('subject');
    
    if (subjectParam === 'feature') {
      setSubject('feature');
      setMessage('I would like to suggest the following feature:\n\n');
    } else if (subjectParam === 'bug') {
      setSubject('bug');
      setMessage('I found the following issue:\n\nSteps to reproduce:\n1. \n2. \n3. \n\nExpected behavior:\n\nActual behavior:\n');
    } else if (subjectParam === 'technical') {
      setSubject('support');
      setMessage('');
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = t('common.nameRequired');
    }

    if (!email.trim()) {
      newErrors.email = t('common.emailRequired');
    } else if (!/\S+@\S+\.\S/.test(email)) {
      newErrors.email = t('common.emailInvalid');
    }

    if (!subject) {
      newErrors.subject = t('common.selectSubject');
    }

    if (!message.trim()) {
      newErrors.message = t('common.messageRequired');
    } else if (message.length > maxCharacters) {
      newErrors.message = t('common.messageMaxLength', { max: maxCharacters });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, attachment: t('common.fileTooLarge') }));
        return;
      }
      setAttachment(file);
      setErrors(prev => ({ ...prev, attachment: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      let attachmentUrl = null;
      if (attachment) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: attachment });
        attachmentUrl = file_url;
      }

      const subjectLabel = subjects.find(s => s.value === subject)?.label || subject;
      
      await base44.integrations.Core.SendEmail({
        from_name: "ContractGuard Contact Form",
        to: "support@contractguard.com",
        subject: `[Contact Form] ${subjectLabel} - ${name}`,
        body: `
New contact form submission:

Name: ${name}
Email: ${email}
Subject: ${subjectLabel}

Message:
${message}
${attachmentUrl ? `\nAttachment: ${attachmentUrl}` : ''}
        `
      });

      await base44.integrations.Core.SendEmail({
        from_name: "ContractGuard",
        to: email,
        subject: "We received your message - ContractGuard",
        body: `
Hi ${name},

Thank you for contacting ContractGuard. We have received your message and will respond within 24-48 hours.

Your message:
"${message}"

If you have any urgent questions, please reply to this email.

Best regards,
The ContractGuard Team
        `
      });

      setSubmitSuccess(true);
      setName("");
      setEmail("");
      setSubject("general");
      setMessage("");
      setAttachment(null);
      setErrors({});
      
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      setSubmitError("Failed to send message. Please try again or email us directly at support@contractguard.com");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <PublicNavbar />
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-50 to-white py-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('contact.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6 max-w-2xl">
          <AnimatePresence mode="wait">
            {submitSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <Card className="border-2 border-green-200 bg-green-50">
                  <CardContent className="p-12 text-center">
                    <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {t('contact.successTitle')}
                    </h2>
                    <p className="text-gray-700 mb-2">
                      {t('contact.successMessage')}
                    </p>
                    <p className="text-gray-600 text-sm mb-8">
                      {t('common.checkEmailConfirmation')}
                    </p>
                    <Button
                      onClick={() => setSubmitSuccess(false)}
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      {t('common.sendAnotherMessage')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-0 shadow-2xl">
                  <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <Label htmlFor="name">{t('contact.yourName')} *</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                          }}
                          placeholder="John Doe"
                          className={`mt-2 ${errors.name ? 'border-red-500' : ''}`}
                          disabled={isSubmitting}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="email">{t('contact.yourEmail')} *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                          }}
                          placeholder="john@example.com"
                          className={`mt-2 ${errors.email ? 'border-red-500' : ''}`}
                          disabled={isSubmitting}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.email}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="subject">{t('contact.subject')} *</Label>
                        <Select
                          value={subject}
                          onValueChange={(value) => {
                            setSubject(value);
                            if (errors.subject) setErrors(prev => ({ ...prev, subject: "" }));
                          }}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className={`mt-2 ${errors.subject ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder={t('contact.selectSubject')} />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map(sub => (
                              <SelectItem key={sub.value} value={sub.value}>
                                {sub.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.subject && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.subject}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="message">{t('contact.message')} *</Label>
                        <Textarea
                          id="message"
                          value={message}
                          onChange={(e) => {
                            setMessage(e.target.value);
                            if (errors.message) setErrors(prev => ({ ...prev, message: "" }));
                          }}
                          placeholder={t('contact.messagePlaceholder')}
                          rows={6}
                          className={`mt-2 ${errors.message ? 'border-red-500' : ''}`}
                          disabled={isSubmitting}
                          maxLength={maxCharacters}
                        />
                        <div className="flex justify-between items-center mt-1">
                          {errors.message ? (
                            <p className="text-red-500 text-sm flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.message}
                            </p>
                          ) : (
                            <div />
                          )}
                          <p className={`text-sm ${characterCount > maxCharacters ? 'text-red-500' : 'text-gray-500'}`}>
                            {characterCount}/{maxCharacters}
                          </p>
                        </div>
                      </div>

                      <div>
                        <Label>{t('common.attachFile')}</Label>
                        <div className="mt-2">
                          {attachment ? (
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                              <Upload className="w-5 h-5 text-blue-600" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{attachment.name}</p>
                                <p className="text-sm text-gray-500">
                                  {(attachment.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setAttachment(null)}
                                disabled={isSubmitting}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors cursor-pointer">
                              <Upload className="w-5 h-5 text-gray-400" />
                              <span className="text-gray-600">{t('common.clickToUpload')}</span>
                              <input
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                disabled={isSubmitting}
                              />
                            </label>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{t('common.fileFormatsSize')}</p>
                        {errors.attachment && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.attachment}
                          </p>
                        )}
                      </div>

                      {submitError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{submitError}</AlertDescription>
                        </Alert>
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-6 text-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            {t('contact.sending')}
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            {t('contact.sendMessage')}
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{t('contact.otherWaysTitle')}</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t('contact.emailSupport')}</p>
                      <a href="mailto:support@contractguard.com" className="text-blue-600 hover:text-blue-700">
                        {t('contact.emailAddress')}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t('contact.liveChat')}</p>
                      <p className="text-gray-600 text-sm">{t('contact.monFri9to6')}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Twitter className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Twitter</p>
                      <a href="https://twitter.com/contractguard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                        @contractguard
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">{t('common.officeHours')}</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">{t('common.mondayFriday')}</p>
                      <p className="text-gray-600">9:00 AM - 6:00 PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900">{t('common.saturdaySunday')}</p>
                      <p className="text-gray-600">{t('common.closed')}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>{t('contact.responseTime')}</strong> {t('contact.within24h')}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>{t('common.emergencySupport')}:</strong> {t('common.proBusinessOnly')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
