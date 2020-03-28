use mongodb::Client;
use std::process;
use std::fs::File;
use bson::{doc, Document};

fn import_street(client: &Client) {
  let db = client.database("police");
  let file_path = "src/street.csv";
  let file = File::open(file_path).unwrap();
  let mut rdr = csv::Reader::from_reader(file);
  let crimes = db.collection("crimes");

  let mut docs: Vec<Document> = Vec::new();
  let mut count = 0;
  let mut i = 0;

  for result in rdr.records() {
    match result {
        Ok(record) => {
          let long: f32;
          let lat: f32;

          match &record[4].parse::<f32>() {
            Ok(val) => long = *val,
            Err(_err) => long = 0.0
          }

          match &record[5].parse::<f32>() {
            Ok(val) => lat = *val,
            Err(_err) => lat = 0.0
          }
          let rec = doc! {
            "crime_id": &record[0],
            "month": &record[1],
            "reported_by": &record[2],
            "falls_within": &record[3],
            "location": {
              "type": "Point",
              "coordinates": [long, lat]
            },
            "street_name": &record[6],
            "lsoa_code": &record[7],
            "lsoa_name": &record[8],
            "crime_type": &record[9],
            "last_outcome_category": &record[10],
            "context": &record[11]
          };
          docs.push(rec);
          count += 1;
          i += 1;
          if i == 1000 {
            crimes.insert_many(docs, None);
            docs = Vec::new();
            i = 0;
            println!("{:?} records inserted", count);
          }
        },
        Err(err) => {
            println!("error reading CSV: {}", err);
            process::exit(1);
        }
    }
  }
  crimes.insert_many(docs, None);
  println!("{:?} records inserted", count);
}

fn import_outcome(client: &Client) {
  let db = client.database("police");
  let file_path = "src/outcome.csv";
  let file = File::open(file_path).unwrap();
  let mut rdr = csv::Reader::from_reader(file);
  let outcomes = db.collection("outcomes");

  let mut docs: Vec<Document> = Vec::new();
  let mut count = 0;
  let mut i = 0;

  for result in rdr.records() {
    match result {
        Ok(record) => {
          let long: f32;
          let lat: f32;

          match &record[4].parse::<f32>() {
            Ok(val) => long = *val,
            Err(_err) => long = 0.0
          }

          match &record[5].parse::<f32>() {
            Ok(val) => lat = *val,
            Err(_err) => lat = 0.0
          }
          let rec = doc! {
            "crime_id": &record[0],
            "month": &record[1],
            "reported_by": &record[2],
            "falls_within": &record[3],
            "location": {
              "type": "Point",
              "coordinates": [long, lat]
            },
            "street_name": &record[6],
            "lsoa_code": &record[7],
            "lsoa_name": &record[8],
            "outcome_type": &record[9]
          };
          docs.push(rec);
          count += 1;
          i += 1;
          if i == 1000 {
            outcomes.insert_many(docs, None);
            docs = Vec::new();
            i = 0;
            println!("{:?} records inserted", count);
          }
        },
        Err(err) => {
            println!("error reading CSV: {}", err);
            process::exit(1);
        }
    }
  }
  outcomes.insert_many(docs, None);
  println!("{:?} records inserted", count);
}

fn main() {
  let client = Client::with_uri_str("mongodb://192.168.0.80:27017/").unwrap();

  import_street(&client);
  import_outcome(&client);
}
