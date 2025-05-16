import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Loader2 } from "lucide-react";
import { logger } from "../../utils/logger";

interface StatsProps {
  userId: string;
}

interface Statistics {
  totalFlashcards: number;
  aiGeneratedCount: number;
  aiEditedCount: number;
  manualCount: number;
  loading: boolean;
  error: string | null;
}

const StatCard = ({ title, value, loading }: { title: string; value: number; loading: boolean }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold flex items-center">
        {loading ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : value}
      </div>
    </CardContent>
  </Card>
);

export function Stats({ userId }: StatsProps) {
  const [stats, setStats] = useState<Statistics>({
    totalFlashcards: 0,
    aiGeneratedCount: 0,
    aiEditedCount: 0,
    manualCount: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch statistics");
        }
        const data = await response.json();
        setStats({
          ...data,
          loading: false,
          error: null,
        });
      } catch (error) {
        logger.error("Error fetching stats:", error);
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load statistics",
        }));
      }
    };

    fetchStats();
  }, [userId]);

  if (stats.error) {
    return (
      <Card className="bg-destructive/10">
        <CardContent className="pt-6">
          <p className="text-destructive">Error loading statistics: {stats.error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Flashcards" value={stats.totalFlashcards} loading={stats.loading} />
      <StatCard title="AI Generated" value={stats.aiGeneratedCount} loading={stats.loading} />
      <StatCard title="AI Edited" value={stats.aiEditedCount} loading={stats.loading} />
      <StatCard title="Manual" value={stats.manualCount} loading={stats.loading} />
    </div>
  );
}
