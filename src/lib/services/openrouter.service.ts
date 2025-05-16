import { z } from "zod";
import type { ModelOptions, RequestPayload, ResponseType } from "./openrouter.types";
import { logger } from "../../utils/logger";

const ConfigSchema = z.object({
  apiKey: z.string().min(1),
  apiEndpoint: z.string().url(),
  defaultModel: z.string().default("openrouter-gpt"),
  defaultSystemMessage: z.string().default("You are a helpful assistant"),
  maxRetries: z.number().default(3),
});

type ConfigType = z.infer<typeof ConfigSchema>;

class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

// Service class
export class OpenRouterService {
  private _apiKey: string;
  private _apiEndpoint: string;
  private readonly _internalLogger: Console;
  private readonly _maxRetries: number;

  public systemMessage: string;
  public modelName: string;
  public modelParameters: ModelOptions;

  constructor() {
    this._internalLogger = console;
    this.modelParameters = {
      temperature: 0.7,
      max_tokens: 200,
      top_p: 0.9,
    };
    this.systemMessage = "";
    this.modelName = "";
    this._apiKey = "";
    this._apiEndpoint = "";
    this._maxRetries = 3;
  }

  public async initialize(config: ConfigType): Promise<void> {
    try {
      const validatedConfig = ConfigSchema.parse(config);
      this._apiKey = validatedConfig.apiKey;
      this._apiEndpoint = validatedConfig.apiEndpoint;
      this.modelName = validatedConfig.defaultModel;
      this.systemMessage = validatedConfig.defaultSystemMessage;
    } catch (error) {
      this._handleError("Invalid configuration provided");
      throw error;
    }
  }

  public async sendChatPrompt(
    systemMessage: string,
    userMessage: string,
    options?: ModelOptions
  ): Promise<ResponseType> {
    try {
      const payload = this._buildRequestPayload(systemMessage, userMessage, options);
      const response = await this._sendRequestWithRetry(payload);
      return this._parseResponse(response);
    } catch (error) {
      this._handleError("Failed to send chat prompt");
      throw error;
    }
  }

  private _buildRequestPayload(systemMessage: string, userMessage: string, options?: ModelOptions): RequestPayload {
    return {
      messages: [
        {
          role: "system",
          content: systemMessage || this.systemMessage,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      model: this.modelName,
      ...options,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ChatResponse",
          strict: true,
          schema: {
            message: "string",
            usage: { total_tokens: "number" },
          },
        },
      },
    };
  }

  private async _sendRequestWithRetry(payload: RequestPayload, attempt = 1): Promise<Response> {
    try {
      const response = await this._sendRequest(payload);
      return response;
    } catch (error) {
      if (attempt >= this._maxRetries || !this._isRetryableError(error)) {
        throw error;
      }

      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise((resolve) => setTimeout(resolve, delay));

      return this._sendRequestWithRetry(payload, attempt + 1);
    }
  }

  private _isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.includes("network") || error.message.includes("500") || error.message.includes("503");
    }
    return false;
  }

  private async _sendRequest(payload: RequestPayload): Promise<Response> {
    logger.info("Sending request to OpenRouter API:", this._apiEndpoint);
    logger.info("Payload:", payload);
    const response = await fetch(this._apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this._apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    logger.info("TEST", response);
    if (!response.ok) {
      throw new OpenRouterError(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  private async _parseResponse(response: Response): Promise<ResponseType> {
    try {
      const data = await response.json();
      logger.info("Raw OpenRouter API Response:", data);
      return {
        message: data.choices[0].message.content,
        usage: {
          total_tokens: data.usage.total_tokens,
        },
      };
    } catch {
      throw new OpenRouterError("Failed to parse API response");
    }
  }

  private _handleError(message: string): void {
    this._internalLogger.error("[OpenRouterService Error]:", message);
  }
}
