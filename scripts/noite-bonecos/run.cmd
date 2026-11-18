@echo off
rem Tarefa unica 18/11/2026 22h: bonecos do Zeze e Luciano (pedido do Rafa)
cd /d C:\Users\User\Documents\projetos\a6-sunset-mapa
set "PATH=C:\Program Files\Git\bin;%PATH%"
call C:\Users\User\AppData\Roaming\npm\claude.cmd -p "Leia o arquivo C:\Users\User\Documents\projetos\a6-sunset-mapa\scripts\noite-bonecos\PROMPT.md e execute exatamente o que ele manda, do inicio ao fim." --permission-mode bypassPermissions < NUL > C:\Users\User\Documents\projetos\a6-sunset-mapa\scripts\noite-bonecos\ultimo-run.log 2>&1
