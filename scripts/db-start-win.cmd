@echo off

REM This script starts PostgreSQL on Windows. It assumes that you:
REM - installed PostgreSQL to the default folder;
REM - are using the postgres account;
REM - have configured the 'trust' authentication mechanism (no password).

set PGDATA=C:\Program Files\PostgreSQL\9.5\data
set PGHOST=127.0.0.1
set PGPORT=5432
set PGUSER=postgres

"C:\Program Files\PostgreSQL\9.5\bin\postgres.exe"