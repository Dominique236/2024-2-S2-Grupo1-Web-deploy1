import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BUILDING_ENDPOINT } from '../utils/apiRoutes';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const OTAdvancedFiltersPopup = ({
    show,
    onClose,
    onApply,
    estadoPendiente,
    estadoResuelta,
    estadoInactiva,
    prioridadAlta,
    prioridadMedia,
    prioridadBaja,
    tipoLavadora,
    tipoSecadora,
    filterbuilding,
    handleEstadoPendienteChange,
    handleEstadoResueltaChange,
    handleEstadoInactivaChange,
    handlePrioridadAltaChange,
    handlePrioridadMediaChange,
    handlePrioridadBajaChange,
    handleTipoLavadoraChange,
    handleTipoSecadoraChange,
    handleFilterBuildingChange
}) => {
    const [buildingOptions, setBuildingOptions] = useState([]);
    const [idbuilding, setIdBuilding] = useState('');
    const [selectedBuildings, setSelectedBuildings] = useState([]);

    useEffect(() => {
        const fetchBuildingsOptions = async () => {
            try {
                const response = await axios.get(BUILDING_ENDPOINT);
                const buildingSelectOptions = response.data.map(item => ({
                    value: item.name,
                    label: `${item.name} - ${item.address} - ${item.county}`,
                }));
                setBuildingOptions(buildingSelectOptions);
            } catch (error) {
                console.error('Error fetching building options:', error);
            }
        };

        fetchBuildingsOptions();
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


    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-25"></div>
            <div className="bg-white p-8 rounded-lg shadow-lg relative z-10 w-4/5">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-teal-600 text-xl font-semibold mb-6">Filtros Avanzados</h2>

                <div className="mb-4">
                    <div className="flex flex-row">
                        <div className="basis-1/6">
                            <p><strong>Estado</strong></p>
                            <label className="block"> <input type="checkbox" checked={estadoPendiente} onChange={handleEstadoPendienteChange} className="custom-checkbox mr-2 leading-tight"/>Por Visitar</label>
                            <label className="block"> <input type="checkbox" checked={estadoResuelta} onChange={handleEstadoResueltaChange} className="custom-checkbox mr-2 leading-tight"/>Resuelta</label>
                            <label className="block"> <input type="checkbox" checked={estadoInactiva} onChange={handleEstadoInactivaChange} className="custom-checkbox mr-2 leading-tight"/>Inactiva</label>
                        </div>
                        <div className="basis-1/6">
                            <p><strong>Prioridad</strong></p>
                            <label className="block"><input type="checkbox" checked={prioridadAlta} onChange={handlePrioridadAltaChange} className="custom-checkbox mr-2 leading-tight" />Alta</label>
                            <label className="block"><input type="checkbox" checked={prioridadMedia} onChange={handlePrioridadMediaChange} className="custom-checkbox mr-2 leading-tight" />Media</label>
                            <label className="block"><input type="checkbox" checked={prioridadBaja} onChange={handlePrioridadBajaChange} className="custom-checkbox mr-2 leading-tight" />Baja</label>
                        </div>
                        <div className="basis-1/6">
                            <p><strong>Tipo</strong></p>
                            <label className="block"><input type="checkbox" checked={tipoLavadora} onChange={handleTipoLavadoraChange} className="custom-checkbox mr-2 leading-tight" />Lavadora</label>
                            <label className="block"><input type="checkbox" checked={tipoSecadora} onChange={handleTipoSecadoraChange} className="custom-checkbox mr-2 leading-tight" />Secadora</label></div>
                        <div className="basis-3/6">
                            <p><strong>Edificio</strong></p>
                            <Autocomplete
                                id="idbuilding"
                                options={buildingOptions}
                                getOptionLabel={(option) => option.label}
                                value={filterbuilding !== '' ? buildingOptions.find(option => option.value === filterbuilding) : null}
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
                                    style={{ minWidth: '250px', fontSize: '16px', padding: '10px', minHeight: '50px' }}
                                />
                                )}
                            />
                        </div>
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

export default OTAdvancedFiltersPopup;
