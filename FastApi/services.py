from fastapi import HTTPException, status
from db import get_db
from models import User, Chat, Message
from auth import hash_password, verify_password, create_access_token
from bson import ObjectId
from datetime import datetime

# User creation (Sign up)
def create_user(user: User):
    db = get_db()
    # Hash the password before saving to the database
    user_data = dict(user)
    user_data["password"] = hash_password(user.password)
    result = db.users.insert_one(user_data)
    return str(result.inserted_id)  # Return the user ID as string

# Authenticate User (Login)
def authenticate_user(email: str, password: str):
    db = get_db()
    user = db.users.find_one({"email": email})
    
    # If user doesn't exist or password is incorrect
    if not user or not verify_password(password, user['password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect credentials"
        )
    
    # Return the User model object
    # user_data = User(**user)
    return user  # Convert MongoDB document into Pydantic model

# Generate JWT Token
def generate_token(user_data):
    access_token = create_access_token(data={"user_id": str(user_data["_id"])})
    return {"access_token": access_token, "token_type": "bearer"}

# services.py

def create_chat(topic: str, user_id: str, document_path: str = None):
    db = get_db()
    
    # Create a new chat document
    chat_data = {
        "topic": topic,
        "user_id": ObjectId(user_id),  # Storing the user reference (ObjectId)
        "message_ids": [],  # Start with an empty list of message references
        "document_path": document_path,  # Save the document path in the chat
    }

    # Insert the chat into the database
    result = db.chats.insert_one(chat_data)
    
    # Update the user's chat_ids to include the new chat
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"chat_ids": result.inserted_id}}
    )
    
    # Return the created chat with its `_id` and document_path
    return {
        "id": str(result.inserted_id),  # Ensure _id is serialized as string
        "topic": topic,
        "user_id": user_id,
        "document_path": document_path
    }


def send_message(chat_id: str, user_id: str, text: str, sent: bool):
    db = get_db()
    
    # Create a new message document
    message = {
        "user_id": ObjectId(user_id),  # User ID (Sender or Receiver)
        "text": text,
        "timestamp": datetime.utcnow(),  # Current timestamp
        "sent": sent  # Boolean to indicate whether it's sent or received
    }
    
    # Insert the message into the database
    result = db.messages.insert_one(message)
    
    # Add the message reference (message_id) to the chat's messages array
    db.chats.update_one(
        {"_id": ObjectId(chat_id)},
        {"$push": {"message_ids": result.inserted_id}}
    )
    
    # Return the created message with its `_id`
    return {
        "id": str(result.inserted_id),  # Ensure _id is serialized as string
    }