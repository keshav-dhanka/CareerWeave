<div align="center">

![Python Version](https://img.shields.io/badge/python-3.14+-blue.svg)
![AI Engine](https://img.shields.io/badge/AI-Gemini%203%20Flash-red.svg)
![Backend](https://img.shields.io/badge/Framework-FastAPI-009688.svg)
![Database](https://img.shields.io/badge/Database-MySQL%208.0-4479A1.svg)

</div>

</div>

<div align="center">
  <h1>Career Weave</h1>
  <h3>The AI-Driven Career Architect.</h3>
  <p>Weaving personalized, persistent learning paths from your current skills to your dream role.</p>
</div>

<p align="center">
    <a href="#features"> Features </a> •
    <a href="#tech-stack"> Tech Stack </a> •
    <a href="#project-structure"> Project Structure </a> •
    <a href="#installation"> Installation </a> •
	<a href="#quick-start"> Quick Start </a> •
    <a href="https://github.com/keshav-dhanka/CareerWeave/issues"> Report Bug </a>
</p>



## Features

- **AI-Generated Delta Analysis**: Calculates the technical "gap" between your current profile and target role using Gemini 3 Flash.
- **Dynamic Feasibility Gate**: Detects unrealistic career jumps and provides honest, architect-level reasoning.
- **Relational Persistence**: All roadmaps and weekly milestones are stored in **MySQL** with full referential integrity.
- **Secure Authentication**: User signup and login systems utilizing **Bcrypt** password hashing.
- **Auto-Generated Documentation**: Fully interactive API explorer via **Swagger UI**.



## Tech Stack

- **Language**: Python 3.14+
- **API Framework**: FastAPI (Asynchronous logic)
- **AI Integration**: Google Generative AI (Gemini 2.5 Flash Lite)
- **Database**: MySQL 8.0 (Relational Mapping)
- **Data Validation**: Pydantic v2
- **Security**: Passlib (Bcrypt hashing)



## Project Structure

```text
CareerWeave/
├── backend/            		
│   ├── main.py         		# FastAPI Entry point & Routes
│   ├── generator.py    		# Gemini AI Prompt Engine
│   ├── database_manager.py 	# MySQL CRUD & Auth Operations
│   ├── schemas.py      		# Pydantic Data Models (DTOs)
│
├── database/           		
│   └── schema.sql      		# Database blueprint & Table setup
│
├── tests/              		
│   └── test_pipeline.py 		# E2E verification script
│
├── .env.example           		# Template for API keys & DB credentials
├── requirements.txt			# Project dependencies
└── README.md
```



## Installation

1. Clone & Navigate
	```bash
	git clone https://github.com/keshav-dhanka/CareerWeave.git
	cd CareerWeave
	```
 
2. Environment Setup
	```bash
	# Create virtual environment
	python -m venv .venv
	source .venv/Scripts/activate	# Linux/Mac/Git Bash
	# OR
	.\.venv\Scripts\activate		# Windows PowerShell
	```
 
3. Install Dependencies
	```bash
	pip install -r requirements.txt
	```

4. Database Setup
   1. Open MySQL Workbench
   2. Run the script found in ```database/schema.sql``` to initialize the tables

5. Environment Variables

   Create a ```.env``` file in the root directory
    ```
    GEMINI_API_KEY=your_google_ai_studio_key
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=career_weave_db
    ```



## Quick Start
Launch the backend server:
```bash
cd backend
uvicorn main:app --reload
```
Once running, explore the interactive API documentation at: http://127.0.0.1:8000/docs



<p align="center">Built with ❤️ by <i><b>Keshav Dhanka</b></i></p>