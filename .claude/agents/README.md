# DriveReady Custom Agents Team

This directory contains custom AI agents specialized for the DriveReady driving school management application.

## 🤖 Available Agents

### 1️⃣ Security Auditor 🔐
**File:** `security-auditor.yaml`

**Responsibilities:**
- Security vulnerability scanning
- RLS (Row Level Security) policy audit
- Secret and API key exposure detection
- Prompt injection attack prevention
- N8N webhook and workflow security
- Dependency vulnerability checks
- SQL injection and XSS prevention

**Use when:**
- Implementing authentication features
- Reviewing database security
- Auditing N8N workflows
- Before production deployment
- After adding new dependencies

---

### 2️⃣ Database Engineer 🗄️
**File:** `database-engineer.yaml`

**Responsibilities:**
- Database schema design and evolution
- Supabase migration file creation
- Seed data and default values
- RLS policy implementation
- Query optimization and indexing
- Data integrity management

**Use when:**
- Adding new tables or columns
- Modifying database schema
- Creating seed data functions
- Optimizing slow queries
- Setting up RLS policies

---

### 3️⃣ Test Specialist 🧪
**File:** `test-specialist.yaml`

**Responsibilities:**
- Unit test creation with Vitest
- Integration test development
- Component testing with React Testing Library
- Test coverage analysis
- Mock data creation
- Edge case identification

**Use when:**
- Adding new features (test-first)
- Fixing bugs (regression tests)
- Improving test coverage
- Refactoring code (ensure no breakage)
- Before major releases

---

### 4️⃣ UI Designer 🎨
**File:** `ui-designer.yaml`

**Responsibilities:**
- React component development
- Tailwind CSS styling
- shadcn/ui component integration
- Framer Motion animations
- Responsive design (mobile-first)
- Accessibility (WCAG compliance)
- Hebrew RTL text handling

**Use when:**
- Building new UI components
- Improving visual design
- Adding animations
- Making responsive layouts
- Implementing accessibility features
- Handling Hebrew text display

---

### 5️⃣ Integration Engineer 🔗
**File:** `integration-engineer.yaml`

**Responsibilities:**
- React Query (TanStack Query) implementation
- Supabase client integration
- Custom hooks development
- Data fetching and caching
- Error handling and retry logic
- N8N webhook integration

**Use when:**
- Creating new data fetching hooks
- Integrating external APIs
- Implementing real-time features
- Setting up N8N workflows
- Optimizing data caching

---

### 6️⃣ Logic Validator 🧠
**File:** `logic-validator.yaml`

**Responsibilities:**
- Business logic verification
- Edge case identification and testing
- Mathematical calculation validation
- Data consistency checks
- Business rule enforcement
- Formula accuracy verification

**Use when:**
- Implementing complex calculations
- Verifying readiness formulas
- Testing edge cases
- Ensuring data consistency
- Validating business rules

---

## 🚀 How to Use Agents

### Option 1: Team-Based Work (Recommended for complex tasks)

Create a team with multiple agents:

```bash
# Example: Feature development with full stack
Team: Database Engineer + Integration Engineer + UI Designer + Test Specialist
```

### Option 2: Individual Agent

Invoke a single agent for focused work:

```bash
# Example: Security audit before deployment
Agent: Security Auditor
```

### Option 3: Sequential Work

Use agents in sequence for phased development:

```bash
1. Database Engineer → Create schema
2. Integration Engineer → Build hooks
3. UI Designer → Create components
4. Test Specialist → Write tests
5. Logic Validator → Verify correctness
6. Security Auditor → Final security check
```

---

## 📋 Common Workflows

### Adding a New Feature

1. **Database Engineer** - Design schema and migration
2. **Integration Engineer** - Create data fetching hooks
3. **UI Designer** - Build UI components
4. **Test Specialist** - Write comprehensive tests
5. **Logic Validator** - Verify business logic
6. **Security Auditor** - Security review

### Bug Fix

1. **Logic Validator** - Identify root cause
2. **Test Specialist** - Write regression test
3. **Relevant Agent** - Implement fix
4. **Test Specialist** - Verify all tests pass

### Security Review

1. **Security Auditor** - Full security scan
2. **Database Engineer** - Review RLS policies
3. **Integration Engineer** - Check API security
4. **Security Auditor** - Final verification

### Performance Optimization

1. **Logic Validator** - Identify bottlenecks
2. **Database Engineer** - Optimize queries
3. **Integration Engineer** - Improve caching
4. **Test Specialist** - Performance benchmarks

---

## 🎯 Agent Specializations

| Agent | Tools | Focus | When to Use |
|-------|-------|-------|-------------|
| Security Auditor | Bash, Read, Grep, Edit | Security, RLS, Secrets | Pre-deployment, Auth work |
| Database Engineer | Bash, Read, Grep, Edit | Schema, Migrations, RLS | DB changes, Optimizations |
| Test Specialist | Bash, Read, Grep, Edit | Tests, Coverage, Quality | TDD, Bug fixes, Refactoring |
| UI Designer | Read, Grep, Edit | Components, Styling, A11y | UI work, Animations, RTL |
| Integration Engineer | Read, Grep, Edit | Hooks, APIs, State | Data fetching, N8N, Cache |
| Logic Validator | Bash, Read, Grep | Calculations, Validation | Complex logic, Formulas |

---

## 📖 Best Practices

1. **Choose the Right Agent** - Match the task to the agent's expertise
2. **Team Coordination** - Use multiple agents for complex features
3. **Sequential Tasks** - Some agents naturally follow others (DB → Integration → UI)
4. **Security First** - Run Security Auditor before production deployments
5. **Test Everything** - Test Specialist should validate all changes
6. **Document Changes** - Agents should document their work
7. **Validate Logic** - Logic Validator should review calculations
8. **Iterate** - Agents can refine each other's work

---

## 🔄 Agent Maintenance

Agents are defined in YAML files and can be:
- **Updated** - Modify YAML to add capabilities
- **Extended** - Add new focus areas
- **Customized** - Tailor to project needs
- **Versioned** - Track changes with version field

---

## 📚 Related Documentation

- **AGENTS_ROADMAP.md** - Future agents and enhancements
- **ACTUAL_VS_SPEC.md** - Specification vs implementation
- **FUTURE_FEATURES.md** - Planned features roadmap
- **README.md** - Project overview and setup

---

## 💡 Tips

- Start with Logic Validator to understand requirements
- Always include Test Specialist in your workflow
- Run Security Auditor before any deployment
- Use Database Engineer for all schema changes
- Let UI Designer handle all component work
- Integration Engineer should manage all data flow

---

**Version:** 1.0.0
**Last Updated:** 2026-02-18
**Project:** DriveReady Dashboard
