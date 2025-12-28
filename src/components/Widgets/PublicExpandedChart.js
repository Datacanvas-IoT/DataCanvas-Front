import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadarController, Title, Tooltip, RadialLinearScale, registerables } from 'chart.js';
import { Line, Bar, Pie, Bubble, Radar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import ButtonRectangle from '../input/ButtonRectangle';
import TextBox from '../input/TextBox';
import shareService from '../../services/shareService';

ChartJS.register(...registerables);

/**
 * PublicExpandedChart - Expanded chart view for public/shared dashboards
 * Uses public API endpoints (no authentication required)
 */
export default function PublicExpandedChart({ widget, shareToken, setLoading = () => { } }) {
    const [chartData, setChartData] = useState([]);
    const [chartConfig, setChartConfig] = useState({ datasets: [] });
    const [chartOptions, setChartOptions] = useState({});
    const [recordLimit, setRecordLimit] = useState(100);

    useEffect(() => {
        configureChartOptions();
    }, []);

    useEffect(() => {
        if (Object.keys(chartOptions).length > 0) {
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
            title: { display: false },
            ticks: {
                display: widget.configuration.chart_type === 3 ? false : true,
                color: 'gray',
            },
            grid: {
                display: widget.configuration.chart_type === 3 ? false : true,
                color: '#111111',
            },
        };

        let x = {
            title: { display: false },
            type: (widget.configuration.x_axis == null) ? 'time' : 'category',
            ticks: {
                display: widget.configuration.chart_type === 3 ? false : true,
                color: 'gray',
            },
            grid: {
                display: widget.configuration.chart_type === 3 ? false : true,
                color: '#111111',
            },
        };

        if (x.type === 'time') {
            x.adapters = {
                date: { locale: enUS }
            };
        }

        setChartOptions({
            scales: { x, y },
            responsive: true,
            maintainAspectRatio: false,
        });
    };

    const loadChartData = async () => {
        if (!recordLimit || recordLimit === '' || isNaN(recordLimit) || recordLimit <= 0 || !Number.isInteger(Number(recordLimit))) {
            toast.error('Please enter a valid positive integer for the record limit.');
            return;
        }

        setLoading(true);

        try {
            const response = await shareService.getPublicChartData(shareToken, widget.id, recordLimit);
            if (response.status === 200) {
                setChartData(response.data);
            }
        } catch (err) {
            toast.error('Failed to load chart data.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const configureChart = () => {
        let newChartConfig = [];
        for (let series of chartData) {
            let color = '';
            if (widget.configuration.chart_type === 3) {
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
            };

            newChartConfig.push(dataset);
        }
        setChartConfig({ datasets: newChartConfig });
    };

    return (
        chartConfig.datasets.length > 0 && (
            <div className="mt-2 w-full h-full">
                <div className='w-full flex flex-wrap justify-center items-center mb-4 space-x-4'>
                    <div className='text-white text-sm mt-2'>
                        Limit Data Records
                    </div>
                    <div>
                        <TextBox 
                            placeholder='Enter number of records'
                            value={recordLimit}
                            onChange={(e) => setRecordLimit(e.target.value)} 
                        />
                    </div>
                    <div className='mt-2'>
                        <ButtonRectangle
                            text='Filter'
                            onClick={() => { loadChartData() }} 
                        />
                    </div>
                </div>
                {widget.configuration.chart_type === 1 && <Bubble data={chartConfig} options={chartOptions} />}
                {widget.configuration.chart_type === 2 && <Bar data={chartConfig} options={chartOptions} />}
                {widget.configuration.chart_type === 4 && <Line data={chartConfig} options={chartOptions} />}
            </div>
        )
    );
}
