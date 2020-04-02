# Advanced DB Coursework (CS3800)

API - Node.js API
Web - React frontend
utils - Data manipulation/importers

## Running

Put a selfsigned key and cert into `API/cert` with the following command:

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ./API/cert/selfsigned.key -out ./API/cert/selfsigned.crt
```

On first run, run `script/setup` from the project root.

From the project root, run `script/start` to start the API and frontend server
processes. Both will log to the same console window. If your server is running
on a different machine, run `REACT_APP_API_HOST=<host-ip> script/start` where
`host-ip` is the IP of the other machine.

The console will display `Initialized controller` when the API is ready for
queries.

The frontend is accessible on `https://<host_ip>:3000/`
The API is accessible on `https://<host_ip>:8443/api/`

## Certificate notes

If using self-signed certificates (as deployed by default), you may get security
warnings. Visit `https://<host_ip>:8443/api/crimes/types` first and accept the
security warnings before visiting `https://<host_ip>:3000/` for the main
application

## Importing the dataset

`utils` contains a collection of scripts focused on importing data. See
`utils/README.md` for details on how to use these scripts

## Tidying up the dataset

This will unset any `location` field where the `coordinates` are [ 0, 0 ]

```javascript
db.crimes.updateMany(
  { "location.coordinates": [0.0, 0.0] },
  { $unset: { location: 1 } }
)
```

Use this to unset any empty `lsoa_code` and `lsoa_name` fields

```javascript
db.crimes.updateMany(
  { lsoa_code: "" },
  { $unset : { lsoa_code : 1 } }
)
db.crimes.updateMany(
  { lsoa_name: "" },
  { $unset : { lsoa_name : 1 } }
)
```

This will add a date field to every document, parsed from the month field. It
allows an index by date to be created, and massively speeds up querying

```javascript
db.crimes.aggregate([
    {
        $project: {
            date: { $dateFromString: { dateString: "$month" } },
            _id: 1, crime_id: 1, month: 1, reported_by: 1, falls_within: 1,
            location: 1, street_name: 1, crime_type: 1, lsoa_code: 1,
            lsoa_name: 1, last_outcome_category: 1
        }
    },
    { $out: "crimes" }
])
```

## Creating indexes

The location index is required for querying on distance from a point, while
date and crime type are suggested to improve performance for some queries.

```javascript
db.crimes.createIndex( { "location": "2dsphere" } )
db.crimes.createIndex( { "date": 1 } )
db.crimes.createIndex( { "crime_type": 1 } )
```

## API Documentation

Import `./swagger.yaml` into https://editor.swagger.io/ to view the API documentation
