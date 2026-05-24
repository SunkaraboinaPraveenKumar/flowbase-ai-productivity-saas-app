# FlowBase — Complete AI Productivity SaaS App: Master Build Prompt

---

## Project Overview

Build a **full-stack AI productivity SaaS application called FlowBase** using **Next.js 14+ (App Router)**, **Neon PostgreSQL + Drizzle ORM**, **Clerk authentication**, **AssemblyAI** (streaming speech-to-text + voice agent), **LiveBlocks** (real-time collaboration), **Google Gemini AI**, **Anthropic Claude API**, **Tiptap rich text editor**, and **Excalidraw** for the whiteboard. Deploy on **Vercel**.

FlowBase is an all-in-one productivity workspace that combines: an AI assistant, task/Kanban board, calendar with drag-and-drop scheduling, voice-powered notes, collaborative whiteboard, pages & spaces (like Notion), an AI template builder for mini-apps, and a smart dashboard — all inside a single, beautifully designed product.

The UI must be **world-class**: dark-mode first, glassmorphism accents, smooth Framer Motion animations, a professional sidebar, and consistent design tokens throughout. Every page must feel cohesive, polished, and production-ready — not like a tutorial project.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ App Router (TypeScript) |
| Styling | Tailwind CSS + shadcn/ui + custom CSS variables |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | Clerk (with Clerk Billing for subscription plans) |
| AI — Chat | Google Gemini 1.5 Pro (text generation, AI refine, template builder) |
| AI — Voice STT | AssemblyAI Universal Streaming Pro model (real-time speech-to-text) |
| AI — Voice Agent | AssemblyAI Voice Agent API (two-way conversation) |
| Real-time | LiveBlocks (Kanban collaboration, whiteboard, comments, threading) |
| Rich Text | Tiptap (notes + pages editor) |
| Whiteboard | Excalidraw SDK |
| Icons | Lucide React |
| Animations | Framer Motion |
| Deployment | Vercel |

---

## Design System & Theme

### Color Palette (CSS Variables)
```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #111118;
  --bg-card: #16161f;
  --bg-elevated: #1c1c28;
  --border: rgba(255,255,255,0.06);
  --border-accent: rgba(139,92,246,0.3);
  --text-primary: #f0f0f5;
  --text-secondary: #8b8b9a;
  --text-muted: #525261;
  --accent-primary: #7c3aed;      /* violet */
  --accent-secondary: #06b6d4;    /* cyan */
  --accent-green: #10b981;
  --accent-amber: #f59e0b;
  --accent-rose: #f43f5e;
  --glow: rgba(124,58,237,0.15);
  --radius: 12px;
  --radius-lg: 16px;
  --sidebar-width: 260px;
  --sidebar-collapsed: 68px;
}
```

### Typography
- **Display / Headings**: `Syne` (Google Fonts) — bold, geometric, futuristic
- **Body**: `DM Sans` — clean, readable, modern
- **Monospace**: `JetBrains Mono` — code blocks, timestamps

### Global UI Rules
- All cards: `background: var(--bg-card)`, `border: 1px solid var(--border)`, `border-radius: var(--radius)`, subtle `box-shadow: 0 4px 24px rgba(0,0,0,0.3)`
- Hover states: border transitions to `var(--border-accent)` with a faint violet glow
- All modals/dialogs: backdrop blur `backdrop-filter: blur(20px)`, semi-transparent background
- Buttons: primary uses `bg-violet-600 hover:bg-violet-500`, transitions with `transition-all duration-200`
- Sidebar items: `rounded-lg`, left border indicator on active state, icon + label with smooth collapse animation
- Loading states: skeleton shimmer effect matching card backgrounds
- Toast notifications: bottom-right, dark with colored left border by type (success=green, error=rose, info=cyan)

---

## Application Architecture

### Folder Structure
```
/app
  /(auth)
    /sign-in/[[...sign-in]]/page.tsx
    /sign-up/[[...sign-up]]/page.tsx
  /(dashboard)
    layout.tsx                    ← sidebar + topbar shell
    /dashboard/page.tsx
    /ai-assistant/page.tsx
    /calendar/page.tsx
    /kanban/page.tsx
    /notes/page.tsx
    /whiteboard/page.tsx
    /spaces/page.tsx
    /spaces/[spaceId]/page.tsx
    /spaces/[spaceId]/[pageId]/page.tsx
    /templates/page.tsx
    /settings/page.tsx
  /page.tsx                       ← Landing page
  /api
    /auth/sync/route.ts           ← Save user to DB on first sign-in
    /ai/chat/route.ts             ← AI assistant endpoint
    /ai/voice-agent/route.ts      ← AssemblyAI voice agent
    /ai/refine/route.ts           ← Gemini text refinement
    /ai/template/route.ts         ← Template generator
    /ai/whiteboard/route.ts       ← AI diagram generator
    /assembly/stream/route.ts     ← AssemblyAI streaming STT
    /liveblocks/auth/route.ts     ← LiveBlocks auth
    /calendar/route.ts
    /kanban/route.ts
    /notes/route.ts
    /whiteboard/route.ts
    /spaces/route.ts
    /pages/route.ts
    /templates/route.ts
/components
  /ui                             ← shadcn/ui components
  /layout
    sidebar.tsx
    topbar.tsx
    sidebar-item.tsx
  /dashboard
    stats-card.tsx
    quick-actions.tsx
    ai-insight-panel.tsx
    recent-activity.tsx
    upcoming-calendar-strip.tsx
  /calendar
    calendar-grid.tsx
    week-view.tsx
    task-dialog.tsx
    draft-panel.tsx
  /kanban
    board-list.tsx
    kanban-column.tsx
    task-card.tsx
    task-dialog.tsx
    collaborators-panel.tsx
  /notes
    notes-sidebar.tsx
    rich-editor.tsx
    speak-button.tsx
    ai-toolbar.tsx
  /whiteboard
    whiteboard-list.tsx
    excalidraw-wrapper.tsx
    ai-diagram-prompt.tsx
  /spaces
    space-card.tsx
    pages-list.tsx
    page-editor.tsx
  /templates
    template-card.tsx
    template-preview.tsx
    mini-app-renderer.tsx
  /ai-assistant
    chat-bubble.tsx
    action-confirm-card.tsx
    voice-agent-button.tsx
  /settings
    profile-section.tsx
    subscription-section.tsx
    category-manager.tsx
    ai-settings.tsx
/db
  /index.ts
  /schema.ts
/lib
  /gemini.ts
  /assembly.ts
  /liveblocks.ts
  /auth.ts
  /utils.ts
/hooks
  /use-assembly-streaming.ts
  /use-voice-agent.ts
  /use-kanban-drag.ts
```

---

## Database Schema (Drizzle ORM — Neon PostgreSQL)

```typescript
// users
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerk_id").unique(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatar: text("avatar"),
  plan: text("plan").default("free"), // "free" | "pro"
  aiActionsToday: integer("ai_actions_today").default(0),
  aiActionsResetAt: timestamp("ai_actions_reset_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// calendar_tasks
export const calendarTasks = pgTable("calendar_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  scheduledAt: timestamp("scheduled_at"),
  isDraft: boolean("is_draft").default(false),
  taskType: text("task_type").default("task"), // task | reminder | meeting | event
  category: text("category"),
  color: text("color").default("#7c3aed"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// kanban_boards
export const kanbanBoards = pgTable("kanban_boards", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").default("#7c3aed"),
  liveblocksRoomId: text("liveblocks_room_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// kanban_columns
export const kanbanColumns = pgTable("kanban_columns", {
  id: uuid("id").defaultRandom().primaryKey(),
  boardId: uuid("board_id").references(() => kanbanBoards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  order: integer("order").default(0),
  color: text("color"),
});

// kanban_tasks
export const kanbanTasks = pgTable("kanban_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  columnId: uuid("column_id").references(() => kanbanColumns.id, { onDelete: "cascade" }),
  boardId: uuid("board_id").references(() => kanbanBoards.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").default("medium"), // low | medium | high | urgent
  label: text("label"),
  dueDate: timestamp("due_date"),
  syncToCalendar: boolean("sync_to_calendar").default(false),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// kanban_collaborators
export const kanbanCollaborators = pgTable("kanban_collaborators", {
  id: uuid("id").defaultRandom().primaryKey(),
  boardId: uuid("board_id").references(() => kanbanBoards.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  status: text("status").default("pending"), // pending | accepted
  addedAt: timestamp("added_at").defaultNow(),
});

// notes
export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Untitled"),
  content: text("content"), // JSON from Tiptap
  isPinned: boolean("is_pinned").default(false),
  isTrashed: boolean("is_trashed").default(false),
  color: text("color").default("#1c1c28"),
  icon: text("icon").default("📝"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// whiteboards
export const whiteboards = pgTable("whiteboards", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("Untitled Board"),
  data: text("data"), // Excalidraw JSON
  thumbnail: text("thumbnail"),
  liveblocksRoomId: text("liveblocks_room_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// spaces
export const spaces = pgTable("spaces", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#7c3aed"),
  icon: text("icon").default("📁"),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// pages
export const pages = pgTable("pages", {
  id: uuid("id").defaultRandom().primaryKey(),
  spaceId: uuid("space_id").references(() => spaces.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Untitled Page"),
  content: text("content"),
  icon: text("icon").default("📄"),
  coverImage: text("cover_image"),
  isFavorite: boolean("is_favorite").default(false),
  template: text("template").default("blank"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// space_members
export const spaceMembers = pgTable("space_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  spaceId: uuid("space_id").references(() => spaces.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role").default("editor"), // viewer | editor | admin
  status: text("status").default("pending"),
  addedAt: timestamp("added_at").defaultNow(),
});

// ai_generated_templates
export const aiTemplates = pgTable("ai_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  prompt: text("prompt").notNull(),
  generatedSchema: text("generated_schema"), // JSON schema for mini-app
  generatedUi: text("generated_ui"),          // JSON for UI rendering
  appState: text("app_state"),                // runtime state JSON
  addedToSidebar: boolean("added_to_sidebar").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// ai_chat_history
export const aiChatHistory = pgTable("ai_chat_history", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  actionType: text("action_type"), // create_task | create_note | etc
  actionData: text("action_data"), // JSON
  createdAt: timestamp("created_at").defaultNow(),
});

// categories
export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").default("#7c3aed"),
  icon: text("icon"),
  scope: text("scope").notNull(), // calendar | kanban | notes | reminder
});

// activity_log
export const activityLog = pgTable("activity_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  entityType: text("entity_type"), // task | note | board | page | whiteboard
  entityId: text("entity_id"),
  metadata: text("metadata"), // JSON
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

## Environment Variables Required

```env
# Database
DATABASE_URL=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
CLERK_PRO_PLAN_ID=

# AI
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-pro

# AssemblyAI
ASSEMBLYAI_API_KEY=

# LiveBlocks
LIVEBLOCKS_SECRET_KEY=
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=
```

---

## Feature 1: Landing Page (`/`)

**Design**: Dark, cinematic hero. Full-viewport gradient mesh background in deep violet → midnight blue. Floating animated orbs (CSS keyframe pulse). Glassmorphism navbar.

**Sections to build:**

### 1.1 Navbar
- Logo: "FlowBase" in Syne font, violet gradient text
- Nav links: Features, How it Works, Pricing, Changelog
- CTA buttons: "Sign In" (ghost) + "Get Started Free" (violet filled, glow effect)
- Sticky with backdrop blur on scroll

### 1.2 Hero Section
- Headline: Large display text (Syne, 72px+): "Your Entire Workflow. One Intelligent Space."
- Sub-headline: "AI assistant, tasks, calendar, notes, whiteboard, and collaboration — unified."
- Two CTAs: "Start for Free" (primary) + "Watch Demo" (ghost with play icon)
- Animated product mockup: floating dashboard screenshot with subtle parallax tilt on mouse move
- Particle/star field background effect
- Scroll indicator (animated chevron)

### 1.3 Feature Highlights Grid
Six feature cards in a 3×2 grid (masonry-style, some cards taller):
1. **AI Assistant** — Chat with your workspace, add tasks/reminders via natural language
2. **Smart Calendar** — Drag & drop scheduling, week/month views, draft tasks
3. **Kanban Board** — Real-time collaboration via LiveBlocks, comment threads, priority labels
4. **Voice Notes** — Speak to write, powered by AssemblyAI real-time streaming
5. **AI Whiteboard** — Excalidraw + AI diagram generation from prompts
6. **Pages & Spaces** — Notion-like docs with collaborative editing

Each card: icon with gradient background, title, description, subtle hover lift animation.

### 1.4 How It Works (3-step)
Step 1: Sign up and set up your workspace
Step 2: Let AI understand your workflow
Step 3: Work faster with everything in one place

Horizontal timeline with numbered circles, connecting lines, and icon illustrations.

### 1.5 Product Showcase (Tabbed)
Tabbed section where each tab shows a different feature screenshot/mockup with animated entrance.

### 1.6 Collaboration Section
Side-by-side split: left text, right animated mockup showing multiple cursors on a whiteboard (LiveBlocks style).

### 1.7 Pricing Section
Two cards: Free and Pro
- **Free**: 3 boards, 25 tasks, 10 notes, 10 spaces, 5 AI actions/day
- **Pro**: Unlimited everything, voice agent, AI template builder, priority support — $12/month
Cards with feature list checkmarks, CTA buttons, popular badge on Pro.

### 1.8 Footer
Logo + tagline, nav links grouped by category, social icons, copyright.

---

## Feature 2: Authentication

Use **Clerk's pre-built components** (`<SignIn />` and `<SignUp />`) with custom appearance matching the dark theme (violet accent). Wrap in centered card with logo above.

On first sign-in/sign-up: call `/api/auth/sync` server action to upsert the user into the `users` table by email (do NOT use webhooks — use `currentUser()` from `@clerk/nextjs/server` inside a server component or server action).

---

## Feature 3: Dashboard Layout (Shared Shell)

### 3.1 Sidebar (`/components/layout/sidebar.tsx`)

**Design**: Fixed left sidebar, 260px wide when expanded, collapses to 68px (icon-only) with smooth CSS transition. Dark background matching `--bg-secondary`.

**Top section:**
- FlowBase logo + app name (hidden when collapsed)
- User avatar + name from Clerk (hidden when collapsed)
- Collapse/expand toggle button

**Navigation groups** (with group labels hidden on collapse):

**WORKSPACE**
- 🏠 Dashboard → `/dashboard`
- 🤖 AI Assistant → `/ai-assistant`

**PRODUCTIVITY**
- 📅 Calendar → `/calendar`
- 🗂 Kanban Board → `/kanban`
- 📝 Notes → `/notes`

**CREATIVE**
- 🎨 Whiteboard → `/whiteboard`
- 📚 Pages & Spaces → `/spaces`

**TOOLS**
- ⚡ AI Template Builder → `/templates`
- ⚙️ Settings → `/settings`

**AI-Generated Apps section** (below main nav):
- Header: "My Apps" with a small badge showing count (max 3 for free, unlimited for pro)
- Each app listed with its generated icon and name, click opens the template page
- Remove button on hover

**Bottom section:**
- Free/Pro plan badge with usage bar (AI actions today)
- "Upgrade to Pro" button (shown only for free users)

**Active state**: Left violet border `border-l-2 border-violet-500`, slightly brighter text, violet icon.

**Collapsed state**: Only icons visible, tooltip on hover showing label.

### 3.2 Topbar
- Current page title (dynamic from route)
- Breadcrumb trail where relevant
- Global search button (⌘K shortcut to open command palette)
- Notifications bell
- User avatar (Clerk UserButton component)

### 3.3 Command Palette (⌘K)
Modal with search input. Searches across:
- Navigation items
- Recent notes by title
- Kanban tasks
- Calendar events
Keyboard navigable. Opens on ⌘K / Ctrl+K.

---

## Feature 4: Dashboard Page (`/dashboard`)

**Design**: Grid layout. Cards with stats, quick actions, insight panel, upcoming items, recent activity.

### 4.1 Stats Row (top)
Four stat cards in a row:
- 📅 Calendar: upcoming events count
- 🗂 Kanban: open tasks count
- 📝 Notes: total notes count
- 📚 Spaces: total pages count

Each card: icon with colored background, large number, label, subtle trend indicator.

### 4.2 Quick Actions
Six clickable buttons with icon + label:
"New Task", "New Note", "New Event", "New Board", "AI Chat", "New Space"
Each navigates to the respective page or opens the relevant dialog.

### 4.3 Task Summary Widget
Horizontal bar chart or ring chart showing:
- Total tasks
- Completed
- In progress
- Overdue (highlighted in rose)

### 4.4 Upcoming Calendar Strip
Horizontal scrollable strip showing next 7 days. Each day column shows scheduled tasks as colored chips. Click a chip to open the task edit dialog.

### 4.5 Recent Activity Feed
Timeline-style list of the last 10 activity log entries:
- Icon by action type (created, completed, updated, deleted)
- Entity name
- Relative timestamp ("2 minutes ago")

### 4.6 AI Insight Panel
Box with violet gradient border. Shows 2–3 AI-generated insights based on user data:
- Upcoming deadlines
- Unfinished tasks from yesterday
- Suggestions like "You have 3 drafts — want to schedule them?"
Refresh button to regenerate insights.

### 4.7 Recent Pages
3-column grid of recently updated space pages with icon, title, space name, last updated.

### 4.8 Invite Section
Card with "Collaborate with your team" prompt and email invite input for a default space.

---

## Feature 5: AI Assistant Page (`/ai-assistant`)

### 5.1 Layout
Full-height split:
- Left (320px): Conversation history list (sorted by date, grouped Today/Yesterday/Older)
- Right (flex-1): Active chat window

### 5.2 Empty State
When no conversation is active, show:
- Large robot/sparkle icon
- "What can I help you with today?" title
- Four suggestion cards:
  - "Add a calendar reminder for tomorrow"
  - "Create a new Kanban board for my project"
  - "Take a note about my meeting"
  - "Build me a habit tracker app"

### 5.3 Chat Interface
- Messages displayed in chat bubbles: user right (violet), AI left (dark card)
- AI messages support markdown rendering (bold, lists, code blocks)
- Typing indicator: animated 3-dot pulse while AI is generating
- Multi-line textarea input (Enter sends, Shift+Enter = new line)
- Send button + microphone button (for voice input via AssemblyAI streaming)
- Conversation history persists in `ai_chat_history` table

### 5.4 Generative UI for AI Actions
When the AI detects an actionable intent (add calendar event, create task, create note, create board, create reminder), it renders an **Action Confirm Card** inline in the chat instead of just text:

```
┌─────────────────────────────────────────────┐
│ 📅 Add Calendar Event                        │
│                                             │
│ Title: Meeting with client                  │
│ Date: May 25, 2025 at 2:00 PM              │
│ Type: Meeting                               │
│                                             │
│ [Confirm]  [Cancel]                         │
└─────────────────────────────────────────────┘
```

On "Confirm", the action executes server-side and a success toast appears. The AI then sends a follow-up message confirming the action was taken.

### 5.5 AI Actions the Assistant Can Perform
- `create_calendar_task`: Add a scheduled task/reminder to calendar
- `create_kanban_task`: Add a task to a specified board and column
- `create_kanban_board`: Create a new Kanban board
- `create_note`: Create a new note with provided content
- `update_note`: Update/append content to an existing note
- `summarize_notes`: Return a summary of recent notes
- `create_space`: Create a new Space
- `create_page`: Create a page inside a Space

### 5.6 Voice Agent Button
A circular microphone button at the bottom-right of the chat input area. On click:
- Connect to **AssemblyAI Voice Agent API**
- Show a "Listening..." pulsing animation (violet ring)
- Two-way conversation: user speaks → AssemblyAI STT → sends to AI → AI responds → AssemblyAI TTS plays audio back
- Stop button to end the session

### 5.7 Rate Limiting
- Free plan: 5 AI actions per day (resets midnight UTC)
- Pro plan: Unlimited
- Show a friendly upgrade prompt when limit is reached with current usage displayed

---

## Feature 6: Calendar Page (`/calendar`)

### 6.1 Layout
- Main area: Calendar grid (month or week view)
- Right side panel (320px): Draft Tasks panel

### 6.2 Month View
- Full 7-column grid, current day highlighted with violet circle
- Each day cell shows task chips (max 3 visible, "+N more" overflow)
- Task chips color-coded by category
- Click on a day → opens "Add Task" dialog pre-filled with that date

### 6.3 Week View
- 7-column layout, each column = one day
- Time rows on the left (hourly from 6am–11pm)
- Tasks positioned at their scheduled time as colored blocks
- Can drag tasks between time slots

### 6.4 Navigation Controls
Topbar with:
- `< Prev` and `Next >` arrows
- "Today" button to jump to current date
- Month/Week view toggle (segmented control)
- "+ Add Task" primary button

### 6.5 Task Add/Edit Dialog
Full featured dialog:
- **Title** (required)
- **Description** (textarea)
- **Date** (date picker)
- **Time** (time picker, optional)
- **Task Type** (dropdown): Task | Reminder | Meeting | Event
- **Category** (dropdown, populated from user's categories in settings)
- **Color** (color swatch picker)
- Save modes: "Schedule" (adds to calendar) or "Save as Draft"
- Edit mode: pre-fill all fields from selected task

On click of an existing task chip, open same dialog in edit mode.

### 6.6 Drag & Drop
- Drag tasks between calendar days to reschedule (update `scheduledAt` in DB)
- Drag from Draft Panel to a calendar day to schedule a draft task (set `isDraft = false`)
- Smooth drag ghost element matching card style

### 6.7 Draft Task Panel (right side)
- Header: "Drafts" with count badge
- List of draft tasks as cards
- Quick-add form: title + optional time + "Save Draft" button
- Each draft card draggable to calendar

---

## Feature 7: Kanban Board (`/kanban`)

### 7.1 Layout
- **Left panel (280px)**: List of all boards for the signed-in user
- **Right panel (flex-1)**: Active board columns

### 7.2 Board List Panel
- "New Board" button at top → opens dialog with board name + color picker
- Each board listed as a row with:
  - Color dot indicator
  - Board name
  - Task count badge
  - Edit (pencil) and delete (trash) icon on hover
- Click to select active board

### 7.3 Board Columns
- Default 3 columns: **To Do**, **In Progress**, **Review**
- Columns displayed horizontally with horizontal scroll if more than 4
- Each column header: name, task count, `+` add task button, `⋯` menu (rename, delete)
- "Add Column +" button at far right of column row

### 7.4 Task Cards
Each task card shows:
- Title
- Priority badge (colored): Low (green) | Medium (amber) | High (orange) | Urgent (rose)
- Optional: label, due date, calendar sync indicator icon
- Comment count badge (from LiveBlocks)
- Avatar of assignee/creator
- Drag handle

Dragging: smooth drag-and-drop between columns (use `@hello-pangea/dnd` or similar). Update column + order in DB on drop.

### 7.5 Task Add/Edit Dialog
Full dialog with:
- **Title** (required)
- **Description** (textarea)
- **Column** (dropdown, pre-selected to current column)
- **Due Date** (date picker)
- **Priority** (dropdown): Low / Medium / High / Urgent
- **Label** (text input, optional)
- **Sync to Calendar** checkbox (if checked + due date set, also create calendar task)
- Create / Update / Cancel buttons

On click of any task card → open same dialog in view/edit mode.

### 7.6 Comment Threads (LiveBlocks)
Each task card has a "Comments" section at the bottom of the task dialog:
- Thread-style comments using `@liveblocks/react-comments`
- Reply to any comment creates a nested thread
- Real-time updates as other collaborators type
- Emoji reactions on comments

### 7.7 Collaboration (LiveBlocks)
- Each board has a `liveblocksRoomId`
- "Collaborators" section in the board panel header:
  - Shows avatars of currently online collaborators (live presence)
  - "Invite" button → input email → adds to `kanban_collaborators` table
  - Pending collaborators shown with a clock icon
- When multiple users are online: show colored cursor overlays on task cards they're hovering

---

## Feature 8: Notes Page (`/notes`)

### 8.1 Layout
- **Left panel (280px)**: Notes list sidebar
- **Right panel (flex-1)**: Active note editor

### 8.2 Notes Sidebar
- Search bar at top
- "New Note" button
- Filter tabs: All | Pinned | Trash
- Notes listed as cards showing:
  - Icon + color stripe
  - Title
  - First 2 lines of content (plain text preview)
  - Last updated timestamp
- Click to open in editor

### 8.3 Note Actions (hover or right-click context menu)
- Pin / Unpin
- Change Color (swatch picker)
- Change Icon (emoji picker)
- Move to Trash
- Restore from Trash (Trash tab only)
- Permanently Delete (Trash tab only)

### 8.4 Rich Text Editor (Tiptap)
Full Tiptap editor with:

**Slash Commands (`/` menu)**:
- Heading 1, Heading 2, Heading 3
- Bold, Italic, Strikethrough
- Bullet List
- Numbered List
- Code Block
- Quote
- Divider
- Image upload

**Floating Toolbar** (appears on text selection):
- Bold, Italic, Underline, Strikethrough
- Text color picker
- Highlight color
- Link
- **AI Refine** button (sparkle icon) → dropdown with:
  - Improve Grammar
  - Make it Shorter
  - Make it Longer
  - Simplify Language
  - Translate to...

AI Refine: sends selected text to `/api/ai/refine`, replaces selection with improved text.

**Note Header**:
- Editable title (large, Syne font)
- Icon picker on click of icon
- Cover image option
- Last updated timestamp

**No border/outline on the editor focus state**. Editor takes full height. Clean, distraction-free.

### 8.5 Speak to Note (AssemblyAI)
- Microphone button in topbar of editor: "Speak to Note"
- On click: connect to **AssemblyAI Universal Streaming Pro** model via WebSocket
- Real-time streaming: as user speaks, words appear in the editor at the cursor position (streaming, not batch)
- Max recording session: 2 minutes
- Stop button visible while recording
- Pulsing violet ring animation on microphone while active
- On session end: show toast with "Recording saved to note"
- Implementation: use `useAssemblyStreaming` custom hook that manages WebSocket, media stream, and interim/final result injection into Tiptap editor

### 8.6 Note Metadata Bar
Top of editor shows:
- Word count
- Character count
- Estimated read time
- Category selector (from user's note categories)

---

## Feature 9: Whiteboard Page (`/whiteboard`)

### 9.1 Layout
- **Left panel (260px)**: Whiteboard list
- **Right panel (flex-1)**: Active Excalidraw canvas

### 9.2 Whiteboard List
- "New Whiteboard" button → dialog with name input
- Each whiteboard listed with:
  - Thumbnail preview (or placeholder icon)
  - Name (editable inline on double-click)
  - Last updated timestamp
  - `⋯` menu: Rename, Clear Canvas, Delete

### 9.3 Excalidraw Canvas
Embed Excalidraw using `@excalidraw/excalidraw`:
- Full canvas taking all available space
- Default tools: Select, Hand, Draw, Text, Shapes (rect, ellipse, diamond, arrow, line), Image, Eraser
- Color palette, stroke width, fill style controls in Excalidraw's built-in toolbar
- Save canvas state to DB (debounced, every 2 seconds on change)
- Remove Excalidraw watermark/branding; show custom empty state

### 9.4 AI Diagram Generator
- "Generate with AI ✨" button in the whiteboard toolbar
- Opens a small prompt input popover
- User types a description: "User authentication flow with login, signup, and 2FA"
- Sends to `/api/ai/whiteboard` which uses Gemini to generate Excalidraw-compatible JSON elements
- Elements inserted onto canvas at center viewport
- Support for: flowcharts, mind maps, sequence diagrams, org charts

### 9.5 Export
- "Export as PNG" button → uses Excalidraw's `exportToBlob()` → triggers download

### 9.6 LiveBlocks Collaboration (Optional / Challenge Feature)
Connect the whiteboard to a LiveBlocks room so multiple users can draw simultaneously with live cursors.

---

## Feature 10: Pages & Spaces (`/spaces`)

### 10.1 Spaces List Page (`/spaces`)
**Design**: Card grid (3 columns), each card showing:
- Space color bar on left
- Icon + Space name (Syne font)
- Description (truncated)
- Page count
- Member avatars (invited collaborators)
- "Last updated" timestamp
- `⋯` menu: Edit, Invite Member, Duplicate, Archive, Delete

**Toolbar**:
- "New Space" button → dialog with name, description, color picker, icon picker
- View toggle: Grid / List
- Sort by: Name / Most Pages / Recently Updated
- Tabs: All | Active | Archived

### 10.2 Space Detail Page (`/spaces/[spaceId]`)
- Space header: color banner, icon, name, description
- "Add Page" button → dialog with title, template selection (Blank, Meeting Notes, Project Plan, Weekly Review), icon picker
- Pages listed in sidebar-style left panel
  - Each page: icon + title
  - Drag to reorder
  - `⋯` menu: Rename, Duplicate, Move to another space, Mark as Favorite, Export, Delete
- Click page → opens page editor on right

### 10.3 Page Editor (`/spaces/[spaceId]/[pageId]`)
Same Tiptap editor as Notes with:
- Editable page title (Syne, large)
- Cover image (upload or color gradient)
- Emoji icon picker
- "Favorite" bookmark icon in header
- Full slash command menu
- AI toolbar on selection (same as Notes)
- **Speak to Page**: same AssemblyAI streaming integration as Notes
- Word count + last updated in footer

### 10.4 Space Collaboration
- Invite members by email → stored in `space_members`
- Invited members can view/edit pages
- Online presence shown as avatars in page header

---

## Feature 11: AI Template Builder (`/templates`)

### 11.1 Layout
- **Left panel (380px)**: Generator form + app list
- **Right panel (flex-1)**: Preview of generated app

### 11.2 Generator Form
- Large textarea: "Describe your mini-app idea..."
- Examples below: "Habit Tracker", "Budget Planner", "Meal Prep Planner", "Daily Journal", "Workout Logger"
- "Generate ✨" button (primary, full width)
- Loading state: animated shimmer on preview panel + progress messages:
  - "Understanding your idea..."
  - "Designing the interface..."
  - "Building your app..."

### 11.3 AI Generation
POST to `/api/ai/template` → Gemini generates:
```json
{
  "name": "Habit Tracker",
  "description": "Track your daily habits and streaks",
  "schema": {
    "fields": [
      { "id": "habit", "label": "Habit Name", "type": "text" },
      { "id": "completed", "label": "Completed", "type": "boolean" },
      { "id": "date", "label": "Date", "type": "date" }
    ]
  },
  "ui": {
    "components": [
      { "type": "input", "fieldId": "habit", "placeholder": "Enter habit..." },
      { "type": "button", "label": "Add Habit", "action": "addRecord" },
      { "type": "list", "title": "Today's Habits", "fieldIds": ["habit", "completed"] }
    ]
  }
}
```

### 11.4 Mini-App Renderer
Right panel renders the generated schema into a **fully functional** mini-app using React state:
- Inputs, buttons, lists, checkboxes all interactive
- Data stored in React state (and persisted to `ai_templates.appState` column)
- No hardcoded data — AI schema drives the entire UI
- Show "Add Record", "Complete", "Delete" actions as appropriate

### 11.5 Created Apps List (left panel bottom)
- List of all generated apps for this user
- Each app: icon (generated), name, date created
- "Open" button to load into preview panel
- "Add to Sidebar" button → sets `addedToSidebar = true`, app appears in sidebar nav
- "Remove from Sidebar" if already added
- Free plan: maximum 1 app. Pro: unlimited. Show upgrade prompt when limit reached.

---

## Feature 12: Settings Page (`/settings`)

Tabbed settings page. Tabs on left sidebar within settings layout.

### Tab 1: Profile
- Avatar (shows Clerk profile photo)
- Full name (editable, syncs to DB)
- Email (read-only, from Clerk)
- "Manage Account" button → opens Clerk UserProfile component in a modal

### Tab 2: Subscription
- Current plan: Free or Pro badge
- Usage stats:
  - Boards created (e.g., 2/3)
  - Tasks created (e.g., 18/25)
  - Notes (e.g., 6/10)
  - Spaces (e.g., 4/10)
  - AI actions today (e.g., 3/5)
- Progress bars for each limit
- **Upgrade to Pro card**: feature list checkmarks, price, "Upgrade Now" CTA → triggers Clerk billing flow
- If Pro: "Manage Subscription" → Clerk billing portal

### Tab 3: Categories
Three sub-tabs: Calendar | Kanban | Notes
Each sub-tab shows:
- List of existing categories with color dot, name, edit/delete icons
- "Add Category" form inline: name input + color picker + icon picker + scope selector + "Add" button

### Tab 4: AI Settings
- **Default Model**: Dropdown (Gemini 1.5 Pro / Gemini 1.5 Flash)
- **AI Tone**: Professional / Friendly / Concise / Creative
- **Enable AI Refine in Notes**: Toggle
- **Enable AI Refine in Pages**: Toggle
- **Enable AI Insight on Dashboard**: Toggle
- **Voice Agent Language**: Dropdown (English / Spanish / French / German)

### Tab 5: Preferences
- **Theme**: Dark (forced for now, can add light mode toggle)
- **Default Calendar View**: Month / Week
- **Default Task Priority**: Low / Medium / High
- **Sidebar Collapsed by Default**: Toggle
- **Show Word Count in Editor**: Toggle

### Tab 6: Privacy & Security
- **Two-Factor Authentication**: managed by Clerk (link to account security)
- **Active Sessions**: list from Clerk
- **Delete Account**: danger zone, requires confirmation dialog

---

## Feature 13: AI Text Refine (Global Floating Toolbar)

Available in **Notes editor** and **Pages editor**:
- Appears whenever user selects text (minimum 10 characters)
- Floating toolbar positioned above selection (like Notion's)
- AI Refine button opens dropdown:
  - **Improve Grammar**: fixes grammar/spelling
  - **Make Shorter**: condenses the text
  - **Make Longer**: expands with more detail
  - **Simplify**: plain language version
  - **Fix Tone (Professional)**: more formal
- On select: sends to `/api/ai/refine` with `{text, action}` → returns refined text → replaces selection in Tiptap

---

## API Routes Detail

### `/api/auth/sync` (POST)
- Called from middleware or layout server component after sign-in
- Uses `currentUser()` from Clerk to get user data
- Upserts into `users` table by email
- Returns `{ user }`

### `/api/ai/chat` (POST)
- Body: `{ messages: [...], userId }`
- Checks AI action limit (free: 5/day, pro: unlimited)
- Sends conversation to Gemini with system prompt defining all available actions
- Detects intent from response, returns `{ reply, action?, actionData? }`
- Increments `ai_actions_today` on each call
- Logs to `ai_chat_history` and `activity_log`

### `/api/ai/refine` (POST)
- Body: `{ text, action }` (action = "grammar" | "shorter" | "longer" | "simplify" | "professional")
- Returns `{ refined: string }`

### `/api/ai/template` (POST)
- Body: `{ prompt, userId }`
- Checks template limit for free users
- Returns `{ schema, ui, name, description }`

### `/api/ai/whiteboard` (POST)
- Body: `{ prompt }`
- Returns Excalidraw-compatible elements array

### `/api/assembly/stream` (GET)
- Returns temporary AssemblyAI token for client-side WebSocket connection
- Client connects directly to AssemblyAI WebSocket using this token

### `/api/liveblocks/auth` (POST)
- Authenticates the current Clerk user with LiveBlocks
- Returns LiveBlocks session token with user identity (name, avatar, color)

### `/api/calendar` (GET/POST/PUT/DELETE)
- CRUD for calendar tasks filtered by `userId`

### `/api/kanban` (GET/POST/PUT/DELETE)
- CRUD for boards, columns, tasks, collaborators

### `/api/notes` (GET/POST/PUT/DELETE)
- CRUD for notes filtered by `userId`

### `/api/whiteboard` (GET/POST/PUT/DELETE)
- CRUD for whiteboards filtered by `userId`

### `/api/spaces` & `/api/pages` (GET/POST/PUT/DELETE)
- CRUD for spaces and pages

### `/api/templates` (GET/POST/PUT/DELETE)
- CRUD for AI templates + sidebar management

---

## AssemblyAI Integration Details

### Speech-to-Text Streaming (Notes & Pages)
```typescript
// /hooks/use-assembly-streaming.ts
// 1. Fetch temp token from /api/assembly/stream
// 2. Connect WebSocket to wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=...
// 3. Capture microphone audio with MediaRecorder (PCM16 format)
// 4. Send audio chunks to WebSocket
// 5. Receive partial_transcript and final_transcript messages
// 6. Insert final transcripts into Tiptap editor at current cursor position (streaming, not batch)
// 7. Show partial transcripts as greyed-out "ghost text" while user is still speaking
// 8. Max duration: 2 minutes, then auto-stop
// 9. Model: "universal-streaming" (latest Universal Streaming Pro)
```

### Voice Agent (AI Assistant Page)
```typescript
// /hooks/use-voice-agent.ts
// 1. Use AssemblyAI Voice Agent API (two-way conversation)
// 2. System prompt: "You are FlowBase AI assistant. Help users manage their tasks, calendar, notes, and workspace..."
// 3. Greeting: "Hey! I'm your FlowBase AI. What would you like to work on today?"
// 4. On user speech: STT → AI intent detection → TTS response played back to user
// 5. On detecting an action (add task, create note, etc.): emit an event to render Action Confirm Card in chat UI
// 6. Stop conversation on button click or after 5 minutes of inactivity
```

---

## LiveBlocks Integration Details

### Setup
```typescript
// /lib/liveblocks.ts
import { Liveblocks } from "@liveblocks/node";
export const liveblocks = new Liveblocks({ secret: process.env.LIVEBLOCKS_SECRET_KEY! });

// /api/liveblocks/auth/route.ts
// Use liveblocks.identifyUser() with Clerk user data
```

### Kanban Board Room
- Room ID format: `kanban-board-{boardId}`
- Presence: `{ cursor: {x, y}, hoveredCardId: string | null }`
- Storage: not used (data in DB, LiveBlocks for presence only)
- Comments: `@liveblocks/react-comments` for task comment threads

### Whiteboard Room (Challenge Feature)
- Room ID: `whiteboard-{whiteboardId}`
- Storage: Excalidraw elements stored in LiveBlocks Storage for real-time sync

---

## Clerk Billing Integration

### Plans
- **Free**: `CLERK_FREE_PLAN_ID` — default for all new users
- **Pro**: `CLERK_PRO_PLAN_ID` — $12/month

### Free Plan Limits (enforced server-side)
```typescript
export const FREE_LIMITS = {
  kanbanBoards: 3,
  kanbanTasks: 25,
  notes: 10,
  spaces: 10,
  aiActionsPerDay: 5,
  aiTemplates: 1,
};
```

### Enforcement Pattern
Every mutation API route checks the user's plan before allowing creation:
```typescript
const user = await getUserFromDb(clerkId);
if (user.plan === "free" && currentBoardCount >= FREE_LIMITS.kanbanBoards) {
  return NextResponse.json({ error: "Free plan limit reached", upgrade: true }, { status: 403 });
}
```

On 403 with `upgrade: true`, client shows upgrade modal automatically.

### Subscription UI
In Settings > Subscription, embed Clerk's billing UI:
```tsx
import { PricingTable } from "@clerk/nextjs";
<PricingTable />
```

For managing existing subscription: redirect to Clerk's subscription portal.

---

## Animations & Motion Guidelines

Use **Framer Motion** throughout:

```tsx
// Page entrance
<motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

// List items stagger
<motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>

// Modal
<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>

// Sidebar collapse
// Use CSS transition: width 200ms ease, not Framer for performance

// AI insight appear
<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300 }}>
```

All lists use staggered entrance. Dialogs scale in. Cards lift on hover (`translateY(-2px)`, shadow increase). Sidebar items have left-border slide-in animation on active.

---

## Error Handling & UX Patterns

- All async operations show a loading skeleton or spinner
- Errors show a toast notification (bottom-right) with error message and retry option
- Empty states: every list has a thoughtfully designed empty state with illustration, title, description, and CTA
- Optimistic UI: for task creation/update, show immediately while API call is in-flight
- Network errors: show offline banner when connection is lost
- Form validation: inline field errors using react-hook-form + zod

---

## Deployment Checklist

1. Run `npm run build` locally — fix all TypeScript and build errors
2. Ensure all environment variables are set in Vercel project settings
3. Run `npx drizzle-kit push` against production Neon DB URL
4. Set up Clerk production instance with correct redirect URLs
5. Verify AssemblyAI and LiveBlocks keys are production keys
6. Test all features end-to-end in production environment
7. Enable Clerk billing in production dashboard
8. Set up custom domain (optional)

---

## Implementation Order (Recommended Chapter Sequence)

1. **Project Setup** — Next.js boilerplate, install all dependencies, env setup
2. **DB + Auth** — Drizzle schema, `/api/auth/sync`, user sync on sign-in
3. **Dashboard Layout** — Sidebar, topbar, routing, theme system
4. **Landing Page** — Full marketing page before any feature pages
5. **Dashboard Page** — Stats, quick actions, activity feed
6. **Calendar** — Grid, week view, task dialog, drag & drop, draft panel
7. **Kanban Board** — Boards, columns, tasks, drag & drop
8. **LiveBlocks (Kanban)** — Presence, comments, collaboration
9. **Notes** — Sidebar, Tiptap editor, pin/color/icon, trash
10. **AssemblyAI STT** — Speak to Note, streaming integration
11. **AI Refine** — Floating toolbar, Gemini refine endpoint
12. **Whiteboard** — Excalidraw, board list, AI diagram generator
13. **Pages & Spaces** — Spaces list, space detail, page editor
14. **AI Template Builder** — Generator, mini-app renderer, sidebar apps
15. **AI Assistant** — Chat UI, generative action cards, voice agent
16. **Settings** — All tabs, Clerk billing, categories, AI preferences
17. **Polish** — Animations, empty states, error handling, mobile responsiveness
18. **Deploy** — Build, Vercel, env vars, production testing

---

## Additional Notes for the AI Coding Agent

- **Never use webhooks for user sync** — use `currentUser()` server-side
- **Always check plan limits server-side** — never trust client for plan enforcement
- **Tiptap content stored as JSON** (not HTML) in the `content` column
- **AssemblyAI tokens should never be exposed client-side** — always proxy through `/api/assembly/stream`
- **Drizzle schema changes require `npx drizzle-kit push`** after every schema update
- **LiveBlocks room IDs must be unique per entity** — use format `{entity}-{id}`
- **Category selects in dialogs** should always fetch from the user's `categories` table, not be hardcoded
- **Mobile responsiveness**: sidebar becomes a bottom sheet drawer on mobile, all dialogs are full-screen on mobile
- **The `theme.md` file** should be created and referenced by the AI for all styling decisions:
  - Contains all CSS variables, font choices, spacing scale, animation timings
  - Every new component reads this file before adding styles
- **The AI assistant system prompt** must include a complete list of all action types with their required parameters so the AI can correctly parse user intent
- **Excalidraw must not show its default loading splash** — use the `UIOptions` prop to suppress branding
- **All date/time handling**: store in UTC in the DB, display in user's local timezone

---

*This is the complete master prompt for building FlowBase. Implement each chapter sequentially, commit to a new branch per chapter, push to GitHub, and review with an AI code reviewer before merging to main. The result should be a production-ready, deployable AI productivity SaaS application.*
