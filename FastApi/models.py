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


# Chat Model
class Chat(BaseModel):
    topic: str
    user_id: str
    message_ids: List[str] = []  # List of message IDs (as strings)
    document_path: Optional[str] = None  # Optionally store the file path

    class Config:
        orm_mode = True
        json_encoders = {ObjectId: str}


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

