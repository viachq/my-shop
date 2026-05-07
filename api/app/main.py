import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import Base, engine
from app.routers import ai, analytics, auth, liqpay, orders, products, promocodes, reviews, users
from app.routers import settings as settings_router

logger = logging.getLogger(__name__)

app = FastAPI(
    title="TechBox API",
    description="Backend API for TechBox electronics & gadgets e-commerce platform",
    version="1.0.0",
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

# CORS — must be added before other middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(liqpay.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(promocodes.router, prefix="/api")
app.include_router(settings_router.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error on %s %s: %s", request.method, request.url, exc, exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.get("/")
def root():
    return {"message": "TechBox API", "docs": "/docs"}
