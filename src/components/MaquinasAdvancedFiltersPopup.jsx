import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MACHINE_ENDPOINT, WAREHOUSE_ENDPOINT } from '../utils/apiRoutes';
import { Autocomplete, TextField } from '@mui/material';

const MaquinasAdvancedFiltersPopup = ({
    show,
    onClose,
    onApply,
    estadoActiva,
    estadoEliminada,
    tipoLavadora,
    tipoSecadora,
    filterLocation,
    filterBuilding,
    filterWarehouse,
    filterSupplier,
    handleEstadoActivaChange,
    handleEstadoEliminadaChange,
    handleTipoLavadoraChange,
    handleTipoSecadoraChange,
    handleFilterLocationChange,
    handleFilterBuildingChange,
    handleFilterWarehouseChange,
    handleFilterSupplierChange
}) => {

    const [supplierOptions, setSupplierOptions] = useState([]);
    const [supplierId, setSupplierId] = useState('');
    const [buildingOptions, setBuildingOptions] = useState([]);
    const [buildingId, setBuildingId] = useState('');
    const [warehouseOptions, setWarehouseOptions] = useState([]);
    const [warehouseId, setWarehouseId] = useState('');

    const [selectedBuildings, setSelectedBuildings] = useState([]);
    const [selectedWarehouses, setSelectedWarehouses] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);

    useEffect(() => {
        const fetchBuildingOptions = async () => {
            try {
                const response = await axios.get(MACHINE_ENDPOINT);
                const machineData = response.data;
                const uniqueBuildings = machineData.reduce((buildings, item) => {
                    // Check if Building property is not null before accessing its id
                    if (item.Building && item.Building.id) {
                        const buildingExists = buildings.every(building => {
                            return building.id !== item.Building.id;
                        });
                        
                        if (buildingExists) {
                            buildings.push(item.Building);
                        }
                    }
                    return buildings;
                }, []);
                
                const buildingSelectOptions = uniqueBuildings.map(building => ({
                    value: building.name,
                    label: `${building.name} - ${building.address}`,
                }));
                setBuildingOptions(buildingSelectOptions);
            } catch (error) {
                console.error('Error fetching building options:', error);
            }
        };

       /* const fetchWarehouseOptions = async () => {
            try {
                const response = await axios.get(WAREHOUSE_ENDPOINT);
                const machineData = response.data;
                // Extract unique warehouse names from machine data
                const uniqueWarehouses = machineData.reduce((warehouses, item) => {
                    // Check if Building property is not null before accessing its id
                    if (item.Warehouse && item.Warehouse.id) {
                        const warehouseExists = warehouses.every(building => {
                            return building.id !== item.Warehouse.id;
                        });
                        
                        if (warehouseExists) {
                            warehouses.push(item.Warehouse);
                        }
                    }
                    return warehouses;
                }, []);
        
                // Create options array for the <select> component
                const warehouseSelectOptions = uniqueWarehouses.map(warehouse => ({
                    value: warehouse.name,
                    label: `${warehouse.name} - ${warehouse.address}`,
                }));
        
                setWarehouseOptions(warehouseSelectOptions);
            } catch (error) {
                console.error('Error fetching warehouse options:', error);
            }
        }; */

        const fetchWarehouseOptions = async () => {
            try {
                const response = await axios.get(WAREHOUSE_ENDPOINT);
                const warehouseSelectOptions = response.data.map(item => ({
                    value: item.name,
                    label: `${item.name} - ${item.address}`,
                }));
                setWarehouseOptions(warehouseSelectOptions);
            } catch (error) {
                console.error('Error fetching building options:', error);
            }
        };



        const fetchSupplierOptions = async () => {
            try {
                const response = await axios.get(MACHINE_ENDPOINT);
                const machineData = response.data;
        
                // Extract unique supplier names from machine data
                const uniqueSuppliers = [...new Set(machineData.map(item => item.supplier))];
        
                // Create options array for the <select> component
                const supplierSelectOptions = uniqueSuppliers.map(supplier => ({
                    value: supplier,
                    label: supplier,
                }));
        
                setSupplierOptions(supplierSelectOptions);
            } catch (error) {
                console.error('Error fetching location options:', error);
            }
        };
        //fetchLocationOptions();
        fetchBuildingOptions();
        fetchWarehouseOptions();
        fetchSupplierOptions();
    }, []);

    const handleSelectBuilding = (event, newValue) => {
        if (newValue !== null && newValue !== undefined) {
            setSelectedBuildings(newValue);
            handleFilterBuildingChange(newValue.map(option => option.value));
        } else {
            setSelectedBuildings([]);
            handleFilterBuildingChange([]);
        }
    };

    const handleSelectWarehouse = (event, newValue) => {
        if (newValue !== null && newValue !== undefined) {
            setSelectedWarehouses(newValue);
            handleFilterWarehouseChange(newValue.map(option => option.value));
        } else {
            setSelectedWarehouses([]);
            handleFilterWarehouseChange([]);
        }
    };

    const handleSelectSupplier = (event, newValue) => {
        if (newValue !== null && newValue !== undefined) {
            setSelectedSuppliers(newValue);
            handleFilterSupplierChange(newValue.map(option => option.value));
        } else {
            setSelectedSuppliers([]);
            handleFilterSupplierChange([]);
        }
    };

    if (!show) return null;


    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-25"></div>
            <div className="bg-white p-8 rounded-lg shadow-lg relative z-10 w-[900px]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-teal-600 text-xl font-semibold mb-6">Filtros Avanzados</h2>

                <div className="flex flex-row">
                    <div className="basis-1/3">
                        <p><strong>Tipo de máquina</strong></p>
                        <label className="block"><input type="checkbox" checked={tipoLavadora} onChange={handleTipoLavadoraChange} className="custom-checkbox mr-2 leading-tight" />Lavadora</label>
                        <label className="block"><input type="checkbox" checked={tipoSecadora} onChange={handleTipoSecadoraChange} className="custom-checkbox mr-2 leading-tight" />Secadora</label>
                        <br></br>
                        <p><strong>Estado</strong></p>
                        <label className="block"> <input type="checkbox" checked={estadoActiva} onChange={handleEstadoActivaChange} className="custom-checkbox mr-2 leading-tight"/>Activo</label>
                        <label className="block"> <input type="checkbox" checked={estadoEliminada} onChange={handleEstadoEliminadaChange} className="custom-checkbox mr-2 leading-tight"/>Eliminado</label>
                    </div>

                    <div className="basis-1/3">
                        <p><strong>Edificio:</strong></p>
                        <Autocomplete
                            id="idbuilding"
                            options={buildingOptions}
                            getOptionLabel={(option) => option.label}
                            value={filterBuilding !== '' ? buildingOptions.find(option => option.value === filterBuilding) : null}
                            onChange={(event, newValue) => {
                            if (newValue !== null && newValue !== undefined) {
                                handleFilterBuildingChange(newValue.value); // Actualiza el estado filterbuilding en el componente padre
                            } else {
                                handleFilterBuildingChange(''); // Si el valor es null o undefined, asigna un valor vacío al estado filterbuilding
                            }
                            }}
                            renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Seleccione un Edificio"
                                variant="outlined"
                                className='w-full p-2 border border-gray-300 rounded-md'
                                style={{ minWidth: '200px', fontSize: '16px', padding: '10px', minHeight: '50px' }}
                            />
                            )}
                        />
                        <p><strong>Bodega:</strong></p>
                        <Autocomplete
                            id="idwarehouse"
                            options={warehouseOptions}
                            getOptionLabel={(option) => option.label}
                            value={filterWarehouse !== '' ? warehouseOptions.find(option => option.value === filterWarehouse) : null}
                            onChange={(event, newValue) => {
                            if (newValue !== null && newValue !== undefined) {
                                handleFilterWarehouseChange(newValue.value); // Actualiza el estado filterbuilding en el componente padre
                            } else {
                                handleFilterWarehouseChange(''); // Si el valor es null o undefined, asigna un valor vacío al estado filterbuilding
                            }
                            }}
                            renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Seleccione una bodega"
                                variant="outlined"
                                className='w-full p-2 border border-gray-300 rounded-md'
                                style={{ minWidth: '200px', fontSize: '16px', padding: '10px', minHeight: '50px' }}
                            />
                            )}
                        />
                    </div>

                    <div className="basis-1/3">
                        <p><strong>Proveedor</strong></p>
                        <Autocomplete
                            id="idsupplier"
                            options={supplierOptions}
                            getOptionLabel={(option) => option.label}
                            value={filterSupplier !== '' ? supplierOptions.find(option => option.value === filterSupplier) : null}
                            onChange={(event, newValue) => {
                            if (newValue !== null && newValue !== undefined) {
                                handleFilterSupplierChange(newValue.value); // Actualiza el estado filterbuilding en el componente padre
                            } else {
                                handleFilterSupplierChange(''); // Si el valor es null o undefined, asigna un valor vacío al estado filterbuilding
                            }
                            }}
                            renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Seleccione un proveedor"
                                variant="outlined"
                                className='w-full p-2 border border-gray-300 rounded-md'
                                style={{ minWidth: '200px', fontSize: '16px', padding: '10px', minHeight: '50px' }}
                            />
                            )}
                        />
                    </div>

                </div>

                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onApply}
                        className="bg-turquesa-500 hover:bg-teal-400 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                    >
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MaquinasAdvancedFiltersPopup;
