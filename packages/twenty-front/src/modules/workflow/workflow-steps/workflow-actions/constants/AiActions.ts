import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const AI_ACTIONS: Array<{
  label: string;
  type: Extract<WorkflowActionType, 'AI_AGENT' | 'AI_SUMMARY'>;
  icon: string;
}> = [
  {
    label: 'AI Agent',
    type: 'AI_AGENT',
    icon: 'IconBrain',
  },
  {
    label: 'AI Summary',
    type: 'AI_SUMMARY',
    icon: 'IconSparkles',
  },
];
