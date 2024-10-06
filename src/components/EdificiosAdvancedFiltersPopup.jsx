import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BUILDING_ENDPOINT } from '../utils/apiRoutes';
import Autocomplete from '@mui/material/Autocomplete';
import { TextField } from '@mui/material';

const EdificiosAdvancedFiltersPopup = ({
    show,
    onClose,
    onApply,
    estadoActivo,
    estadoEliminado,
    filterComuna,
    handleEstadoActivoChange,
    handleEstadoEliminadoChange,
    handleFilterCountyChange
}) => {
    const [buildingOptions, setBuildingOptions] = useState([]);
    const comunasSantiago = [
        "Cerrillos",
        "Cerro Navia",
        "Conchalí",
        "El Bosque",
        "Estación Central",
        "Huechuraba",
        "Independencia",
        "La Cisterna",
        "La Florida",
        "La Granja",
        "La Pintana",
        "La Reina",
        "Las Condes",
        "Lo Barnechea",
        "Lo Espejo",
        "Lo Prado",
        "Macul",
        "Maipú",
        "Ñuñoa",
        "Pedro Aguirre Cerda",
        "Peñalolén",
        "Providencia",
        "Pudahuel",
        "Quilicura",
        "Quinta Normal",
        "Recoleta",
        "Renca",
        "San Joaquín",
        "San Miguel",
        "San Ramón",
        "Vitacura",
      ]; 

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

    const handleSelectCounty = (e) => {
        const selectedValue = e.target.value;
        handleFilterCountyChange(selectedValue);
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

                <div className="flex flex-row mb-4">
                    <div className="basis-1/4">
                        <p><strong>Estado</strong></p>
                        <label className="block"> <input type="checkbox" checked={estadoActivo} onChange={handleEstadoActivoChange} className="custom-checkbox mr-2 leading-tight"/>Activo</label>
                        <label className="block"> <input type="checkbox" checked={estadoEliminado} onChange={handleEstadoEliminadoChange} className="custom-checkbox mr-2 leading-tight"/>Eliminado</label>
                    </div>

                    <div className="basis-1/4">
                        <p><strong>Comuna</strong></p>
                        {/* <select id='idbuilding' value={filterComuna} onChange={handleSelectCounty} className='w-full p-2 border border-gray-300 rounded-md'>
                            <option value="">Seleccione una Comuna</option>
                            {comunasSantiago.map((comuna) => (
                                <option key={comuna} value={comuna}>{comuna}</option>
                            ))}
                        </select> */}
                        {/* <Autocomplete
                            id="idbuilding"
                            options={comunasSantiago}
                            value={filterComuna} // Assuming filterComuna is an array
                            onChange={(event, newValue) => handleFilterCountyChange(newValue)}
                            multiple  // Enable selecting multiple comunas
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Seleccione una o más comunas"
                                    variant="outlined"
                                    className='w-full p-2 border border-gray-300 rounded-md'
                                    style={{ minWidth: '250px', fontSize: '16px', padding: '10px', minHeight: '50px' }}
                                />
                            )}
                        /> */}
                        <Autocomplete
                            id="idbuilding"
                            options={comunasSantiago}
                            value={filterComuna}
                            onChange={(event, newValue) => handleFilterCountyChange(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Seleccione una comuna"
                                    variant="outlined"
                                    className='w-full p-2 border border-gray-300 rounded-md'
                                    style={{ minWidth: '250px', fontSize: '16px', padding: '10px', minHeight: '40px' }}
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

export default EdificiosAdvancedFiltersPopup;
