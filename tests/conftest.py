import os


# Keep the test suite self-contained; deployments still use DATABASE_URL from
# the environment or docker-compose.
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")