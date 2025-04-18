@echo off
cd C:\xampp\htdocs\projetos\startup-rush
sqlite3 prisma\dev.db < prisma\migrations\manual\migration.sql
echo Migração aplicada! 