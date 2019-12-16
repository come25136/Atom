# Atom Project
I don't want to process GTFS as it is 😟,  
Try using Atom at such times 🤗.

# Let's start up

```bash
$ npm i
$ npm run build
$ npm start
```

# Environment example

.env

```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=atom
DB_LOGGING=false
DB_SYNC=false

GTFS_TO_DB=false

REALTIME=true

PORT=3000
```

# Database

Use MySQL or MariaDB.

# Where are the references?

Try accessing `localhost:3000` after [Let's start up](#lets-start-up).  
There should be what you want.

# Q&A

## Is there an Atom public server?
> No :(  
When CI is setting and merged with master, it will be deployed to the public server.  
Please wait patiently. :)

## Is the Docker image published?
> No :(  
Once CI is set, it will be published :)
