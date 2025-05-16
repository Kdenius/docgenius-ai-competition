from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from io import BytesIO
from fastapi.responses import JSONResponse
from datetime import datetime
from services import create_user, authenticate_user, generate_token, create_chat, send_message, verify_user
from schemas import UserSchema, ChatSchema, MessageSchema, LoginRequest
from shutil import copyfileobj
from fastapi.middleware.cors import CORSMiddleware
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
import os
import PyPDF2
from docx import Document
from bs4 import BeautifulSoup

app = FastAPI()
UPLOAD_DIRECTORY = "public"

# Azure Storage connection string (from the Azure portal)
AZURE_CONNECTION_STRING = os.getenv("AZURE_CONNECTION_STRING")
CONTAINER_NAME = "documents"  # Name of the Blob Container you created

# Initialize the BlobServiceClient
blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)

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
    return JSONResponse(content={"token": token, "user": user})


@app.post("/login")
def login(login_data: LoginRequest):
    user_data = authenticate_user(login_data.email, login_data.password)
    # return JSONResponse(content={"user": user_data})
    return user_data

# Function to upload the file to Azure Blob Storage
def upload_to_azure(file: UploadFile, user_id: str):
    # Create a "folder" structure by including the user_id in the blob name
    blob_name = f"{user_id}/{file.filename}"

    # Get a blob client
    blob_client = blob_service_client.get_blob_client(container=CONTAINER_NAME, blob=blob_name)
    # Read file data and upload it to Azure Blob Storage
    file_data = file.file.read()
    
    # Upload the file to the blob storage
    try:
        blob_client.upload_blob(file_data, overwrite=True)  # overwrite=True to overwrite if file exists
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")
    
    # Generate the URL for the uploaded file
    blob_url = f"https://{blob_service_client.account_name}.blob.core.windows.net/{CONTAINER_NAME}/{blob_name}"
    
    return blob_url

# Function to extract text from PDF using PyPDF2
def extract_text_from_pdf(file: UploadFile) -> str:
    with file.file as f:  # Open the file
        reader = PyPDF2.PdfReader(f)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    return text

# Function to extract text from DOCX using python-docx
def extract_text_from_docx(file: UploadFile) -> str:
    with file.file as f:
        doc = Document(f)
        text = ""
        for para in doc.paragraphs:
            text += para.text + "\n"
    return text

# Function to extract text from HTML using BeautifulSoup
def extract_text_from_html(file: UploadFile) -> str:
    with file.file as f:
        soup = BeautifulSoup(f, "html.parser")
        text = soup.get_text()
    return text

@app.post("/chat/create")
async def create_new_chat(
    user_id: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        file_extension = file.filename.split(".")[-1]
        # print('ayatoo ave se')
        if file_extension == "pdf":
            raw_text = extract_text_from_pdf(file)
        elif file_extension == "docx":
            raw_text = extract_text_from_docx(file)
        elif file_extension == "html":
            raw_text = extract_text_from_html(file)
        elif file_extension == "txt":
            content = await file.read()
            raw_text = content.decode('utf-8')
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # # Generate the new file name using user ID and timestamp
        # timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        # file_extension = file.filename.split(".")[-1]  # Get the file extension
        # new_filename = f"{user_id}_{timestamp}.{file_extension}"
        # print(raw_text)
        file_url = upload_to_azure(file, user_id)
        # file_url = '/heloo'
        file_size = file.size

    #     try:
    # # Read the file content into memory
    #         file_content = BytesIO(await file.read())
    #     except Exception as e:
    #         raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
        # Now call the create_chat function with the file saved path (document_path)
        chat_data = await create_chat(file_size=file_size,file_extension=file_extension, user_id=user_id, document_path=file_url, raw_text=raw_text)
        
        # Return the created chat with its _id and the document path
        return chat_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating chat: {str(e)}")


@app.post("/chat/message")
def send_new_message( message: MessageSchema):
    message_data = send_message(
        chat_id=message.chat_id,
        text=message.text,
    )
    return message_data

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail}  # Ensure that the `detail` is in a structured JSON format
    )
