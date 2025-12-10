from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base

class Branch(Base):
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True, index=True)
    lawyer_id = Column(Integer, ForeignKey("lawyers.id"))
    name = Column(String, nullable=False)
    district = Column(String, nullable=False)
    city = Column(String, nullable=False)
    address = Column(String, nullable=False)

    # optional:
    # lawyer = relationship("Lawyer", back_populates="branches")
