# Session Management UI Specification

**Version:** 2.0  
**Last Updated:** October 2025  
**Status:** 🚧 In Progress

## Overview

This document specifies the UI/UX design for session management features in KaryaKarta, including sidebar navigation, session list, authentication screens, and user flows.

## Table of Contents

1. [User Flows](#user-flows)
2. [Component Specifications](#component-specifications)
3. [Sidebar Design](#sidebar-design)
4. [Authentication UI](#authentication-ui)
5. [Session Management](#session-management)
6. [Real-time Updates](#real-time-updates)
7. [Responsive Design](#responsive-design)
8. [Accessibility](#accessibility)

---

## User Flows

### 1. First-Time User Flow

```
Landing Page
    ↓
Sign Up
    ↓
Email Verification
    ↓
Auto-Login
    ↓
Chat Page (Empty State)
    ↓
Type First Message
    ↓
Session Auto-Created with Title
```

### 2. Returning User Flow

```
Landing Page
    ↓
Login
    ↓
Chat Page (Session List Loaded)
    ↓
Select Previous Session OR Start New Chat
    ↓
Continue Conversation
```

### 3. Session Switching Flow

```
Active Chat
    ↓
Click Session in Sidebar
    ↓
Load Session History
    ↓
Display Messages
    ↓
Continue in New Session
```

### 4. New Chat Flow

```
Any Page
    ↓
Click "New Chat" Button
    ↓
Create New Session (API Call)
    ↓
Clear Current Messages
    ↓
Generate New Session ID
    ↓
Ready for Input
```

---

## Component Specifications

### 1. Session List Component

**Location:** `src/components/chat/session-list.tsx`

```typescript
interface SessionListProps {
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, newTitle: string) => void;
  loading: boolean;
}

interface Session {
  id: string;
  session_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  is_archived: boolean;
}
```

**Visual Design:**
```
┌─────────────────────────────────────┐
│  📝 Today                           │
│  ┌───────────────────────────────┐ │
│  │ ✓ How to implement auth?     │ │ ← Active
│  │   12 messages • 2:45 PM      │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │   Building a REST API        │ │
│  │   8 messages • 11:30 AM      │ │
│  └───────────────────────────────┘ │
│                                     │
│  📅 Yesterday                      │
│  ┌───────────────────────────────┐ │
│  │   Database design patterns   │ │
│  │   15 messages • Yesterday    │ │
│  └───────────────────────────────┘ │
│                                     │
│  📅 Previous 7 Days               │
│  └─ 5 more sessions...            │
└─────────────────────────────────────┘
```

**Features:**
- Group by: Today, Yesterday, Previous 7 Days, Previous 30 Days
- Hover actions: Rename, Delete, Archive
- Click to switch sessions
- Active session highlighted
- Smooth animations

### 2. Session Item Component

**Location:** `src/components/chat/session-item.tsx`

```typescript
interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (newTitle: string) => void;
}
```

**Visual States:**

**Default:**
```
┌────────────────────────────────────┐
│  Building a REST API              │
│  8 messages • 11:30 AM            │
└────────────────────────────────────┘
```

**Hover:**
```
┌────────────────────────────────────┐
│  Building a REST API      [✏️] [🗑️] │
│  8 messages • 11:30 AM            │
└────────────────────────────────────┘
```

**Active:**
```
┌────────────────────────────────────┐
│ ✓ Building a REST API     [✏️] [🗑️] │
│   8 messages • 11:30 AM           │
└────────────────────────────────────┘
  ^ Blue border/background
```

**Editing:**
```
┌────────────────────────────────────┐
│  [_Building a REST API____]  [✓][✗]│
│  8 messages • 11:30 AM            │
└────────────────────────────────────┘
```

### 3. New Chat Button

**Location:** Sidebar top

**Visual Design:**
```
┌─────────────────────────────────┐
│                                 │
│  [ + New Chat ]                │
│    (Full width, primary color) │
│                                 │
└─────────────────────────────────┘
```

**States:**
- Default: Primary button
- Hover: Slightly darker
- Active: Scale down slightly
- Loading: Spinner inside button

**Behavior:**
- Click → Create new session
- API call to `/api/sessions` (POST)
- Clear current chat
- Focus on input field

### 4. Session Search

**Location:** Above session list

```typescript
interface SessionSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}
```

**Visual Design:**
```
┌─────────────────────────────────────┐
│  🔍 Search conversations...        │
└─────────────────────────────────────┘
```

**Features:**
- Real-time search (debounced 300ms)
- Search by title or content
- Clear button when text entered
- Keyboard shortcut: Cmd/Ctrl + K

---

## Sidebar Design

### Layout Structure

```
┌─────────────────────────────┐
│ HEADER                      │
│  Logo + Theme Toggle        │
├─────────────────────────────┤
│ NEW CHAT BUTTON            │
│  [+ New Chat]              │
├─────────────────────────────┤
│ SEARCH (Optional)           │
│  [🔍 Search...]            │
├─────────────────────────────┤
│ SESSION LIST (Scrollable)   │
│  Today                      │
│    - Session 1              │
│    - Session 2              │
│  Yesterday                  │
│    - Session 3              │
│  ...                        │
│                             │
│                             │
│                             │
├─────────────────────────────┤
│ FOOTER                      │
│  User Profile + Logout      │
│  Settings Link              │
└─────────────────────────────┘
```

### Dimensions

- **Width:** 280px (desktop), 100% (mobile)
- **Min-height:** 100vh
- **Padding:** 16px
- **Gap between items:** 8px

### Behavior

- **Desktop:** Always visible on left
- **Tablet:** Collapsible with toggle button
- **Mobile:** Slide-in drawer from left

### Animations

```typescript
// Sidebar slide in/out
const sidebarVariants = {
  open: { x: 0, opacity: 1 },
  closed: { x: -280, opacity: 0 }
};

// Session item fade in
const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0 }
};
```

---

## Authentication UI

### 1. Login Page

**Route:** `/login`

**Layout:**
```
┌──────────────────────────────────────┐
│                                      │
│           🤖                         │
│        KaryaKarta                    │
│                                      │
│    ┌─────────────────────────┐      │
│    │ Email                   │      │
│    │ [________________]      │      │
│    │                         │      │
│    │ Password                │      │
│    │ [________________]      │      │
│    │                         │      │
│    │ [     Sign In     ]     │      │
│    │                         │      │
│    │ Forgot password?        │      │
│    │ Don't have account?     │      │
│    │ Sign up →               │      │
│    └─────────────────────────┘      │
│                                      │
└──────────────────────────────────────┘
```

**Component:** `src/app/login/page.tsx`

```typescript
interface LoginFormData {
  email: string;
  password: string;
}

interface LoginPageProps {}
```

**Features:**
- Email/password fields
- Form validation
- Error messages inline
- Loading state
- Remember me (optional)
- OAuth buttons (optional)

### 2. Sign Up Page

**Route:** `/signup`

**Layout:**
```
┌──────────────────────────────────────┐
│                                      │
│           🤖                         │
│        KaryaKarta                    │
│      Create Your Account             │
│                                      │
│    ┌─────────────────────────┐      │
│    │ Email                   │      │
│    │ [________________]      │      │
│    │                         │      │
│    │ Password                │      │
│    │ [________________]      │      │
│    │ 8+ characters           │      │
│    │                         │      │
│    │ Confirm Password        │      │
│    │ [________________]      │      │
│    │                         │      │
│    │ [ ] I agree to ToS      │      │
│    │                         │      │
│    │ [    Sign Up     ]      │      │
│    │                         │      │
│    │ Already have account?   │      │
│    │ Sign in →               │      │
│    └─────────────────────────┘      │
│                                      │
└──────────────────────────────────────┘
```

**Features:**
- Email validation
- Password strength indicator
- Password confirmation
- Terms of service checkbox
- Success message → Auto-redirect

### 3. User Profile Dropdown

**Location:** Sidebar footer

```
┌─────────────────────────────┐
│  👤 user@example.com       │
│  ├─ Profile                │
│  ├─ Settings               │
│  ├─ Usage & Billing        │
│  └─ Log out                │
└─────────────────────────────┘
```

**Component:** `src/components/layout/user-menu.tsx`

---

## Session Management

### Actions

#### 1. Create Session
```typescript
const createSession = async (): Promise<Session> => {
  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: 'New Chat'
    })
  });
  return response.json();
};
```

#### 2. Switch Session
```typescript
const switchSession = async (sessionId: string) => {
  // 1. Save current session state
  // 2. Load new session from API
  const response = await fetch(`/api/sessions/${sessionId}`);
  const session = await response.json();
  
  // 3. Update UI with session messages
  setCurrentSession(session);
  setMessages(session.messages);
};
```

#### 3. Delete Session
```typescript
const deleteSession = async (sessionId: string) => {
  // Show confirmation dialog
  const confirmed = confirm('Delete this conversation?');
  if (!confirmed) return;
  
  // Delete from backend
  await fetch(`/api/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  // Update UI
  setSessions(sessions.filter(s => s.id !== sessionId));
  
  // If deleting current session, create new one
  if (sessionId === currentSession?.id) {
    await createNewSession();
  }
};
```

#### 4. Rename Session
```typescript
const renameSession = async (sessionId: string, newTitle: string) => {
  await fetch(`/api/sessions/${sessionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title: newTitle })
  });
  
  // Update local state
  setSessions(sessions.map(s => 
    s.id === sessionId ? { ...s, title: newTitle } : s
  ));
};
```

---

## Real-time Updates

### Subscription to Session Changes

```typescript
useEffect(() => {
  // Subscribe to session changes
  const subscription = supabase
    .channel('sessions')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `user_id=eq.${user?.id}`
      },
      (payload) => {
        handleSessionUpdate(payload);
      }
    )
    .subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, [user]);
```

### Update Handlers

```typescript
const handleSessionUpdate = (payload: any) => {
  switch (payload.eventType) {
    case 'INSERT':
      setSessions([payload.new, ...sessions]);
      break;
    case 'UPDATE':
      setSessions(sessions.map(s => 
        s.id === payload.new.id ? payload.new : s
      ));
      break;
    case 'DELETE':
      setSessions(sessions.filter(s => s.id !== payload.old.id));
      break;
  }
};
```

---

## Responsive Design

### Breakpoints

```typescript
const breakpoints = {
  mobile: '0-768px',
  tablet: '769px-1024px',
  desktop: '1025px+'
};
```

### Mobile Layout

- Sidebar becomes full-screen drawer
- Hamburger menu to toggle
- Bottom navigation (optional)
- Swipe gestures for navigation

### Tablet Layout

- Collapsible sidebar (280px → 60px)
- Icon-only mode when collapsed
- Tooltip on hover

### Desktop Layout

- Full sidebar always visible
- Resizable sidebar (optional)
- Keyboard shortcuts enabled

---

## Accessibility

### Keyboard Navigation

| Action | Shortcut |
|--------|----------|
| New Chat | Cmd/Ctrl + N |
| Search | Cmd/Ctrl + K |
| Next Session | Cmd/Ctrl + ] |
| Previous Session | Cmd/Ctrl + [ |
| Delete Session | Cmd/Ctrl + Backspace |
| Focus Input | / |

### Screen Reader Support

- Proper ARIA labels on all buttons
- Role attributes for lists
- Live regions for updates
- Focus management

### Color Contrast

- WCAG AA minimum (4.5:1)
- AAA preferred (7:1)
- High contrast mode support

### Focus Indicators

- Visible focus rings
- Custom focus styles
- Skip to main content link

---

## Error States

### No Sessions Available

```
┌─────────────────────────────────┐
│                                 │
│          💬                     │
│   No conversations yet          │
│   Start by clicking New Chat    │
│                                 │
│   [ + New Chat ]               │
│                                 │
└─────────────────────────────────┘
```

### Failed to Load Sessions

```
┌─────────────────────────────────┐
│          ⚠️                      │
│   Failed to load conversations  │
│   [ Try Again ]                │
└─────────────────────────────────┘
```

### Session Deleted

```
Toast notification:
┌─────────────────────────────────┐
│ ✓ Conversation deleted          │
│   [ Undo ]                      │
└─────────────────────────────────┘
(Auto-dismiss in 5 seconds)
```

---

## Loading States

### Initial Load
- Skeleton screens for session list
- Shimmer effect
- Progress indicator

### Session Switch
- Fade out current messages
- Loading spinner
- Fade in new messages

### Delete/Rename
- Button disabled state
- Loading spinner in button
- Optimistic updates

---

## Implementation Checklist

- [ ] Create SessionContext
- [ ] Create AuthContext
- [ ] Create session-list.tsx
- [ ] Create session-item.tsx
- [ ] Create user-menu.tsx
- [ ] Update sidebar.tsx
- [ ] Create login page
- [ ] Create signup page
- [ ] Add session API endpoints
- [ ] Implement real-time updates
- [ ] Add keyboard shortcuts
- [ ] Test responsive design
- [ ] Test accessibility
- [ ] Add error handling
- [ ] Add loading states
- [ ] Write component tests

---

## Resources

- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Framer Motion](https://www.framer.com/motion/) - For animations
- [React Hook Form](https://react-hook-form.com/) - For forms
- [Zod](https://zod.dev/) - For validation
