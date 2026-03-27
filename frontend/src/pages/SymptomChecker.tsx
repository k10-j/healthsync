import { useState } from "react";
import { AlertTriangle, ChevronRight, ChevronLeft, Heart, Calendar, BookOpen, Phone, Info, Sparkles, Shield, Thermometer, Activity, Brain, Search, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Symptom {
  id: string;
  name: string;
  category: string;
  icon: typeof Heart;
}

interface AssessmentResult {
  conditions: { name: string; probability: string }[];
  riskLevel: "low" | "medium" | "high";
  recommendations: string[];
  nextSteps: ("self-care" | "appointment" | "urgent")[];
}

const symptoms: Symptom[] = [
  { id: "headache", name: "Headache", category: "Head", icon: Brain },
  { id: "fever", name: "Fever", category: "General", icon: Thermometer },
  { id: "cough", name: "Cough", category: "Respiratory", icon: Activity },
  { id: "fatigue", name: "Fatigue", category: "General", icon: Activity },
  { id: "nausea", name: "Nausea", category: "Digestive", icon: Activity },
  { id: "dizziness", name: "Dizziness", category: "Head", icon: Brain },
  { id: "chest_pain", name: "Chest Discomfort", category: "Chest", icon: Heart },
  { id: "shortness_breath", name: "Shortness of Breath", category: "Respiratory", icon: Activity },
  { id: "stomach_pain", name: "Stomach Pain", category: "Digestive", icon: Activity },
  { id: "muscle_aches", name: "Muscle Aches", category: "General", icon: Activity },
  { id: "sore_throat", name: "Sore Throat", category: "Respiratory", icon: Activity },
  { id: "runny_nose", name: "Runny Nose", category: "Respiratory", icon: Activity },
];

const followUpQuestions = [
  { id: "duration", question: "How long have you been feeling this way?", options: ["Just started today", "A few days", "About a week", "More than a week"] },
  { id: "severity", question: "How would you describe the intensity?", options: ["Mild — manageable", "Moderate — noticeable", "Severe — affecting daily life"] },
  { id: "onset", question: "Did this come on suddenly or gradually?", options: ["Came on suddenly", "Built up gradually"] },
];

const mockResult: AssessmentResult = {
  conditions: [
    { name: "Common Cold", probability: "Most likely" },
    { name: "Flu", probability: "Possible" },
    { name: "COVID-19", probability: "Consider testing" },
  ],
  riskLevel: "medium",
  recommendations: [
    "Get plenty of rest — your body needs time to heal",
    "Stay hydrated with water, tea, or warm broth",
    "Over-the-counter pain relievers may help with discomfort",
    "Monitor your symptoms and temperature",
  ],
  nextSteps: ["self-care", "appointment"],
};

export default function SymptomChecker() {
  const [step, setStep] = useState<"intro" | "symptoms" | "questions" | "result">("intro");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptomId) ? prev.filter(s => s !== symptomId) : [...prev, symptomId]
    );
  };

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [followUpQuestions[currentQuestion].id]: answer }));
    if (currentQuestion < followUpQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setStep("result");
    }
  };

  const getRiskInfo = (level: AssessmentResult["riskLevel"]) => {
    switch (level) {
      case "low": return { class: "bg-success/15 border-success/30", badge: "success", message: "This looks manageable with self-care", icon: Heart };
      case "medium": return { class: "bg-warning/15 border-warning/30", badge: "warning", message: "Consider speaking with a healthcare provider", icon: Thermometer };
      case "high": return { class: "bg-destructive/15 border-destructive/30", badge: "destructive", message: "Please seek medical attention soon", icon: AlertTriangle };
    }
  };

  const resetAssessment = () => {
    setStep("intro");
    setSelectedSymptoms([]);
    setAnswers({});
    setCurrentQuestion(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/50 to-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {step !== "intro" && (
              <Button variant="ghost" size="icon-sm" className="rounded-xl" onClick={() => {
                if (step === "symptoms") setStep("intro");
                else if (step === "questions") {
                  if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
                  else setStep("symptoms");
                } else if (step === "result") setStep("questions");
              }}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold text-foreground">How Are You Feeling?</h1>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1 rounded-lg">
            <Shield className="h-3 w-3" />Guidance only
          </Badge>
        </div>
      </header>

      <div className="px-4 py-6 animate-fade-in">
        {step === "intro" && (
          <div className="space-y-6">
            <div className="text-center py-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-5 shadow-soft">
                <Thermometer className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">We're here to help</h2>
              <p className="text-muted-foreground leading-relaxed">
                Let's understand how you're feeling and guide you toward the right care.
              </p>
            </div>

            <div className="health-card-warm p-5 border-warning/30">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center flex-shrink-0">
                  <Info className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">A friendly reminder</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    This tool offers gentle guidance based on your symptoms, but it's not a replacement for professional medical advice.
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={() => setStep("symptoms")} className="w-full rounded-2xl" size="lg">
              <Sparkles className="h-5 w-5 mr-2" />Let's Get Started
            </Button>

            <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              <p>If you're having a medical emergency, please call emergency services immediately.</p>
            </div>
          </div>
        )}

        {step === "symptoms" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">What's bothering you?</h2>
              <p className="text-sm text-muted-foreground">Select all that apply — take your time</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {symptoms.map((symptom) => {
                const SymptomIcon = symptom.icon;
                return (
                  <button key={symptom.id} onClick={() => toggleSymptom(symptom.id)}
                    className={cn(
                      "p-4 rounded-2xl text-left transition-all duration-300 border-2",
                      selectedSymptoms.includes(symptom.id)
                        ? "bg-primary/10 border-primary shadow-soft"
                        : "bg-card border-border/50 hover:border-primary/30 hover:bg-primary/5"
                    )}>
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-2">
                      <SymptomIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="font-semibold text-sm text-foreground block">{symptom.name}</span>
                    <span className="text-xs text-muted-foreground">{symptom.category}</span>
                  </button>
                );
              })}
            </div>
            <Button onClick={() => setStep("questions")} disabled={selectedSymptoms.length === 0} className="w-full rounded-2xl" size="lg">
              Continue ({selectedSymptoms.length} selected)<ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          </div>
        )}

        {step === "questions" && (
          <div className="space-y-6">
            <div className="flex gap-2">
              {followUpQuestions.map((_, i) => (
                <div key={i} className={cn("h-2 flex-1 rounded-full transition-all duration-500", i <= currentQuestion ? "bg-primary" : "bg-muted")} />
              ))}
            </div>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-2">Question {currentQuestion + 1} of {followUpQuestions.length}</p>
              <h2 className="text-xl font-bold text-foreground">{followUpQuestions[currentQuestion].question}</h2>
            </div>
            <div className="space-y-3">
              {followUpQuestions[currentQuestion].options.map((option) => (
                <button key={option} onClick={() => handleAnswer(option)}
                  className="w-full p-4 rounded-2xl text-left transition-all duration-300 border-2 border-border/50 bg-card hover:border-primary/40 hover:bg-primary/5 hover:shadow-soft">
                  <span className="font-semibold text-foreground">{option}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === "result" && (
          <div className="space-y-6">
            {(() => {
              const riskInfo = getRiskInfo(mockResult.riskLevel);
              const RiskIcon = riskInfo.icon;
              return (
                <div className={cn("health-card p-6 text-center border-2", riskInfo.class)}>
                  <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center mx-auto mb-3">
                    <RiskIcon className="h-8 w-8 text-foreground" />
                  </div>
                  <Badge variant={riskInfo.badge as any} className="mb-3">
                    {mockResult.riskLevel.charAt(0).toUpperCase() + mockResult.riskLevel.slice(1)} Priority
                  </Badge>
                  <h2 className="text-lg font-bold text-foreground">Assessment Complete</h2>
                  <p className="text-sm text-muted-foreground mt-1">{riskInfo.message}</p>
                </div>
              );
            })()}

            <div className="health-card-warm p-4 border-primary/20">
              <div className="flex gap-3 items-start">
                <Heart className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" fill="currentColor" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Remember:</strong> You know your body best. This is guidance to support you, not replace your instincts or professional care.
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground" /> What this might be
              </h3>
              <div className="space-y-2">
                {mockResult.conditions.map((condition, i) => (
                  <div key={i} className="health-card p-4 flex items-center justify-between">
                    <span className="font-semibold text-foreground">{condition.name}</span>
                    <Badge variant="outline" className="rounded-lg">{condition.probability}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" /> Ways to feel better
              </h3>
              <div className="health-card p-5">
                <ul className="space-y-3">
                  {mockResult.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">{i + 1}</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-muted-foreground" /> Next steps for you
              </h3>
              <div className="grid gap-3">
                {mockResult.nextSteps.includes("appointment") && (
                  <Link to="/appointments/book" className="health-card p-4 flex items-center gap-4 hover:shadow-elevated transition-all duration-300 group">
                    <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground">Talk to a professional</h4>
                      <p className="text-xs text-muted-foreground">Schedule a visit when you're ready</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
                <Link to="/health-library" className="health-card p-4 flex items-center gap-4 hover:shadow-elevated transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-2xl bg-success/15 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground">Learn more</h4>
                    <p className="text-xs text-muted-foreground">Explore trusted health information</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                </Link>
                {mockResult.nextSteps.includes("urgent") && (
                  <a href="tel:112" className="health-card p-4 flex items-center gap-4 bg-destructive/5 border-destructive/30">
                    <div className="w-12 h-12 rounded-2xl bg-destructive/15 flex items-center justify-center">
                      <Phone className="h-6 w-6 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground">Call for help</h4>
                      <p className="text-xs text-muted-foreground">If you need immediate care</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-destructive" />
                  </a>
                )}
              </div>
            </div>

            <Button onClick={resetAssessment} variant="outline" className="w-full rounded-2xl">Start a New Check</Button>
          </div>
        )}
      </div>
    </div>
  );
}
