import { Injectable } from '@nestjs/common';

import { WebSearchInput } from 'src/engine/core-modules/tool/tools/web-search-tool/types/web-search-input.type';
import { WebSearchParametersZodSchema } from 'src/engine/core-modules/tool/tools/web-search-tool/web-search-tool.schema';
import { WebSearchService } from 'src/engine/core-modules/tool/tools/web-search-tool/web-search.service';
import { ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { Tool } from 'src/engine/core-modules/tool/types/tool.type';

@Injectable()
export class WebSearchTool implements Tool {
  description = 'Search the web for information';
  parameters = WebSearchParametersZodSchema;

  constructor(private readonly webSearchService: WebSearchService) {}

  async execute(parameters: ToolInput): Promise<ToolOutput> {
    const { query, maxResults } = parameters as WebSearchInput;

    try {
      // Search the web for information
      const searchResults = await this.webSearchService.search(
        query,
        maxResults,
      );

      // Build comprehensive context
      const context = {
        query,
        results: searchResults.results,
        totalResults: searchResults.totalResults,
        timestamp: new Date().toISOString(),
      };

      return { result: context };
    } catch (error) {
      return { error: error.message };
    }
  }
}
