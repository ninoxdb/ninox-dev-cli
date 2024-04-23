## First POC for the CLI for downloading a database


### usage

Build the project
```bash
npm run build
```

// Import a database
e.g 

```bash
npm run start:quick  -- object:import -id jcalcacgz6fd -w ryn13yp7yqzf0e9mx -t Database -d localhost:8080 -k b5736430-3833-11ee-80c3-8b4a1bbee840 -p http  

npm run start:quick  -- object:import -id v0bueq8w4n52 -w qnbfhl32kbi45d5ii -t Database -d saqib2.ninoxdb.de -k 557d8a80-7d5f-11ee-aee7-f3c1aeaf6d5b
```

// Deploy to a live database
```bash
npm run start:quick  -- deploy -id jcalcacgz6fd -w ryn13yp7yqzf0e9mx -t Database -d localhost:8080 -k b5736430-3833-11ee-80c3-8b4a1bbee840 -p http

npm run start:quick  -- deploy -id v0bueq8w4n52 -w qnbfhl32kbi45d5ii -t Database -d saqib2.ninoxdb.de -k 557d8a80-7d5f-11ee-aee7-f3c1aeaf6d5b
```