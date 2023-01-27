# Instrucțiuni pentru deployment

Pentru a rula aplicația în producție, în primul rând trebuie urmați (cel puțin o parte) din pașii de setup din [documentația de configurare a mediului dezvoltare](CONTRIBUTING.md).

În particular, trebuie creat un fișier `.env.local` în care să fie setate toate credențialele/secretele de care are nevoie aplicația (URL-ul la care va fi disponibilă; credențialele contului de e-mail; client ID și client secret pentru autentificarea cu Google/Facebook; etc.).

După ce au fost instalate dependency-urile și au fost configurate variabilele de mediu, poți compila versiunea de producție a aplicației și a server-ului de Next.js folosind comanda:

```sh
npm run build
```

Dacă compilarea s-a finalizat cu succes, poți porni un server de producție cu aplicația prin comanda:

```sh
npm run start
```
