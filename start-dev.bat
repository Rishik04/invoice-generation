@echo off
REM -----------------------------------------------------------------
:: This script automates the process of building and running the
:: Docker containers for the invoice generation application.
::
:: To use it:
:: 1. Save this file as "start-dev.bat" in the root directory
::    of your project (the same folder as your docker-compose.yml).
:: 2. Ensure Docker Desktop is running.
:: 3. Double-click the file to execute it.
REM -----------------------------------------------------------------

ECHO.
ECHO ===========================================
ECHO  Starting Invoice Generation Application
ECHO ===========================================
ECHO.

ECHO Step 1: Building Docker images...
ECHO This might take a moment if it's the first time or if files have changed.
ECHO -------------------------------------------------------------------------
docker-compose build

:: Check if the build command was successful.
IF %ERRORLEVEL% NEQ 0 (
    ECHO.
    ECHO !!! Docker build failed. Please check the error messages above.
    GOTO :END
)

ECHO.
ECHO Docker images built successfully.
ECHO.

ECHO Step 2: Starting all services...
ECHO The logs from all containers will be displayed in this window.
ECHO To stop the services, press CTRL+C in this window.
ECHO -------------------------------------------------------------------------
docker-compose up

ECHO.
ECHO ===========================================
ECHO  Application has been shut down.
ECHO ===========================================
ECHO.

:END
ECHO Press any key to close this window.
pause >nul
