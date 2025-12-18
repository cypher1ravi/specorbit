# SpecOrbit - Complete Tech Stack Analysis & Recommendations

**Comprehensive Technical Stack Deep Dive**

---

## EXECUTIVE SUMMARY

This document provides detailed analysis of technology choices for building SpecOrbit, including alternatives, trade-offs, and specific package recommendations for MVP and scaling phases.

---

## PART 1: FRONTEND TECHNOLOGY STACK

### Option A: React + TypeScript (RECOMMENDED) ⭐

**Why React?**
- **Largest ecosystem** - Millions of npm packages
- **Component reusability** - Accelerates development
- **Strong typing with TS** - Fewer runtime errors
- **Excellent tooling** - Vite, ESLint, Prettier
- **Job market** - Easiest to hire developers
- **Performance** - Virtual DOM optimizations
- **Your expertise** - You've built with React (Folify)

**Why TypeScript?**
- Catches bugs at compile time
- Better IDE autocomplete
- Easier refactoring
- Self-documenting code through types
- Reduces runtime errors by ~15-30%

**Why Vite over Create React App?**
- **Build speed:** Vite is 10x faster (300ms vs 3s)
- **Dev server:** Instant HMR (Hot Module Replacement)
- **Bundle size:** Similar, but faster
- **Config:** Simpler Vite config vs CRA (eject required)
- **Modern:** Uses ES modules natively

**Core Frontend Dependencies:**

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.3.0",
  "@types/react": "^18.2.0",
  "@types/react-dom": "^18.2.0",
  
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0",
  
  "tailwindcss": "^3.3.0",
  "postcss": "^8.4.0",
  "autoprefixer": "^10.4.0",
  
  "@radix-ui/react-dialog": "^1.1.0",
  "@radix-ui/react-dropdown-menu": "^2.0.0",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-tabs": "^1.0.0",
  
  "@tanstack/react-query": "^5.25.0",
  "@tanstack/react-router": "^1.0.0",
  
  "react-hook-form": "^7.48.0",
  "zod": "^3.22.0",
  "@hookform/resolvers": "^3.3.0",
  
  "axios": "^1.6.0",
  "zustand": "^4.4.0",
  
  "swaggerui-express": "^4.6.0",
  "redoc": "^2.1.0",
  
  "lucide-react": "^0.294.0",
  "date-fns": "^2.30.0",
  "clsx": "^2.0.0"
}
```

**Alternative Frameworks Comparison:**

| Framework | Bundle | Learning | Performance | Hiring | Scale |
|-----------|--------|----------|-------------|--------|-------|
| **React** | 40KB | Easy | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Vue.js | 35KB | Very Easy | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Svelte | 15KB | Moderate | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| Angular | 200KB | Hard | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |

**Verdict:** React wins for SpecOrbit due to ecosystem size, your expertise, and hiring ease. Svelte is faster but limited hiring pool.

---

### State Management: TanStack Query vs Redux vs Zustand

**TanStack Query (RECOMMENDED for server state)** ⭐

Why it's best for SpecOrbit:
- Solves server state (API responses, caching)
- Built-in background refetching
- Automatic cache invalidation
- Handles loading/error states
- No boilerplate

```typescript
// Example: Fetching projects
const { data: projects, isLoading, error } = useQuery({
  queryKey: ['projects'],
  queryFn: async () => {
    const response = await axios.get('/api/projects');
    return response.data;
  },
});

// Automatic refetching, caching, deduplication
```

**Zustand (RECOMMENDED for UI state)** ⭐

Why it's best for UI state:
- Minimal boilerplate
- Easy to understand
- Excellent TypeScript support
- Tiny bundle size (2KB)
- Can sync to localStorage

```typescript
// Example: UI state
const useUIStore = create((set) => ({
  sidebarOpen: true,
  darkMode: false,
  toggleSidebar: () => set((state) => ({
    sidebarOpen: !state.sidebarOpen,
  })),
}));
```

**Redux: NOT recommended** ❌
- Overkill for SpecOrbit
- Massive boilerplate
- TanStack Query handles 90% of use case
- Use Zustand for remaining 10%

---

### Routing: TanStack Router

**Why TanStack Router over React Router?**

```typescript
// React Router (traditional)
<Routes>
  <Route path="/projects/:id" element={<ProjectDetail />} />
</Routes>

// TanStack Router (type-safe)
const route = createFileRoute('/projects/$id')({
  component: ProjectDetail,
  // $id is type-safe, auto-completion works!
});
```

TanStack Router advantages:
- Type-safe route parameters
- Better error boundaries
- Loader functions (like Next.js)
- Code splitting built-in
- Better DX overall

---

### UI Component Library: Shadcn/ui + Radix UI

**Why Shadcn/ui?**
- Copy-paste components (not npm install)
- Full control over code
- Styled with Tailwind CSS
- Accessible (WCAG compliant)
- Headless (no pre-built styles to fight)

**Essential Components for SpecOrbit:**
```
- Button
- Dialog / Modal
- Dropdown Menu
- Select
- Tabs
- Input / Textarea
- Alert / Toast
- Card
- Badge
- Skeleton (loading)
- Popover
- Command palette
```

**Installation:**
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
# ... etc for each component
```

---

### Styling: Tailwind CSS

**Why Tailwind over CSS Modules or Styled Components?**

```html
<!-- Tailwind (utility-first) -->
<button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
  Click me
</button>

<!-- CSS Modules (harder to maintain) -->
<button className={styles.button}>Click me</button>
<!-- plus styles.module.css with lots of selectors -->

<!-- Styled Components (slower, larger bundle) -->
const StyledButton = styled.button`...`;
```

Tailwind advantages:
- Fastest development
- Smallest CSS output with PurgeCSS
- Easy theming
- Dark mode built-in
- Responsive utilities

**Tailwind Configuration for SpecOrbit:**
```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        primary: '#2180a0', // Your brand blue
        secondary: '#5e5240', // Your brand brown
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
```

---

### Forms: React Hook Form + Zod

**Why React Hook Form?**
- Minimal re-renders (uncontrolled by default)
- Smaller bundle than Formik
- TypeScript-first
- Built-in validation

**Why Zod for validation?**
- Lightweight (8KB vs 25KB for Yup)
- TypeScript-native
- Excellent error messages
- Can create types from schemas

**Example:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  githubUrl: z.string().url('Invalid GitHub URL'),
  language: z.enum(['javascript', 'python', 'java']),
});

type ProjectFormData = z.infer<typeof projectSchema>;

function ProjectForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
    </form>
  );
}
```

---

### Testing: Vitest + React Testing Library

**Why Vitest over Jest?**
- 10x faster than Jest (ViteJS-based)
- Drop-in Jest replacement
- Works with Vite's configuration
- Excellent TypeScript support

**React Testing Library Approach:**
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('submits form with project name', async () => {
  const { getByLabelText, getByRole } = render(<ProjectForm />);
  const input = getByLabelText(/project name/i);
  const button = getByRole('button', { name: /create/i });

  await userEvent.type(input, 'My API');
  await userEvent.click(button);

  // Assert submission happened
});
```

**Philosophy:** Test user behavior, not implementation details.

---

## PART 2: BACKEND TECHNOLOGY STACK

### Runtime & Framework: Node.js 20 LTS + Express.js

**Why Node.js?**
- JavaScript on both frontend and backend
- Single language = faster development
- Excellent async/await support
- Perfect for I/O-heavy operations
- Large package ecosystem (npm)
- Your expertise

**Why Express.js?**
- Lightweight and flexible
- Largest Node.js framework ecosystem
- Excellent middleware system
- Battle-tested in production
- Easy to understand codebase

**Why NOT alternatives?**
- **NestJS:** Too opinionated/heavy for MVP
- **Fastify:** Marginal performance gain, less ecosystem
- **Hono:** Too new, limited integrations
- **Koa:** Smaller ecosystem than Express

**Node.js Setup:**
```bash
node -v  # Should be v20.10.0 or later
npm -v   # Should be 10.2.0 or later
```

---

### TypeScript in Node.js

**Setup with tsx:**
```bash
npm install -D typescript tsx @types/node
```

**typescript.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

**Run TypeScript directly (no compilation step):**
```bash
npx tsx src/index.ts
```

---

### Database: PostgreSQL 16

**Why PostgreSQL over MongoDB?**

| Feature | PostgreSQL | MongoDB |
|---------|-----------|---------|
| **ACID Transactions** | ✅ Strict | ⚠️ Session level |
| **JOIN Queries** | ✅ Powerful | ❌ Limited |
| **Data Integrity** | ✅ Constraints | ❌ No constraints |
| **JSON Support** | ✅ JSONB (best of both) | ✅ Native |
| **Scaling** | ✅ Partitioning | ✅ Sharding |
| **Cost** | Low | Moderate |
| **Learning Curve** | ⭐⭐⭐ | ⭐⭐ |

**Verdict:** PostgreSQL wins for SpecOrbit because:
- Need strict data integrity for API specs
- Complex queries (joins for teams, projects, specs)
- JSONB allows flexible schema when needed
- Better performance for structured data

**Key PostgreSQL Features:**
```sql
-- JSONB: Store flexible data within relational schema
CREATE TABLE openapi_specs (
  id UUID PRIMARY KEY,
  spec_json JSONB NOT NULL,  -- Full OpenAPI spec as JSON
  created_at TIMESTAMP
);

-- GIN Indexes: Query JSONB efficiently
CREATE INDEX idx_spec_methods ON openapi_specs USING GIN (spec_json);

-- GENERATED COLUMNS: Computed columns
ALTER TABLE projects ADD COLUMN is_active GENERATED ALWAYS AS (
  deleted_at IS NULL
) STORED;
```

---

### ORM: Prisma

**Why Prisma over TypeORM or Sequelize?**

```typescript
// Prisma: Clean, intuitive API
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' },
  include: { projects: true },
});

// TypeORM: More boilerplate, verbose
const user = await userRepository.findOne({
  where: { email: 'user@example.com' },
  relations: ['projects'],
});
```

**Prisma Advantages:**
- Auto-generated types from schema
- Zero boilerplate migrations
- Excellent TypeScript support
- Visual database GUI (Prisma Studio)
- Query logging for debugging

**Prisma Installation:**
```bash
npm install @prisma/client
npm install -D prisma typescript ts-node

# Initialize
npx prisma init

# Create migration
npx prisma migrate dev --name initial_schema

# View database GUI
npx prisma studio
```

**Prisma Schema Example:**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  projects  Project[]
  teams     Team[]
  createdAt DateTime @default(now())
}

model Project {
  id        String   @id @default(cuid())
  name      String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  specs     OpenAPISpec[]
  createdAt DateTime @default(now())
}

model OpenAPISpec {
  id        String   @id @default(cuid())
  projectId String
  project   Project  @relation(fields: [projectId], references: [id])
  version   String
  specJson  Json     // JSONB in PostgreSQL
  createdAt DateTime @default(now())
}
```

---

### Authentication: Passport.js + JWT + OAuth2

**Architecture:**

```
Request with JWT
    ↓
Passport JWT Strategy
    ↓
Verify token signature
    ↓
Extract userId from token
    ↓
Load user from database
    ↓
Attach user to req.user
```

**JWT Token Structure:**
```
Header: { alg: "HS256", typ: "JWT" }
Payload: { sub: userId, iat: timestamp, exp: expiration }
Signature: HMAC(header.payload, secret)
```

**Passport.js Setup:**
```javascript
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as GitHubStrategy } from 'passport-github';

// JWT Strategy
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
      });
      return done(null, user || false);
    }
  )
);

// GitHub OAuth Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:3000/api/auth/github/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await prisma.user.findUnique({
        where: { githubId: profile.id },
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            githubId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          },
        });
      }
      return done(null, user);
    }
  )
);
```

**Token Refresh Strategy:**
```typescript
// Tokens
interface Tokens {
  accessToken: string;  // 15 minutes
  refreshToken: string; // 7 days
}

function generateTokens(userId: string): Tokens {
  return {
    accessToken: jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
      expiresIn: '15m',
    }),
    refreshToken: jwt.sign(
      { sub: userId, type: 'refresh' },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: '7d' }
    ),
  };
}

// Store refresh token in database (for revocation)
await prisma.refreshToken.create({
  data: {
    userId,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});
```

---

### Code Parsing: AST Parsers

**For Express.js:**

Option 1: **@babel/parser** (Recommended) ⭐
```typescript
import * as babelParser from '@babel/parser';

const code = `
app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});
`;

const ast = babelParser.parse(code, {
  sourceType: 'module',
  plugins: ['typescript'],
});

// Traverse AST to find route definitions
traverse(ast, {
  CallExpression(path) {
    if (path.node.callee.object?.name === 'app') {
      // This is an app.get(), app.post(), etc.
      const method = path.node.callee.property.name;
      const path = path.node.arguments[0].value;
      const handler = path.node.arguments[1];
      // Extract parameter info, response type, etc.
    }
  },
});
```

Option 2: **ts-morph** (For TypeScript)
```typescript
import { Project } from 'ts-morph';

const project = new Project();
const sourceFile = project.addSourceFileAtPath('src/api.ts');

// Find route definitions
sourceFile.getStatements().forEach((stmt) => {
  // Analyze each statement
});
```

Option 3: **swag-autogen**
```typescript
import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: { title: 'My API', version: '1.0.0' },
};

swaggerAutogen()(
  './dist/swagger-output.json',
  ['./src/routes/**/*.ts'],
  doc
);
```

**Verdict:** Use **ts-morph** for MVP (handles TypeScript natively, more reliable).

---

### OpenAPI & Spec Validation

**Packages:**

```json
{
  "swagger-jsdoc": "^6.2.0",
  "@apidevtools/swagger-parser": "^10.1.0",
  "openapi-types-ts": "^1.0.0",
  "openapi-enforcer": "^1.30.0",
  "jsonschema": "^1.4.0"
}
```

**Example: Generate and validate spec**

```typescript
import SwaggerParser from '@apidevtools/swagger-parser';

async function validateSpec(spec: OpenAPI.Document) {
  try {
    // Validate against OpenAPI 3.0 standard
    const validated = await SwaggerParser.validate(spec);
    console.log('✅ Spec is valid');
    return validated;
  } catch (err) {
    console.error('❌ Spec validation failed:', err.message);
    throw err;
  }
}
```

---

### Documentation Generation: Swagger UI Express + ReDoc

**Swagger UI Express:**
```typescript
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger-output.json';

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui { font-family: "Inter", sans-serif; }',
  swaggerOptions: { persistAuthorization: true },
}));
```

**ReDoc (Alternative, beautiful):**
```typescript
import redoc from 'redoc-express';

app.get('/api/docs', redoc({
  title: 'SpecOrbit API',
  specUrl: '/api/openapi.json',
}));
```

**Which to choose?**
- **Swagger UI:** More interactive, test endpoints
- **ReDoc:** More beautiful, better for reading

Use both! Swagger for testing, ReDoc for sharing.

---

### Background Jobs: Bull Queue

**Why Bull over Agenda or BullMQ?**
- Redis-backed (you already have Redis)
- Built-in retry logic
- Job scheduling
- Progress tracking
- Web dashboard available

```typescript
import Queue from 'bull';

const syncQueue = new Queue('api-sync', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  },
});

// Producer: Add job
syncQueue.add(
  {
    projectId: '123',
    githubUrl: 'https://github.com/user/repo',
  },
  {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
  }
);

// Consumer: Process job
syncQueue.process(async (job) => {
  console.log(`Processing sync for project ${job.data.projectId}`);
  
  // 1. Clone repo
  // 2. Parse code
  // 3. Generate spec
  // 4. Store in DB
  // 5. Generate docs
  
  return { success: true };
});

// Progress tracking
job.progress(50); // 50% done
```

---

### Validation: Zod + Joi

**Use Zod for API request/response validation:**
```typescript
import { z } from 'zod';
import { Router } from 'express';

const createProjectSchema = z.object({
  name: z.string().min(1),
  githubUrl: z.string().url(),
  language: z.enum(['javascript', 'python', 'java']),
});

router.post('/projects', async (req, res) => {
  try {
    const data = createProjectSchema.parse(req.body);
    // data is now typed as { name, githubUrl, language }
    const project = await prisma.project.create({ data });
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
});
```

**Use Joi for complex business logic validation:**
```typescript
import Joi from 'joi';

const apiSpecSchema = Joi.object({
  openapi: Joi.string().required(),
  info: Joi.object({
    title: Joi.string().required(),
    version: Joi.string().required(),
  }),
  paths: Joi.object().required(),
});

const { error, value } = apiSpecSchema.validate(spec);
```

---

### Logging: Winston

**Structured logging for production debugging:**

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Usage
logger.info('API sync started', { projectId: '123' });
logger.error('Spec validation failed', { error: e.message });
```

---

## PART 3: DATABASE & CACHING

### PostgreSQL Hosting Options

| Provider | Price | Managed | Backup | Failover |
|----------|-------|---------|--------|----------|
| **Railway** | $10-50/mo | ✅ | ✅ Daily | N/A |
| **AWS RDS** | $15-200+/mo | ✅ | ✅ Auto | ✅ Multi-AZ |
| **Supabase** | Free-$150+/mo | ✅ | ✅ Weekly | ✅ Enterprise |
| **Self-hosted** | $5/mo VM | ❌ | Manual | Manual |

**Recommendation for MVP:** Railway or Supabase (simplest, cheapest)

---

### Redis Hosting Options

| Provider | Price | Free Tier | Limits |
|----------|-------|-----------|--------|
| **Redis Cloud** | $15-200+/mo | 30MB | Generous |
| **Upstash** | Pay-per-request | 10,000 commands/day | Good for early stage |
| **Railway** | $5-20/mo | None | Part of Railway |

**Recommendation:** Railway Redis (included with Railway plan)

---

### Connection Pooling

**For PostgreSQL (use PgBouncer via Prisma):**
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
}
```

**Connection pool configuration:**
- Pool size: 20-50 connections
- Max overflowed: 10
- Idle timeout: 30 seconds

---

## PART 4: DEPLOYMENT & INFRASTRUCTURE

### Container: Docker

**Dockerfile for Node.js + TypeScript:**

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app

# Install dumb-init to handle signals properly
RUN apk add --no-cache dumb-init

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Use dumb-init to prevent zombie processes
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
```

**docker-compose.yml for local development:**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: SpecOrbit
      POSTGRES_USER: SpecOrbit
      POSTGRES_PASSWORD: dev_password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      DATABASE_URL: postgresql://SpecOrbit:dev_password@postgres:5432/SpecOrbit
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
```

**Run locally:**
```bash
docker-compose up
# App runs on http://localhost:3000
```

---

### Deployment: Railway or Render

**Railway (Recommended) ⭐**

Pros:
- ✅ Simplest deployment
- ✅ Automatic git integration
- ✅ Environment variables GUI
- ✅ Database included
- ✅ Redis included
- ✅ Affordable ($5-20/mo)

Steps:
1. Push code to GitHub
2. Connect to Railway
3. Add environment variables
4. Deploy (automatic on git push)

**Render**

Pros:
- ✅ Free tier available
- ✅ PostgreSQL free tier (7 days retention)
- ✅ Similar to Railway

Cons:
- ❌ Slower deployments
- ❌ Database free tier limited

---

### CI/CD: GitHub Actions

**Deploy on every push to main:**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: npm install -g @railway/cli && railway deploy
```

---

## PART 5: DEVELOPMENT WORKFLOW

### Package Manager: npm (included with Node.js)

**Version:** npm 10+ (comes with Node.js 20+)

**Essential commands:**
```bash
npm install              # Install dependencies
npm run dev            # Start dev server with nodemon
npm run build          # TypeScript compilation
npm run test           # Run Jest tests
npm run lint           # ESLint + Prettier
npm run type-check     # TypeScript type checking
npm start              # Start production server
```

---

### Linting & Formatting: ESLint + Prettier

**.eslintrc.json:**
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],
    "@typescript-eslint/explicit-function-return-types": "warn"
  }
}
```

**.prettierrc:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

**Run:**
```bash
npm run lint              # Check for errors
npm run lint:fix          # Auto-fix issues
npm run format            # Auto-format code
```

---

### Testing: Jest + Supertest

**jest.config.js:**
```javascript
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  coverageThreshold: {
    global: { branches: 80, functions: 80, lines: 80 },
  },
};
```

**Example test:**
```typescript
import request from 'supertest';
import app from '../app';

describe('Projects API', () => {
  it('creates a new project', async () => {
    const response = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Project',
        githubUrl: 'https://github.com/user/repo',
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
```

---

## COMPARISON TABLE: All Tech Choices

| Layer | Choice | Alternative | Why |
|-------|--------|-----------|-----|
| **Frontend** | React 18 | Vue.js, Svelte | Ecosystem, hiring, your expertise |
| **Frontend Build** | Vite | Webpack, Turbopack | Speed, DX |
| **State (Server)** | TanStack Query | Redux, Zustand | Built for API state |
| **State (UI)** | Zustand | Jotai, Recoil | Simplicity |
| **Styling** | Tailwind | Styled Components | Speed, DX |
| **UI Components** | Shadcn/ui | MUI, AntD | Control, customization |
| **Forms** | React Hook Form | Formik, Final Form | Lightweight, performance |
| **Validation** | Zod | Yup, Joi | TypeScript-native |
| **Routing** | TanStack Router | React Router | Type-safety |
| **Backend** | Express | Fastify, NestJS | Simplicity, ecosystem |
| **Language** | TypeScript | JavaScript | Type safety, DX |
| **ORM** | Prisma | TypeORM, Sequelize | DX, types |
| **Database** | PostgreSQL | MongoDB, MySQL | ACID, JSON support |
| **Cache** | Redis | Memcached | Features, simplicity |
| **Auth** | Passport + JWT | Auth0, NextAuth | Open source, control |
| **Code Parsing** | ts-morph | @babel/parser | Type support |
| **OpenAPI** | swagger-jsdoc | @apidevtools/swagger-parser | Generation, validation |
| **Jobs** | Bull | Agenda, BullMQ | Redis integration |
| **Logging** | Winston | Pino, Bunyan | Features, ecosystem |
| **Testing** | Vitest + RTL | Jest, Mocha | Speed, modern |
| **Deployment** | Railway | Render, Railway | Simplicity, affordability |
| **CI/CD** | GitHub Actions | CircleCI, GitLab CI | Free with GitHub |

---

## FINAL RECOMMENDATION SUMMARY

### Minimal Stack (MVP - ≤2 developers, 16 weeks)

```
Frontend:
- React 18 + TypeScript
- Vite build
- TailwindCSS styling
- Shadcn/ui components
- TanStack Query + Router
- React Hook Form + Zod
- Axios for API calls

Backend:
- Node.js 20 LTS
- Express.js
- TypeScript
- PostgreSQL (Railway)
- Redis (Railway)
- Prisma ORM
- Passport.js + JWT for auth
- ts-morph for code parsing
- swagger-jsdoc for OpenAPI
- Swagger UI Express for docs
- Bull for background jobs
- Winston for logging
- Jest + Supertest for testing

DevOps:
- Docker for containerization
- Railway for hosting (backend + db + redis)
- Vercel for frontend
- GitHub Actions for CI/CD
- Sentry for error tracking

Total Monthly Cost: $25-40
```

This stack gets you to MVP in 16 weeks with proven reliability, excellent DX, and easy hiring for future team members.

---

**Document Version:** 1.0
**Last Updated:** December 13, 2025
