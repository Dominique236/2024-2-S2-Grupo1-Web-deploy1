import React, { useState, useEffect, useContext } from 'react';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { WAREHOUSE_ENDPOINT, TOOL_ENDPOINT } from '../utils/apiRoutes';
import { UserContext } from '../contexts/UserContext';
import Tabla from './Tabla';
import axios from 'axios';
import EditToolPopup from './EditarHerramientaPopup';
import AgregarHerramientaPopup from './AgregarHerramientaPopup';

const Herramientas = () => {
    const { userRole } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(true);
    const [filas, setFilas] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]);
    const [filterToolWarehouse, setFilterToolWarehouse] = useState('');
    const [filterToolTechnician, setFilterToolTechnician] = useState('');
    const [warehouseOptions, setWarehouseOptions] = useState([]);
    const [technicianOptions, setTechnicianOptions] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [filterConditions, setFilterConditions] = useState([]);
    const [toolAdder, setToolAdder] = useState(false);  // Estado para agregar herramienta
    const [editedTool, setEditedTool] = useState(null); // Estado para herramienta en edición
    const [users, setUsers] = useState([]);
    const [technician_all, setTechnicianAll] = useState([]);

    const columnsTools = [
        { nombre: "Nombre Herramienta", llave: "name" },
        { nombre: "Modelo", llave: "model" },
        { nombre: "Bodega/Técnico", llave: "WarehouseOrTechnician" },
        { nombre: "", llave: "actions" } // Columna para acciones (editar)
    ];

    useEffect(() => {
        const fetchUsers = () => {
            const storedUsers = localStorage.getItem('filasUsuarios');
            if (storedUsers) {
                const parsedUsers = JSON.parse(storedUsers);
                setUsers(parsedUsers);
                const technician = parsedUsers.filter(user => user.permisos === 'tecnico');
                setTechnicianAll(technician);
                const technicianSelectOptions = technician.map(user => ({
                    value: user.idUsuario,
                    label: `${user.nombre} ${user.apellido}`,
                }));
                setTechnicianOptions(technicianSelectOptions);
            }
        };

        const fetchToolData = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(TOOL_ENDPOINT);
                if (response.status !== 200) {
                    throw new Error('Error al obtener los datos de herramientas');
                }
                const data = response.data;
                setFilas(data);
                setFilteredRows(data);
            } catch (error) {
                console.error('Error al obtener los datos de herramientas:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const fetchWarehouseOptions = async () => {
            try {
                const response = await axios.get(WAREHOUSE_ENDPOINT);
                const warehouseSelectOptions = response.data.map(item => ({
                    value: item.id,
                    label: item.name,
                }));
                setWarehouseOptions(warehouseSelectOptions);
            } catch (error) {
                console.error('Error al obtener las opciones de bodega:', error);
            }
        };

        fetchUsers();
        fetchToolData();
        fetchWarehouseOptions();
    }, [toolAdder]); // Dependencia para actualizar al agregar herramienta

    const fetchToolData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(TOOL_ENDPOINT);
            if (response.status !== 200) {
                throw new Error('Error al obtener los datos de herramientas');
            }
            const data = response.data;
            setFilas(data);
            setFilteredRows(data);
        } catch (error) {
            console.error('Error al obtener los datos de herramientas:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWarehouseChange = (event, value) => {
        setFilterToolWarehouse(value ? value.value : '');
        applyFilters(filas, value ? value.value : '', filterToolTechnician);
    };

    const handleTechnicianChange = (event, value) => {
        setFilterToolTechnician(value ? value.value : '');
        applyFilters(filas, filterToolWarehouse, value ? value.value : '');
    };

    const applyFilters = (tools, warehouseId, technicianId) => {
        let filtered = tools;
        if (warehouseId) {
            filtered = filtered.filter(tool => tool.warehouse_id === warehouseId);
        }
        if (technicianId) {
            filtered = filtered.filter(tool => tool.technitian_id === technicianId);
        }
        setFilteredRows(filtered);
    };

    const handleEditTool = (tool) => {
        setEditedTool(tool); // Establecer la herramienta actualmente en edición
    };

    const handleUpdateTool = async (updatedTool) => {
        try {
            const response = await axios.put(`${TOOL_ENDPOINT}/${updatedTool.id}`, updatedTool);
            if (response.status === 200) {
                // Actualizar filas después de la edición
                const updatedFilas = filas.map(tool => (tool.id === updatedTool.id ? response.data : tool));
                setFilas(updatedFilas);
                applyFilters(updatedFilas, filterToolWarehouse, filterToolTechnician); // Actualizar también las filas filtradas
                handleCloseEdit(); // Cerrar el modal después de editar la herramienta
            } else {
                throw new Error('Error al editar la herramienta');
            }
        } catch (error) {
            console.error('Error al editar la herramienta:', error);
        }
    };

    const handleDeleteTool = async (toolId) => {
        try {
            const response = await axios.delete(`${TOOL_ENDPOINT}/${toolId}`);
            if (response.status === 204) {
                const updatedFilas = filas.filter(tool => tool.id !== toolId);
                setFilas(updatedFilas);
                applyFilters(updatedFilas, filterToolWarehouse, filterToolTechnician); // Actualizar también las filas filtradas
            } else {
                throw new Error('Error al eliminar la herramienta');
            }
        } catch (error) {
            console.error('Error al eliminar la herramienta:', error);
        }
    }

    const handleCloseEdit = () => {
        setEditedTool(null); // Limpiar la herramienta en edición
        fetchToolData(); // Volver a cargar los datos de herramientas
    };

    const handleAddTool = async (newTool) => {
        try {
            const response = await axios.post(TOOL_ENDPOINT, newTool);
            if (response.status === 201) {
                const addedTool = response.data;
                const newFilas = [...filas, addedTool];
                setFilas(newFilas);
                setFilteredRows(newFilas);
                setToolAdder(false); // Cerrar el popup de agregar herramienta
            } else {
                throw new Error('Error al agregar la herramienta');
            }
        } catch (error) {
            console.error('Error al agregar la herramienta:', error);
        }
    };

    const rowsWithActions = filteredRows.map(tool => {
        const technician = users.find(user => user.idUsuario === tool.technitian_id)?.nombre || '';
        const technicianLastName = users.find(user => user.idUsuario === tool.technitian_id)?.apellido || '';
        const technicianName = technicianLastName ? `${technician} ${technicianLastName}` : technician;

        return {
            ...tool,
            actions: (
                <div>
                    <button
                        key={`edit-${tool.id}`} // Clave única para el botón de editar
                        onClick={() => handleEditTool(tool)}
                        className="bg-white rounded px-2 py-2 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto mr-2"
                    >
                        Editar
                    </button>
                </div>
            ),
            WarehouseOrTechnician: tool.Warehouse 
                ? `Bodega: ${tool.Warehouse.name}` 
                : `Técnico: ${technicianName}`
        };
    });

    return (
        <div className='relative flex flex-grow h-auto flex-col lg:px-8 mb-10 mt-4'>
            <div className='flex justify-between items-end'>
                <div>
                    <h1 className='text-3xl first-line:font-bold text-gray-800'>Herramientas</h1>
                </div>
            </div>
            <div className='mt-4 flex grid grid-cols-4 g-x-2'>
                <div>
                    <Autocomplete
                        options={warehouseOptions}
                        getOptionLabel={(option) => option.label}
                        onChange={handleWarehouseChange}
                        renderInput={(params) => (
                            <TextField {...params} 
                                label="Filtrar por Bodega" variant="outlined"
                                style={{ minWidth: '250px', fontSize: '16px'}} 
                            />
                        )}
                        className='h-2 w-20'
                    />
                </div>
                <div>
                    <Autocomplete
                        options={technicianOptions}
                        getOptionLabel={(option) => option.label}
                        onChange={handleTechnicianChange}
                        renderInput={(params) => (
                            <TextField {...params} 
                                label="Filtrar por Técnico" variant="outlined" 
                                style={{ minWidth: '250px', fontSize: '16px'}} 
                            />
                        )}
                    />
                </div>
                <div></div>
                <div className='flex justify-end content-center items-center'>
                    {userRole === 'admin' && (
                            <button
                                onClick={() => setToolAdder(true)}
                                className="bg-white rounded px-3 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            >
                                Agregar herramienta
                            </button>
                    )}
                </div>
            </div>
            <Tabla 
                columnas={columnsTools} 
                filas={rowsWithActions} 
                isLoading={isLoading}
            />
            {toolAdder && (
                <AgregarHerramientaPopup
                    open={true}
                    users={technician_all}
                    warehouseOptions={warehouseOptions}
                    onAdd={handleAddTool} // Definir la función onAdd para agregar herramienta
                    onClose={() => setToolAdder(false)} // Definir la función onClose para cerrar el popup
                />
            )}
            {editedTool && (
                <EditToolPopup
                    open={true}
                    editedTool={editedTool}
                    warehouseOptions={warehouseOptions}
                    users={technician_all}
                    handleUpdateTool={handleUpdateTool}
                    handleDeleteTool={handleDeleteTool} // Pasar la función handleDeleteTool
                    handleCloseEdit={handleCloseEdit}
                />
            )}
        </div>
    );
};

export default Herramientas;
