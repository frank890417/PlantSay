git push
ssh mono "cd /var/www/plantsay;git pull;npm run build;pm2 restart 'plantsay'"
