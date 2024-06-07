import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadarController, Title, Tooltip, RadialLinearScale, registerables } from 'chart.js';
import { Line, Bar, Pie, Bubble, Radar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadarController, RadialLinearScale, Title, Tooltip);
ChartJS.register(...registerables);

/*
    * This component is used to display the expanded chart widget.
    * It will display the chart with the data provided in the widget.
    * The widget data is passed as props to this component.
    * STRUCTURE OF WIDGET DATA:
    * {
        "widget_name": STRING
        "widget_type": NUMBER, For charts, it is 1.
        "dataset": NUMBER,
        "project_id": NUMBER,
        "configuration": {
            "x_axis": NUMBER,
            "chart_type": NUMBER,
            "ChartSeries": [
                {
                    "series_name": STRING,
                    "clm_id": NUMBER,
                    "device_id": NUMBER
                },
                {
                    "series_name": "Series 2",
                    "clm_id": 107,
                    "device_id": 26
                }
            ]
        }
    * }
*/
export default function ExpandedChart({ widget, setLoading = () => { }, navigate = () => { } }) {
    // ---------- States for chart data ----------
    const [chartData, setChartData] = useState([]);

    // ---------- States for chart configuration ----------
    const [chartConfig, setChartConfig] = useState({
        datasets: []
    });

    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        configureChartOptions();
    }, []);

    useEffect(() => {
        if (chartOptions != {}) {
            loadChartData();
        }
    }, [chartOptions]);

    useEffect(() => {
        if (chartData.length > 0 && chartData[0].data.length > 0) {
            configureChart();
        }
    }, [chartData]);

    const configureChartOptions = () => {
        let y = {
            title: {
                display: false,
            },
            ticks: {
                display: widget.configuration.chart_type == 3 ? false : true,
                color: 'gray', // changes the color of the y-axis labels
            },
            grid: {
                display: widget.configuration.chart_type == 3 ? false : true,
                color: '#111111', // changes the color of the y-axis grid lines
            },
        }

        let x = {
            title: {
                display: false,
            },
            type: (widget.x_axis == null) ? 'time' : 'category',
            ticks: {
                display: widget.configuration.chart_type == 3 ? false : true,
                color: 'gray', // changes the color of the x-axis labels
            },
            grid: {
                display: widget.configuration.chart_type == 3 ? false : true,
                color: '#111111', // changes the color of the x-axis grid lines
            },
        }

        if (x.type == 'time') {
            x.adapters = {
                date: {
                    locale: enUS
                }
            }
            // x.time = {
            //     unit: 'minute'
            // }
        }

        setChartOptions({
            scales: {
                x: x,
                y: y
            },
            responsive: true,
            maintainAspectRatio: false,
        });
    }

    /*
        * This function loads chart data from the server.
        * ENDPOINT: http://localhost:3001/api/data/get/chart/<widget.id>.
        * METHOD: GET,
        * Headers: localStorage.getItem(auth-token)
    */
    const loadChartData = async () => {
        setLoading(true);

        try {
            const response = await axios.get(`http://localhost:3001/api/data/get/chart/${widget.id}`, {
                headers: {
                    'authorization': localStorage.getItem('auth-token')
                }
            });

            if (response.status == 200) {
                setChartData(response.data);
            }
        } catch (err) {
            toast.error('Failed to load chart data.');
            navigate('/dashboard');
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    /*
        * This function configures the chart for display.
        * It will set the labels and datasets for the chart.
        * The datasets are generated based on the series data.
        * The colors for each series are generated randomly.
        * STRUCTURE OF chartConfig STATE:
        * {
        *       labels: [STRING],
        *       datasets: [
        *           { label: STRING, data: [NUMBER], fill: BOOLEAN, borderColor: STRING, tension: NUMBER, borderWidth: NUMBER }
        *       ]
        * }
    */
    const configureChart = () => {
        let newChartConfig = [];
        for (let series of chartData) {
            let color = '';
            if (widget.configuration.chart_type == 3) {
                color = ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600'];
            } else {
                color = `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 100)}, 1)`;
            }

            let dataset = {
                label: series.name,
                data: series.data,
                fill: false,
                backgroundColor: color,
                borderColor: color,
                tension: 0.2,
                borderWidth: 1
            }

            newChartConfig.push(dataset);
        }
        console.log(newChartConfig);
        setChartConfig({
            datasets: newChartConfig
        });
    }

    return (
        chartConfig.datasets.length > 0 &&
        < div className={`mt-8 w-full h-full`
        }>
            {(widget.configuration.chart_type == 1) && <Bubble data={chartConfig} options={chartOptions} />}
            {widget.configuration.chart_type == 2 && <Bar data={chartConfig} options={chartOptions} />}
            {widget.configuration.chart_type == 3 && (<Pie data={chartConfig} options={chartOptions} />)}
            {(widget.configuration.chart_type == 4) && <Line data={chartConfig} options={chartOptions} />}
        </div >
    );
}