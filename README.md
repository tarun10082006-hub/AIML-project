<<<<<<< HEAD
# Plant Disease Detection System

## Setup

### 1. Place your model
Copy your pre-trained Keras model to:
```
backend/model/model.h5
```
The model must accept input shape `(None, 224, 224, 3)` and output logits/probabilities
for the 15 classes defined in `model.py`.

### 2. Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Start MongoDB
Make sure MongoDB is running locally on port 27017.

### 4. Run the backend
```bash
cd backend
uvicorn main:app --reload
```

### 5. Open the frontend
Open `frontend/signup.html` in your browser to create an account, then log in and start predicting.

## Class Labels (model.py)
Edit `CLASS_LABELS` in `backend/model.py` to match the exact output order of your model.

## Project Structure
```
Ai-ML project/
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── db.py
│   ├── model.py
│   ├── requirements.txt
│   └── model/
│       └── model.h5   ← place your model here
└── frontend/
    ├── index.html
    ├── login.html
    ├── signup.html
    └── style.css
```
=======
# AIML-project
>>>>>>> 2a98fea09e35912447e55934771fe7e7145aa387
