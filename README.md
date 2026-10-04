# Project Management Laboratory

## How to set up?

You will need to:
- Set up a google firebase account
- Set up a groq API key
- An email for kafka usage

keep in mind that the project wont work if any of this are failed to be setup. 

### Backend setup

The backend will need to have a .env file, you can find an example in the backend folder, in it you should include:

- The path to a file with the firebase auth keys (structure in trainu.json.example)
- Grok API key
- SMTP host, port, user and password for the email service

### Frontend setup

The frontend will need its own .env file (an example is also included) it should contain:

- The remaining firebase keys



After adding those files simply do "docker compose up -d" on the main folder and the containers should start.

## How to use?

Frontend accessed on http://localhost:5173/

Backend accessed on http://localhost:5000/

Database accessed on MongoDB Compass "Localhost:27017"


## Regarding the DB?

The project includes a init.js file in the mongo-init folder responsible for seeding