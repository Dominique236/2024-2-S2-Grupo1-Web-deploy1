import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { WAREHOUSE_ENDPOINT, TOOL_ENDPOINT } from '../utils/apiRoutes';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Modal from '@mui/material/Modal';
import { UserContext } from '../contexts/UserContext';

const HerramientasAdvancedFiltersPopup = ({
    show,
    onClose,
    onApply,
    filterToolWarehouse,
    filterToolTechnician,
    handleFilterToolWarehouseChange,
    handleFilterToolTechnicianChange,
    warehouseOptions,
    technicianOptions,
}) => {
    const { userRole } = useContext(UserContext);
    const [selectedWarehouse, setSelectedWarehouse] = useState(filterToolWarehouse);
    const [selectedTechnician, setSelectedTechnician] = useState(filterToolTechnician);

    useEffect(() => {
        setSelectedWarehouse(filterToolWarehouse);
        setSelectedTechnician(filterToolTechnician);
    }, [filterToolWarehouse, filterToolTechnician]);

    const handleApplyClick = () => {
        handleFilterToolWarehouseChange(selectedWarehouse);
        handleFilterToolTechnicianChange(selectedTechnician);
        onApply();
    };

    if (!show) return null;

    return (
        <Modal
            open={show}
            onClose={onClose}
            aria-labelledby="advanced-filters-modal"
            aria-describedby="advanced-filters-description"
        >
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-lg shadow-lg w-[500px]">
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
                    <div className="w-1/2 pr-2">
                        <p><strong>Bodega:</strong></p>
                        <Autocomplete
                            id="warehouse-filter"
                            options={warehouseOptions}
                            getOptionLabel={(option) => option.label}
                            value={selectedWarehouse !== '' ? warehouseOptions.find(option => option.value === selectedWarehouse) : null}
                            onChange={(event, newValue) => {
                                if (newValue !== null && newValue !== undefined) {
                                    setSelectedWarehouse(newValue.value);
                                } else {
                                    setSelectedWarehouse('');
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
                    <div className="w-1/2 pl-2">
                        <p><strong>Técnico:</strong></p>
                        <Autocomplete
                            id="technician-filter"
                            options={technicianOptions}
                            getOptionLabel={(option) => option.label}
                            value={selectedTechnician !== '' ? technicianOptions.find(option => option.value === selectedTechnician) : null}
                            onChange={(event, newValue) => {
                                if (newValue !== null && newValue !== undefined) {
                                    setSelectedTechnician(newValue.value);
                                } else {
                                    setSelectedTechnician('');
                                }
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Seleccione un técnico"
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
        </Modal>
    );
};

export default HerramientasAdvancedFiltersPopup;
