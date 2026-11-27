#!/usr/bin/env bash
# Valida migracoes/2026-11-20-admins.sql num Postgres local DESCARTÁVEL. Nunca aponte para um banco de verdade:
# o script cria e apaga o banco "admins_test". Usa a cópia da estrutura de produção (replica/, sem dados), aplica a migração por cima.
#
# Uso (você inicia o Postgres de teste e diz como conectar; sem PSQL definido, o script não roda):
#   PSQL="psql -h /tmp/pgsocket -p 54329 -U postgres" bash testes/banco/admins.sh
set -euo pipefail
cd "$(dirname "$0")"
: "${PSQL:?defina PSQL com o comando psql de um Postgres local de teste}"
case "$PSQL" in *supabase*) echo "PSQL aponta para o Supabase: recusado."; exit 2;; esac
run() { $PSQL -v ON_ERROR_STOP=1 -q "$@"; }
run -d postgres -c "drop database if exists admins_test" -c "create database admins_test" 2>/dev/null
for f in replica/0-supabase.sql replica/1-esquema.sql replica/2-permissoes.sql replica/3-config.sql \
         ../../migracoes/2026-11-17-plano-vip.sql ../../migracoes/2026-11-20-admins.sql; do
  run -d admins_test -f "$f" >/dev/null
done
saida="$($PSQL -q -d admins_test -f admins.test.sql 2>&1 | grep -E "FALHOU|TOTAL|ERROR" || true)"
echo "$saida"
run -d postgres -c "drop database if exists admins_test" 2>/dev/null
if echo "$saida" | grep -qE "FALHOU|ERROR"; then exit 1; fi
echo "$saida" | grep -q "TOTAL: .* 0 falha(s)" || { echo "testes não terminaram"; exit 1; }
