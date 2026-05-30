<div align="center">

![Python Version](https://img.shields.io/badge/python-3.14+-blue.svg?style=for-the-badge&logo=python)
![AI Engine](https://img.shields.io/badge/AI-Gemini%203%20Flash-red.svg?style=for-the-badge&logo=google)
![Backend](https://img.shields.io/badge/Framework-FastAPI-009688.svg?style=for-the-badge&logo=fastapi)
![Database](https://img.shields.io/badge/Database-MySQL%208.0-4479A1.svg?style=for-the-badge&logo=mysql)

<h1>CareerWeave</h1>
<h3>The AI-Driven Career Architect.</h3>
<p><i>Weaving personalized, persistent learning paths from your current skills to your dream role.</i></p>

<p align="center">
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-project-structure">Project Structure</a> •
    <a href="#-installation">Installation</a> •
	<a href="#-quick-start">Quick Start</a>
</p>

</div>



## ✨ Features

- **Two-Pass AI Orchestration**: Utilizes a "Recruiter Pass" to extract context from natural language and an "Architect Pass" to generate the final roadmap.
- **Conversational Context Extraction**: Translates messy, free-form user prompts into structured technical briefings.
- **Sequential Milestone Unlocking**: Implements a "Progress Lock" system where Week N details are hidden until Week N-1 is marked as completed.
- **Dynamic Feasibility Gate**: Detects unrealistic career jumps (e.g., Retail to AI Engineer in 12 weeks) and provides honest, architect-level reasoning.
- **Relational Persistence**: All roadmaps, user profiles, and weekly tasks are securely stored in **MySQL** with full referential integrity.
- **JWT Authentication**: Secure user sessions using industry-standard **JSON Web Tokens** and Bcrypt hashing.



## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Backend Framework** | FastAPI (Modular Routing) & Python 3.14+ |
| **Frontend Framework** | React 19, Vite, React Router |
| **UI & Animations** | TailwindCSS, GSAP, Framer Motion, Three.js |
| **AI Integration** | Google Generative AI (Gemini 3 Flash) |
| **Database** | MySQL 8.0 (Relational Mapping) |
| **Security** | Bcrypt (Hashing) & PyJWT (Session Tokens) |
| **Validation** | Pydantic v2 (Strict Data Schemas) |



## 🏛️ High-Level Architecture

CareerWeave follows a decoupled client-server architecture, cleanly separating the user interface from business logic, AI orchestration, and data persistence.

```text
    [ Frontend: React + Vite ]
               │
               │ REST API (JSON / JWT Auth)
               ▼
      [ Backend: FastAPI ]
        │             │
        │             ▼
        │     [ AI Orchestration ]
        │      • Recruiter Pass
        │      • Architect Pass
        │             │
        │             ▼
        │     [ Google Gemini 3 Flash ]
        │
        ▼
   [ MySQL Database ]
    • User Profiles
    • Persisted Roadmaps
    • Progress Tracking
```

**Data Flow Overview:**
1. **Client Interaction**: The React SPA captures user inputs, manages local UI state (modals, animations), and handles protected routing.
2. **API Layer**: FastAPI receives requests, enforcing security (JWT via PyJWT) and strict data validation (Pydantic v2).
3. **AI Generation Engine**: The backend sends validated context to the Gemini model to dynamically build the JSON-structured learning curriculum.
4. **Data Persistence**: The generated roadmap and user states are securely written to the MySQL relational database using parameterized queries.



## ⚙️ Installation

**1. Clone & Navigate**
```bash
git clone https://github.com/keshav-dhanka/CareerWeave.git
cd CareerWeave
```

**2. Environment Setup**
```bash
# Create virtual environment
python -m venv .venv

# Activate (Linux/Mac/Git Bash)
source .venv/Scripts/activate	

# Activate (Windows PowerShell)
.\.venv\Scripts\activate		
```

**3. Install Backend Dependencies**
```bash
pip install -r requirements.txt
```

**4. Install Frontend Dependencies**
```bash
cd frontend
npm install
cd ..
```

**5. Database Setup**
- Initialize tables using `database/schema.sql` in MySQL Workbench.

**6. Environment Variables**
Create a `.env` file in the project directory:
```env
GEMINI_API_KEY=your_google_ai_studio_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=career_weave_db
```

**7. Seed Example Data (Optional but Recommended)**
Populate your database with pre-generated example roadmaps to test the UI:
```bash
python database/seed_examples.py
```
*(Note: This automatically creates a dummy user with email `examples@careerweave.com` and password `DummyPassword123!`)*



## ⚡ Quick Start

You will need two separate terminal windows to run both the backend and frontend.

**Terminal 1: Launch the Backend**
```bash
# Ensure your virtual environment is active
uvicorn backend.main:app --reload
```
*Explore the interactive **Swagger UI API documentation** at: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)***

**Terminal 2: Launch the Frontend**
```bash
cd frontend
npm run dev
```
*The React application will launch, typically accessible at **[http://localhost:5173](http://localhost:5173)***



## 🛠️ Known Technical Debt & Future Optimizations

- **Asynchronous DB Migration**: Currently tracking a transition from synchronous database connections to a fully async pooling architecture (`aiomysql` / SQLAlchemy Async) to optimize FastAPI concurrency.
- **State Management**: Planning a migration of local UI triggers (Toasts/Modals) into native React 19 Context to eliminate current prop-drilling patterns.
- **Data Fetching**: Refactoring raw `useEffect` fetches into a robust data-fetching library (like React Query or SWR) for better caching and loading states.



<p align="center">Built with ❤️ by <i><b>Keshav Dhanka</b></i></p>