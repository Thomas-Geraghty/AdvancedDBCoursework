# Advanced DB Coursework (CS3800)

API - Node.js API
Web - React frontend
utils - Data manipulation/importers

## Running

Put a selfsigned key and cert into `API/cert` with the following command:

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./API/cert/selfsigned.key -out ./API/cert/selfsigned.crt
```

From the project root, run `script/start`
