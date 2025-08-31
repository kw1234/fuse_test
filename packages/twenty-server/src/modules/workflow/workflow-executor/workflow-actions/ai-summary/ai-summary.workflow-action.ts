import { Injectable } from '@nestjs/common';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { isWorkflowAiSummaryAction } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-summary/guards/is-workflow-ai-summary-action.guard';
import { AiSummaryExecutorService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-summary/services/ai-summary-executor.service';

@Injectable()
export class AiSummaryWorkflowAction implements WorkflowAction {
  constructor(
    private readonly aiSummaryExecutorService: AiSummaryExecutorService,
  ) {}

  async execute({
    currentStepId,
    steps,
    context: _context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = steps.find((step) => step.id === currentStepId);

    if (!step) {
      throw new Error('Step not found');
    }

    if (!isWorkflowAiSummaryAction(step)) {
      throw new Error('Invalid action type for AI Summary workflow action');
    }

    const result = await this.aiSummaryExecutorService.execute(
      step.settings.input,
    );

    return { result };
  }
}
