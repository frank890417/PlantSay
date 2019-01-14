git push
ssh mono "cd /var/www/PlantSay;git pull;npm run build;pm2 restart 'plantsay'"
