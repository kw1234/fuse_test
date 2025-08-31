import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';
import { type WorkflowAiSummaryActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-summary/types/workflow-ai-summary-action-input.type';

export type WorkflowAiSummaryActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowAiSummaryActionInput;
};
