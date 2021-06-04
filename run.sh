clear
if [ ! -f ".env" ] 
then
    echo "Copying file"
    cp .env.example .env; 
fi
if [ ! -d "node_modules" ] 
then 
    echo "Installing dependencies"
    npm install > /dev/null 2>&1;
    echo "Completed"
fi
clear
npm run start