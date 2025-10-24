
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Shield, ArrowLeft, Calendar, Clock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import PublicNavbar from "../components/landing/PublicNavbar";
import Footer from "../components/landing/Footer";
import { useTranslation } from "../components/i18n/I18nProvider";

// Fallback blog posts in case Notion fails
const fallbackBlogPosts = [
  {
    id: "fallback-1", // Added ID for fallback posts
    title: "10 Dangerous Clauses to Avoid in Rental Leases",
    excerpt: "Learn to identify the most problematic clauses that could cost you thousands in your next rental contract.",
    category: "Contracts",
    readTime: "5 min",
    date: "2024-12-15",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop"
  },
  {
    id: "fallback-2",
    title: "How to Negotiate Better Terms in Employment Contracts",
    excerpt: "Proven strategies to get better conditions in your next employment contract without seeming difficult.",
    category: "Employment",
    readTime: "7 min",
    date: "2024-12-12",
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=400&fit=crop"
  },
  {
    id: "fallback-3",
    title: "Complete Guide: Understanding NDAs (Non-Disclosure Agreements)",
    excerpt: "Everything you need to know about non-disclosure agreements before signing one at your new company.",
    category: "Legal",
    readTime: "6 min",
    date: "2024-12-10",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop"
  },
  {
    id: "fallback-4",
    title: "The 5 Most Common Mistakes When Signing Freelance Contracts",
    excerpt: "Avoid these costly mistakes that most freelancers make when signing their first contracts.",
    category: "Freelance",
    readTime: "4 min",
    date: "2024-12-08",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop"
  },
  {
    id: "fallback-5",
    title: "What to Do If You Find an Illegal Clause in Your Contract?",
    excerpt: "Practical steps to protect your rights when you discover illegal or abusive terms.",
    category: "Tips",
    readTime: "5 min",
    date: "2024-12-05",
    image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&h=400&fit=crop"
  },
  {
    id: "fallback-6",
    title: "Intelligent Analysis vs Lawyers: When Do You Need Each?",
    excerpt: "Discover when automated analysis is sufficient and when you really need to consult a lawyer.",
    category: "Technology",
    readTime: "6 min",
    date: "2024-12-03",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop"
  }
];

export default function Blog() {
  const { t } = useTranslation();
  const [blogPosts, setBlogPosts] = useState(fallbackBlogPosts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const response = await base44.functions.invoke('getNotionBlogPosts');
        
        console.log('Blog API Response:', response.data);
        
        if (response.data.success && response.data.posts.length > 0) {
          setBlogPosts(response.data.posts);
        } else {
          // Use fallback if no posts returned
          console.warn('No blog posts from Notion, using fallback');
          setBlogPosts(fallbackBlogPosts); // Ensure fallback is used if successful but empty
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        console.error('Error details:', err.response?.data);
        setError(t('blog.unableToLoadPosts'));
        setBlogPosts(fallbackBlogPosts); // Always use fallback on error
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <PublicNavbar />
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-green-50 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              {t('blog.title')}
            </h1>
            <p className="text-xl text-gray-600">
              {t('blog.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Error Banner */}
      {error && (
        <div className="container mx-auto px-6 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800">{error} - {t('blog.showingRecentPosts')}</p>
          </div>
        </div>
      )}

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {blogPosts.map((post, index) => (
                <motion.div
                  key={post.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={createPageUrl("BlogPost") + "?id=" + post.id}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden group cursor-pointer">
                      <div className="relative overflow-hidden">
                        <img 
                          src={post.image} 
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white text-gray-900 hover:bg-white">
                            {post.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardHeader>
                        <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <p className="text-gray-600 leading-relaxed">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(post.date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {post.readTime}
                            </div>
                          </div>
                          
                          <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
