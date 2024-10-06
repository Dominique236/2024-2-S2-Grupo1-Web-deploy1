import React, { useState, useEffect, useMemo } from 'react';
import { Chart } from 'primereact/chart';
import { PulseLoader } from 'react-spinners';
import { OT_ENDPOINT, BUILDING_ENDPOINT, WAREHOUSE_ENDPOINT } from '../utils/apiRoutes';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const MachineOTCounter = ({ ots }) => {
    const [isLoadingChart, setIsLoadingChart] = useState(true);
    const [isLoadingTable, setIsLoadingTable] = useState(true);
    const [chartDataOTTotales, setChartDataOTTotales] = useState({});
    const [chartDataOTActivas, setChartDataOTActivas] = useState({});
    const [chartOptionsTotales, setChartOptionsTotales] = useState({});
    const [chartOptionsActivas, setChartOptionsActivas] = useState({});
    const [tableData, setTableData] = useState([]);
    const [globalFilter, setGlobalFilter] = useState(null);

    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedLocationName, setSelectedLocationName] = useState('Sin filtro');


    const [machineData, setMachineData] = useState([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const [buildingResponse, warehouseResponse] = await Promise.all([
                    fetch(BUILDING_ENDPOINT),
                    fetch(WAREHOUSE_ENDPOINT)
                ]);

                if (!buildingResponse.ok || !warehouseResponse.ok) {
                    throw new Error('Failed to fetch locations');
                }

                const [buildingData, warehouseData] = await Promise.all([
                    buildingResponse.json(),
                    warehouseResponse.json()
                ]);

                const formattedLocations = [
                    ...buildingData.map(building => ({ name: `Edificio: ${building.name}`, value: `building-${building.id}` })),
                    ...warehouseData.map(warehouse => ({ name: `Bodega: ${warehouse.name}`, value: `warehouse-${warehouse.id}` }))
                ];

                setLocations(formattedLocations);

                // Set default location to first building	
                const defaultLocation = formattedLocations.find(location => location.name.includes('Novo'));
                if (defaultLocation) {
                    setSelectedLocation(defaultLocation.value);
                }
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };

        fetchLocations();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoadingChart(true);
            setIsLoadingTable(true);

            try {
                const [otResponse, buildingResponse, warehouseResponse] = await Promise.all([
                    fetch(`${OT_ENDPOINT}/machine_statistics`),
                    fetch(BUILDING_ENDPOINT),
                    fetch(WAREHOUSE_ENDPOINT)
                ]);

                if (!otResponse.ok || !buildingResponse.ok || !warehouseResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const [otData, buildingData, warehouseData] = await Promise.all([
                    otResponse.json(),
                    buildingResponse.json(),
                    warehouseResponse.json()
                ]);

                const machineDataArray = Object.values(otData).map(entry => {
                    const machine = entry.machine;
                    const locationID = machine.building_id || machine.warehouse_id;
                    const locationType = machine.building_id ? "building" : "warehouse";
                    const locationData = locationType === "building" ?
                        buildingData.find(building => building.id === locationID) :
                        warehouseData.find(warehouse => warehouse.id === locationID);

                    const location = locationData ?
                        (locationType === "building" ?
                            `Edificio: ${locationData.name}` :
                            `Bodega: ${locationData.name}`) :
                        "Ubicación no encontrada";

                    return {
                        code: machine.code,
                        model: machine.model,
                        supplier: machine.supplier,
                        location: location,
                        locationType,
                        locationID,
                        cantidad_OT: entry.cantidad_OT || 0,
                        cantidad_OT_activas: entry.cantidad_OT_activas || 0, 
                        proporcional: entry.proporcional || 0,
                        proporcional_activas: entry.proporcional_activas || 0
                    };
                });

                setMachineData(machineDataArray);
                setTableData(machineDataArray.filter(item => item.cantidad_OT >= 1 || item.cantidad_OT_activas >= 1));
            } catch (error) {
                console.error('Error fetching data:', error);
            }

            setIsLoadingTable(false);
        };

        fetchData();
    }, [ots]);

    useEffect(() => {
        const filterChartData = () => {
            setIsLoadingChart(true);

            let filteredData = machineData;
            // dinamic title for the chart
            let locationName = 'Sin filtro';

            if (selectedLocation) {
                const [type, id] = selectedLocation.split('-');
                filteredData = machineData.filter(item =>
                    item.locationType === type && item.locationID.toString() === id
                );

                const location = locations.find(location => location.value === selectedLocation);
                if (location) {
                    locationName = location.name;
                }
            }

            setSelectedLocationName(locationName);

            const labels = filteredData.map(item => item.code);
            const dataCantidadOTTotales = filteredData.map(item => item.cantidad_OT);
            const dataCantidadOTActivas = filteredData.map(item => item.cantidad_OT_activas);
            const machineInfo = filteredData.map(item => ({
                model: item.model,
                supplier: item.supplier,
                location: item.location,
                proporcional: item.proporcional, // Check if this is correctly populated
                proporcional_activas: item.proporcional_activas // Check if this is correctly populated
            }));

            const chartDataOTTotales = {
                labels: labels,
                datasets: [
                    {
                        label: 'OTs Totales',
                        data: dataCantidadOTTotales,
                        backgroundColor: 'rgba(33, 143, 139, 0.5)',
                        borderColor: 'rgba(33, 143, 139, 1)',
                        borderWidth: 1,
                        machineInfo: machineInfo
                    }
                ]
            };

            const chartDataOTActivas = {
                labels: labels,
                datasets: [
                    {
                        label: 'OTs Activas',
                        data: dataCantidadOTActivas,
                        backgroundColor: 'rgba(255, 159, 64, 0.5)',
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1,
                        machineInfo: machineInfo
                    }
                ]
            };

            const chartOptionsActivas = {
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Máquinas (Código QR)',
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
                                const machineCode = context.label;
                                const machineInfo = context.dataset.machineInfo[context.dataIndex];
                                const proporcionalActivasPercent = (machineInfo.proporcional_activas * 100).toFixed(2) + '%'; // Convert to percentage with two decimal places
                                return [
                                    `Modelo: ${machineInfo.model}`,
                                    `Proveedor: ${machineInfo.supplier}`,
                                    `Ubicación: ${machineInfo.location}`,
                                    ` `,
                                    `${label}: ${value}`,
                                    `Corresponde al ${proporcionalActivasPercent} de OTs activas`, // Display as percentage
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

            const chartOptionsTotales = {
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Máquinas (Código QR)',
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
                                const machineCode = context.label;
                                const machineInfo = context.dataset.machineInfo[context.dataIndex];
                                const proporcionalTotalPercent = (machineInfo.proporcional * 100).toFixed(2) + '%'; // Convert to percentage with two decimal places
                                return [
                                    `Modelo: ${machineInfo.model}`,
                                    `Proveedor: ${machineInfo.supplier}`,
                                    `Ubicación: ${machineInfo.location}`,
                                    ` `,
                                    `${label}: ${value}`,
                                    `Corresponde al ${proporcionalTotalPercent} de OTs totales`, // Display as percentage
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

            setChartDataOTTotales(chartDataOTTotales);
            setChartDataOTActivas(chartDataOTActivas);
            setChartOptionsTotales(chartOptionsTotales);
            setChartOptionsActivas(chartOptionsActivas);
            setIsLoadingChart(false);
            // console.log(chartDataOTActivas);
        };

        filterChartData();
    }, [selectedLocation, machineData]);

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
            <div className="card h-auto w-auto">
                <Autocomplete
                    options={locations}
                    value={locations.find(option => option.value === selectedLocation) || selectedLocationName}
                    onChange={(event, newValue) => newValue ? setSelectedLocation(newValue.value) : setSelectedLocation(null)}
                    getOptionLabel={(option) => option.name}
                    renderInput={(params) => <TextField {...params} label="Seleccione una ubicación" variant="outlined" />}
                    className="mt-2 mb-4 w-full md:w-25rem"
                />
                {isLoadingChart ? (
                    <div className='flex justify-center items-center'>
                        <PulseLoader color="#319795" className='justify-center w-full' />
                    </div>
                ) : (
                    <>
                        <div className="chart-container">
                            <h2 className='text-turquesa-500 font-bold text-center w-full'>OTs Activas: {selectedLocationName} </h2>
                            <Chart type="bar" data={chartDataOTActivas} options={chartOptionsActivas} />
                        </div>
                        <br></br><br></br>
                        <div className="chart-container">
                            <h2 className='text-turquesa-500 font-bold text-center w-full'>OTs Totales: {selectedLocationName} </h2>
                            <Chart type="bar" data={chartDataOTTotales} options={chartOptionsTotales} />
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
                        <Column field="code" header="Código QR" sortable />
                        <Column field="model" header="Modelo" sortable />
                        <Column field="supplier" header="Proveedor" sortable />
                        <Column field="location" header="Ubicación" sortable />
                        <Column field="cantidad_OT" header="OTs totales" sortable />
                        <Column field="cantidad_OT_activas" header="OTs activas" sortable />
                    </DataTable>
                )}
            </div>
        </div>
    );
}

export default MachineOTCounter;
