import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BookOpen, CheckCircle, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import { cn } from "@/lib/utils";

import { Heart, Brain, Apple, Activity } from "lucide-react";

const categoryUI: Record<string, { icon: any; color: string }> = {
  chronic: { icon: Heart, color: "destructive" },
  mental: { icon: Brain, color: "primary" },
  nutrition: { icon: Apple, color: "success" },
  wellness: { icon: Activity, color: "accent" },
};

type LearnLanguage = "en" | "kn";

interface LearnArticleDetail {
  id: string;
  title: string;
  titleKn: string;
  category: string;
  readTime: number;
  verified: boolean;
  excerpt: string;
  content: string;
  topic: { id: string; name: string; nameKn: string };
}

export default function HealthLibraryArticle() {
  const { id } = useParams();
  const [language, setLanguage] = useState<LearnLanguage>("en");
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<LearnArticleDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest<{ article: LearnArticleDetail }>(`/learn/articles/${id}`);
        setArticle(res.article);
      } catch (e: any) {
        setError(e?.message || "Failed to load article");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const ui = article ? categoryUI[article.category] : null;
  const CategoryIcon = ui?.icon || BookOpen;
  const categoryColor = ui?.color || "primary";

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-top">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Link to="/health-library">
                <Button variant="ghost" size="icon-sm" className="rounded-xl">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <BookOpen className="h-5 w-5 text-success" />
              <h1 className="text-xl font-bold text-foreground">Learn & Grow</h1>
            </div>
            <div className="flex items-center gap-1 p-0.5 bg-muted rounded-xl">
              <button
                onClick={() => setLanguage("en")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                  language === "en" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground",
                )}
              >
                English
              </button>
              <button
                onClick={() => setLanguage("kn")}
                className={cn(
                  "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all",
                  language === "kn" ? "bg-card text-foreground shadow-soft" : "text-muted-foreground",
                )}
              >
                Kinyarwanda
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-4 animate-fade-in">
        {loading && (
          <div className="health-card p-5 text-sm text-muted-foreground">Loading article...</div>
        )}

        {error && !loading && (
          <div className="health-card p-5 text-sm text-destructive">{error}</div>
        )}

        {!loading && !error && article && (
          <div className="space-y-4">
            <div className="health-card p-5 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="rounded-lg gap-1">
                    <CategoryIcon className="h-3 w-3" />
                    {language === "en" ? article.topic.name : article.topic.nameKn}
                  </Badge>
                  {article.verified && (
                    <Badge variant="success" className="gap-1 rounded-lg">
                      <CheckCircle className="h-3 w-3" />
                      {language === "en" ? "Verified" : "Byemejwe"}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{article.readTime} min read</span>
                </div>
              </div>

              <h2 className="font-bold text-foreground text-2xl">{language === "en" ? article.title : article.titleKn}</h2>

              <p className="text-sm text-muted-foreground leading-relaxed">{article.excerpt}</p>
            </div>

            <div className="health-card p-5">
              <div className="text-sm text-primary-foreground/90 whitespace-pre-wrap leading-relaxed">
                {article.content}
              </div>
              <div className="mt-4">
                <Link
                  to="/health-library"
                  className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Back to topics
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

