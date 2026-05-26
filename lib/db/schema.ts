import { pgTable, uuid, text, integer, timestamp, boolean, vector, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  vkId: text('vk_id').unique(),
  telegramId: text('telegram_id').unique(),
  phone: text('phone').unique(),
  email: text('email'),
  name: text('name'),
  avatar: text('avatar'),
  role: text('role').default('user').notNull(), // user, premium_user, admin, lawyer
  dailyFreeQueries: integer('daily_free_queries').default(0),
  lastQueryDate: timestamp('last_query_date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const legalQueries = pgTable('legal_queries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  category: text('category'), // civil, criminal, family, labor, arbitration, administrative
  question: text('question').notNull(),
  aiResponse: text('ai_response'),
  modelUsed: text('model_used'), // deepseek-chat or deepseek-coder
  tokensUsed: integer('tokens_used'),
  isPremium: boolean('is_premium').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const courtCases = pgTable('court_cases', {
  id: uuid('id').primaryKey().defaultRandom(),
  caseNumber: text('case_number').unique(),
  court: text('court'),
  decisionDate: timestamp('decision_date'),
  category: text('category'),
  region: text('region').default('RF'), // RF, KZ, BY, etc.
  fullText: text('full_text'),
  summary: text('summary'),
  embedding: vector('embedding', { dimensions: 1536 }),
  sourceUrl: text('source_url'),
  lastUpdated: timestamp('last_updated').defaultNow(),
}, (table) => ({
  embeddingIndex: index('idx_court_cases_embedding').using('ivfflat', table.embedding.op('vector_cosine_ops')),
}));

export const aiPrompts = pgTable('ai_prompts', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').unique(),
  systemPrompt: text('system_prompt').notNull(),
  category: text('category'),
  modelHint: text('model_hint'), // chat or coder
  isActive: boolean('is_active').default(true),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const lawyerConsultations = pgTable('lawyer_consultations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  queryId: uuid('query_id').references(() => legalQueries.id),
  status: text('status').default('pending'), // pending, assigned, completed
  lawyerId: uuid('lawyer_id').references(() => users.id),
  scheduledAt: timestamp('scheduled_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usageLogs = pgTable('usage_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  endpoint: text('endpoint'),
  ipHash: text('ip_hash'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  queries: many(legalQueries),
  consultations: many(lawyerConsultations),
}));

export const legalQueriesRelations = relations(legalQueries, ({ one }) => ({
  user: one(users, { fields: [legalQueries.userId], references: [users.id] }),
}));