from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))
    print("Tables in database:")
    for row in result:
        print(f"  - {row[0]}")
    
    print("\nUploads table data:")
    result = conn.execute(text('SELECT id, image_path FROM uploads LIMIT 5'))
    for row in result:
        print(f"ID: {row[0]}, Path: {row[1]}")
