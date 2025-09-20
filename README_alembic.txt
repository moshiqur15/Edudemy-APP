# For production DB migrations use Alembic.
# Quick steps to initialize alembic (run locally):
# 1. pip install alembic
# 2. alembic init alembic
# 3. edit alembic.ini to point SQLALCHEMY URL to DATABASE_URL
# 4. generate migration: alembic revision --autogenerate -m "init"
# 5. alembic upgrade head

# If you prefer SQLModel's create_all during development, keep using `init_db()` as in main.py
