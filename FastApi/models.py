from pydantic import BaseModel, EmailStr
from bson import ObjectId
from typing import List, Optional
from datetime import datetime

# User Model
class User(BaseModel):
    name: str
    email: EmailStr
    password: str
    verify: bool
    chat_ids: list[str] = []  # Array to store references to chats created by the user

    class Config:
        orm_mode = True
        json_encoders = {ObjectId: str}


class Chat(BaseModel):
    user_id: str
    message_ids: List[str] = []  # List of message IDs (as strings)
    document_path: Optional[str] = None  # Optionally store the file path
    timestamp: datetime
    type: str  # Using Enum for better validation
    size: int  # Size in KB (integer type)
    doc_summary: Optional[str] = None  # Optional summary of the document

    class Config:
        orm_mode = True  # Allows conversion from ORM models like SQLAlchemy
        json_encoders = {ObjectId: str}  # If you're using ObjectId for MongoDB, this is helpful

class Message(BaseModel):
    user_id: str  # User ID (Sender or Receiver)
    text: str
    timestamp: datetime  # Timestamp includes both date and time
    sent: bool  # True if message is sent, False if received

    class Config:
        orm_mode = True
        json_encoders = {ObjectId: str}

# Email Request Model
class EmailRequest(BaseModel):
    email: EmailStr
    subject: str
    message: str

