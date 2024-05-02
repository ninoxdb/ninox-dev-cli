## First POC for the CLI for downloading/uploading (aka importing/deploying) a database

## Commands
Usage: ninox [options] [command]

Ninox CLI SDK

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  init            Initialize a new Ninox SDK project
  object:import   Import an object from Ninox
  deploy          Deploy a Ninox SDK project
  list            List objects from a live Ninox Account
  help [command]  display help for command

Build the project
```bash
npm run build
```

### usage examples


// Import a database
e.g 

```bash
npm run start:quick  -- production object:import -id jcalcacgz6fd  

npm run start:quick  -- dev object:import -id v0bueq8w4n52
```

// Deploy to a live database
```bash
npm run start:quick  -- production deploy -id jcalcacgz6fd

npm run start:quick  -- dev deploy -id v0bueq8w4n52
```