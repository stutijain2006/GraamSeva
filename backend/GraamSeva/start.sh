#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

export PYTHONPATH=$(pwd)

echo "Waiting for DB..."
until python manage.py migrate --noinput; do
  echo "Retrying in 3s..."
  sleep 3
done

if [[ "${RUN_DB_SEED:-false}" == "true" ]]; then
  echo "Seeding database..."
  python manage.py seed_frontend_mock_data || echo "Seed failed, continuing..."
fi

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Starting Gunicorn..."
exec gunicorn GraamSeva.wsgi:application --bind 0.0.0.0:${PORT:-8000}