from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware  # Import the CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
import uuid

# Create the FastAPI app instance first
app = FastAPI()

# Add CORS middleware to allow the frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# In-memory storage (for demo only)
users: Dict[str, dict] = {}   # username -> {password, balance, transactions}
sessions: Dict[str, str] = {} # token -> username

# ---------------------- Models ----------------------
class RegisterRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class TransferRequest(BaseModel):
    to_user: str
    amount: float

class BalanceResponse(BaseModel):
    balance: float

class Transaction(BaseModel):
    type: str   # "credit" or "debit"
    amount: float
    from_user: str = None
    to_user: str = None

# ---------------------- Helper ----------------------
def get_current_user(token: str) -> str:
    if token not in sessions:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return sessions[token]

# ---------------------- Endpoints ----------------------
@app.post("/register")
def register(req: RegisterRequest):
    if req.username in users:
        raise HTTPException(status_code=400, detail="User already exists")
    users[req.username] = {
        "password": req.password,
        "balance": 1000.0,  # Initial balance
        "transactions": []
    }
    return {"message": "User registered successfully"}

@app.post("/login")
def login(req: LoginRequest):
    if req.username not in users or users[req.username]["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = str(uuid.uuid4())
    sessions[token] = req.username
    return {"token": token}

@app.post("/transfer")
def transfer(req: TransferRequest, token: str):
    from_user = get_current_user(token)

    if req.to_user not in users:
        raise HTTPException(status_code=404, detail="Recipient not found")
    if users[from_user]["balance"] < req.amount:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # Deduct from sender
    users[from_user]["balance"] -= req.amount
    users[from_user]["transactions"].append(
        {"type": "debit", "amount": req.amount, "to_user": req.to_user}
    )

    # Add to receiver
    users[req.to_user]["balance"] += req.amount
    users[req.to_user]["transactions"].append(
        {"type": "credit", "amount": req.amount, "from_user": from_user}
    )

    return {"message": "Transfer successful"}

@app.get("/balance", response_model=BalanceResponse)
def balance(token: str):
    username = get_current_user(token)
    return {"balance": users[username]["balance"]}

@app.get("/transactions", response_model=List[Transaction])
def transactions(token: str):
    username = get_current_user(token)
    return users[username]["transactions"]