#!/bin/bash
# Script para inicializar o banco PostgreSQL do HUB

echo "Inicializando banco PostgreSQL do HUB de Entregas..."

# Aguardar o PostgreSQL estar pronto
echo "Aguardando PostgreSQL estar pronto..."
until docker exec hubtown_postgres pg_isready -U hubtown_user -d hubtown_db > /dev/null 2>&1; do
  echo "   PostgreSQL ainda não está pronto. Aguardando..."
  sleep 2
done

echo "PostgreSQL está pronto!"

# Executar o schema
echo "Criando tabelas..."
docker exec -i hubtown_postgres psql -U hubtown_user -d hubtown_db < database/schema.sql

# Executar os seeds
echo "Inserindo dados iniciais..."
docker exec -i hubtown_postgres psql -U hubtown_user -d hubtown_db < database/seeds.sql

echo "Banco inicializado com sucesso!"
echo ""
echo "Informações de conexão:"
echo "   Host: localhost"
echo "   Porta: 5432"
echo "   Banco: hubtown_db"
echo "   Usuário: hubtown_user"
echo "   Senha: hubtown_pass"
echo ""
echo "Para conectar via psql:"
echo "   docker exec -it hubtown_postgres psql -U hubtown_user -d hubtown_db"