from fastapi import HTTPException, status
from db import get_db
from models import User, Chat, Message
from auth import hash_password, verify_password, create_access_token, verify_token
from bson import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

# Load environment variables from .env file
load_dotenv()

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=f"DocGenius AI <{os.getenv('MAIL_USERNAME')}>",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",  # Change for other providers
    MAIL_STARTTLS=True,  # Replaces MAIL_TLS
    MAIL_SSL_TLS=False,  # Replaces MAIL_SSL
    USE_CREDENTIALS=True
)
# User creation (Sign up)
async def create_user(user: User):
    db = get_db()
    # Hash the password before saving to the database
    existing_user = db.users.find_one({"email": user.email})
    print(existing_user)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this Email already exists"
        )
    user_data = dict(user)
    user_data["password"] = hash_password(user.password)
    user_data["verify"] = False
    result = db.users.insert_one(user_data)

    token = generate_token(user_data)
    print(token)
    html_body = f"""
<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>DocGenius Account Verification</title>
    <style>
        body {{
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }}
        .email-container {{
            border: 1px solid #e1e1e1;
            border-radius: 5px;
            overflow: hidden;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }}
        .header {{
            background-color: #4A90E2;
            color: white;
            padding: 20px;
            text-align: center;
        }}
        .content {{
            padding: 20px 30px;
            background-color: #ffffff;
        }}
        .credentials-box {{
            background-color: #f9f9f9;
            border-left: 4px solid #4A90E2;
            padding: 15px;
            margin: 20px 0;
        }}
        .button-container {{
            text-align: center;
            margin: 25px 0 15px;
        }}
        .verify-button {{
            display: inline-block;
            background-color: #4CAF50;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 14px;
            transition: background-color 0.3s;
        }}
        .verify-button:hover {{
            background-color: #45a049;
        }}
        .footer {{
            text-align: center;
            padding: 15px;
            font-size: 12px;
            color: #777777;
            background-color: #f7f7f7;
            border-top: 1px solid #e1e1e1;
        }}
        .logo {{
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 1px;
        }}
    </style>
</head>
<body>
    <div class='email-container'>
        <div class='header'>
            <div class='logo'>DocGenius AI</div>
            <p>Email Verification</p>
        </div>
        <div class='content'>
            <p>Dear <strong>{user_data['name']}</strong>,</p>
            <p>Welcome to <strong>DocGenius</strong> – your AI-powered assistant for document-based question answering.</p>
            <p>To activate your account and start using DocGenius, please verify your email by clicking the button below:</p>
            <div class='button-container'>
                <a href="{os.getenv('VARIFY_URL')}/verify/{str(token['access_token'])}" class='verify-button'>Verify Account</a>
            </div>
            <p>If you did not request this registration, you can safely ignore this email.</p>
            <p>Thank you,<br>The DocGenius Team</p>
        </div>
        <div class='footer'>
            <p>© 2025 DocGenius. All rights reserved.</p>
            <p>This is an automated message. Please do not reply.</p>
        </div>
    </div>
</body>
</html>
"""

    message = MessageSchema(
        subject="Verify Your Email for DocGenius AI",
        recipients=[user_data["email"]],
        body=html_body,
        subtype="html"
    )
    fm = FastMail(conf)
    await fm.send_message(message)
    # return str(result.inserted_id)  # Return the user ID as string
    return 

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
    
    if not user.get('verify', False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your email is not verified. Please check your inbox to verify your account."
        )
    
    # Return the User model object
    # user_data = User(**user)
    return User(**user)  # Convert MongoDB document into Pydantic model

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

def verify_user(token: str):
     payload = verify_token(token)
     db = get_db()  # Get database connection
     user = db.users.find_one({"_id": ObjectId(payload["user_id"])})
     print(user)
     if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
     if user['verify']:
        raise HTTPException(
            status_code=status.HTTP_405_METHOD_NOT_ALLOWED,
            detail="Already Verified User !"
        )
     db.users.update_one({"_id": ObjectId(payload['user_id'])}, {"$set": {"verify": True}})
     return User(**user)