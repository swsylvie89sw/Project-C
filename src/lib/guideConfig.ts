/**
 * Guided-panel starting assumptions, kept in one place so they can be calibrated
 * against real samples. Every factor here is editable in the panel.
 */

export type ContentLang = 'en' | 'zh-TW'

/** Longest text sent to the tokenizer, per field. */
export const MAX_TOKENIZER_CHARS = 200_000

/** Output length is entered in words for English and characters for Traditional Chinese. */
export const LENGTH_UNIT: Record<ContentLang, 'words' | 'chars'> = { en: 'words', 'zh-TW': 'chars' }

/** Starting tokens per English word / per Traditional Chinese character. */
export const DEFAULT_TOKENS_PER_UNIT: Record<ContentLang, number> = { en: 1.33, 'zh-TW': 1.0 }

export type ContextPreset = 'none' | 'small' | 'medium' | 'large' | 'custom'
export const CONTEXT_PRESETS: Record<Exclude<ContextPreset, 'custom'>, number> = {
  none: 0,
  small: 500,
  medium: 2000,
  large: 8000,
}

export type TaskType = 'shortAnswer' | 'chat' | 'summary' | 'longForm'
export const TASK_TYPES: TaskType[] = ['shortAnswer', 'chat', 'summary', 'longForm']

/** Typical response length per task type, in words (en) or characters (zh-TW). */
export const TASK_LENGTH: Record<ContentLang, Record<TaskType, number>> = {
  en: { shortAnswer: 50, chat: 150, summary: 250, longForm: 1000 },
  'zh-TW': { shortAnswer: 100, chat: 300, summary: 500, longForm: 2000 },
}

export const DEFAULT_DAYS_PER_MONTH = 22

/** Example request content, in the content language (not interface text). */
export const EXAMPLES: Record<ContentLang, { systemPrompt: string; userInput: string }> = {
  en: {
    systemPrompt:
      'You are a helpful customer support assistant for an online store. Answer politely and concisely. ' +
      'If you do not know the answer, say so and offer to connect the customer with a human agent. ' +
      'Never share personal data.',
    userInput:
      "Hi, I ordered a pair of running shoes last week and they still haven't arrived. Can you check where my order is?",
  },
  'zh-TW': {
    systemPrompt:
      '你是一家網路商店的客服助理。請以禮貌、簡潔的方式回答。' +
      '如果不知道答案，請直接說明，並提供轉接真人客服的選項。不得透露任何個人資料。',
    userInput: '你好，我上週訂了一雙慢跑鞋，到現在還沒收到，可以幫我查一下訂單進度嗎？',
  },
}
