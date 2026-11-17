#!/usr/bin/env bash
# Valida migracoes/2026-11-17-trilha-turbo.sql num Postgres local DESCARTÁVEL. Nunca aponte para um banco de verdade:
# o script cria e apaga o banco "turbo_test" e usa um esquema mínimo (stub.sql) no lugar do esquema do Supabase.
#
# Uso (você inicia o Postgres de teste e diz como conectar; sem PSQL definido, o script não roda):
#   PSQL="psql -h /tmp/pgsocket -p 54329 -U postgres" bash testes/banco/turbo.sh
set -euo pipefail
cd "$(dirname "$0")"
: "${PSQL:?defina PSQL com o comando psql de um Postgres local de teste}"
case "$PSQL" in *supabase*) echo "PSQL aponta para o Supabase: recusado."; exit 2;; esac
run() { $PSQL -v ON_ERROR_STOP=1 -q "$@"; }
tmp="$(mktemp)"; trap 'rm -f "$tmp"' EXIT
sed -n '/^create or replace function public._give_packs/,/^end \$\$;/p' ../../migracoes/2026-11-13-carimbo-figurinha.sql > "$tmp"
run -d postgres -c "drop database if exists turbo_test" -c "create database turbo_test" 2>/dev/null
for f in stub.sql "$tmp" ../../migracoes/2026-11-17-trilha-turbo.sql dados.sql; do run -d turbo_test -f "$f"; done
saida="$($PSQL -q -d turbo_test -f turbo.test.sql 2>&1 | grep -E "FALHOU|TOTAL|ERROR" || true)"
echo "$saida"
run -d postgres -c "drop database if exists turbo_test" 2>/dev/null
# uma verificação que dá ERRO não conta como feita: o script falha em vez de aprovar sem rodá-la
if echo "$saida" | grep -qE "FALHOU|ERROR"; then exit 1; fi
echo "$saida" | grep -q "TOTAL: .* 0 falha(s)" || { echo "testes não terminaram"; exit 1; }
