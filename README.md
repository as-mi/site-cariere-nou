# Site web Cariere v12

Acest repository conține codul sursă al viitoarei platforme web pentru proiectul Cariere.

## Instrucțiuni de dezvoltare

### Dependințe

Pentru a putea rula aplicația, trebuie să ai instalat [Node.js](https://nodejs.org/en/) și [npm](https://www.npmjs.com/).

După prima clonare a repo-ului sau după ce se modifică lista de dependințe,
trebuie să actualizezi package-urile instalate folosind comanda:

```sh
npm install
```

### Configurare bază de date

Aplicația este concepută să folosească sistemul de baze de date [PostgreSQL](https://www.postgresql.org/) pentru stocarea datelor.

Cel mai ușor mod de a obține o instanță de PostgreSQL locală pentru dezvoltare este folosind [Docker](https://www.docker.com/) și [Docker Compose](https://docs.docker.com/compose/). Dacă acestea sunt deja instalează, rulează comanda:

```sh
docker compose up
```

Docker va descărca imaginea de PostgreSQL, va crea și va porni un container cu baza de date configurată pentru mediul de dezvoltare.

### Configurare autentificare prin Google

Aplicația oferă suport pentru autentificarea cu contul de Google, [prin intermediul protocolului OAuth2](https://developers.google.com/identity/protocols/oauth2).

Pentru a putea folosi această funcționalitate, trebuie să creezi un fișier `.env.local` în acest director, în care să configurezi variabilele de mediu `GOOGLE_CLIENT_ID` și `GOOGLE_CLIENT_SECRET`:

```sh
GOOGLE_CLIENT_ID=<client ID>
GOOGLE_CLIENT_SECRET=<client secret>
```

Acestea pot fi găsite în proiectul asociat din [Google API Console](https://console.developers.google.com/), în zona de _API & Services_ > _Credentials_.

### Rulare server de dezvoltare

Pentru a porni un server de dezvoltare local, trebuie folosită comanda:

```sh
npm run dev
```

Aplicația va fi disponibilă la adresa `http://localhost:3000`.

### Verificare cod

Pe măsură ce lucrezi la cod, este recomandat să rulezi comenzile

```sh
npm run format
```

pentru a formata automat codul cu [Prettier](https://prettier.io/), și

```sh
npm run lint
```

pentru a verifica cu [ESLint](https://eslint.org/) că nu există potențiale probleme
sau încălcări ale bunelor practici.

### Gestionare bază de date folosind Prisma

Aplicația interacționează cu baza de date folosind biblioteca [Prisma](https://www.prisma.io/). Odată cu instalarea dependințelor prin `npm install`, se instalează și interfața din linia de comandă a Prisma, care poate fi accesată rulând `npx prisma`.

#### Comenzi uzuale

Pentru a rula și aplica migrațiile existente pe baza de date din mediul de dezvoltare:

```sh
npx prisma migrate dev
```

Pentru a crea și aplica o nouă migrație după ce ai modificat `prisma/schema.prisma`:

```sh
npx prisma migrate dev --name "nume-migratie"
```

Pentru a regenera codul client după ce ai modificat schema bazei de date:

```sh
npx prisma generate
```

Pentru a deschide [Prisma Studio](https://www.prisma.io/studio), un mediu de lucru vizual pentru administrarea bazei de date:

```sh
npx prisma studio
```
