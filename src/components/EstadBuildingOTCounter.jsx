import React, { useState, useEffect, useMemo } from 'react';
import { Chart } from 'primereact/chart';
import { PulseLoader } from 'react-spinners';
import { BUILDING_ENDPOINT, OT_ENDPOINT } from '../utils/apiRoutes';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const BuildingOTCounter = () => {
    const [isLoadingChart, setIsLoadingChart] = useState(true);
    const [isLoadingTable, setIsLoadingTable] = useState(true);
    const [chartDataOTTotales, setChartDataOTTotales] = useState({});
    const [chartDataOTActivas, setChartDataOTActivas] = useState({});
    const [chartOptionsTotales, setChartOptionsTotales] = useState({});
    const [chartOptionsActivas, setChartOptionsActivas] = useState({});
    const [tableData, setTableData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(null);

    const [counties, setCounties] = useState([]);
    const [selectedCounty, setSelectedCounty] = useState(null);
    
    const [buildingData, setBuildingData] = useState([]);

    useEffect(() => {
        const fetchCounties = async () => {
            try {
                const response = await fetch(BUILDING_ENDPOINT);
                if (!response.ok) {
                    throw new Error('Failed to fetch building data');
                }
                const buildingData = await response.json();
                // Extract unique counties from the fetched data
                const counties = [...new Set(buildingData.map(item => item.county))];
                setCounties(counties);
            } catch (error) {
                console.error('Error fetching counties:', error);
            }
        };
    
        fetchCounties();
    }, []);
    

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingChart(true);
            setIsLoadingTable(true);

            try {
                // Fetch building data to get counties
                const otResponse = await fetch(OT_ENDPOINT + '/building_statistics');
                if (!otResponse.ok) {
                    throw new Error('Failed to fetch building data');
                }
                const buildings = await otResponse.json();

                const buildingDataArray = Object.values(buildings).map(entry => {
                    const building = entry.building;
                    return {
                        name: building.name,
                        county: building.county,
                        address: building.address,
                        cantidad_OT: entry.cantidad_OT || 0,
                        cantidad_OT_activas: entry.cantidad_OT_activas || 0,
                        proporcional: entry.proporcional || 0,
                        proporcional_activas: entry.proporcional_activas || 0
                    };
                });

                setBuildingData(buildingDataArray);
                setTableData(buildingDataArray.filter(item => item.cantidad_OT >= 1 || item.cantidad_OT_activas >= 1));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
            setIsLoadingChart(false);
            setIsLoadingTable(false);
        };

        fetchData();
    }, []);
    

    
    useEffect(() => {
        const filterChartData = () => {
            setIsLoadingChart(true);

            let filteredData = buildingData;

            if (selectedCounty) {
                filteredData = filteredData.filter(item => item.county === selectedCounty);
            }

            const labels = filteredData.map(building => building.name);
            const dataCantidadOTs = filteredData.map(building => building.cantidad_OT);
            const dataCantidadOTsActivas = filteredData.map(building => building.cantidad_OT_activas);
            const buildingInfo = filteredData.map(building => ({
                name: building.name,
                county: building.county,
                address: building.address,
                proporcional: building.proporcional,
                proporcional_activas: building.proporcional_activas
            }));

            const chartDataTotales = {
                labels: labels,
                datasets: [
                    {
                        label: 'OTs totales',
                        data: dataCantidadOTs,
                        backgroundColor: 'rgba(33, 143, 139, 0.5)',
                        borderColor: 'rgba(33, 143, 139, 1)',
                        borderWidth: 1,
                        buildingInfo: buildingInfo
                    }
                ]
            };

            const chartDataActivas = {
                labels: labels,
                datasets: [
                    {
                        label: 'OTs Activas',
                        data: dataCantidadOTsActivas,
                        backgroundColor: 'rgba(255, 159, 64, 0.5)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1,
                        buildingInfo: buildingInfo
                    }
                ]
            };
            // console.log("BUILDING INFO: ", buildingInfo);

            const chartOptionsTotales = {
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
                            text: 'OTs Totales',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            callback: function (value) {
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
                    tooltip: {
                        position: 'nearest',
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label || '';
                                const value = context.raw;
                                const buildingName = context.label;
                                const buildingInfo = context.dataset.buildingInfo[context.dataIndex];
                                const proporcionalPercent = (buildingInfo.proporcional * 100).toFixed(2) + '%';
                                return [
                                    `Comuna: ${buildingInfo.county}`,
                                    `Dirección: ${buildingInfo.address}`,
                                    ` `,
                                    `${label}: ${value}`,
                                    `Corresponde al ${proporcionalPercent} de OTs totales`, // Display as percentage
                                ];
                            }
                        },
                        bodyFont: {
                            size: 14
                        },
                        titleFont: {
                            size: 14
                        }
                    },
                    legend: {
                        display: false
                    }
                }
            };

            const chartOptionsActivas = {
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
                            text: 'OTs Activas',
                            font: {
                                size: 14,
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            callback: function (value) {
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
                    tooltip: {
                        position: 'nearest',
                        callbacks: {
                            label: function (context) {
                                const label = context.dataset.label || '';
                                const value = context.raw;
                                const buildingName = context.label;
                                const buildingInfo = context.dataset.buildingInfo[context.dataIndex];
                                const proporcionalPercent = (buildingInfo.proporcional_activas * 100).toFixed(2) + '%';
                                return [
                                    `Comuna: ${buildingInfo.county}`,
                                    `Dirección: ${buildingInfo.address}`,
                                    ` `,
                                    `${label}: ${value}`,
                                    `Corresponde al ${proporcionalPercent} de OTs activas`, // Display as percentage
                                ];
                            }
                        },
                        bodyFont: {
                            size: 14
                        },
                        titleFont: {
                            size: 14
                        }
                    },
                    legend: {
                        display: false
                    }
                }
            };

            setChartDataOTTotales(chartDataTotales);
            setChartDataOTActivas(chartDataActivas);
            setChartOptionsTotales(chartOptionsTotales);
            setChartOptionsActivas(chartOptionsActivas);
            setIsLoadingChart(false);
        };

        filterChartData();
    }, [selectedCounty, buildingData]);

    const renderHeader = () => {
        return (
            <div className="grid grid-flow-col auto-cols-max">
                <div className="flex justify-between">
                    <IconField iconPosition="left">
                        <InputIcon className="pi pi-search" />
                        <InputText
                            type="search"
                            onInput={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Buscar..."
                        />
                    </IconField>
                </div>
            </div>
        );
    };

    const header = useMemo(renderHeader);

    return (
        <div>
            <div className="card mt-3 h-auto w-auto">
                <Autocomplete
                    options={counties}
                    value={selectedCounty}
                    onChange={(event, newValue) => setSelectedCounty(newValue)}
                    getOptionLabel={(option) => option} // Assuming your county objects have a name property
                    renderInput={(params) => <TextField {...params} label="Seleccione una comuna" variant="outlined" />}
                    className="mt-2 mb-4 w-full md:w-25rem"
                />
                {isLoadingChart ? (
                    <div className='flex justify-center items-center'>
                        <PulseLoader color="#319795" className='justify-center w-full' />
                    </div>
                ) : (
                    <>
                        <div className="chart-container">
                            <h2 className='text-turquesa-500 font-bold text-center w-full'>OTs Activas</h2>
                            <Chart className='p-2' type="bar" data={chartDataOTActivas} options={chartOptionsActivas} />
                        </div>
                        <br></br><br></br>
                        <div className="chart-container">
                            <h2 className='text-turquesa-500 font-bold text-center w-full'>OTs Totales</h2>
                            <Chart className='p-2' type="bar" data={chartDataOTTotales} options={chartOptionsTotales} />
                        </div>
                        <br></br><br></br>
                    </>
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
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        globalFilter={globalFilter}
                        header={header}
                        stripedRows 
                        removableSort
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} datos"
                    >
                        <Column field="name" header="Nombre" sortable />
                        <Column field="county" header="Comuna" sortable />
                        <Column field="address" header="Dirección" sortable />
                        <Column field="cantidad_OT" header="Cantidad de OTs" sortable />
                        <Column field="cantidad_OT_activas" header="Cantidad de OTs Activas" sortable />
                    </DataTable>
                )}
            </div>
        </div>
    );
}

export default BuildingOTCounter;
