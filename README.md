# rowingLogBook

Projet initialise avec une architecture full stack simple et standardisee pour toute l'equipe.

## Stack technique

- `frontend/`: `Next.js 16` + `React 19` + `Tailwind CSS 4`
- `backend/`: API `Spring Boot 3.3.5`
- `db`: `PostgreSQL 17`
- `pgadmin`: interface d'administration pour PostgreSQL
- orchestration locale: `Docker Compose`

## Objectif de l'architecture

Cette base a ete mise en place pour que toute l'equipe travaille dans le meme environnement, avec les memes versions, sans avoir a installer manuellement `Node`, `Java`, `Maven` et `PostgreSQL` sur chaque machine.

Le mode de travail recommande est donc:

```bash
docker compose up --build
```

## Pourquoi pgAdmin et pas phpMyAdmin

`phpMyAdmin` est un outil pour `MySQL` et `MariaDB`.
Il ne supporte pas `PostgreSQL`.

Comme la base choisie pour ce projet est `PostgreSQL`, l'outil ajoute est `pgAdmin`, qui est l'equivalent adapte.

## Structure du projet

```text
.
├── backend
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/resources/application.yml
├── frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.mjs
│   └── app/
├── .env
├── .env.example
├── .gitignore
├── .nvmrc
├── docker-compose.yml
└── README.md
```

## Versions figees

Les versions ont ete verrouillees pour eviter les differences entre machines et entre dates.

- Node.js: `22.14.0`
- Frontend Docker image: `node:22.14.0-alpine`
- Backend build image: `maven:3.9.9-eclipse-temurin-21`
- Backend runtime image: `eclipse-temurin:21-jre`
- PostgreSQL image: `postgres:17-alpine`
- pgAdmin image: `dpage/pgadmin4:9`
- Spring Boot: `3.3.5`
- Next.js: `16.1.6`
- React: `19.2.4`
- Tailwind CSS: `4.2.1`

## Prerequis

Pour utiliser le projet dans le mode recommande:

- Docker
- Docker Compose

Pour un lancement hors Docker:

- Node.js `22.14.0` ou compatible
- npm
- Java `21`
- Maven `3.9+`
- PostgreSQL

## Variables d'environnement

Le projet charge ses variables depuis [`.env`](/home/marti/Documents/DeveloppementProject/rowingLogBook/.env).
Un exemple est fourni dans [`.env.example`](/home/marti/Documents/DeveloppementProject/rowingLogBook/.env.example).

### Variables actuellement definies

```env
POSTGRES_DB=rowinglogbook
POSTGRES_USER=rowing
POSTGRES_PASSWORD=rowing
POSTGRES_PORT=5432

PGADMIN_DEFAULT_EMAIL=admin@rowinglogbook.local
PGADMIN_DEFAULT_PASSWORD=admin
PGADMIN_PORT=5050

BACKEND_PORT=8080
FRONTEND_PORT=3000

SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/rowinglogbook
SPRING_DATASOURCE_USERNAME=rowing
SPRING_DATASOURCE_PASSWORD=rowing
SPRING_JPA_HIBERNATE_DDL_AUTO=update

API_BASE_URL=http://backend:8080
API_PROXY_TARGET=http://backend:8080
```

### Role des variables

- `POSTGRES_DB`: nom de la base PostgreSQL
- `POSTGRES_USER`: utilisateur PostgreSQL
- `POSTGRES_PASSWORD`: mot de passe PostgreSQL
- `POSTGRES_PORT`: port expose localement pour PostgreSQL
- `PGADMIN_DEFAULT_EMAIL`: login de connexion a pgAdmin
- `PGADMIN_DEFAULT_PASSWORD`: mot de passe pgAdmin
- `PGADMIN_PORT`: port local de pgAdmin
- `BACKEND_PORT`: port local de l'API Spring Boot
- `FRONTEND_PORT`: port local de Next.js
- `SPRING_DATASOURCE_URL`: URL JDBC utilisee par Spring Boot
- `SPRING_DATASOURCE_USERNAME`: utilisateur DB cote backend
- `SPRING_DATASOURCE_PASSWORD`: mot de passe DB cote backend
- `SPRING_JPA_HIBERNATE_DDL_AUTO`: strategie Hibernate pour le schema
- `API_BASE_URL`: URL utilisee par le frontend pour les appels serveur
- `API_PROXY_TARGET`: cible du rewrite `/api/*` dans Next.js

## Services Docker

Le fichier [docker-compose.yml](/home/marti/Documents/DeveloppementProject/rowingLogBook/docker-compose.yml) demarre 4 services:

### `db`

- image: `postgres:17-alpine`
- role: base de donnees principale
- port local: `5432`
- volume persistant: `postgres-data`

### `pgadmin`

- image: `dpage/pgadmin4:9`
- role: administration graphique de PostgreSQL
- port local: `5050`
- volume persistant: `pgadmin-data`

### `backend`

- build depuis `backend/Dockerfile`
- role: API `Spring Boot`
- port local: `8080`
- depend de `db`

### `frontend`

- build depuis `frontend/Dockerfile`
- role: interface `Next.js`
- port local: `3000`
- depend de `backend`

## Demarrage du projet

Depuis la racine du depot:

```bash
docker compose up --build
```

Pour lancer en arriere-plan:

```bash
docker compose up --build -d
```

## URLs disponibles

Une fois le stack demarre:

- frontend: `http://localhost:3000`
- backend: `http://localhost:8080`
- health API: `http://localhost:8080/api/health`
- PostgreSQL: `localhost:5432`
- pgAdmin: `http://localhost:5050`

## Arret et reset

Arret simple:

```bash
docker compose down
```

Arret avec suppression des volumes de donnees:

```bash
docker compose down -v
```

Rebuild complet:

```bash
docker compose down -v
docker compose up --build
```

## Connexion a pgAdmin

1. Ouvrir `http://localhost:5050`
2. Se connecter avec:
   - email: `admin@rowinglogbook.local`
   - mot de passe: `admin`
3. Ajouter un serveur PostgreSQL avec:
   - Host name/address: `db`
   - Port: `5432`
   - Maintenance database: `rowinglogbook`
   - Username: `rowing`
   - Password: `rowing`

## Configuration backend

Le backend est configure dans [backend/pom.xml](/home/marti/Documents/DeveloppementProject/rowingLogBook/backend/pom.xml) et [backend/src/main/resources/application.yml](/home/marti/Documents/DeveloppementProject/rowingLogBook/backend/src/main/resources/application.yml).

### Dependances principales ajoutees

- `spring-boot-starter-web`
- `spring-boot-starter-actuator`
- `spring-boot-starter-data-jpa`
- `postgresql`

### Configuration applicative

Le backend:

- ecoute sur le port `8080`
- se connecte a PostgreSQL via `SPRING_DATASOURCE_*`
- utilise `hibernate.ddl-auto=update`
- expose au minimum `health` et `info` via Actuator
- expose l'endpoint `GET /api/health`

## Configuration frontend

Le frontend est configure dans:

- [frontend/package.json](/home/marti/Documents/DeveloppementProject/rowingLogBook/frontend/package.json)
- [frontend/next.config.mjs](/home/marti/Documents/DeveloppementProject/rowingLogBook/frontend/next.config.mjs)
- [frontend/app/page.js](/home/marti/Documents/DeveloppementProject/rowingLogBook/frontend/app/page.js)

### Fonctionnement reseau

- le frontend utilise `API_BASE_URL` pour ses appels serveur
- le rewrite Next.js utilise `API_PROXY_TARGET` pour router `/api/*`
- en Docker, ces variables pointent vers `http://backend:8080`
- hors Docker, elles peuvent pointer vers `http://localhost:8080`

## Lancement sans Docker

Ce mode est possible, mais il n'est pas le mode recommande pour l'equipe.

### Frontend

```bash
nvm use
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
mvn spring-boot:run
```

### Base PostgreSQL locale

Dans ce cas, il faut aussi disposer d'un PostgreSQL local compatible avec les valeurs utilisees par `application.yml` ou redefinir les variables d'environnement adequates.

## Fichiers importants

- [docker-compose.yml](/home/marti/Documents/DeveloppementProject/rowingLogBook/docker-compose.yml): orchestration complete du stack
- [.env](/home/marti/Documents/DeveloppementProject/rowingLogBook/.env): configuration locale du projet
- [.env.example](/home/marti/Documents/DeveloppementProject/rowingLogBook/.env.example): modele de configuration
- [backend/pom.xml](/home/marti/Documents/DeveloppementProject/rowingLogBook/backend/pom.xml): dependances Spring Boot
- [backend/src/main/resources/application.yml](/home/marti/Documents/DeveloppementProject/rowingLogBook/backend/src/main/resources/application.yml): configuration backend
- [frontend/package.json](/home/marti/Documents/DeveloppementProject/rowingLogBook/frontend/package.json): dependances frontend
- [frontend/next.config.mjs](/home/marti/Documents/DeveloppementProject/rowingLogBook/frontend/next.config.mjs): rewrite API

## Etat actuel de l'initialisation

Ce qui a ete fait:

- initialisation du frontend `Next.js`
- integration de `Tailwind CSS`
- initialisation d'une API `Spring Boot`
- ajout d'un endpoint de sante `GET /api/health`
- ajout de `PostgreSQL`
- ajout de `pgAdmin`
- ajout des fichiers `.env`
- standardisation du projet avec `Docker Compose`
- verrouillage des versions frontend pour stabiliser l'environnement

## Commandes utiles

Verifier la configuration compose:

```bash
docker compose config
```

Voir les logs:

```bash
docker compose logs -f
```

Voir les logs d'un seul service:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
docker compose logs -f pgadmin
```

Tester l'API:

```bash
curl http://localhost:8080/api/health
```

## Notes

- le premier `docker compose up --build` peut etre long, car Docker doit telecharger les images et Maven doit recuperer les dependances Java
- les donnees PostgreSQL sont persistantes tant que les volumes Docker ne sont pas supprimes
- les identifiants actuellement presents dans `.env` sont des valeurs de developpement, pas des secrets de production
