import { useMutation } from '@apollo/client';
import { Sparkles, Loader2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GENERATE_TASK_RECOMMENDATIONS, UPDATE_TASK_SOURCE } from '@/graphql/tasks';
import { GET_LEAD } from '@/graphql/leads';
import type { Task } from '@/types/lead';
import { TaskSource } from '@/types/lead';

interface AITaskSuggestionsProps {
  leadId: number | string; // GraphQL ID type returns string
  tasks?: Task[];
}

export function AITaskSuggestions({ leadId, tasks = [] }: AITaskSuggestionsProps) {
  // Convert leadId to number (GraphQL ID type returns strings)
  const leadIdInt = typeof leadId === 'string' ? parseInt(leadId) : leadId;

  // Filter tasks to show only AI-suggested ones that haven't been dismissed
  const suggestions = tasks.filter(task => task.source === TaskSource.AI_SUGGESTED);

  const [generateRecommendations, { loading: isGenerating }] = useMutation(
    GENERATE_TASK_RECOMMENDATIONS,
    {
      variables: { leadId: leadIdInt },
      onCompleted: (data) => {
        const count = data?.generateTaskRecommendations?.length || 0;
        toast.success(`Generated ${count} task recommendation${count !== 1 ? 's' : ''}`);
      },
      onError: (error) => {
        toast.error(`Error generating recommendations: ${error.message}`);
      },
      refetchQueries: [{ query: GET_LEAD, variables: { id: leadIdInt } }],
    }
  );

  const [updateTaskSource] = useMutation(UPDATE_TASK_SOURCE, {
    onError: (error) => {
      toast.error(`Error updating task: ${error.message}`);
    },
    refetchQueries: [{ query: GET_LEAD, variables: { id: leadIdInt } }],
  });

  const handleAccept = async (taskId: string, title: string) => {
    try {
      await updateTaskSource({
        variables: {
          taskId: parseInt(taskId),
          source: TaskSource.MANUAL,
        },
      });
      toast.success(`Added "${title}" to your tasks`);
    } catch {
      // Error already handled by mutation onError
    }
  };

  const handleDismiss = async (taskId: string, title: string) => {
    try {
      await updateTaskSource({
        variables: {
          taskId: parseInt(taskId),
          source: TaskSource.DISMISSED,
        },
      });
      toast.success(`Dismissed "${title}"`);
    } catch {
      // Error already handled by mutation onError
    }
  };

  const handleGenerate = async () => {
    try {
      await generateRecommendations();
    } catch {
      // Error already handled by mutation onError
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Task Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              No active AI suggestions yet. Generate personalized task recommendations based on this lead's history and status.
            </p>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get AI Recommendations
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.map((task) => (
              <div
                key={task.id}
                className="border rounded-lg p-4 space-y-3 bg-muted/30"
              >
                <div>
                  <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                  {task.description && (
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                </div>

                {task.aiReasoning && (
                  <div className="bg-background rounded p-2 border-l-2 border-primary">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">AI Reasoning:</span>{' '}
                      {task.aiReasoning}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(task.id, task.title)}
                    className="flex-1"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Add to My Tasks
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDismiss(task.id, task.title)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
              size="sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate More
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
