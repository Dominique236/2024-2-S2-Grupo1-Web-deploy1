// EstadBuildingHours.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { OT_ENDPOINT } from '../utils/apiRoutes';
import { Chart } from 'primereact/chart';
import { PulseLoader } from 'react-spinners';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const EstadBuildingHours = () => {
    const [isLoadingChart, setIsLoadingChart] = useState(true);
    const [isLoadingTable, setIsLoadingTable] = useState(true);
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [tableData, setTableData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(null);

    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 2)));
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() )));
      

    const calculateHours = (createdAt, updatedAt) => {
        if (!createdAt || !updatedAt) {
            console.warn(`Fechas faltantes. createdAt: ${createdAt}, updatedAt: ${updatedAt}`);
            return 0; 
        }
    
        const start = new Date(createdAt);
        const end = new Date(updatedAt);
    
        if (isNaN(start) || isNaN(end)) {
            console.warn(`Fechas no válidas: createdAt: ${createdAt}, updatedAt: ${updatedAt}`);
            return 0; 
        }
    
        const diffInMilliseconds = end - start;
        return diffInMilliseconds / (1000 * 60 * 60); 
    };
    

    const sumHoursByBuilding = (data) => {
        const buildingHoursMap = {};
        data.forEach((ot) => {
            const buildingName = ot.Machine?.Building?.name || 'Sin Edificio';
    
            const hours = calculateHours(ot.createdAt, ot.updatedAt);
    
            if (buildingHoursMap[buildingName]) {
                buildingHoursMap[buildingName] += hours;
            } else {
                buildingHoursMap[buildingName] = hours;
            }
    
            console.log(`Horas sumadas para ${buildingName}: ${hours}`);
        });
    
        return buildingHoursMap;
    };
    

    const generateGradientColors = (counts) => {
        const max = Math.max(...counts);
        return counts.map(count => {
            const ratio = count / max;
            const green = Math.round(255 * (1 - ratio)); // Disminuye de 255 a 0
            return `rgba(255, ${green}, 0, 0.5)`;
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingChart(true);
            setIsLoadingTable(true);
            try {
                const start = startDate.toISOString().split('T')[0];
                const end = endDate.toISOString().split('T')[0];
                const response = await fetch(`${OT_ENDPOINT}?startDate=${start}&endDate=${end}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch OT data');
                }
                const data = await response.json();

                const filteredData = data.filter(item => item.status === 'Resuelta');

                // Sumar horas por edificio
                const buildingHoursMap = sumHoursByBuilding(filteredData);

                // Convertir mapa a datos utilizables
                const labels = Object.keys(buildingHoursMap);
                const counts = Object.values(buildingHoursMap);

                const backgroundColors = generateGradientColors(counts);

                const chartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Horas Hombre por Edificio (OT Terminadas)',
                            data: counts,
                            backgroundColor: backgroundColors,
                            borderColor: backgroundColors,
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
                                text: 'Edificios',
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
                                text: 'Horas Hombre',
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
                                        return `${value} horas`;
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
                                    return `${context.raw} horas`;
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
                
                const tableDataArray = Object.entries(buildingHoursMap).map(([building, hours]) => ({
                    building,
                    hours: `${hours.toFixed(2)} horas`
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
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Chart className='p-2 h-auto' type="bar" data={chartData} options={chartOptions} style={{ width: '60vw', height: '45vh' }}/>
                        </div>
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
                        <Column field="building" header="Edificio" sortable />
                        <Column field="hours" header="HH Totales" sortable />
                    </DataTable>
                )}
            </div>
        </div>
    );
}

export default EstadBuildingHours;
