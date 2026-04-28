#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

python manage.py migrate --noinput
if [[ "${RUN_DB_SEED:-true}" == "true" ]]; then
	python manage.py seed_frontend_mock_data
fi
python manage.py collectstatic --noinput

exec gunicorn GraamSeva.wsgi:application --bind 0.0.0.0:${PORT:-8000}
