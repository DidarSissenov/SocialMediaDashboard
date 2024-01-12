@echo off
echo Starting the Social Media Dashboard App

:: Start MongoDB (if installed as a service)
echo Starting MongoDB...
start mongod

:: Add a delay to wait for MongoDB to start
echo Waiting for MongoDB to start...
timeout /t 10 /nobreak > NUL

:: Starting the server
echo Starting Node.js server...
node server.js
echo Application started successfully.