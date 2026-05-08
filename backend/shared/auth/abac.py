"""
ABAC (Attribute-Based Access Control) — control de acceso por nivel de clearance.
Lee el principal del request.state poblado por el middleware JWT (ver app/main.py).
"""
from fastapi import HTTPException, Request, status

CLEARANCE_ORDER = {
    "OPEN": 0,
    "RESTRICTED": 1,
    "CONFIDENTIAL": 2,
    "SECRET": 3,
    "TOP_SECRET": 4,
}


def require_clearance(min_level: str):
    """
    Devuelve una dependencia FastAPI que exige un nivel mínimo de clearance.
    El JWT debe haberse decodificado previamente y haber poblado
    `request.state.principal` con el payload del token.
    """

    async def dep(request: Request) -> dict:
        principal = getattr(request.state, "principal", None)
        if not principal:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="no auth principal",
            )
        subj = CLEARANCE_ORDER.get(principal.get("clearance", "OPEN"), 0)
        need = CLEARANCE_ORDER.get(min_level, 0)
        if subj < need:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"clearance < {min_level}",
            )
        return principal

    return dep
