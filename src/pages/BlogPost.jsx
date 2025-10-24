import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Share2, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import PublicNavbar from "../components/landing/PublicNavbar";
import Footer from "../components/landing/Footer";
import { useTranslation } from "../components/i18n/I18nProvider";

export default function BlogPost() {
  const { t } = useTranslation();
  const [post, setPost] = useState(null);
  const [content, setContent] = useState("");
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        
        // Get post ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        
        if (!postId) {
          setError(t('blog.noPostIdProvided'));
          setLoading(false);
          return;
        }

        // First get the post metadata and all posts
        const postsResponse = await base44.functions.invoke('getNotionBlogPosts');
        
        if (!postsResponse.data.success || !postsResponse.data.posts) {
          throw new Error('Failed to load post metadata');
        }

        const foundPost = postsResponse.data.posts.find(p => p.id === postId);
        
        if (!foundPost) {
          setError(t('blog.postNotFoundError'));
          setLoading(false);
          return;
        }

        setPost(foundPost);

        // Get related posts (exclude current post, max 3)
        const otherPosts = postsResponse.data.posts
          .filter(p => p.id !== postId)
          .slice(0, 3);
        setRelatedPosts(otherPosts);

        // Then get the full content
        const contentResponse = await base44.functions.invoke('getNotionPostContent', { pageId: postId });
        
        if (contentResponse.data.success && contentResponse.data.content) {
          setContent(contentResponse.data.content);
        } else {
          setContent(`<p>${t('blog.contentNotAvailable')}</p>`);
        }

      } catch (err) {
        console.error('Error loading blog post:', err);
        setError(t('blog.failedToLoadPost'));
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-6 py-4">
            <PublicNavbar />
          </div>
        </header>
        
        <div className="container mx-auto px-6 py-20 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('blog.postNotFound')}</h1>
          <p className="text-gray-600 mb-8">{error || t('blog.postNotFoundDescription')}</p>
          <Link to={createPageUrl("Blog")}>
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('blog.backToBlog')}
            </Button>
          </Link>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <PublicNavbar />
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to={createPageUrl("Landing")} className="hover:text-blue-600">
              {t('blog.home')}
            </Link>
            <span>/</span>
            <Link to={createPageUrl("Blog")} className="hover:text-blue-600">
              {t('blog.blog')}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{post.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <section className="relative h-96 bg-gray-900">
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />
      </section>

      {/* Article Header */}
      <section className="py-12 bg-white -mt-32 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8 md:p-12"
          >
            <Link to={createPageUrl("Blog")}>
              <Button variant="ghost" className="mb-6 -ml-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('blog.backToBlog')}
              </Button>
            </Link>

            <Badge className="mb-4">{post.category}</Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{t('blog.by')} {post.author}</span>
              </div>
              <Button variant="outline" size="sm" className="ml-auto">
                <Share2 className="w-4 h-4 mr-2" />
                {t('blog.share')}
              </Button>
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
              style={{
                lineHeight: '1.8',
              }}
            />
          </motion.div>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {t('blog.moreArticles')}
          </h2>
          
          {relatedPosts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {relatedPosts.map((relatedPost, index) => (
                <motion.div
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={createPageUrl("BlogPost") + "?id=" + relatedPost.id}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden group cursor-pointer">
                      <div className="relative overflow-hidden">
                        <img 
                          src={relatedPost.image} 
                          alt={relatedPost.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white text-gray-900 hover:bg-white">
                            {relatedPost.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3">
                          {relatedPost.title}
                        </h3>
                        
                        <p className="text-gray-600 leading-relaxed mb-4 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(relatedPost.date)}
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
          ) : null}
          
          <div className="text-center">
            <Link to={createPageUrl("Blog")}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                {t('blog.viewAllPosts')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}