import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

import { firstValueFrom } from 'rxjs';

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

export interface WebSearchResponse {
  results: WebSearchResult[];
  totalResults: number;
}

interface BraveSearchResult {
  title?: string;
  url?: string;
  description?: string;
  published_date?: string;
}

@Injectable()
export class WebSearchService {
  private readonly logger = new Logger(WebSearchService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async search(
    query: string,
    maxResults: number = 10,
  ): Promise<WebSearchResponse> {
    const apiKey = this.configService.get<string>('BRAVE_SEARCH_API_KEY');

    if (!apiKey) {
      throw new Error('BRAVE_SEARCH_API_KEY not configured');
    }

    try {
      this.logger.log(
        `Searching for: "${query}" with maxResults: ${maxResults}`,
      );

      const response = await firstValueFrom(
        this.httpService.get('https://api.search.brave.com/res/v1/web/search', {
          params: {
            q: query,
            count: Math.min(maxResults, 20), // Brave API max is 20
            search_lang: 'en',
            ui_lang: 'en-US',
            safesearch: 'moderate',
          },
          headers: {
            'X-Subscription-Token': apiKey,
            Accept: 'application/json',
          },
        }),
      );

      const results = this.formatBraveResults(response.data);

      this.logger.log(`Found ${results.length} search results`);

      return {
        results,
        totalResults: response.data.web?.total_count || results.length,
      };
    } catch (error) {
      this.logger.error(`Web search failed: ${error.message}`);
      throw new Error(`Web search failed: ${error.message}`);
    }
  }

  private formatBraveResults(data: {
    web?: { results?: BraveSearchResult[] };
  }): WebSearchResult[] {
    if (!data.web?.results) {
      return [];
    }

    return data.web.results.map((result: BraveSearchResult) => ({
      title: result.title || 'No title',
      url: result.url || '',
      snippet: result.description || 'No description available',
      publishedDate: result.published_date || undefined,
    }));
  }
}
