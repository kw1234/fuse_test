import { Injectable, Logger } from '@nestjs/common';

import OpenAI from 'openai';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
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

  constructor(private readonly twentyConfigService: TwentyConfigService) {
    console.log('AiSummaryExecutorService constructor called');
    this.logger.log('AiSummaryExecutorService constructor called');

    const apiKey = this.twentyConfigService.get('OPENAI_API_KEY');

    console.log(
      `OpenAI API key ${apiKey ? 'found' : 'not found'} in configuration`,
    );
    this.logger.log(
      `OpenAI API key ${apiKey ? 'found' : 'not found'} in configuration`,
    );

    if (apiKey) {
      this.openai = new OpenAI({
        apiKey,
      });
      console.log('OpenAI client initialized successfully');
      this.logger.log('OpenAI client initialized successfully');
    } else {
      console.error('OpenAI API key not found - AI Summary will not work');
      this.logger.error('OpenAI API key not found - AI Summary will not work');
    }
  }

  async execute(
    input: WorkflowAiSummaryActionInput,
  ): Promise<OpenAIExecutorResult> {
    console.log(
      'AiSummaryExecutorService.execute() called with input:',
      JSON.stringify(input),
    );
    this.logger.log('AiSummaryExecutorService.execute() called');

    if (!this.openai) {
      const error =
        'OpenAI API key is not configured. Please configure OPENAI_API_KEY.';

      console.error('AI Summary execution failed:', error);
      this.logger.error('AI Summary execution failed:', error);
      throw new Error(error);
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
      console.log(`Executing AI Summary with model: ${model}`);
      this.logger.log(`Executing AI Summary with model: ${model}`);

      const completion = await this.openai.chat.completions.create({
        model: model || 'gpt-3.5-turbo',
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

      console.log(
        `AI Summary completed successfully. Tokens used: ${tokensUsed}`,
      );
      this.logger.log(
        `AI Summary completed successfully. Tokens used: ${tokensUsed}`,
      );

      return {
        summary,
        model,
        tokensUsed,
      };
    } catch (error) {
      console.error(`Failed to execute AI Summary: ${error.message}`);
      this.logger.error(`Failed to execute AI Summary: ${error.message}`);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
}
