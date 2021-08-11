#!/bin/sh
mysql -u root -e"CREATE USER 'repl'@'%';"
mysql -u root -e"GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';"
