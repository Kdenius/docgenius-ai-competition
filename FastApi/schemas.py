# schema.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from fastapi import UploadFile

# User Schema
class UserSchema(BaseModel):
    name: str
    email: str
    password: str

    class Config:
        orm_mode = True



# Chat Schema updated to accept file
class ChatSchema(BaseModel):
    topic: str
    user_id: str  # User ID should be passed as a string in the API request

    class Config:
        orm_mode = True

class MessageSchema(BaseModel):
    user_id: str  # User ID (Sender or Receiver)
    text: str
    timestamp: datetime  # Timestamp in ISO format
    sent: bool  # Boolean to indicate if the message is sent (True) or received (False)

    class Config:
        orm_mode = True
