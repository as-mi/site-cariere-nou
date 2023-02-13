# Instrucțiuni de dezvoltare

## Dependințe

Pentru a putea rula aplicația, trebuie să ai instalat [Node.js](https://nodejs.org/en/) și [npm](https://www.npmjs.com/).

După prima clonare a repo-ului sau după ce se modifică lista de dependințe,
trebuie să actualizezi package-urile instalate folosind comanda:

```sh
npm install
```

## Configurare bază de date

Aplicația este concepută să folosească sistemul de baze de date [PostgreSQL](https://www.postgresql.org/) pentru stocarea datelor.

Cel mai ușor mod de a obține o instanță de PostgreSQL locală pentru dezvoltare este folosind [Docker](https://www.docker.com/) și [Docker Compose](https://docs.docker.com/compose/). Dacă acestea sunt deja instalează, rulează comanda:

```sh
docker compose up
```

Docker va descărca imaginea de PostgreSQL, va crea și va porni un container cu baza de date configurată pentru mediul de dezvoltare.

## Configurare environment variables

Pentru a configura unele funcționalități, trebuie să creezi un fișier `.env.local` în acest director, în care să setezi variabilele de mediu descrise mai jos.

### Configurare trimitere de e-mailuri prin SMTP

Înregistrarea și autentificarea prin e-mail și parolă necesită un cont de e-mail, din care aplicați va trimite mesaje de confirmare a adresei și de resetare a parolei.

Pentru a trimite mail-uri, aplicația se poate conecta la un cont de e-mail prin protocolul [SMTP](https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol), ajutată de biblioteca [nodemailer](https://nodemailer.com/). Configurația este citită din două variabile de mediu:

```
EMAIL_CONNECTION_STRING=<setări cont SMTP>
EMAIL_FROM=<adresa de pe care se vor trimite e-mailurile>
```

Pentru o adresă de [GMail](https://gmail.com/), trebuie adaptate setările de mai jos:

```
EMAIL_CONNECTION_STRING=smtp://adresă.de.e-mail@domeniu.ro:parolă:smtp.gmail.com:587
EMAIL_FROM='"Aplicația Cariere" <adresă.de.e-mail@domeniu.ro>'
```

### Configurare autentificare prin Google

Aplicația oferă suport pentru autentificarea cu contul de Google, [prin intermediul protocolului OAuth2](https://developers.google.com/identity/protocols/oauth2).

Pentru a putea folosi această funcționalitate, trebuie setate variabilele de mediu `GOOGLE_CLIENT_ID` și `GOOGLE_CLIENT_SECRET`:

```sh
GOOGLE_CLIENT_ID=<client ID>
GOOGLE_CLIENT_SECRET=<client secret>
```

Acestea pot fi găsite în proiectul asociat din [Google API Console](https://console.developers.google.com/), în zona de _API & Services_ > _Credentials_.

## Rulare server de dezvoltare

Pentru a porni un server de dezvoltare local, trebuie folosită comanda:

```sh
npm run dev
```

Aplicația va fi disponibilă la adresa `http://localhost:3000`.

## Creare cont de admin

Pentru a crea un cont de administrator în baza de date, se poate folosi comanda:

```sh
npm run seed:admin
```

O să pornească un script interactiv care va solicita informațiile necesare creării contului de admin.

## Verificare cod

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

## Rulare teste

### Unit tests

Pentru a rula testele automate folosind [Jest](https://jestjs.io/), folosește comanda:

```sh
npm run test
```

Aceasta va porni Jest în „watch mode”, adică vă monitoriza fișierele pe care le modifici și va rula automat testele corespunzătoare. Dacă vrei să rulezi toate testele o singură dată, poți folosi în schimb `npx jest`.

### End-to-end tests

Aplicația are și câteva [teste end-to-end](https://smartbear.com/learn/automated-testing/what-is-end-to-end-testing/) care verifică funcționarea generală a aplicației din perspectiva utilizatorului final. Acestea sunt implementate folosind [Playwright](https://playwright.dev/).

Pentru a putea rula pentru prima dată testele, după ce ai rulat deja `npm install`, mai trebuie să instalezi și dependency-urile specifice Playwright:

```sh
npx playwright install
```

De fiecare dată când faci modificări la codul sursă al aplicației, va trebui să recompilezi varianta de producție a ei (documentația oficială Next.js [recomandă rularea testelor E2E față de codul de producție](https://nextjs.org/docs/testing#running-your-playwright-tests)). Poți face acest lucru folosind comanda:

```sh
npm run build
```

Nu e nevoie să recompilezi aplicația dacă ai modificat doar codul sursă al testelor.

Într-un final, pentru a rula testele, trebuie să te asiguri că **baza de date de dezvoltare este pornită și accesibilă** și apoi să rulezi:

```sh
npm run test:e2e
```

Playwright va porni server-ul de producție pe `localhost` la port-ul `3000` și va începe să execute testele față de această instanță a aplicației. Ar trebui să vezi o fereastră nouă de Google Chrome, care este controlată automat de Playwright.

## Gestionare bază de date folosind Prisma

Aplicația interacționează cu baza de date folosind biblioteca [Prisma](https://www.prisma.io/). Odată cu instalarea dependințelor prin `npm install`, se instalează și interfața din linia de comandă a Prisma, care poate fi accesată rulând `npx prisma`.

### Comenzi uzuale

Pentru a rula și aplica migrațiile existente pe baza de date din mediul de dezvoltare:

```sh
npx prisma migrate dev
```

Pentru a crea și aplica o nouă migrație după ce ai modificat `prisma/schema.prisma`:

```sh
npx prisma migrate dev --name "nume-migratie"
```

Dacă nu ești sigur de codul SQL pe care îl va genera migrația, sau vrei să-l poți revizui înainte de a-l aplica, poți adăuga și flag-ul `--create-only`. Asta va genera migrația fără a o aplica pe baza de date de dezvoltare. O poți aplica ulterior rulând din nou `npx prisma migrate`.

Pentru a regenera codul client după ce ai modificat schema bazei de date:

```sh
npx prisma generate
```

Pentru a deschide [Prisma Studio](https://www.prisma.io/studio), un mediu de lucru vizual pentru administrarea bazei de date:

```sh
npx prisma studio
```
