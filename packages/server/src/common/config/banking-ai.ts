import { registerAs } from '@nestjs/config';

export default registerAs('bankingAi', () => ({
  enabled: process.env.BANKING_AI_ENABLED === 'true',
  ollamaUrl: process.env.OLLAMA_BASE_URL ?? 'http://ollama:11434',
  model: process.env.BANKING_AI_MODEL ?? 'qwen2.5:3b-instruct',
  timeoutMs: Number(process.env.BANKING_AI_TIMEOUT_MS ?? 2000),
  priorMinFreq: Number(process.env.BANKING_AI_PRIOR_MIN_FREQ ?? 3),
  priorMinShare: Number(process.env.BANKING_AI_PRIOR_MIN_SHARE ?? 0.7),
  candidatesCap: Number(process.env.BANKING_AI_CANDIDATES_CAP ?? 60),
}));
