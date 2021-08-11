#!/bin/sh

while ! mysqladmin ping -h $SOURCE_HOST --silent; do
    sleep 1
done

# masterをロックする
mysql -u $SOURCE_USER -h $SOURCE_HOST -e "RESET MASTER;"
mysql -u $SOURCE_USER -h $SOURCE_HOST -e "FLUSH TABLES WITH READ LOCK;"

# masterのDB情報をDumpする
# ここでは --all-databases にしてるけど用途に応じて必要なDBだけにしていいと思う
mysqldump -u $SOURCE_USER -h $SOURCE_HOST --all-databases --master-data --single-transaction --flush-logs --events > /tmp/master_dump.sql

# dumpしたmasterのDBをslaveにimportする
mysql -u root -e "STOP SLAVE;";
mysql -u root < /tmp/master_dump.sql

# masterに繋いで bin-logのファイル名とポジションを取得する
log_file=`mysql -u $SOURCE_USER -h $SOURCE_HOST -e "SHOW MASTER STATUS\G" | grep File: | awk '{print $2}'`
pos=`mysql -u $SOURCE_USER -h $SOURCE_HOST -e "SHOW MASTER STATUS\G" | grep Position: | awk '{print $2}'`

# slaveの開始
mysql -u root -e "RESET SLAVE";
mysql -u root -e "CHANGE MASTER TO MASTER_HOST='$SOURCE_HOST', MASTER_USER='$SOURCE_USER', MASTER_PASSWORD='', MASTER_LOG_FILE='${log_file}', MASTER_LOG_POS=${pos};"
mysql -u root -e "START SLAVE"

# masterをunlockする
mysql -u $SOURCE_USER -h $SOURCE_HOST -e "UNLOCK TABLES;"
