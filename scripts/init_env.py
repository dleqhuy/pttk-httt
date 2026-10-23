"""Create local secrets once without printing them or overwriting configuration."""
import secrets
from pathlib import Path

root = Path(__file__).resolve().parents[1]
target = root / ".env"
if not target.exists():
    text = (root / ".env.example").read_text()
    for placeholder in (
        "replace-with-a-random-secret-at-least-32-characters",
        "replace-with-a-strong-password",
        "replace-with-a-strong-db-password",
        "replace-with-a-demo-password",
    ):
        text = text.replace(placeholder, secrets.token_urlsafe(36))
    target.write_text(text)
    target.chmod(0o600)
