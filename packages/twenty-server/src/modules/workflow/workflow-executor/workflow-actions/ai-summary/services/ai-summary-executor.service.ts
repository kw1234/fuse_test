import { Injectable, Logger } from '@nestjs/common';

import OpenAI from 'openai';

import { type WorkflowAiSummaryActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/ai-summary/types/workflow-ai-summary-action-input.type';

interface OpenAIExecutorResult {
  summary: string;
  model: string;
  tokensUsed: number;
}

@Injectable()
export class AiSummaryExecutorService {
  private readonly logger = new Logger(AiSummaryExecutorService.name);
  private openai: OpenAI | null = null;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
      });
    }
  }

  async execute(
    input: WorkflowAiSummaryActionInput,
  ): Promise<OpenAIExecutorResult> {
    if (!this.openai) {
      throw new Error(
        'OpenAI API key is not configured. Please set OPENAI_API_KEY environment variable.',
      );
    }

    const {
      prompt,
      model = 'gpt-3.5-turbo',
      maxTokens = 500,
      temperature = 0.7,
    } = input;

    if (!prompt?.trim()) {
      throw new Error('Prompt is required for AI Summary action');
    }

    try {
      this.logger.log(`Executing AI Summary with model: ${model}`);

      const completion = await this.openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: maxTokens,
        temperature,
      });

      const summary = completion.choices[0]?.message?.content || '';
      const tokensUsed = completion.usage?.total_tokens || 0;

      this.logger.log(
        `AI Summary completed successfully. Tokens used: ${tokensUsed}`,
      );

      return {
        summary,
        model,
        tokensUsed,
      };
    } catch (error) {
      this.logger.error(`Failed to execute AI Summary: ${error.message}`);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
}
