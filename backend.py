from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import List
import os
import shutil
from uuid import uuid4

from database import get_db, engine, Base
from models import User, Upload
from auth import (
    get_password_hash, verify_password, create_access_token,
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
)
from crack_dimension import measure_crack

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Crack Detection API")

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Pydantic models for request/response
from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    user_type: str  # 'engineer', 'home_owner', 'admin'

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    user_type: str
    
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str

class UploadResponse(BaseModel):
    id: int
    user_id: int
    image_path: str
    length_mm: float
    avg_width_mm: float
    max_width_mm: float
    area_mm2: float
    angle_deg: float
    crack_type: str
    created_at: str
    
    model_config = {"from_attributes": True}

@app.post("/register", response_model=UserResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    existing_email = db.query(User).filter(User.email == user.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate user type
    if user.user_type not in ['engineer', 'home_owner', 'admin']:
        raise HTTPException(status_code=400, detail="Invalid user type")
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        user_type=user.user_type
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/upload", response_model=UploadResponse)
async def upload_crack_image(
    file: UploadFile = File(...),
    pixels_per_mm: float = Form(10.0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Measure crack dimensions
    try:
        measurements = measure_crack(file_path, pixels_per_mm=pixels_per_mm)
    except Exception as e:
        # Clean up file if measurement fails
        os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Crack measurement failed: {str(e)}")
    
    # Save to database
    upload = Upload(
        user_id=current_user.id,
        image_path=file_path,
        length_mm=measurements["length_mm"],
        avg_width_mm=measurements["avg_width_mm"],
        max_width_mm=measurements["max_width_mm"],
        area_mm2=measurements["area_mm2"],
        angle_deg=measurements["angle_deg"],
        crack_type=measurements["crack_type"]
    )
    db.add(upload)
    db.commit()
    db.refresh(upload)
    
    # Convert datetime to string for response
    upload_dict = {
        "id": upload.id,
        "user_id": upload.user_id,
        "image_path": upload.image_path,
        "length_mm": upload.length_mm,
        "avg_width_mm": upload.avg_width_mm,
        "max_width_mm": upload.max_width_mm,
        "area_mm2": upload.area_mm2,
        "angle_deg": upload.angle_deg,
        "crack_type": upload.crack_type,
        "created_at": upload.created_at.isoformat()
    }
    
    return UploadResponse(**upload_dict)

@app.get("/history", response_model=List[UploadResponse])
def get_upload_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    uploads = db.query(Upload).filter(Upload.user_id == current_user.id).order_by(Upload.created_at.desc()).all()
    
    result = []
    for upload in uploads:
        upload_dict = {
            "id": upload.id,
            "user_id": upload.user_id,
            "image_path": upload.image_path,
            "length_mm": upload.length_mm,
            "avg_width_mm": upload.avg_width_mm,
            "max_width_mm": upload.max_width_mm,
            "area_mm2": upload.area_mm2,
            "angle_deg": upload.angle_deg,
            "crack_type": upload.crack_type,
            "created_at": upload.created_at.isoformat()
        }
        result.append(UploadResponse(**upload_dict))
    
    return result

@app.get("/history/{upload_id}", response_model=UploadResponse)
def get_upload_detail(
    upload_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    upload = db.query(Upload).filter(
        Upload.id == upload_id,
        Upload.user_id == current_user.id
    ).first()
    
    if not upload:
        raise HTTPException(status_code=404, detail="Upload not found")
    
    upload_dict = {
        "id": upload.id,
        "user_id": upload.user_id,
        "image_path": upload.image_path,
        "length_mm": upload.length_mm,
        "avg_width_mm": upload.avg_width_mm,
        "max_width_mm": upload.max_width_mm,
        "area_mm2": upload.area_mm2,
        "angle_deg": upload.angle_deg,
        "crack_type": upload.crack_type,
        "created_at": upload.created_at.isoformat()
    }
    
    return UploadResponse(**upload_dict)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
