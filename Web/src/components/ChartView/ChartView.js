import React, { useEffect } from 'react';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { getCrimeStats } from '../../client/API';
import './ChartView.scss'

const data = {
    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
    datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
    }]
};

const options = {
    legend: {
        display: false,
        maintainAspectRatio: true,
        responsive: false
    },
};

const bar_options = {
    responsive: false,
    legend: {
        display: false,
        maintainAspectRatio: true,
    },
    scales: {
        yAxes: [{
            display: true,
            type: "logarithmic",
            ticks: {
                min: 0,
                max: 10000000,
                callback: function (value, index, values) {
                    if (value === 10000000) return "10M";
                    if (value === 2000000) return "2M";
                    if (value === 500000) return "500K";
                    if (value === 100000) return "100K";
                    if (value === 20000) return "20K";
                    if (value === 5000) return "5K";
                    if (value === 1000) return "1K";
                    return null;
                }
           }
        }]
    }
}

const doughnutSize = 300

export default function ChartView() {
    const [ stats, setStats ] = React.useState([]);

    useEffect(() => {
        getCrimeStats('all').then(result => {
            setStats(result);
        })
    }, [])

    function createCrimesByType() {
        if(stats.crimesByType) {
            let dataset = stats.crimesByType;
            let labels = dataset.map(stat => stat._id);
            let values = dataset.map(stat => stat.count);
            let colors = dataset.map(stat => stringToColour(stat._id));

            const data = {
                labels: labels,
                datasets: [{
                    label: '# Crimes Per Type',
                    data: values,
                    backgroundColor: colors
                }]
            }

            return <Doughnut data={data} options={options} height={doughnutSize}/>
        }
    }

    function createCrimesByRegion() {
        if(stats.crimesByRegion) {
            let dataset = stats.crimesByRegion;
            let labels = dataset.map(stat => stat._id);
            let values = dataset.map(stat => stat.count);
            let colors = dataset.map(stat => stringToColour(stat._id));

            const data = {
                labels: labels,
                datasets: [{
                    label: '# Crimes Per Policing Region',
                    data: values,
                    backgroundColor: colors

                }]
            }

            return <Doughnut data={data} options={options} height={doughnutSize}/>
        }
    }

    function createCrimesByOutcome() {
        console.log(stats)
        if(stats.outcomesByHas) {
            let dataset = stats.outcomesByHas;
            let labels = dataset.map(stat => stat._id);
            let with_values = dataset.map(stat => stat.with_outcome);
            let without_values = dataset.map(stat => stat.without_outcome);
            let colors = dataset.map(stat => stringToColour(stat._id));

            const data = {
                labels: labels,
                datasets: [
                    {
                        label: '# With outcome',
                        data: with_values,
                        backgroundColor: "rgba(50,205,50,0.5)",
                        borderColor: "rgba(50,205,50,1)",
                        borderWidth: 1
                    },
                    {
                        label: '# Without outcome',
                        data: without_values,
                        backgroundColor: "rgba(220,20,60,0.5)",
                        borderColor: "rgba(220,20,60,1)",
                        borderWidth: 1
                    }
                ]
            }

            return <Bar data={data} options={bar_options} height={doughnutSize} width={doughnutSize * 2}/>
        }
    }

    function createRegionsByOutcome() {
        console.log(stats)
        if(stats.outcomesByRegion) {
            let dataset = stats.outcomesByRegion;
            let labels = dataset.map(stat => stat._id);
            let with_values = dataset.map(stat => stat.with_outcome);
            let without_values = dataset.map(stat => stat.without_outcome);
            let colors = dataset.map(stat => stringToColour(stat._id));

            const data = {
                labels: labels,
                datasets: [
                    {
                        label: '# With outcome',
                        data: with_values,
                        backgroundColor: "rgba(50,205,50,0.5)",
                        borderColor: "rgba(50,205,50,1)",
                        borderWidth: 1
                    },
                    {
                        label: '# Without outcome',
                        data: without_values,
                        backgroundColor: "rgba(220,20,60,0.5)",
                        borderColor: "rgba(220,20,60,1)",
                        borderWidth: 1
                    }
                ]
            }

            return <Bar data={data} options={bar_options} height={doughnutSize * 1.15} width={doughnutSize * 3.5}/>
        }
    }

    function createCrimesByTime() {
        if(stats.crimesByMonth) {
            let dataset = stats.crimesByMonth;
            let labels = dataset.map(stat => {
                let date = new Date(stat._id);
                return `${date.getFullYear()}-${date.getMonth()}`
            });
            let values = dataset.map(stat => stat.count);
            let colors = dataset.map(stat => stringToColour(stat._id));

            const data = {
                labels: labels,
                datasets: [{
                    label: '# Crimes Per Month',
                    data: values,
                    backgroundColor: colors
                }]
            }

            return <Line data={data} options={options} height={'50rem'}/>
        }
    }

    function createCrimesByMonth() {
        if(stats.crimesByMonth) {
            let dataset = stats.crimesByMonth;
            let years = {};
            let datasets = [];

            // Gets data into year: month: count
            dataset.forEach(stat => {
                let date = new Date(stat._id);
                if(!years[date.getFullYear()]) {
                    years[date.getFullYear()] = {};
                }
            });
            dataset.forEach(stat => {
                let date = new Date(stat._id);
                years[date.getFullYear()][date.toLocaleString('default', { month: 'short' })] = stat.count;
            });

            const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            for(const year in years) {
                datasets.push({
                    label: `Crime by Month in ${year}`,
                    data: Object.keys(years[year]).map(k => years[year][k]),
                });
            }

            const data = {
                labels: labels,
                datasets: datasets,
            }

            return <Line data={data} options={options} height={'50rem'}/>
        }
    }

    // Render
    return (
        <div className="ChartView">
            <h3>Charts</h3>
            <div className="charts-row">
                <div>
                    <h4>Crimes by Type</h4>
                    {createCrimesByType()}
                </div>
                <div>
                    <h4>Crimes by Policing Region</h4>
                    {createCrimesByRegion()}
                </div>
            </div>
            <div className="charts-row">
                <div>
                    <h4>Outcomes by Crime Type</h4>
                    {createCrimesByOutcome()}
                </div>
                <div>
                    <h4>Outcomes by Region</h4>
                    {createRegionsByOutcome()}
                </div>
            </div>
            <div className="charts-row charts-row__single">
                <div>
                    <h4>Crimes by Time</h4>
                    {createCrimesByTime()}
                </div>
            </div>
            <div className="charts-row charts-row__single">
                <div>
                    <h4>Crimes by Month</h4>
                    {createCrimesByMonth()}
                </div>
            </div>

        </div>
    )
}

var stringToColour = function(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  }
