#!/bin/sh
set -e

echo "Waiting for PostgreSQL..."
while ! uv run python -c "
from sqlalchemy import create_engine, text
engine = create_engine('$DATABASE_URL')
with engine.connect() as c:
    c.execute(text('SELECT 1'))
" 2>/dev/null; do
  sleep 1
done
echo "PostgreSQL is ready."

echo "Initializing database..."
uv run python init_db.py

echo "Starting API server..."
exec uv run uvicorn app.main:app --host 0.0.0.0 --port 4000 --reload
