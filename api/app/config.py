from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/techbox"
    SECRET_KEY: str = "techbox-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    LIQPAY_PUBLIC_KEY: str = ""
    LIQPAY_PRIVATE_KEY: str = ""
    LIQPAY_RESULT_URL: str = "http://localhost:5182/order-success"
    LIQPAY_SERVER_URL: str = "http://localhost:4000/api/liqpay/callback"

    GEMINI_API_KEY: str = ""

    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:4000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5182",
        "http://localhost:5183",
        "http://localhost:5184",
        "http://localhost:5185",
    ]

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
