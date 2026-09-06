from fastapi import Header, HTTPException


def get_current_role(
    x_role: str = Header(default="viewer")
):
    allowed_roles = {"admin", "editor", "viewer"}

    if x_role not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="Invalid role"
        )

    return x_role


def require_admin(
    x_role: str = Header(default="viewer")
):
    if x_role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return x_role


def require_editor_or_admin(
    x_role: str = Header(default="viewer")
):
    if x_role not in {"admin", "editor"}:
        raise HTTPException(
            status_code=403,
            detail="Editor or Admin access required"
        )

    return x_role