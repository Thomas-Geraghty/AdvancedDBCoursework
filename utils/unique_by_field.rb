require 'csv'
require 'set'

filename = 'street.csv'

field_name = 'Crime ID'

unique_values = Set[]

puts 'Starting read'

count = 0

CSV.foreach(filename, headers: true) do |row|
  unique_values.add(row[field_name])
  count += 1
  puts("#{count} records processed") if (count % 1000) == 0
end

puts "There are #{unique_values.count} unique #{field_name} values"
