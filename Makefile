.PHONY: install dev ingest up down logs clean

install:
	npm install

dev:
	npm run dev

ingest:
	npm run ingest

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f bot

db:
	docker compose up -d postgres

clean:
	docker compose down -v
	rm -rf dist node_modules
