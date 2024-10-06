    import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import { MACHINE_ENDPOINT, OT_ENDPOINT, BUILDING_ENDPOINT, WAREHOUSE_ENDPOINT } from '../utils/apiRoutes';
import { Chart } from 'primereact/chart';
import { PulseLoader } from 'react-spinners';

const MachineOTProportional = ({ ots }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);

            try {
                // Fetch all machines
                /* const [machineResponse, buildingResponse, warehouseResponse] = await Promise.all([
                    fetch(MACHINE_ENDPOINT),
                    fetch(BUILDING_ENDPOINT),
                    fetch(WAREHOUSE_ENDPOINT)
                ]);

                if (!machineResponse.ok || !buildingResponse.ok || !warehouseResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const [machineData, buildingData, warehouseData] = await Promise.all([
                    machineResponse.json(),
                    buildingResponse.json(),
                    warehouseResponse.json()
                ]);

                // Fetch work order statistics for each machine
                const machineWorkOrderCount = {};
                for (const machine of machineData) {
                    const workOrderResponse = await fetch(OT_ENDPOINT + '/machine_statistics/' + machine.id);
                    if (!workOrderResponse.ok) {
                        throw new Error(`Failed to fetch work order data for machine ID ${machine.id}`);
                    }
                    const workOrderData = await workOrderResponse.json();
                    machineWorkOrderCount[machine.id] = workOrderData.proporcional_activas;
                }

                console.log('Fetched machine data:', machineData);
                console.log('Fetched work order counts:', machineWorkOrderCount);

                const chartDataArray = machineData.map(machine => {
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
                        count: machineWorkOrderCount[machine.id] || 0
                    };
                }); */

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

                const chartDataArray = Object.values(otData).map(entry => {
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

                    const count = ots === 'proporcional' ? entry.proporcional|| 0 : entry.proporcional_activas || 0;

                    return {
                        code: machine.code,
                        model: machine.model,
                        supplier: machine.supplier,
                        location: location,
                        count: count || 0
                    };
                });

                // Sort data from max to min
                chartDataArray.sort((a, b) => b.count - a.count);

                // Filter data to include only entries where count >= 1
                const filteredChartDataArray = chartDataArray.filter(item => item.count > 0);

                const labels = filteredChartDataArray.map(item => item.code);
                const data = filteredChartDataArray.map(item => item.count);
                const machineInfo = filteredChartDataArray.map(item => ({
                    model: item.model,
                    supplier: item.supplier,
                    location: item.location
                }));

                const chartData = {
                    labels: labels,
                    datasets: [
                        {
                            data: data,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.6)',
                                'rgba(54, 162, 235, 0.6)',
                                'rgba(255, 206, 86, 0.6)',
                                'rgba(75, 192, 192, 0.6)',
                                'rgba(153, 102, 255, 0.6)',
                                'rgba(255, 159, 64, 0.6)'
                            ],
                            hoverBackgroundColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            machineInfo: machineInfo
                        }
                    ]
                };

                const chartOptions = {
                    maintainAspectRatio: false, // Ensure chart doesn't maintain aspect ratio
                    responsive: true, // Allow chart to be responsive
                    plugins: {
                        title: {
                            display: true,
                            text: 'Proporción de OT por Máquina', // Chart title
                            font: {
                                size: 18,
                                weight: 'bold'
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw;
                                    const machineCode = labels[context.dataIndex];
                                    const machineInfo = context.dataset.machineInfo[context.dataIndex];
                                    return [
                                        `Código: ${machineCode}`,
                                        `Modelo: ${machineInfo.model}`,
                                        `Proveedor: ${machineInfo.supplier}`,
                                        `Ubicación: ${machineInfo.location}`,
                                        `Proporción: ${value}`
                                    ];
                                }
                            }
                        }
                    }
                };

                setChartData(chartData);
                setChartOptions(chartOptions);

            } catch (error) {
                console.error('Error fetching data:', error);
            }
            setIsLoading(false);
        };

        fetchData();
    }, []);

    return (
        <div>
            <div className="card" style={{ position: 'relative', width: '100%', height: '400px' }}>
                {isLoading ? (
                    <PulseLoader color="#319795" />
                ) : (
                    <Chart type="pie" data={chartData} options={chartOptions} />
                )}
            </div>
        </div>
    );
}

export default MachineOTProportional;
