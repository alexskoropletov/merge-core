# Makefile для vibe-merge-core

.PHONY: up down build-client start-client build-server start-server all

up:
	docker-compose up -d

down:
	docker-compose down

build-client:
	cd client && npm install

start-client:
	cd client && npx expo start

build-server:
	cd server && cargo build

start-server:
	cd server && cargo run

all: up build-client build-server 