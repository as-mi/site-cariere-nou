# Instrucțiuni pentru deployment

Pentru a rula aplicația Cariere în producție, trebuie urmați (o parte) din pașii pentru configurarea mediului de dezvoltare.

## Specificații hardware

- Un procesor modern, de preferat multi-core (ca să poată ține atât aplicația cât și baza de date)
- Cel puțin 2 GiB de RAM (aplicația nu va consuma mai mult de 1 GiB de RAM în general, dar e bine să avem memorie în plus pentru sistemul de operare și baza de date)
- Cel puțin 10 GiB spațiu de stocare (pentru a instala toate programele și package-urile de care avem nevoie; în funcție de câți participanți și câte CV-uri se încarcă în platformă, s-ar putea să fie nevoie de mai mult spațiu de stocare)

### Configurația actuală

Noi folosim în producție o mașină virtuală de la [DigitalOcean](https://www.digitalocean.com/), aflată în [regiunea FRA1](https://docs.digitalocean.com/products/platform/availability-matrix/#available-datacenters) (Frankfurt, Germania), pe care avem [Ubuntu Server](https://ubuntu.com/server) 22.04 cu toate actualizările la zi.

## Instalare Node.js

Pentru a gestiona versiunea de [Node.js](https://nodejs.org/en/) folosită de aplicație, recomandăm utilizarea unui program ca [`nvm`](https://github.com/nvm-sh/nvm).

## Configurarea NGINX ca reverse proxy

Din raționamente de securitate și de performanță, nu este o idee bună să expunem aplicația web direct pe internet. De aceea, pe server-ul ASMI folosim [NGINX](https://www.nginx.com/) ca un gateway/[reverse proxy](https://en.wikipedia.org/wiki/Reverse_proxy). Tot NGINX se ocupă și de criptarea conexiunilor externe cu HTTPS, cu certificate TLS de la [Let's Encrypt](https://letsencrypt.org/), gestionate automat prin [Certbot](https://certbot.eff.org/).

## Configurare variabile de mediu

Aplicația citește unii parametrii de configurare din [variabilele de mediu](https://en.wikipedia.org/wiki/Environment_variable) (credențialele de acces la baza de date; _client ID_ și _client secret_ pentru autentificarea cu Google/Facebook; etc). Pentru a seta și persista aceste variabile, poți crea un fișier `.env.local` în directorul aplicației în care să le definești.

## Instalarea dependency-urilor

Înainte de prima rulare a aplicației, sau după ce s-au făcut actualizări care au modificat lista de pachete, trebuie să rulăm:

```sh
npm install
```

## Rularea migrațiilor și actualizarea clientului Prisma

Dacă s-au adăugat migrații noi și s-a modificat schema bazei de date, trebuie să le aplicăm pe baza de date din producție rulând comanda:

```sh
npx prisma migrate deploy
```

După aceea, e bine să rulăm și

```sh
npx prisma generate
```

ca să ne asigurăm că se actualizează și codul client auto-generat de Prisma.

## Compilarea versiunii de producție a aplicației

Poți compila versiunea de producție a aplicației și a server-ului de Next.js folosind comanda:

```sh
npm run build
```

## Rularea aplicației

Dacă compilarea s-a finalizat cu succes, poți porni aplicația în modul de producție prin comanda:

```sh
npm run start
```
