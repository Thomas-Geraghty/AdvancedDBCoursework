# Utils

The datasource used for these scripts is the UK street-level police open data,
available at [https://data.police.uk/data/](https://data.police.uk/data/)

## combine.rb

Takes files in a `data` directory relative to this script with the structure

```
data
->2019-11
->2019-12
->2020-01
->2020-02
->year-month
```

Any filenames containing `street` will be appended to `street.csv`

Any filenames containing `outcome` will be appended to `outcome.csv`

Both `street.csv` and `outcome.csv` will be written to the `data` directory

Run with `ruby combine.rb`

## unique_by_field.rb

Takes the csvs produced above and counts the unique occurences of terms in each
column

Edit the script to change the field/filename

Run with `ruby unique_by_field.rb`

## importer

Rust based importer. Requires the `street.csv` and `outcome.csv` files to be
present in the `src` directory.

Edit the script on line 129 to change server hostname.

Requires rust nightly, install with `rustup install nightly`

Run with `cargo +nightly run`
