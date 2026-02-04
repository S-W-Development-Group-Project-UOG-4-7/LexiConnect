from sqlalchemy import BigInteger, Boolean, Column, DateTime, ForeignKey, String, Text, func, text

from app.database import Base


class AuthLog(Base):
    __tablename__ = "auth_logs"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    event_type = Column(String(32), nullable=False, index=True)
    success = Column(Boolean, nullable=False, index=True, server_default=text("false"))
    occurred_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    ip_address = Column(String(64), nullable=True)
    user_agent = Column(Text, nullable=True)
    message = Column(Text, nullable=True)
