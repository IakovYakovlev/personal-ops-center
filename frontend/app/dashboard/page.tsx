import Link from 'next/link';
import { IconBook, IconBrain, IconDatabase, IconChartDots3 } from '@tabler/icons-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  return (
    <div className="space-y-8 px-4 lg:px-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome to Personal Ops Center</h1>
        <p className="text-muted-foreground mt-2">
          Your personal operations dashboard for AI-powered productivity tools
        </p>
      </div>

      {/* Services Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Services</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* AI Document Intelligence - Active Service */}
          <Link href="/dashboard/documents">
            <Card
              className={cn(
                'p-6 transition-all border-2 cursor-pointer h-full',
                'border-muted hover:border-primary/50 hover:shadow-lg',
              )}
            >
              <CardHeader className="p-0">
                <div className="flex items-center gap-2 mb-2">
                  <IconBook className="size-6 text-primary" />
                  <CardTitle>AI Document Intelligence</CardTitle>
                </div>
                <CardDescription>
                  Upload and analyze documents with AI. Extract summaries, keywords, sentiment, and
                  insights.
                </CardDescription>
                <p className="text-xs text-muted-foreground mt-2">🟢 Ready to use</p>
              </CardHeader>
            </Card>
          </Link>

          {/* Neural Assistant - Coming Soon */}
          <Link href="/dashboard/neural-assistant">
            <Card
              className={cn(
                'p-6 transition-all border-2 cursor-pointer h-full',
                'border-muted hover:border-primary/50 hover:shadow-lg',
              )}
            >
              <CardHeader className="p-0">
                <div className="flex items-center gap-2 mb-2">
                  <IconBrain className="size-6 text-muted-foreground" />
                  <CardTitle>Neural Assistant</CardTitle>
                </div>
                <CardDescription>
                  Chat with AI assistant. RAG-powered search and question answering for your
                  documents.
                </CardDescription>
                <p className="text-xs text-muted-foreground mt-2">🚧 Coming Soon</p>
              </CardHeader>
            </Card>
          </Link>

          {/* Data Forge - Coming Soon */}
          <Card
            className={cn(
              'p-6 transition-all border-2 h-full',
              'opacity-60 cursor-not-allowed border-muted',
            )}
          >
            <CardHeader className="p-0">
              <div className="flex items-center gap-2 mb-2">
                <IconDatabase className="size-6 text-muted-foreground" />
                <CardTitle>Data Forge</CardTitle>
              </div>
              <CardDescription>
                Process and transform data with .NET 10 backend. High-performance data pipelines.
              </CardDescription>
              <p className="text-xs text-muted-foreground mt-2">🚧 Coming Soon</p>
            </CardHeader>
          </Card>

          {/* Insight Aggregator - Coming Soon */}
          <Card
            className={cn(
              'p-6 transition-all border-2 h-full',
              'opacity-60 cursor-not-allowed border-muted',
            )}
          >
            <CardHeader className="p-0">
              <div className="flex items-center gap-2 mb-2">
                <IconChartDots3 className="size-6 text-muted-foreground" />
                <CardTitle>Insight Aggregator</CardTitle>
              </div>
              <CardDescription>
                Aggregate and visualize insights across all services. Analytics dashboard powered by
                .NET 10.
              </CardDescription>
              <p className="text-xs text-muted-foreground mt-2">🚧 Coming Soon</p>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
