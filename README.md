# KaryaKarta AI 🌐

**Modern AI Chat Interface for KaryaKarta Agent**

KaryaKarta AI is a beautiful, responsive Next.js frontend that provides an intuitive chat interface for interacting with the KaryaKarta Agent backend. Built with TypeScript, Tailwind CSS, and real-time WebSocket communication.

[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Key Features

### User Experience
- 💬 **Real-time Chat Interface**: Smooth, responsive chat experience
- 🎨 **Modern UI**: Clean design with dark/light mode support
- 📱 **Fully Responsive**: Works on desktop, tablet, and mobile
- ⚡ **Live Updates**: WebSocket-based real-time progress streaming
- 🔍 **Session Management**: Create, browse, and manage conversation sessions

### Technical Features
- 🔐 **Authentication**: Supabase-powered user authentication
- 💾 **Session Persistence**: Save and restore conversation history
- 🎯 **Message Tracking**: Unique message IDs with deduplication
- 🔄 **Optimistic Updates**: Instant UI feedback with error recovery
- ♿ **Accessibility**: WCAG AA compliant with keyboard navigation

---

## 🏗️ Architecture

### Component Structure

```
karyakarta-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Landing page
│   │   ├── chat/              # Chat interface
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   └── api/               # API routes
│   │
│   ├── components/            # React components
│   │   ├── chat/             # Chat-specific components
│   │   │   ├── chat-input.tsx
│   │   │   ├── message-bubble.tsx
│   │   │   ├── session-list.tsx
│   │   │   └── sidebar.tsx
│   │   ├── layout/           # Layout components
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── hero-section.tsx
│   │   ├── auth/             # Authentication components
│   │   └── ui/               # shadcn/ui components
│   │
│   ├── contexts/             # React contexts
│   │   ├── auth-context.tsx
│   │   └── session-context.tsx
│   │
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries
│   └── types/                # TypeScript types
│
├── docs/                     # Documentation
└── public/                   # Static assets
```

### Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS 3.0+
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Real-time**: Socket.IO Client
- **State Management**: React Context + Hooks
- **Icons**: Lucide React

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm
- Running instance of karyakarta-agent backend
- Supabase project (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/karyakarta.git
   cd karyakarta/karyakarta-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

   Required variables:
   ```env
   # Backend API
   NEXT_PUBLIC_API_URL=http://localhost:8000
   
   # Supabase (for authentication)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Optional
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

### User Interface

1. **[docs/SESSION_UI_SPEC.md](docs/SESSION_UI_SPEC.md)** - Complete UI/UX specifications
   - User flows
   - Component specifications
   - Sidebar design
   - Authentication UI

### Technical Documentation

2. **[docs/message-tracking-system.md](docs/message-tracking-system.md)** - Message tracking implementation
3. **[docs/AUTH_TROUBLESHOOTING.md](docs/AUTH_TROUBLESHOOTING.md)** - Authentication troubleshooting
4. **[docs/OAUTH_SETUP_GUIDE.md](docs/OAUTH_SETUP_GUIDE.md)** - OAuth configuration guide
5. **[docs/UI_REVAMP.md](docs/UI_REVAMP.md)** - UI design decisions

### Backend Integration

See the backend documentation for API integration details:
- [karyakarta-agent/docs/API_CONTRACT.md](../karyakarta-agent/docs/API_CONTRACT.md)

---

## 🎨 Features Overview

### Chat Interface

The main chat interface provides:
- **Message Input**: Rich text input with auto-resize
- **Message History**: Scrollable conversation view
- **Agent Status**: Real-time agent thinking and processing indicators
- **Error Handling**: Graceful error display with retry options
- **Markdown Support**: Rich formatting for agent responses

### Session Management

Manage conversations with:
- **Session List**: Browse all your conversation sessions
- **Session Switching**: Quick switch between active sessions
- **Session Creation**: Start new conversations anytime
- **Session Deletion**: Remove unwanted conversations
- **Session Renaming**: Customize session titles

### Authentication

Secure authentication with:
- **Email/Password**: Traditional authentication
- **OAuth Support**: Google, GitHub (configurable)
- **Session Persistence**: Stay logged in across sessions
- **Protected Routes**: Automatic redirect for unauthenticated users

### Real-time Updates

Stay informed with:
- **Status Messages**: "Searching...", "Processing..."
- **Thinking Process**: View agent's reasoning
- **Progress Indicators**: Visual feedback for long operations
- **Error Notifications**: Immediate error alerts

---

## 🔌 API Integration

### Backend Connection

The frontend connects to the karyakarta-agent backend:

```typescript
// Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// API Client
const response = await fetch(`${API_URL}/execute-task`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: userMessage,
    messageId: generateMessageId(),
    sessionId: currentSessionId,
  }),
});
```

### WebSocket Connection

Real-time updates via Socket.IO:

```typescript
import io from 'socket.io-client';

const socket = io(API_URL);

// Listen for agent updates
socket.on('agent-log', (data) => {
  switch (data.type) {
    case 'status':
      // Show status message
      break;
    case 'thinking':
      // Show agent reasoning
      break;
    case 'response':
      // Show final response
      break;
    case 'error':
      // Handle error
      break;
  }
});
```

### Message Flow

```
1. User types message
   ↓
2. Generate unique messageId
   ↓
3. POST to /execute-task
   ↓
4. Listen on WebSocket for updates
   ↓
5. Display status, thinking, response
   ↓
6. Store in session history
```

---

## 🎨 Styling & Theming

### Theme Support

The app supports both light and dark modes:

```typescript
// Toggle theme
const { theme, setTheme } = useTheme();

// Available themes
type Theme = 'light' | 'dark' | 'system';
```

### Customization

Customize colors in `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          foreground: '#ffffff',
        },
        // ... more colors
      },
    },
  },
};
```

### UI Components

Built with shadcn/ui components:
- Button, Input, Textarea
- Card, Badge, Avatar
- Dropdown Menu, Alert Dialog
- And more...

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Type Checking

```bash
# Check types
npm run type-check

# Build (includes type checking)
npm run build
```

### Linting

```bash
# Lint code
npm run lint

# Fix lint issues
npm run lint -- --fix
```

---

## 🏭 Production Build

### Build for Production

```bash
# Create optimized build
npm run build

# Preview production build
npm run start
```

### Build Output

```
.next/
├── static/          # Static assets
├── server/          # Server-side code
└── standalone/      # Standalone deployment
```

### Environment Variables

For production, set these in your hosting platform:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_supabase_key
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect repository** to Vercel
2. **Set environment variables** in project settings
3. **Deploy** automatically on push

```bash
# Or deploy manually
npm install -g vercel
vercel
```

### Other Platforms

- **Netlify**: Add `netlify.toml` configuration
- **Railway**: Connect GitHub repo
- **Docker**: Use provided Dockerfile
- **Self-hosted**: Build and serve with Node.js

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed deployment instructions.

---

## 🔐 Authentication Setup

### Supabase Configuration

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Enable authentication providers** in Supabase dashboard:
   - Email/Password (enabled by default)
   - Google OAuth (optional)
   - GitHub OAuth (optional)

3. **Add your site URL** to allowed redirect URLs:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```

4. **Copy credentials** to `.env.local`

See [docs/OAUTH_SETUP_GUIDE.md](docs/OAUTH_SETUP_GUIDE.md) for detailed setup.

---

## 🎯 Usage Examples

### Starting a Chat

```typescript
// User types: "Find the best restaurants in Tokyo"

// Frontend generates messageId
const messageId = crypto.randomUUID();

// Send to backend
await fetch('/api/agent/run', {
  method: 'POST',
  body: JSON.stringify({
    prompt: "Find the best restaurants in Tokyo",
    messageId,
    sessionId,
  }),
});

// Receive real-time updates via WebSocket
// 1. Status: "Searching the web..."
// 2. Thinking: "I'll search for top-rated restaurants..."
// 3. Response: "Here are the best restaurants in Tokyo..."
```

### Managing Sessions

```typescript
// Create new session
const newSession = await createSession();

// Switch to existing session
await switchSession(sessionId);

// Delete session
await deleteSession(sessionId);

// Rename session
await renameSession(sessionId, "Tokyo Restaurants");
```

---

## 📱 Responsive Design

### Breakpoints

```typescript
// Mobile: 0-768px
// Tablet: 769px-1024px
// Desktop: 1025px+
```

### Mobile Features

- **Bottom sheet**: For session list
- **Swipe gestures**: Navigate between sessions
- **Touch-optimized**: Large tap targets
- **Responsive text**: Scales with viewport

---

## ♿ Accessibility

### Keyboard Navigation

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + N` | New chat |
| `Cmd/Ctrl + K` | Search sessions |
| `/` | Focus input |
| `Esc` | Close modals |

### Screen Reader Support

- Semantic HTML elements
- ARIA labels on interactive elements
- Live regions for dynamic content
- Focus management

### Standards Compliance

- WCAG AA minimum
- Color contrast 4.5:1+
- Keyboard accessible
- Screen reader tested

---

## 🐛 Troubleshooting

### Common Issues

**Issue**: Can't connect to backend
- **Solution**: Ensure backend is running on correct port
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

**Issue**: Authentication not working
- **Solution**: Verify Supabase credentials
- Check redirect URLs in Supabase dashboard

**Issue**: WebSocket connection failed
- **Solution**: Check CORS settings in backend
- Ensure WebSocket endpoint is accessible

See [docs/AUTH_TROUBLESHOOTING.md](docs/AUTH_TROUBLESHOOTING.md) for more help.

---

## 🔧 Development

### Development Scripts

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

### Code Style

- **ESLint**: For code linting
- **Prettier**: For code formatting (optional)
- **TypeScript**: Strict mode enabled

---

## 🤝 Integration with Backend

### Prerequisites

1. Backend running at `http://localhost:8000`
2. WebSocket endpoint at `/ws/log`
3. REST API at `/execute-task`

### Configuration

Update `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Testing Integration

```bash
# Terminal 1: Start backend
cd karyakarta-agent
uvicorn main:app --reload

# Terminal 2: Start frontend
cd karyakarta-ai
npm run dev
```

---

## 📈 Roadmap

### Current Features
- ✅ Real-time chat interface
- ✅ Session management
- ✅ Authentication
- ✅ Dark/light mode
- ✅ Responsive design

### Upcoming Features
- [ ] Voice input
- [ ] File uploads
- [ ] Export conversations
- [ ] Search in conversations
- [ ] User settings panel
- [ ] Collaborative sessions

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **Documentation**: See [docs/](docs/) folder
- **Backend API**: See [../karyakarta-agent/docs/](../karyakarta-agent/docs/)
- **Issues**: Create a GitHub issue
- **Setup Help**: See [SETUP_GUIDE.md](SETUP_GUIDE.md)

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components
- [Supabase](https://supabase.com/) - Backend as a service
- [Socket.IO](https://socket.io/) - Real-time communication

---

## 👥 Team

Maintained by the KaryaKarta Development Team

---

**Last Updated**: October 2025  
**Version**: 1.0.0  
**Status**: Production Ready

For backend documentation, see [../karyakarta-agent/README.md](../karyakarta-agent/README.md)
