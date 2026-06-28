# Contributing to AI Guardian

Thank you for your interest in contributing to AI Guardian! This guide will help you get started.

## Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git

### Backend

```bash
cd backend
python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Code Style

### Python (Backend)

- Follow PEP 8 with a line length limit of 120 characters
- Use type hints for all function signatures
- Write docstrings for all public functions and classes
- Use `snake_case` for variables and functions, `PascalCase` for classes
- Keep modules focused — one responsibility per file

### TypeScript (Frontend)

- Use TypeScript strict mode — avoid `any` types
- Use functional components with hooks
- Keep components focused — one component per file
- Use named exports for components
- Use descriptive variable names

## Project Structure

```
backend/
├── app/
│   ├── config.py          # Settings & environment
│   ├── database.py        # SQLAlchemy engine & session
│   ├── main.py            # App factory
│   ├── middleware.py       # Rate limiting & security
│   ├── seed.py            # Demo data
│   ├── models/            # SQLAlchemy ORM models
│   ├── schemas/           # Pydantic request/response schemas
│   ├── services/          # Business logic layer
│   └── routes/            # FastAPI route handlers
├── tests/                 # Pytest test suite
└── requirements.txt

frontend/
├── src/
│   ├── App.tsx            # Application shell
│   ├── main.tsx           # Entry point
│   ├── styles.css         # Global styles
│   ├── lib/               # Shared utilities & hooks
│   ├── components/        # Reusable UI components
│   └── pages/             # Page-level components
├── index.html
└── package.json
```

## Making Changes

1. **Fork** the repository
2. **Create a branch** from `main`: `git checkout -b feature/your-feature`
3. **Make your changes** following the code style guidelines
4. **Add tests** for new functionality
5. **Run tests** to ensure nothing is broken:
   ```bash
   # Backend
   cd backend && pytest

   # Frontend
   cd frontend && npm run build
   ```
6. **Commit** with a clear message: `git commit -m "feat: add batch audit processing"`
7. **Push** to your fork: `git push origin feature/your-feature`
8. **Open a Pull Request** against `main`

## Commit Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `style:` — Code style (formatting, no logic change)
- `refactor:` — Code restructuring
- `test:` — Adding or updating tests
- `chore:` — Build process, dependency updates

## Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

All new API endpoints must have corresponding test coverage. Use the `conftest.py` fixtures for authenticated clients and sample data.

### Frontend

```bash
cd frontend
npm run build    # Type checking + production build
```

Ensure `tsc` reports no type errors and the build completes successfully.

## Reporting Issues

Please include:

1. Steps to reproduce the issue
2. Expected behavior
3. Actual behavior
4. Environment details (OS, Python version, Node version)
5. Relevant error messages or logs

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
