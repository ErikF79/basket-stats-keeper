'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { getAnalysis } from '@/app/actions';
import type { Team } from '@/types';

interface AnalysisCardProps {
  team: Team;
}

export default function AnalysisCard({ team }: AnalysisCardProps) {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAnalysis = async () => {
    setIsLoading(true);
    setAnalysis('');
    const result = await getAnalysis(team);
    setAnalysis(result);
    setIsLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" />
          Performance Analysis
        </CardTitle>
        <CardDescription>
          Get AI-powered insights and suggestions based on the current stats.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {analysis && !isLoading && (
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-md border bg-secondary/30 p-4">
            {analysis}
          </div>
        )}
        <Button onClick={handleAnalysis} disabled={isLoading} className="mt-4 w-full md:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
             'Analyze Performance'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
