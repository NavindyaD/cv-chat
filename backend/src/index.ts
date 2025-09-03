#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { CVChatHandler } from './handlers/cv-chat.js';
import { EmailHandler } from './handlers/email.js';
import { Config } from './config.js';

class CVChatMCPServer {
  private server: Server;
  private cvHandler: CVChatHandler;
  private emailHandler: EmailHandler;

  constructor() {
    this.server = new Server(
      {
        name: 'cv-chat-mcp-server',
        version: '1.0.0',
      }
    );

    this.cvHandler = new CVChatHandler();
    this.emailHandler = new EmailHandler();
    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'ask_cv_question',
            description: 'Ask questions about your CV/resume content',
            inputSchema: {
              type: 'object',
              properties: {
                question: {
                  type: 'string',
                  description: 'The question to ask about your CV',
                },
              },
              required: ['question'],
            },
          },
          {
            name: 'send_email',
            description: 'Send an email notification',
            inputSchema: {
              type: 'object',
              properties: {
                recipient: {
                  type: 'string',
                  description: 'Email address of the recipient',
                },
                subject: {
                  type: 'string',
                  description: 'Email subject line',
                },
                body: {
                  type: 'string',
                  description: 'Email body content',
                },
              },
              required: ['recipient', 'subject', 'body'],
            },
          },
          {
            name: 'load_cv',
            description: 'Load and parse a CV/resume file',
            inputSchema: {
              type: 'object',
              properties: {
                filePath: {
                  type: 'string',
                  description: 'Path to the CV/resume file (PDF, DOCX, or TXT)',
                },
              },
              required: ['filePath'],
            },
          },
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!args) {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: No arguments provided',
            },
          ],
        };
      }

      try {
        switch (name) {
          case 'ask_cv_question':
            return await this.cvHandler.askQuestion(args.question as string);
          
          case 'send_email':
            return await this.emailHandler.sendEmail(
              args.recipient as string,
              args.subject as string,
              args.body as string
            );
          
          case 'load_cv':
            return await this.cvHandler.loadCV(args.filePath as string);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('CV Chat MCP Server running on stdio');
  }
}

// Start the server
const server = new CVChatMCPServer();
server.run().catch(console.error);
