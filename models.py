from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    user_type = Column(String)  # 'engineer', 'home_owner', 'admin'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    uploads = relationship("Upload", back_populates="user")

class Upload(Base):
    __tablename__ = "uploads"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    image_path = Column(String)
    length_mm = Column(Float)
    avg_width_mm = Column(Float)
    max_width_mm = Column(Float)
    area_mm2 = Column(Float)
    angle_deg = Column(Float)
    crack_type = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="uploads")
