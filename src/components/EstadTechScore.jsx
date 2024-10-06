import React, { useState, useEffect, useMemo } from 'react';
import { USER_ENDPOINT } from '../utils/apiRoutes';
import { Chart } from 'primereact/chart';
import { PulseLoader } from 'react-spinners';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const TechScore = () => {
    const [isLoadingChart, setIsLoadingChart] = useState(true);
    const [isLoadingTable, setIsLoadingTable] = useState(true);
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [tableData, setTableData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(null);

    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 6)));
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));

    const generateGradientColors = (counts) => {
        const max = Math.max(...counts);
        return counts.map(count => {
            const ratio = count / max;
            const green = Math.round(255 * (1 - ratio)); // Disminuye de 255 a 0
            return `rgba(255, ${green}, 0, 0.5)`;
        });
    };
    
    const generateBorderColors = (counts) => {
        const max = Math.max(...counts);
        return counts.map(count => {
            const ratio = count / max;
            const green = Math.round(255 * (1 - ratio));
            return `rgba(255, ${green}, 0, 1)`;
        });
    };    
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingChart(true);
            setIsLoadingTable(true);
            try {
                const start = startDate.toISOString().split('T')[0];
                const end = endDate.toISOString().split('T')[0];
                const response = await fetch(`${USER_ENDPOINT}/score?startDate=${start}&endDate=${end}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch users data');
                }

                const data = await response.json();
                // console.log('Received data:', data);

                const labels = data.map(item => `${item.name} ${item.lastname}`);
                const counts = data.map(item => item.count);

                const backgroundColors = generateGradientColors(counts);
                const borderColors = generateBorderColors(counts);

                const chartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'OTs reabiertas',
                            data: counts,
                            backgroundColor: backgroundColors,
                            borderColor: borderColors,
                            borderWidth: 1,
                            type: 'bar'
                        }
                    ]
                };

                const chartOptions = {
                    maintainAspectRatio: false,
                    responsive: true,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Técnicos',
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                }
                            },
                            ticks: {
                                font: {
                                    size: 14
                                }
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'OTs reabiertas',
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                }
                            },
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1,
                                callback: function(value) {
                                    if (Number.isInteger(value)) {
                                        return value;
                                    }
                                },
                                font: {
                                    size: 14
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    return `${label}: ${context.raw}`;
                                }
                            },
                            bodyFont: {
                                size: 14
                            },
                            titleFont: {
                                size: 14
                            }
                        }
                    }
                };

                setChartData(chartData);
                setChartOptions(chartOptions);
                
                const tableDataArray = data.map(tech => ({
                    name: tech.name,
                    lastname: tech.lastname,
                    count: tech.count
                }));

                setTableData(tableDataArray);

            } catch (error) {
                console.error('Error fetching or processing data:', error);
            } finally {
                setIsLoadingChart(false);
                setIsLoadingTable(false);
            }
        };

        fetchData();
    }, [startDate, endDate]);

    const renderHeader = () => {
        return (
            <div className="grid grid-flow-col auto-cols-max">
                <div className="flex justify-between">
                    <IconField iconPosition="left">
                        <InputIcon className="pi pi-search" />
                        <InputText 
                            type="search"
                            onInput={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Buscar..." />
                    </IconField>
                </div>
            </div>
        );
    }; 
    
    const header = useMemo(renderHeader, []);

    return (
        <div>
            <div className="card mt-3 h-auto w-auto">
                {isLoadingChart ? (
                    <div className='flex justify-center items-center'>
                        <PulseLoader color="#319795" className='justify-center w-full' />
                    </div>
                ) : (
                    <div>
                        <div className="flex mb-4">
                            <div className='content-center mr-3 font-medium'>
                                Mostrando datos desde 
                            </div>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                dateFormat="yyyy-MM-dd"
                                className="px-4 py-2 border rounded"
                            />
                            <div className='content-center ml-3 mr-3 font-medium'>
                                hasta
                            </div>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                dateFormat="yyyy-MM-dd"
                                className="mr-2 px-4 py-2 border rounded"
                            />
        
                        </div>
                        <div className='font-medium'>
                            A mayor puntaje, mayor cantidad de OTs reabiertas.
                        </div>
                        <Chart className='p-2 h-auto' type="bar" data={chartData} options={chartOptions} />
                    </div>
                )}
            </div>
            <div className="card p-3">
                {isLoadingTable ? (
                    <div className='card p-2 bg-white'>
                        <div className="flex justify-center items-center mt-4 h-24">
                            <PulseLoader color="#319795" />
                        </div>
                    </div>
                ) : (
                    <DataTable 
                        value={tableData} 
                        className="p-datatable-striped"
                        paginator rows={10} rowsPerPageOptions={[10, 25, 50]}
                        globalFilter={globalFilter} 
                        header={header}
                        removableSort
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} datos"
                    >
                        <Column field="name" header="Nombre" sortable />
                        <Column field="lastname" header="Apellido" sortable />
                        <Column field="count" header="OTs reabiertas en misma máquina" sortable />
                    </DataTable>
                )}
            </div>
        </div>
    );
}

export default TechScore;
