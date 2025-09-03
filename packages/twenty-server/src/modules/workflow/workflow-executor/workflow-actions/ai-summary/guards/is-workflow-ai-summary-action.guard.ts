import {
  type WorkflowAction,
  type WorkflowAiSummaryAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const isWorkflowAiSummaryAction = (
  action: WorkflowAction,
): action is WorkflowAiSummaryAction => {
  return action.type === WorkflowActionType.AI_SUMMARY;
};
