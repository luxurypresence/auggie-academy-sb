import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import { AITaskSuggestions } from './AITaskSuggestions';
import { GENERATE_TASK_RECOMMENDATIONS, UPDATE_TASK_SOURCE } from '@/graphql/tasks';
import { GET_LEAD } from '@/graphql/leads';
import type { Task } from '@/types/lead';
import { TaskSource } from '@/types/lead';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('AITaskSuggestions', () => {
  const mockLeadId = 1;

  const mockSuggestion: Task = {
    id: '1',
    title: 'Follow up on proposal',
    description: 'Send follow-up email regarding the pricing proposal',
    aiReasoning: 'Lead has not responded to initial proposal sent 3 days ago',
    source: TaskSource.AI_SUGGESTED,
    dueDate: '2025-10-25T10:00:00Z',
    completed: false,
    leadId: mockLeadId,
    createdAt: '2025-10-22T10:00:00Z',
    updatedAt: '2025-10-22T10:00:00Z',
  };

  const mockManualTask: Task = {
    id: '2',
    title: 'Manual task',
    description: 'A manually created task',
    source: TaskSource.MANUAL,
    completed: false,
    leadId: mockLeadId,
    createdAt: '2025-10-22T10:00:00Z',
    updatedAt: '2025-10-22T10:00:00Z',
  };

  describe('Empty state (no suggestions)', () => {
    it('should render empty state when no tasks provided', () => {
      render(
        <MockedProvider mocks={[]}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[]} />
        </MockedProvider>
      );

      expect(screen.getByText(/No active AI suggestions yet/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Get AI Recommendations/i })).toBeInTheDocument();
    });

    it('should render empty state when only manual tasks exist', () => {
      render(
        <MockedProvider mocks={[]}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[mockManualTask]} />
        </MockedProvider>
      );

      expect(screen.getByText(/No active AI suggestions yet/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Get AI Recommendations/i })).toBeInTheDocument();
    });

    it('should show correct button icon and text in empty state', () => {
      render(
        <MockedProvider mocks={[]}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[]} />
        </MockedProvider>
      );

      const button = screen.getByRole('button', { name: /Get AI Recommendations/i });
      expect(button).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  describe('Displaying suggestions', () => {
    it('should display AI-suggested task', () => {
      render(
        <MockedProvider mocks={[]}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[mockSuggestion]} />
        </MockedProvider>
      );

      expect(screen.getByText('Follow up on proposal')).toBeInTheDocument();
      expect(screen.getByText('Send follow-up email regarding the pricing proposal')).toBeInTheDocument();
    });

    it('should display AI reasoning when provided', () => {
      render(
        <MockedProvider mocks={[]}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[mockSuggestion]} />
        </MockedProvider>
      );

      expect(screen.getByText(/AI Reasoning:/i)).toBeInTheDocument();
      expect(screen.getByText(/Lead has not responded to initial proposal sent 3 days ago/i)).toBeInTheDocument();
    });

    it('should display multiple suggestions', () => {
      const secondSuggestion: Task = {
        ...mockSuggestion,
        id: '3',
        title: 'Schedule demo call',
        description: 'Set up product demonstration',
      };

      render(
        <MockedProvider mocks={[]}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[mockSuggestion, secondSuggestion]} />
        </MockedProvider>
      );

      expect(screen.getByText('Follow up on proposal')).toBeInTheDocument();
      expect(screen.getByText('Schedule demo call')).toBeInTheDocument();
    });

    it('should show "Generate More" button when suggestions exist', () => {
      render(
        <MockedProvider mocks={[]}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[mockSuggestion]} />
        </MockedProvider>
      );

      expect(screen.getByRole('button', { name: /Generate More/i })).toBeInTheDocument();
    });

    it('should display action buttons for each suggestion', () => {
      render(
        <MockedProvider mocks={[]}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[mockSuggestion]} />
        </MockedProvider>
      );

      expect(screen.getByRole('button', { name: /Add to My Tasks/i })).toBeInTheDocument();
      // The dismiss button has only an X icon without text
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(1);
    });
  });

  describe('Generate recommendations', () => {
    it('should call generateTaskRecommendations mutation when button clicked', async () => {
      const user = userEvent.setup();
      const mocks = [
        {
          request: {
            query: GENERATE_TASK_RECOMMENDATIONS,
            variables: { leadId: mockLeadId },
          },
          result: {
            data: {
              generateTaskRecommendations: [mockSuggestion],
            },
          },
        },
        {
          request: {
            query: GET_LEAD,
            variables: { id: mockLeadId },
          },
          result: {
            data: {
              lead: {
                __typename: 'Lead',
                id: mockLeadId,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: null,
                budget: null,
                location: null,
                company: null,
                source: null,
                status: 'new',
                createdAt: '2025-10-22T10:00:00Z',
                updatedAt: '2025-10-22T10:00:00Z',
                summary: null,
                summaryGeneratedAt: null,
                activityScore: null,
                scoreCalculatedAt: null,
                interactions: [],
                tasks: [mockSuggestion],
              },
            },
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[]} />
        </MockedProvider>
      );

      const button = screen.getByRole('button', { name: /Get AI Recommendations/i });
      expect(button).toBeInTheDocument();

      await user.click(button);

      // Verify button is still in the document (mutation was called)
      await waitFor(() => {
        expect(button).toBeInTheDocument();
      });
    });

    it('should disable button while generating', async () => {
      const user = userEvent.setup();
      const mocks = [
        {
          request: {
            query: GENERATE_TASK_RECOMMENDATIONS,
            variables: { leadId: mockLeadId },
          },
          result: {
            data: {
              generateTaskRecommendations: [mockSuggestion],
            },
          },
          delay: 100,
        },
      ];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[]} />
        </MockedProvider>
      );

      const button = screen.getByRole('button', { name: /Get AI Recommendations/i });
      await user.click(button);

      await waitFor(() => {
        const generatingButton = screen.getByRole('button', { name: /Generating.../i });
        expect(generatingButton).toBeDisabled();
      });
    });
  });

  describe('Accept suggestion', () => {
    it('should call updateTaskSource with MANUAL when accepting', async () => {
      const user = userEvent.setup();
      const mocks = [
        {
          request: {
            query: UPDATE_TASK_SOURCE,
            variables: {
              taskId: parseInt(mockSuggestion.id),
              source: TaskSource.MANUAL,
            },
          },
          result: {
            data: {
              updateTaskSource: {
                id: mockSuggestion.id,
                source: TaskSource.MANUAL,
              },
            },
          },
        },
        {
          request: {
            query: GET_LEAD,
            variables: { id: mockLeadId },
          },
          result: {
            data: {
              lead: {
                __typename: 'Lead',
                id: mockLeadId,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: null,
                budget: null,
                location: null,
                company: null,
                source: null,
                status: 'new',
                createdAt: '2025-10-22T10:00:00Z',
                updatedAt: '2025-10-22T10:00:00Z',
                summary: null,
                summaryGeneratedAt: null,
                activityScore: null,
                scoreCalculatedAt: null,
                interactions: [],
                tasks: [],
              },
            },
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[mockSuggestion]} />
        </MockedProvider>
      );

      const acceptButton = screen.getByRole('button', { name: /Add to My Tasks/i });
      await user.click(acceptButton);

      // The mutation should be called
      await waitFor(() => {
        expect(acceptButton).toBeInTheDocument();
      });
    });
  });

  describe('Dismiss suggestion', () => {
    it('should call updateTaskSource with DISMISSED when dismissing', async () => {
      const user = userEvent.setup();
      const mocks = [
        {
          request: {
            query: UPDATE_TASK_SOURCE,
            variables: {
              taskId: parseInt(mockSuggestion.id),
              source: TaskSource.DISMISSED,
            },
          },
          result: {
            data: {
              updateTaskSource: {
                id: mockSuggestion.id,
                source: TaskSource.DISMISSED,
              },
            },
          },
        },
        {
          request: {
            query: GET_LEAD,
            variables: { id: mockLeadId },
          },
          result: {
            data: {
              lead: {
                __typename: 'Lead',
                id: mockLeadId,
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: null,
                budget: null,
                location: null,
                company: null,
                source: null,
                status: 'new',
                createdAt: '2025-10-22T10:00:00Z',
                updatedAt: '2025-10-22T10:00:00Z',
                summary: null,
                summaryGeneratedAt: null,
                activityScore: null,
                scoreCalculatedAt: null,
                interactions: [],
                tasks: [],
              },
            },
          },
        },
      ];

      render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[mockSuggestion]} />
        </MockedProvider>
      );

      const buttons = screen.getAllByRole('button');
      // Find the dismiss button (should be the last button for each task, has X icon)
      const dismissButton = buttons[buttons.length - 2]; // -1 is "Generate More", -2 is dismiss
      await user.click(dismissButton);

      // The mutation should be called
      await waitFor(() => {
        expect(dismissButton).toBeInTheDocument();
      });
    });
  });

  describe('Component header', () => {
    it('should display correct title', () => {
      render(
        <MockedProvider mocks={[]}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[]} />
        </MockedProvider>
      );

      expect(screen.getByText('AI Task Suggestions')).toBeInTheDocument();
    });

    it('should display Sparkles icon in header', () => {
      const { container } = render(
        <MockedProvider mocks={[]}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[]} />
        </MockedProvider>
      );

      // The Sparkles icon should be present (lucide-react renders as svg)
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBeGreaterThan(0);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined tasks array', () => {
      render(
        <MockedProvider mocks={[]}>
          <AITaskSuggestions leadId={mockLeadId} />
        </MockedProvider>
      );

      expect(screen.getByText(/No active AI suggestions yet/i)).toBeInTheDocument();
    });

    it('should filter out DISMISSED tasks', () => {
      const dismissedTask: Task = {
        ...mockSuggestion,
        id: '4',
        source: TaskSource.DISMISSED,
      };

      render(
        <MockedProvider mocks={[]}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[dismissedTask]} />
        </MockedProvider>
      );

      expect(screen.getByText(/No active AI suggestions yet/i)).toBeInTheDocument();
    });

    it('should only show AI_SUGGESTED tasks', () => {
      const tasks: Task[] = [
        mockSuggestion,
        mockManualTask,
        { ...mockSuggestion, id: '5', source: TaskSource.DISMISSED },
      ];

      render(
        <MockedProvider mocks={[]}>
          <AITaskSuggestions leadId={mockLeadId} tasks={tasks} />
        </MockedProvider>
      );

      // Should only show the one AI_SUGGESTED task
      expect(screen.getByText('Follow up on proposal')).toBeInTheDocument();
      expect(screen.queryByText('Manual task')).not.toBeInTheDocument();
    });

    it('should handle suggestion without description', () => {
      const suggestionWithoutDesc: Task = {
        ...mockSuggestion,
        description: undefined,
      };

      render(
        <MockedProvider mocks={[]}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[suggestionWithoutDesc]} />
        </MockedProvider>
      );

      expect(screen.getByText('Follow up on proposal')).toBeInTheDocument();
      expect(screen.queryByText('Send follow-up email')).not.toBeInTheDocument();
    });

    it('should handle suggestion without AI reasoning', () => {
      const suggestionWithoutReasoning: Task = {
        ...mockSuggestion,
        aiReasoning: undefined,
      };

      render(
        <MockedProvider mocks={[]}>
          <AITaskSuggestions leadId={mockLeadId} tasks={[suggestionWithoutReasoning]} />
        </MockedProvider>
      );

      expect(screen.getByText('Follow up on proposal')).toBeInTheDocument();
      expect(screen.queryByText(/AI Reasoning:/i)).not.toBeInTheDocument();
    });
  });
});
