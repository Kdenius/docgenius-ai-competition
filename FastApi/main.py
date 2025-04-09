from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from datetime import datetime
from services import create_user, authenticate_user, generate_token, create_chat, send_message
from schemas import UserSchema, ChatSchema, MessageSchema
from shutil import copyfileobj
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI()
UPLOAD_DIRECTORY = "public"

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

@app.post("/signup", response_model=str)
def signup(user: UserSchema):
    user_id = create_user(user)
    return user_id

@app.post("/login")
def login(email: str, password: str):
    user_data = authenticate_user(email, password)
    print(user_data["_id"])
    return generate_token(user_data)

@app.post("/chat/create")
async def create_new_chat(
    topic: str = Form(...),
    user_id: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        # Generate the new file name using user ID and timestamp
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        file_extension = file.filename.split(".")[-1]  # Get the file extension
        new_filename = f"{user_id}_{timestamp}.{file_extension}"
        
        # Save the uploaded file to the public/ directory
        file_location = os.path.join(UPLOAD_DIRECTORY, new_filename)
        
        with open(file_location, "wb") as buffer:
            copyfileobj(file.file, buffer)
        
        # Now call the create_chat function with the file saved path (document_path)
        chat_data = create_chat(topic=topic, user_id=user_id, document_path=file_location)
        
        # Return the created chat with its _id and the document path
        return chat_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating chat: {str(e)}")


@app.post("/chat/{chat_id}/message")
def send_new_message(chat_id: str, message: MessageSchema):
    # Determine if the message is sent or received
    sent = message.sent

    # Call the send_message function, passing the 'sent' value
    message_data = send_message(
        chat_id=chat_id,
        user_id=message.user_id,  # User ID is now used for both sender and receiver
        text=message.text,
        sent=sent  # Pass the sent flag
    )
    return message_data

