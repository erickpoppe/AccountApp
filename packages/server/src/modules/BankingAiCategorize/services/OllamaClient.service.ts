import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OllamaClientService implements OnModuleInit {
  private readonly logger = new Logger(OllamaClientService.name);

  // Simple in-memory circuit breaker: tracks consecutive failures + cooldown
  private failureCount = 0;
  private coolingUntil = 0;
  private readonly FAILURE_THRESHOLD = 3;
  private readonly COOLDOWN_MS = 60_000;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    if (!this.config.get<boolean>('bankingAi.enabled')) return;
    // Fire-and-forget warmup — failures here don't count toward the circuit breaker
    this.warmup();
  }

  private async warmup() {
    try {
      await axios.post(
        `${this.baseUrl}/api/generate`,
        { model: this.model, prompt: 'warmup', stream: false },
        { timeout: 60_000 },
      );
    } catch {
      // Ollama not ready yet — real requests will retry independently
    }
  }

  get baseUrl(): string {
    return this.config.get<string>('bankingAi.ollamaUrl') ?? 'http://ollama:11434';
  }

  get model(): string {
    return this.config.get<string>('bankingAi.model') ?? 'qwen2.5:3b-instruct';
  }

  get timeoutMs(): number {
    return this.config.get<number>('bankingAi.timeoutMs') ?? 2000;
  }

  isAvailable(): boolean {
    return Date.now() < this.coolingUntil === false;
  }

  async generate(prompt: string): Promise<string | null> {
    if (Date.now() < this.coolingUntil) return null;

    try {
      const response = await axios.post(
        `${this.baseUrl}/api/generate`,
        { model: this.model, prompt, format: 'json', stream: false },
        { timeout: this.timeoutMs },
      );
      this.failureCount = 0;
      return response.data?.response ?? null;
    } catch (err) {
      this.failureCount += 1;
      if (this.failureCount >= this.FAILURE_THRESHOLD) {
        this.coolingUntil = Date.now() + this.COOLDOWN_MS;
        this.logger.warn(`Ollama unreachable — cooling down for ${this.COOLDOWN_MS / 1000}s`);
      }
      return null;
    }
  }
}
