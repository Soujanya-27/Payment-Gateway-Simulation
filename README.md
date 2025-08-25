# Payment Gateway Simulation

This is a full-stack web application that simulates a simple digital wallet or payment system. The backend is built with **FastAPI** in Python, and the frontend is a **Single-Page Application (SPA)** using **HTML, CSS, and JavaScript**.

## Features

* **User Registration:** Create a new user account.
* **User Login:** Authenticate and get a session token.
* **View Balance:** See your current account balance.
* **Transfer Funds:** Send money to another registered user.
* **Transaction History:** View a list of your past transactions (credits and debits).

  ## Technologies Used

  ### Backend
  * **FastAPI:** A modern, fast (high-performance) web framework for building APIs with Python.
  * **Python:** The core programming language for the backend logic.
 
  ### Frontend

  * **HTML5:** Provides the structure for the user interface.
  * **CSS3:** Styles the application for a clean and responsive design.
  * **JavaScript:** Handles all client-side logic, API calls, and dynamic updates to the UI.
 
  ## Getting Started

  ### Prerequisites
  Make sure you have **Python 3.7+** installed. You will also need `uvicorn` and `fastapi`.

  You can install them using pip:
  ```sh
  pip install fastapi uvicorn
  ```

 ## Running the Project

 **1. Clone the Repository**
 ```sh
 git clone [https://github.com/your-username/payment-gateway-simulation.git](https://github.com/your-username/payment-gateway-simulation.git)
 cd payment-gateway-simulation
```

**2. Start the Backend Server**
The backend will run on *http://127.0.0.1:8000*.
```sh
uvicorn main:app --reload
```
The *--reload* flag is useful for development as it automatically restarts the server when you make changes to the code.


**3. Run the Frontend**
Open the *index.html* file in your web browser. You can do this directly from your file system or by using a simple local server extension for your code editor (like "Live Server" for VS Code).
