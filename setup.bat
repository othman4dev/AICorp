@echo off
echo 🚀 Setting up Multi-Agent Dev Team Simulator...
echo.

echo 📦 Installing dependencies...

echo    Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error installing root dependencies
    pause
    exit /b 1
)

echo    Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error installing backend dependencies
    pause
    exit /b 1
)

cd..

echo    Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error installing frontend dependencies
    pause
    exit /b 1
)

cd..

echo ✅ Dependencies installed successfully!
echo.

REM Create .env file if it doesn't exist
if not exist "backend\.env" (
    echo 📝 Creating .env file...
    copy "backend\.env.example" "backend\.env" > nul
    echo ✅ .env file created! Please update it with your API keys.
) else (
    echo ℹ️  .env file already exists.
)

echo.
echo 🎉 Setup complete! Here are your next steps:
echo.
echo 1. Update your .env file in the backend folder with:
echo    - GEMINI_API_KEY (get from https://makersuite.google.com/app/apikey)
echo    - GITHUB_TOKEN (get from https://github.com/settings/tokens)
echo    - GITHUB_REPO_OWNER and GITHUB_REPO_NAME
echo.
echo 2. Start the development servers:
echo    npm run dev
echo.
echo 3. Open your browser to:
echo    Frontend: http://localhost:5173
echo    Backend API: http://localhost:3001
echo.
echo 4. Try chatting with your AI development team!
echo.
echo 📚 For more information, check the README.md file.
echo 🐛 Issues? Create a GitHub issue or check the documentation.
echo.
echo Happy coding! 🎈
echo.
pause
