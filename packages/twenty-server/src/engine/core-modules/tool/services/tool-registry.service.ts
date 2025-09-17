import { Injectable } from '@nestjs/common';

import { ToolType } from 'src/engine/core-modules/tool/enums/tool-type.enum';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/send-email-tool/send-email-tool';
import { type SendEmailInput } from 'src/engine/core-modules/tool/tools/send-email-tool/types/send-email-input.type';
import { WebSearchTool } from 'src/engine/core-modules/tool/tools/web-search-tool/web-search-tool';
import { type WebSearchInput } from 'src/engine/core-modules/tool/tools/web-search-tool/types/web-search-input.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';

@Injectable()
export class ToolRegistryService {
  private readonly toolFactories: Map<ToolType, () => Tool>;

  constructor(
    private readonly sendEmailTool: SendEmailTool,
    private readonly webSearchTool: WebSearchTool,
  ) {
    this.toolFactories = new Map<ToolType, () => Tool>([
      [ToolType.HTTP_REQUEST, () => new HttpTool()],
      [
        ToolType.SEND_EMAIL,
        () => ({
          description: this.sendEmailTool.description,
          parameters: this.sendEmailTool.parameters,
          execute: (params) =>
            this.sendEmailTool.execute(params as SendEmailInput),
          flag: PermissionFlagType.SEND_EMAIL_TOOL,
        }),
      ],
      [
        ToolType.WEB_SEARCH,
        () => ({
          description: this.webSearchTool.description,
          parameters: this.webSearchTool.parameters,
          execute: (params) =>
            this.webSearchTool.execute(params as WebSearchInput),
        }),
      ],
      //TODO: Implement this
      // [
      //   ToolType.CONTEXT_RETRIEVAL,
      //   () => ({
      //     // Register new tool
      //     description: this.contextRetrievalTool.description,
      //     parameters: this.contextRetrievalTool.parameters,
      //     execute: (params) => this.contextRetrievalTool.execute(params),
      //     flag: PermissionFlagType.DATA_ACCESS,
      //   }),
      // ],
      // [
      //   ToolType.INTERNAL_API,
      //   () => ({
      //     // Register new tool
      //     description: this.internalApiTool.description,
      //     parameters: this.internalApiTool.parameters,
      //     execute: (params) => this.internalApiTool.execute(params),
      //     flag: PermissionFlagType.INTERNAL_API_ACCESS,
      //   }),
      // ],
    ]);
  }

  getTool(toolType: ToolType): Tool {
    const factory = this.toolFactories.get(toolType);

    if (!factory) {
      throw new Error(`Unknown tool type: ${toolType}`);
    }

    return factory();
  }

  getAllToolTypes(): ToolType[] {
    return Array.from(this.toolFactories.keys());
  }
}
