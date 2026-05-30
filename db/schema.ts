import {
  pgTable,
  text,
  uuid,
  integer,
  boolean,
  timestamp,
} from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('spark_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  clerkId: text('clerk_id').unique(),
  email: text('email').notNull().unique(),
  name: text('name'),
  avatar: text('avatar'),
  plan: text('plan').default('free'), // "free" | "pro"
  aiActionsToday: integer('ai_actions_today').default(0),
  aiActionsResetAt: timestamp('ai_actions_reset_at').defaultNow(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Calendar tasks
export const calendarTasks = pgTable('spark_calendar_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  scheduledAt: timestamp('scheduled_at'),
  isDraft: boolean('is_draft').default(false),
  taskType: text('task_type').default('task'), // task | reminder | meeting | event
  category: text('category'),
  color: text('color').default('#7c3aed'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Kanban boards
export const kanbanBoards = pgTable('spark_kanban_boards', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').default('#7c3aed'),
  liveblocksRoomId: text('liveblocks_room_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Kanban columns
export const kanbanColumns = pgTable('spark_kanban_columns', {
  id: uuid('id').defaultRandom().primaryKey(),
  boardId: uuid('board_id')
    .notNull()
    .references(() => kanbanBoards.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  order: integer('order').default(0),
  color: text('color'),
});

// Kanban tasks
export const kanbanTasks = pgTable('spark_kanban_tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  columnId: uuid('column_id')
    .notNull()
    .references(() => kanbanColumns.id, { onDelete: 'cascade' }),
  boardId: uuid('board_id')
    .notNull()
    .references(() => kanbanBoards.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  priority: text('priority').default('medium'), // low | medium | high | urgent
  label: text('label'),
  dueDate: timestamp('due_date'),
  syncToCalendar: boolean('sync_to_calendar').default(false),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Kanban collaborators
export const kanbanCollaborators = pgTable('spark_kanban_collaborators', {
  id: uuid('id').defaultRandom().primaryKey(),
  boardId: uuid('board_id')
    .notNull()
    .references(() => kanbanBoards.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  status: text('status').default('pending'), // pending | accepted
  addedAt: timestamp('added_at').defaultNow(),
});

// Notes
export const notes = pgTable('spark_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('Untitled'),
  content: text('content'), // JSON from Tiptap
  isPinned: boolean('is_pinned').default(false),
  isTrashed: boolean('is_trashed').default(false),
  color: text('color').default('#1c1c28'),
  icon: text('icon').default('📝'),
  category: text('category'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Whiteboards
export const whiteboards = pgTable('spark_whiteboards', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull().default('Untitled Board'),
  data: text('data'), // Excalidraw JSON
  thumbnail: text('thumbnail'),
  liveblocksRoomId: text('liveblocks_room_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Spaces
export const spaces = pgTable('spark_spaces', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  color: text('color').default('#7c3aed'),
  icon: text('icon').default('📁'),
  isArchived: boolean('is_archived').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Pages
export const pages = pgTable('spark_pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  spaceId: uuid('space_id')
    .notNull()
    .references(() => spaces.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull().default('Untitled Page'),
  content: text('content'),
  icon: text('icon').default('📄'),
  coverImage: text('cover_image'),
  isFavorite: boolean('is_favorite').default(false),
  template: text('template').default('blank'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Space members
export const spaceMembers = pgTable('spark_space_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  spaceId: uuid('space_id')
    .notNull()
    .references(() => spaces.id, { onDelete: 'cascade' }),
  email: text('email').notNull(),
  role: text('role').default('editor'), // viewer | editor | admin
  status: text('status').default('pending'),
  addedAt: timestamp('added_at').defaultNow(),
});

// AI-generated templates
export const aiTemplates = pgTable('spark_ai_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  prompt: text('prompt').notNull(),
  generatedSchema: text('generated_schema'), // JSON schema for mini-app
  generatedUi: text('generated_ui'), // JSON for UI rendering
  appState: text('app_state'), // runtime state JSON
  addedToSidebar: boolean('added_to_sidebar').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// AI chat history
export const aiChatHistory = pgTable('spark_ai_chat_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  role: text('role').notNull(), // user | assistant
  content: text('content').notNull(),
  actionType: text('action_type'), // create_task | create_note | etc
  actionData: text('action_data'), // JSON
  createdAt: timestamp('created_at').defaultNow(),
});

// Categories
export const categories = pgTable('spark_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  color: text('color').default('#7c3aed'),
  icon: text('icon'),
  scope: text('scope').notNull(), // calendar | kanban | notes | reminder
});

// Activity log
export const activityLog = pgTable('spark_activity_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),
  entityType: text('entity_type'), // task | note | board | page | whiteboard
  entityId: text('entity_id'),
  metadata: text('metadata'), // JSON
  createdAt: timestamp('created_at').defaultNow(),
});
