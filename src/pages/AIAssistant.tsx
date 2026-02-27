import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { NavigationMenu } from "@/components/NavigationMenu";
import { Footer } from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  Bot,
  User,
  Loader2,
  RefreshCw,
  TrendingUp,
  PieChart,
  Lightbulb,
  MessageSquare,
  Clock,
  AlertCircle,
} from "lucide-react";
import { aiAPI, AgentReport } from "@/services/aiApi";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ── localStorage cache hook ───────────────────────────────────────────────────
function useCachedReport(key: string) {
  const [report, setReportState] = useState<AgentReport | null>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as AgentReport) : null;
    } catch {
      return null;
    }
  });

  const setReport = useCallback((data: AgentReport | null) => {
    setReportState(data);
    if (data) {
      try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* quota exceeded */ }
    } else {
      localStorage.removeItem(key);
    }
  }, [key]);

  return [report, setReport] as const;
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
// Simple whitespace-preserving renderer — no external dep needed.
const MarkdownReport = ({ content }: { content: string }) => {
  const lines = content.split("\n");
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (line.startsWith("## "))
          return (
            <h2 key={i} className="text-base font-bold mt-4 mb-1 text-foreground">
              {line.replace(/^## /, "")}
            </h2>
          );
        if (line.startsWith("### "))
          return (
            <h3 key={i} className="text-sm font-semibold mt-3 mb-1 text-foreground">
              {line.replace(/^### /, "")}
            </h3>
          );
        if (line.startsWith("- ") || line.startsWith("* "))
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-primary mt-0.5 flex-shrink-0">•</span>
              <span className="text-muted-foreground">{line.replace(/^[-*] /, "")}</span>
            </div>
          );
        if (line.startsWith("**") && line.endsWith("**"))
          return (
            <p key={i} className="font-semibold text-foreground">
              {line.replace(/\*\*/g, "")}
            </p>
          );
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-muted-foreground">
            {line}
          </p>
        );
      })}
    </div>
  );
};

// ── Report card component ─────────────────────────────────────────────────────
interface ReportCardProps {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  report: AgentReport | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

const ReportCard = ({
  title,
  icon: Icon,
  iconColor,
  report,
  loading,
  error,
  onRefresh,
  badge,
  badgeVariant = "secondary",
}: ReportCardProps) => (
  <Card className="h-full">
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${iconColor}`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-base">{title}</CardTitle>
          {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>
      {report && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Generated at {report.generatedAt}</span>
        </div>
      )}
    </CardHeader>
    <CardContent>
      {loading && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>AI agent is analyzing your data with llama3.2…</span>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}
      {error && !loading && (
        <div className="flex items-start gap-2 text-destructive p-3 bg-destructive/10 rounded-lg">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Failed to load report</p>
            <p className="text-xs mt-1 text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={onRefresh} className="mt-2 h-7 text-xs">
              Try again
            </Button>
          </div>
        </div>
      )}
      {report && !loading && (
        <ScrollArea className="h-[500px] pr-2">
          <MarkdownReport content={report.report} />
        </ScrollArea>
      )}
      {!report && !loading && !error && (
        <div className="text-center py-12 text-muted-foreground">
          <Icon className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Click refresh to generate your report</p>
        </div>
      )}
    </CardContent>
  </Card>
);

// ── Main component ─────────────────────────────────────────────────────────────
const AIAssistant = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const { toast } = useToast();

  // ── Chat state ────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI financial assistant powered by llama3.2 running locally. I can help you understand your portfolio, analyze expenses, and provide investment insights. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Agent report state (localStorage-cached) ─────────────────────────────
  const [portfolioReport, setPortfolioReport] = useCachedReport("ai_report_portfolio");
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);

  const [expenseReport, setExpenseReport] = useCachedReport("ai_report_expense");
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseError, setExpenseError] = useState<string | null>(null);

  const [recommendationReport, setRecommendationReport] = useCachedReport("ai_report_recommendations");
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  // ── Auto-fetch on first tab visit (skip if already cached) ───────────────
  const fetchedTabs = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!fetchedTabs.current.has(activeTab)) {
      fetchedTabs.current.add(activeTab);
      // Only auto-fetch if there's no cached report yet
      if (activeTab === "portfolio" && !portfolioReport) fetchPortfolioReport();
      if (activeTab === "expenses" && !expenseReport) fetchExpenseReport();
      if (activeTab === "recommendations" && !recommendationReport) fetchRecommendationReport();
    }
  }, [activeTab, portfolioReport, expenseReport, recommendationReport]);

  // ── Fetch functions ───────────────────────────────────────────────────────
  const fetchPortfolioReport = useCallback(async () => {
    setPortfolioLoading(true);
    setPortfolioError(null);
    try {
      const data = await aiAPI.getPortfolioAnalysis();
      setPortfolioReport(data);
    } catch (e) {
      setPortfolioError("Could not reach the backend. Make sure the server is running and Ollama is active.");
      toast({ title: "Portfolio Analysis Failed", description: "Could not fetch report.", variant: "destructive" });
    } finally {
      setPortfolioLoading(false);
    }
  }, [toast]);

  const fetchExpenseReport = useCallback(async () => {
    setExpenseLoading(true);
    setExpenseError(null);
    try {
      const data = await aiAPI.getExpenseAnalysis();
      setExpenseReport(data);
    } catch (e) {
      setExpenseError("Could not reach the backend. Make sure the server is running and Ollama is active.");
      toast({ title: "Expense Analysis Failed", description: "Could not fetch report.", variant: "destructive" });
    } finally {
      setExpenseLoading(false);
    }
  }, [toast]);

  const fetchRecommendationReport = useCallback(async () => {
    setRecommendationLoading(true);
    setRecommendationError(null);
    try {
      const data = await aiAPI.getRecommendations();
      setRecommendationReport(data);
    } catch (e) {
      setRecommendationError("Could not reach the backend. Make sure the server is running and Ollama is active.");
      toast({ title: "Recommendations Failed", description: "Could not fetch report.", variant: "destructive" });
    } finally {
      setRecommendationLoading(false);
    }
  }, [toast]);

  // ── Chat functions ────────────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: chatInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const msgText = chatInput;
    setChatInput("");
    setChatLoading(true);

    try {
      const data = await aiAPI.chat(msgText);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response, timestamp: new Date() },
      ]);
    } catch {
      toast({
        title: "Error",
        description: "Failed to get a response. Make sure the backend and Ollama are running.",
        variant: "destructive",
      });
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Financial Dashboard</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Powered by llama3.2 · running locally via Ollama
              </p>
            </div>
            <NavigationMenu />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab list */}
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="chat" className="flex items-center gap-2 text-xs sm:text-sm">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="flex items-center gap-2 text-xs sm:text-sm">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Portfolio</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2 text-xs sm:text-sm">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2 text-xs sm:text-sm">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Recommendations</span>
            </TabsTrigger>
          </TabsList>

          {/* ── Chat Tab ── */}
          <TabsContent value="chat">
            <Card className="h-[calc(100vh-18rem)] flex flex-col">
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-primary-foreground" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                          }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                        <p className="text-xs opacity-60 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-accent-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <div className="bg-muted rounded-lg p-4 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs text-muted-foreground">Thinking…</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything about your finances…"
                    disabled={chatLoading}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage} disabled={chatLoading || !chatInput.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ── Portfolio Tab ── */}
          <TabsContent value="portfolio">
            <ReportCard
              title="Portfolio Analysis"
              icon={PieChart}
              iconColor="bg-blue-500"
              report={portfolioReport}
              loading={portfolioLoading}
              error={portfolioError}
              onRefresh={fetchPortfolioReport}
              badge="Investment Agent"
            />
          </TabsContent>

          {/* ── Expenses Tab ── */}
          <TabsContent value="expenses">
            <ReportCard
              title="Expense Insights"
              icon={TrendingUp}
              iconColor="bg-orange-500"
              report={expenseReport}
              loading={expenseLoading}
              error={expenseError}
              onRefresh={fetchExpenseReport}
              badge="Expense Agent"
            />
          </TabsContent>

          {/* ── Recommendations Tab ── */}
          <TabsContent value="recommendations">
            <ReportCard
              title="Investment Recommendations"
              icon={Lightbulb}
              iconColor="bg-emerald-500"
              report={recommendationReport}
              loading={recommendationLoading}
              error={recommendationError}
              onRefresh={fetchRecommendationReport}
              badge="Recommendation Agent"
              badgeVariant="default"
            />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default AIAssistant;
