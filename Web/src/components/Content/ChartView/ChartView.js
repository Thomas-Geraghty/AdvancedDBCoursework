import React, { useEffect } from 'react';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { getCrimeStats } from '../../API';
import './ChartView.scss'

const options = {
    legend: {
        display: false,
        maintainAspectRatio: false,
        responsive: true
    },
};

const bar_options = {
    legend: {
        display: false,
        maintainAspectRatio: true,
        responsive: false
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

const doughnutSize = 150

export default function ChartView() {
    const [ stats, setStats ] = React.useState([]);

    /**
     * Gets all the crime stats and stores them into local state
     */
    useEffect(() => {
        getCrimeStats('all').then(result => {
            setStats(result);
        })
    }, [])

    /**
     * Create a pie chart (doughnut) representing the amount of crimes
     * committed by type.
     */
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

            return <Doughnut data={data} options={options} className={'doughnut'}/>
        }
    }

    /**
     * Create a pie chart (doughnut) representing the amount of crimes
     * committed by policing region.
     */
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

            return <Doughnut data={data} options={options} className={'doughnut'}/>
        }
    }

    /**
     * Create a pie chart (doughnut) representing the amount of crimes
     * with an outcome versus those without an outcome.
     */
    function createOutcomeRatio() {
        if(stats.outcomeRatio) {
            let dataset = stats.outcomeRatio;
            let labels = dataset.map(stat => stat._id);
            let values = dataset.map(stat => stat.count);
            let colors = dataset.map(stat => stringToColour(stat._id));

            const data = {
                labels: labels,
                datasets: [{
                    label: '# Crime has Outcome',
                    data: values,
                    backgroundColor: colors

                }]
            }

            return <Doughnut data={data} options={options} className={'doughnut'}/>
        }
    }

    /**
    * Create a bar chart representing the amount of crimes
    * with outcomes on a crime type basis.
    */
    function createCrimesByOutcome() {
        if(stats.outcomesByHas) {
            let dataset = stats.outcomesByHas;
            let labels = dataset.map(stat => stat._id);
            let with_values = dataset.map(stat => stat.with_outcome);
            let without_values = dataset.map(stat => stat.without_outcome);

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

            return <Bar data={data} options={bar_options} width={500}/>
        }
    }

    /**
    * Create a bar chart representing the amount of crimes
    * with outcomes on a policing region basis.
    */
    function createRegionsByOutcome() {
        if(stats.outcomesByRegion) {
            let dataset = stats.outcomesByRegion;
            let labels = dataset.map(stat => stat._id);
            let with_values = dataset.map(stat => stat.with_outcome);
            let without_values = dataset.map(stat => stat.without_outcome);

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

            return <Bar data={data} options={bar_options} height={50}/>
        }
    }

    /**
    * Create a line graph representing the amount of crimes
    * committed over the time frame of the dataset
    */
    function createCrimesByTime() {
        if(stats.crimesByMonth) {
            let dataset = stats.crimesByMonth;
            let labels = dataset.map(stat => {
                let date = new Date(stat._id);
                return `${date.getFullYear()}-${date.getMonth()+1}`
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

            return <Line data={data} options={options} height={50}/>
        }
    }

    /**
    * Create a line graph representing the amount of crimes
    * committed each month (comparing between each year in the dataset).
    */
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

    // Render charts
    return (
        <div className="ChartView">
            <h3>Charts</h3>
            <div className="charts-row">
                <div className="doughnut">
                    <h4>Crimes by Type</h4>
                    {createCrimesByType()}
                </div>
                <div className="doughnut">
                    <h4>Crimes by Policing Region</h4>
                    {createCrimesByRegion()}
                </div>
                <div className="doughnut">
                    <h4>Crimes by Outcome Ratio</h4>
                    {createOutcomeRatio()}
                </div>
                <div>
                    <h4>Outcomes by Crime Type</h4>
                    {createCrimesByOutcome()}
                </div>
            </div>
            <div className="charts-row charts-row__single">
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

/**
 * Takes string and converts it into a color
 */
function stringToColour(str) {
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
