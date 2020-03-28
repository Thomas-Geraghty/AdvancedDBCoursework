months = Dir['data/*']
regions = {}

street_header = 'Crime ID,Month,Reported by,Falls within,Longitude,Latitude,Location,LSOA code,LSOA name,Crime type,Last outcome category,Context'
outcome_header = 'Crime ID,Month,Reported by,Falls within,Longitude,Latitude,Location,LSOA code,LSOA name,Outcome type'

street_file = File.open('data/street.csv', 'w')
outcome_file = File.open('data/outcome.csv', 'w')
street_file.puts street_header
outcome_file.puts outcome_header

months.each do |month|
  datasets = Dir["#{month}/*"]
  datasets.each do |region|
    puts "Appending #{region}"
    filename = region.split('-')
    filename = filename.slice(3, filename.length).join('-').to_sym
    unless regions.include? filename
      regions[filename] = File.open("data/#{filename}", 'w')
      if filename.to_s.include? 'street'
        regions[filename].puts street_header
      elsif filename.to_s.include? 'outcome'
        regions[filename].puts outcome_header
      end
    end
    content = File.readlines(region).map { |l| l.chomp }
    content.shift
    content.each do |line|
      regions[filename].puts line
    end
    if filename.to_s.include? 'street'
      content.each do |line|
        street_file.puts line
      end
    elsif filename.to_s.include? 'outcome'
      content.each do |line|
        outcome_file.puts line
      end
    end
  end
end

street_count = 0
outcome_count = 0
total_count = 0

regions.each do |name, file|
  region_count = `wc -l data/#{name}`.split.first.to_i
  puts "#{name} has #{region_count} incidents"
  street_count += region_count if name.to_s.include? 'street'
  outcome_count += region_count if name.to_s.include? 'outcome'
  total_count += region_count
  file.close
end

street_file.close
outcome_file.close

puts "There are #{total_count} incidents across all regions, #{street_count} street events and #{outcome_count} outcome events"
