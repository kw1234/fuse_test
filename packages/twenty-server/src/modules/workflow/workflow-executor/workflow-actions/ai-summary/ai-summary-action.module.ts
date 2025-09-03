import { Module } from '@nestjs/common';

import { AiSummaryExecutorService } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-summary/services/ai-summary-executor.service';
import { AiSummaryWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-summary/ai-summary.workflow-action';

@Module({
  providers: [AiSummaryExecutorService, AiSummaryWorkflowAction],
  exports: [AiSummaryWorkflowAction],
})
export class AiSummaryActionModule {}
