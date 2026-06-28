# AI Guardian — Architecture

> Enterprise decision-intelligence control plane for explaining, remembering, and governing AI outcomes.

## System Architecture

```mermaid
flowchart TB
    subgraph Client["Frontend — React 19 + Vite"]
        UI[Control Plane UI]
        Auth[Auth Module]
        Charts[Chart.js Analytics]
    end

    subgraph API["Backend — FastAPI"]
        Routes[REST API Routes]
        MW[Security Middleware]
        Services[Business Services]
    end

    subgraph Intelligence["AI Intelligence Layer"]
        CF[cascadeflow<br/>Runtime Router]
        EX[Explainer Service<br/>Groq / Fallback]
        HS[Hindsight<br/>Memory Service]
    end

    subgraph Data["Data Layer"]
        DB[(PostgreSQL / SQLite)]
        PDF[ReportLab<br/>PDF Generator]
    end

    UI --> Routes
    Auth --> Routes
    Routes --> MW
    MW --> Services
    Services --> CF
    Services --> EX
    Services --> HS
    Services --> DB
    Services --> PDF
    CF --> EX
    HS --> DB
```

## Module Architecture

```mermaid
graph LR
    subgraph Backend["backend/app/"]
        main[main.py<br/>App Factory]
        config[config.py<br/>Settings]
        database[database.py<br/>Engine & Session]
        middleware[middleware.py<br/>Rate Limit & Headers]
        seed[seed.py<br/>Demo Data]

        subgraph Models["models/"]
            user_m[user.py]
            audit_m[audit.py]
            model_m[model.py]
            logs_m[logs.py]
            system_m[system.py]
        end

        subgraph Schemas["schemas/"]
            auth_s[auth.py]
            audit_s[audit.py]
        end

        subgraph Services["services/"]
            auth_sv[auth.py]
            router_sv[router.py]
            explainer_sv[explainer.py]
            memory_sv[memory.py]
            report_sv[report.py]
        end

        subgraph Routes["routes/"]
            auth_r[auth.py]
            audit_r[audit.py]
            intel_r[intelligence.py]
            dash_r[dashboard.py]
        end
    end

    main --> config
    main --> database
    main --> middleware
    main --> seed
    main --> Routes
    Routes --> Services
    Services --> Models
    Routes --> Schemas
```

## Frontend Architecture

```mermaid
graph TB
    subgraph Frontend["frontend/src/"]
        app[App.tsx<br/>Shell & Router]

        subgraph Lib["lib/"]
            api[api.ts]
            types[types.ts]
            utils[utils.ts]
            hooks[hooks.ts]
            chart[chartConfig.ts]
        end

        subgraph Components["components/"]
            sidebar[Sidebar]
            header[Header]
            badge[Badge]
            stat[Stat]
            score[Score]
            skeleton[Skeleton]
            table[DataTable]
        end

        subgraph Pages["pages/"]
            auth_p[Auth]
            dash_p[Dashboard]
            new_p[NewAudit]
            hist_p[History]
            mem_p[Memory]
            fair_p[Fairness]
            drift_p[Drift]
            route_p[Routing]
            anal_p[Analytics]
            rep_p[Reports]
            set_p[Settings]
        end
    end

    app --> Lib
    app --> Pages
    Pages --> Components
    Pages --> Lib
    Components --> Lib
```

## AI Decision Workflow

```mermaid
sequenceDiagram
    participant User
    participant API as FastAPI
    participant CF as cascadeflow
    participant LLM as Groq LLM
    participant HS as Hindsight
    participant DB as Database

    User->>API: POST /analyze (decision data)
    API->>CF: Evaluate complexity & budget
    CF-->>API: Select model tier + reason

    API->>LLM: Generate explanation
    LLM-->>API: Explanation + confidence + risk

    API->>DB: Store Audit record
    API->>DB: Store RoutingLog + CostLog

    API->>HS: retain(audit summary)
    HS-->>API: Memory stored

    API->>DB: Store MemoryLog
    API-->>User: Audit result + routing trace

    Note over User,DB: Every step is logged for auditability
```

## Database Schema

```mermaid
erDiagram
    USERS ||--o{ AUDITS : owns
    USERS ||--o{ FEEDBACK : gives
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--|| SETTINGS : has

    AUDITS ||--o{ AUDIT_REPORTS : generates
    AUDITS ||--o{ FEEDBACK : receives
    AUDITS ||--o{ MEMORY_LOGS : records
    AUDITS ||--o{ BIAS_LOGS : analyzes
    AUDITS ||--o{ ROUTING_LOGS : routes
    AUDITS ||--o{ COST_LOGS : costs

    MODELS ||--o{ MODEL_VERSIONS : versions

    USERS {
        int id PK
        string email UK
        string full_name
        string password_hash
        string role
        boolean is_active
        datetime created_at
    }

    AUDITS {
        int id PK
        string reference UK
        int owner_id FK
        string subject_name
        string decision_type
        string decision
        json source_data
        text explanation
        text technical_explanation
        json recommendations
        float confidence
        float risk_score
        string status
        datetime created_at
    }

    ROUTING_LOGS {
        int id PK
        int audit_id FK
        string complexity
        string selected_model
        string provider
        text reason
        int tokens
        float latency_ms
        float cost_usd
        float budget_usd
        datetime created_at
    }

    BIAS_LOGS {
        int id PK
        int audit_id FK
        string protected_attribute
        float score
        string severity
        json details
        datetime created_at
    }
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 | UI framework |
| Bundler | Vite | Build tool |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Animation | Framer Motion | Page transitions & micro-animations |
| Charts | Chart.js + react-chartjs-2 | Analytics visualizations |
| Icons | Lucide React | Consistent icon set |
| Forms | React Hook Form | Form validation |
| HTTP | Axios | API communication |
| Backend | FastAPI | REST API framework |
| ORM | SQLAlchemy 2.0 | Database abstraction |
| Validation | Pydantic | Request/response schemas |
| Auth | python-jose (JWT) | Token-based auth |
| PDF | ReportLab | Audit report generation |
| AI | Groq API | LLM inference |
| Memory | Hindsight | Long-term audit memory |
| Routing | cascadeflow | Intelligent model routing |
| Database | PostgreSQL / SQLite | Data persistence |
