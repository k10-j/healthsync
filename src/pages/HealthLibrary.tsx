import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Search, Heart, Brain, Apple, Activity, ChevronRight, BookOpen, Clock, CheckCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";

interface Topic {
  id: string;
  name: string;
  nameKn: string;
  articleCount: number;
}

interface Article {
  id: string;
  title: string;
  titleKn: string;
  category: string;
  readTime: number;
  verified: boolean;
  excerpt: string;
}

const categoryUI: Record<string, { icon: typeof Heart; color: string }> = {
  chronic: { icon: Heart, color: "destructive" },
  mental: { icon: Brain, color: "primary" },
  nutrition: { icon: Apple, color: "success" },
  wellness: { icon: Activity, color: "accent" },
};

export default function HealthLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "kn">("en");

  const [topics, setTopics] = useState<Topic[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    const loadTopicsAndArticles = async () => {
      const topicsRes = await apiRequest<{ topics: Topic[] }>("/learn/topics");
      setTopics(topicsRes.topics);

      const articlesRes = await apiRequest<{ articles: Article[] }>("/learn/articles");
      setArticles(articlesRes.articles);
    };

    loadTopicsAndArticles().catch(() => {
      setTopics([]);
      setArticles([]);
    });
  }, []);

  useEffect(() => {
    const loadBySearch = async () => {
      const q = searchQuery.trim();
      if (!q) {
        const res = await apiRequest<{ articles: Article[] }>("/learn/articles");
        setArticles(res.articles);
        return;
      }

      const res = await apiRequest<{ articles: Article[] }>(`/learn/search?q=${encodeURIComponent(q)}`);
      setArticles(res.articles);
    };

    loadBySearch().catch(() => setArticles([]));
  }, [searchQuery]);

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch = language === "en"
        ? article.title.toLowerCase().includes(searchQuery.toLowerCase())
        : article.titleKn.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || article.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [articles, language, searchQuery, selectedCategory]);

  const getTopicInfo = (topicId: string) => topics.find((t) => t.id === topicId);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #f0fdfa 0%, #f8fffe 50%, #e0f2fe 100%)" }}>
      <header className="sticky top-0 z-40 safe-top" style={{
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid hsl(185 40% 80% / 0.5)",
        boxShadow: "0 2px 16px hsl(185 85% 38% / 0.08)",
      }}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-teal-600" />
              <h1 className="text-xl font-bold" style={{
                background: "linear-gradient(135deg, hsl(185,85%,32%) 0%, hsl(190,95%,38%) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>Learn & Grow</h1>
            </div>
            <div className="flex items-center gap-1 p-0.5 rounded-xl bg-teal-50">
              {(["en", "kn"] as const).map((lang) => (
                <button key={lang} onClick={() => setLanguage(lang)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                  style={language === lang ? {
                    background: "linear-gradient(135deg, hsl(185,85%,38%) 0%, hsl(190,95%,42%) 100%)",
                    color: "white",
                    boxShadow: "0 2px 8px hsl(185 85% 38% / 0.3)",
                  } : { color: "hsl(185,50%,40%)" }}>
                  {lang === "en" ? "English" : "Kinyarwanda"}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-400" />
            <Input
              placeholder={language === "en" ? "Search for wellness topics..." : "Shakisha inyandiko..."}
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 rounded-2xl bg-white border-teal-200 text-slate-800 placeholder:text-slate-400"
            />
          </div>
        </div>
      </header>

      <div className="px-4 py-6 space-y-6 animate-fade-in">
        <section>
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {language === "en" ? "Explore Topics" : "Ibyiciro"}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {topics.map((topic) => {
              const ui = categoryUI[topic.id];
              const CategoryIcon = ui?.icon || BookOpen;
              const color = ui?.color || "primary";
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedCategory(
                    selectedCategory === topic.id ? null : topic.id
                  )}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 border-2",
                    selectedCategory === topic.id
                      ? "bg-primary/10 border-primary shadow-soft"
                      : "bg-card border-border/50 hover:border-primary/30 hover:shadow-soft",
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", `bg-${color}/15`)}>
                    <CategoryIcon className={cn("h-6 w-6", `text-${color}`)} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-foreground text-sm">
                      {language === "en" ? topic.name : topic.nameKn}
                    </h3>
                    <p className="text-xs text-muted-foreground">{topic.articleCount} articles</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-foreground">
              {selectedCategory
                ? (language === "en" ? getTopicInfo(selectedCategory)?.name : getTopicInfo(selectedCategory)?.nameKn)
                : (language === "en" ? "Recommended for You" : "Inyandiko Zose")}
            </h2>
            {selectedCategory && (
              <button onClick={() => setSelectedCategory(null)} className="text-sm text-primary font-semibold">
                {language === "en" ? "Show all" : "Kuraho ishushanya"}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {filteredArticles.map((article) => {
              const topic = getTopicInfo(article.category);
              const ui = categoryUI[article.category];
              const CategoryIcon = ui?.icon || BookOpen;
              return (
                <Link key={article.id} to={`/health-library/${article.id}`}
                  className="health-card block p-5 group hover:shadow-elevated transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="rounded-lg gap-1">
                        <CategoryIcon className="h-3 w-3" />
                        {language === "en" ? topic?.name : topic?.nameKn}
                      </Badge>
                      {article.verified && (
                        <Badge variant="success" className="gap-1 rounded-lg">
                          <CheckCircle className="h-3 w-3" />
                          {language === "en" ? "Verified" : "Byemejwe"}
                        </Badge>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">
                    {language === "en" ? article.title : article.titleKn}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{article.excerpt}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{article.readTime} min read</span>
                    <span className="text-border">·</span>
                    <span className="text-primary font-medium">Read now</span>
                    <ArrowRight className="h-3 w-3 text-primary" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
