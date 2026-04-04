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
| **Language** | Python 3.14+ |
| **Framework** | FastAPI (Asynchronous logic & Modular Routing) |
| **AI Integration** | Google Generative AI (Gemini 3 Flash) |
| **Database** | MySQL 8.0 (Relational Mapping) |
| **Security** | Bcrypt (Hashing) & PyJWT (Session Tokens) |
| **Validation** | Pydantic v2 (Strict Data Schemas) |



## 📂 Project Structure

```text
CareerWeave/
├── backend/            		
│   ├── main.py         		    # FastAPI Entry point & Routes
│   ├── generator.py    		    # Gemini AI Interfacing & Generation
│   ├── prompts.py                  # System Prompts & AI Architecture Rules
│   ├── database_manager.py 	    # MySQL CRUD & Auth Operations
│   ├── schemas.py      		    # Pydantic Data Models (DTOs)
│   └── security.py                 # JWT & Password Security Handling
│
├── database/           		
│   └── schema.sql      		    # Database blueprint & Table setup
│
├── tests/              		    
│   ├── test_api.py      		    # API and integration testing
│   ├── test_database_manager.py    # Database unit testing
│   └── test_generator.py           # Mocked AI logic testing
│
├── requirements.txt			    # Project dependencies
├── .env.example           		    # Template for API keys & DB credentials
└── README.md
```



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

**3. Install Dependencies**
```bash
pip install -r requirements.txt
```

**4. Database Setup**
- Initialize tables using `database/schema.sql` in MySQL Workbench.

**5. Environment Variables**
Create a `.env` file in the project directory:
```env
GEMINI_API_KEY=your_google_ai_studio_key
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=career_weave_db
```



## ⚡ Quick Start

Launch the backend server:

```bash
uvicorn backend.main:app --reload
```

Once running, explore the interactive **Swagger UI API documentation** at: **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**



<p align="center">Built with ❤️ by <i><b>Keshav Dhanka</b></i></p>