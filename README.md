<div align="center">

![Python Version](https://img.shields.io/badge/python-3.14.3-blue.svg)
![AI Engine](https://img.shields.io/badge/AI-Gemini%203%20Flash-orange.svg)

</div>

<div align="center">
  <!-- <img alt="Career Weave Logo" src="assets/logo.png" width="250px"> -->
  <h1>Career Weave</h1>
  <h3>The AI-Driven Career Architect.</h3>
  <p>Weaving personalized learning paths from your current skills to your dream role.</p>
</div>

<p align="center">
    <a href="#features"> Features </a> •
    <a href="#installation"> Installation </a> •
    <a href="#quick-start"> Quick Start </a> •
    <a href="https://github.com/keshav-dhanka/CareerWeave/issues"> Report Bug </a>
</p>



## Features

- **Hyper-Personalized Roadmaps**: Uses Gemini 3 Flash to analyze your specific skill gap and generate a custom 4-24 week curriculum.
- **Strict Data Integrity**: Powered by **Pydantic v2**, ensuring every roadmap is structurally perfect and ready for database injection.
- **Dynamic Duration Logic**: Curriculums adapt in length based on the complexity of the target role and your starting point.
- **Resource Discovery**: Automatically suggests high-quality documentation, videos, and labs for every weekly milestone.
- **Clean Architecture**: Designed with a modular backend ready for Flask and MySQL integration.



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
	source .venv/Scripts/activate  #  Activate virtual environment for Linux/Git Bash
	# OR
	.\.venv\Scripts\activate      # Activate virtual environment for Windows PowerShell
	```

3. Install Dependencies
	```bash
	pip install -r requirements.txt
	```


## Quick Start
1. Configure API Key
	- Create a .env file in the root directory.

	- Copy the contents of .env.example into .env.

	- Add your Google AI Studio API Key in place of 'your_key_here'.

2. Run the Generator
	```bash
	python backend/generator.py
	```