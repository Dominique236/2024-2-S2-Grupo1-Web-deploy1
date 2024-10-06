import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { WAREHOUSE_ENDPOINT } from '../utils/apiRoutes';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const InventarioAdvancedFiltersPopup = ({
    show,
    onClose,
    onApply,
    estadoNuevo,
    estadoReacondicionado,
    estadoReparacion,
    filterInventoryWarehouse,
    handleEstadoNuevoChange,
    handleEstadoReacondicionadoChange,
    handleEstadoReparacionChange,
    handleFilterInventoryWarehouseChange
}) => {

    const [warehouseOptions, setWarehouseOptions] = useState([]);
    const [selectedInventoryWarehouse, setSelectedInventoryWarehouse] = useState(filterInventoryWarehouse);

    useEffect(() => {
        const fetchBuildingsOptions = async () => {
            try {
                const response = await axios.get(WAREHOUSE_ENDPOINT);
                const warehouseSelectOptions = response.data.map(item => ({
                    value: item.name,
                    label: `${item.name} - ${item.address}`,
                }));
                setWarehouseOptions(warehouseSelectOptions);
            } catch (error) {
                console.error('Error fetching warehouse options:', error);
            }
        };

        fetchBuildingsOptions();
    }, []);

    const handleApplyClick = () => {
        handleFilterInventoryWarehouseChange(selectedInventoryWarehouse);
        onApply();
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
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-teal-600 text-xl font-semibold mb-6">Filtros Avanzados</h2>

                <div className="flex flex-row mb-4">
                    <div className="basis-1/3">
                        <p><strong>Estado</strong></p>
                        <label className="block">
                            <input
                                type="checkbox"
                                checked={estadoNuevo}
                                onChange={handleEstadoNuevoChange}
                                className="custom-checkbox mr-2 leading-tight"
                            />
                            Nuevo
                        </label>
                        <label className="block">
                            <input
                                type="checkbox"
                                checked={estadoReacondicionado}
                                onChange={handleEstadoReacondicionadoChange}
                                className="custom-checkbox mr-2 leading-tight"
                            />
                            Reacondicionado
                        </label>
                        <label className="block">
                            <input
                                type="checkbox"
                                checked={estadoReparacion}
                                onChange={handleEstadoReparacionChange}
                                className="custom-checkbox mr-2 leading-tight"
                            />
                            En reparación
                        </label>
                    </div>
                    <div className="basis-1/3">
                        <p><strong>Bodega:</strong></p>
                        <Autocomplete
                            id="idwarehouse"
                            options={warehouseOptions}
                            getOptionLabel={(option) => option.label}
                            value={selectedInventoryWarehouse !== '' ? warehouseOptions.find(option => option.value === selectedInventoryWarehouse) : null}
                            onChange={(event, newValue) => {
                                if (newValue !== null && newValue !== undefined) {
                                    setSelectedInventoryWarehouse(newValue.value);
                                } else {
                                    setSelectedInventoryWarehouse('');
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Seleccione una bodega"
                                    variant="outlined"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    style={{ minWidth: '250px', fontSize: '16px', padding: '10px', minHeight: '50px' }}
                                />
                            )}
                        />
                    </div>
                </div>

                <div className="flex justify-center space-x-4">
                    <button
                        onClick={handleApplyClick}
                        className="bg-turquesa-500 hover:bg-teal-400 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                    >
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InventarioAdvancedFiltersPopup;
