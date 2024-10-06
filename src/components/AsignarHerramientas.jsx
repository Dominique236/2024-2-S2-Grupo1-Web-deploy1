import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Tabla from './Tabla';
import NavBar from './NavBar';
import { PulseLoader } from 'react-spinners';
import { TOOL_ENDPOINT, USER_ENDPOINT, TOOL_REQUEST_ENDPOINT } from '../utils/apiRoutes';
import { useAuth0 } from '@auth0/auth0-react';
import { UserContext } from '../contexts/UserContext';

const AsignarRepuestos = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth0();
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const { userRole, setUserRole } = useContext(UserContext);

    const [selectedRow, setSelectedRow] = useState(null);
    const [filas, setFilas] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filteredRows, setFilteredRows] = useState([]);
    const [filterConditions, setFilterConditions] = useState([]);
    const [toolName, setToolName] = useState(null);
    const [toolModel, setToolModel] = useState(null);
    const [technitianID, setTechnitianID] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState('');

    const { idSolTool } = useParams();

    const columnas = [
        { nombre: "ID Herramienta", llave: "id" },
        { nombre: "Nombre Herramienta", llave: "name" },
        { nombre: "Tipo Herramienta", llave: "model" },
        { nombre: "Bodega", llave: "Warehouse.name" },
        { nombre: "Direccion", llave: "Warehouse.address" }
    ];

    useEffect(() => {
        const fetchSpareRequestData = async () => {
            setIsLoadingPage(true);
            try {
                const response = await axios.get(`${TOOL_REQUEST_ENDPOINT}/${idSolTool}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch request data');
                }
                const data = response.data;
                setToolName(data.tool_name);
                setToolModel(data.tool_model);
                setTechnitianID(data.technitian_id);
            } catch (error) {
                console.error('Error fetching request data:', error);
            } finally {
                setIsLoadingPage(false);
            }
        };

        fetchSpareRequestData();
    }, [idSolTool]);

    useEffect(() => {
        const fetchInventoryData = async () => {
            if (!toolName) return;

            setIsLoadingPage(true);
            try {
                const response = await axios.get(`${TOOL_ENDPOINT}/info`, {
                    params: {
                        name: toolName,
                        model: toolModel
                    }
                });
                if (response.status !== 200) {
                    throw new Error('Failed to fetch inventory data');
                }
                let data = response.data;
                
                // Filtrar herramientas que cumplan con las condiciones
                data = data.filter(item => item.technitian_id === null && item.warehouse_id !== null);

                setFilas(data);
                setFilteredRows(data);
            } catch (error) {
                console.error('Error fetching inventory data:', error);
            } finally {
                setIsLoadingPage(false);
            }
        };

        fetchInventoryData();
    }, [toolName, toolModel]);

    useEffect(() => {
        const fetchUserRole = async () => {
            try {
                const response = await axios.get(`${USER_ENDPOINT}/${user.sub}`);
                const userData = response.data;
                setUserRole(userData.user_metadata.role);
            } catch (error) {
                console.error('Error fetching user roles:', error);
            }
        };

        fetchUserRole();
    }, [user.sub, setUserRole]);

    const handleVolver = () => {
        navigate('/solicitudesherramientas');
    };

    const handleRowClick = (fila) => {
        setSelectedRow(fila);
        setActionToConfirm(`asignar la herramienta con ID ${fila.id}`);
        setShowConfirmationModal(true);
    };

    const realizarAccion = async () => {
        if (!selectedRow) return;
        try {
            await axios.put(`${TOOL_ENDPOINT}/${selectedRow.id}`, {
                technitian_id: technitianID,
                warehouse_id: null,
            });
            await axios.put(`${TOOL_REQUEST_ENDPOINT}/${idSolTool}`, {
                status: 'Aceptada',
                tool_id: selectedRow.id
            });
            setShowConfirmationModal(false);
            navigate('/solicitudesherramientas');
            // Refrescar la página o mostrar un mensaje de éxito
        } catch (error) {
            console.error('Error realizando la acción:', error);
            alert('Error realizando la acción. Por favor, intenta de nuevo.');
        }
    };

    return (
        <div style={{ marginTop: '100px' }}>
            <NavBar />
            <div className='container mx-auto px-4 mb-10'>
                <h1 className='text-3xl mt-10 mb-4 first-line:font-bold text-gray-800'>Asignar Herramientas disponibles</h1>
                <p className='text-xl mt-10 mb-4 text-gray-800'>Seleccione una fila para asignar la herramienta</p>
                <div>
                    {isLoadingPage ? (
                        <div className="flex justify-center items-center mt-4 h-24">
                            <PulseLoader color="#319795" />
                        </div>
                    ) : (
                        <Tabla 
                            columnas={columnas} 
                            filas={filteredRows}
                            onRowClick={handleRowClick} 
                            isLoading={isLoadingPage}
                        />
                    )}
                </div>
                <div className='mt-5 flex justify-center'>
                    <button onClick={handleVolver} className='bg-white mr-3 rounded px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'>
                        Volver
                    </button>
                </div>
            </div>
            {showConfirmationModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-25"></div>
                    <div className="bg-white p-8 rounded-lg shadow-lg relative z-10 w-[600px]">
                        <p className="text-xl font-semibold text-center mb-4">¿Quieres asignar la herramienta con ID {selectedRow?.id}?</p>
                        <div className="flex justify-center space-x-4">
                            <button onClick={realizarAccion} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                                Confirmar
                            </button>
                            <button onClick={() => setShowConfirmationModal(false)} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AsignarRepuestos;
