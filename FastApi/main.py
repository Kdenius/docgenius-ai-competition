from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
from datetime import datetime
from services import create_user, authenticate_user, generate_token, create_chat, send_message, verify_user
from schemas import UserSchema, ChatSchema, MessageSchema, LoginRequest
from shutil import copyfileobj
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()
UPLOAD_DIRECTORY = "public"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows the listed origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)

@app.post("/signup")
async def signup(user: UserSchema):
    # user_id = await create_user(user)
    await create_user(user)
    return {"message" : "check mail for varification"}

@app.get("/verify/{token}")
def verify(token: str):
    user = verify_user(token);
    return JSONResponse(content={"token": token, "user": user.dict()})


@app.post("/login")
def login(login_data: LoginRequest):
    user_data = authenticate_user(login_data.email, login_data.password)
    return JSONResponse(content={"user": user_data.dict()})

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

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail}  # Ensure that the `detail` is in a structured JSON format
    )
