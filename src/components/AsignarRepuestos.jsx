import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Tabla from './Tabla';
import NavBar from './NavBar';
import { PulseLoader } from 'react-spinners';
import { INVENTORY_ENDPOINT, USER_ENDPOINT, SPARE_REQUEST_ENDPOINT } from '../utils/apiRoutes';
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
    const [spareId, setSpareId] = useState(null);
    const [spareQuantity, setSpareQuantity] = useState(null);

    const { idSolRep } = useParams();

    const columnas = [
        { nombre: "Bodega", llave: "Warehouse.name" },
        { nombre: "Direccion", llave: "Warehouse.address" },
        { nombre: "Nombre Repuesto", llave: "Spare.name" },
        { nombre: "Tipo Repuesto", llave: "Spare.type" },
        { nombre: "Cantidad en Bodega", llave: "quantity" } 
    ];

    useEffect(() => {
        const fetchSpareRequestData = async () => {
            setIsLoadingPage(true);
            try {
                const response = await axios.get(`${SPARE_REQUEST_ENDPOINT}/${idSolRep}`);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch request data');
                }
                const data = response.data;
                setSpareId(data.spare_id);
                setSpareQuantity(data.quantity);

            } catch (error) {
                console.error('Error fetching request data:', error);
            } finally {
                setIsLoadingPage(false);
            }
        };

        fetchSpareRequestData();
    }, [idSolRep]);

    useEffect(() => {
        const fetchInventoryData = async () => {
            if (!spareId) return;

            setIsLoadingPage(true);
            try {
                const response = await axios.get(INVENTORY_ENDPOINT);
                if (response.status !== 200) {
                    throw new Error('Failed to fetch inventory data');
                }
                const data = response.data;

                const groupedData = data.reduce((acc, item) => {
                    if (item.spare_id === spareId) {
                        const existingItem = acc.find(i => i.warehouse_id === item.warehouse_id);
                        if (existingItem) {
                            existingItem.quantity += item.quantity;
                        } else {
                            acc.push({ ...item, cantidadAsignar: 0 });
                        }
                    }
                    return acc;
                }, []);

                setFilas(groupedData);
                setFilteredRows(groupedData);
            } catch (error) {
                console.error('Error fetching inventory data:', error);
            } finally {
                setIsLoadingPage(false);
            }
        };

        fetchInventoryData();
    }, [spareId]);

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
        navigate('/solicitudesrepuestos');
    };

    const handleEnviarClick = async () => {
        let suma = 0;
        filteredRows.forEach((fil) => {
            suma += parseInt(fil.cantidadAsignar) || 0;
        });

        if (suma === spareQuantity) { 
            const requestData = filteredRows.map((row) => ({
                spare_id: parseInt(row.spare_id),
                quantity: parseInt(row.cantidadAsignar),
                warehouse_id: parseInt(row.warehouse_id)
            }));
            // console.log(requestData)

            try {
                const response = await axios.put(INVENTORY_ENDPOINT + "/quantities", requestData);
                alert(`Solicitud realizada correctamente!`);
                try {
                    const response = await axios.put(`${SPARE_REQUEST_ENDPOINT}/${idSolRep}`, { state: 'Aprobada' }); //
                    navigate('/solicitudesrepuestos');
                } catch (error) {
                    console.error('Error making spare request:', error);
                    alert('Error haciendo la solicitud. Por favor intenta de nuevo');
                }
            } catch (error) {
                console.error('Error haciendo la request:', error);
                alert('Error haciendo la solicitud. Por favor intenta de nuevo');
            }
        } else {
            alert(`Incorrecto, La suma de los valores es: ${suma}, debe ser ${spareQuantity}`);
        }
    };

    const handleCantidadAsignarChange = (rowData, value) => {
        setFilteredRows(prevRows => {
            return prevRows.map(row => 
                row.warehouse_id === rowData.warehouse_id ? { ...row, cantidadAsignar: value } : row
            );
        });
    };

    return (
        <div>
            <NavBar />
            <div className='container mx-auto px-4 mb-10'>
                <h1 className='text-3xl mt-10 mb-4 first-line:font-bold text-gray-800'>Asignar Repuestos</h1>
                <p className='text-xl mt-4 mb-4 first-line:font-bold text-gray-800'>Cantidad Solicitada: {spareQuantity} </p>
                <div>
                    {isLoadingPage ? (
                        <div className="flex justify-center items-center mt-4 h-24">
                            <PulseLoader color="#319795" />
                        </div>
                    ) : (
                        <Tabla 
                            columnas={columnas} 
                            filas={filteredRows} 
                            showCantidadAsignar={true} 
                            onCantidadAsignarChange={handleCantidadAsignarChange}
                            isLoading={isLoadingPage}
                        />
                    )}
                </div>
                <div className='mt-5 flex justify-center'>
                    <button onClick={handleVolver} className='bg-white mr-3 rounded px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'>
                        Volver
                    </button>
                    <button type='button' onClick={handleEnviarClick} className='bg-turquesa-500 hover:bg-turquesa-400 font-semibold text-white p-2 rounded-md'>Enviar</button>
                </div>
            </div>
        </div>
    );
};

export default AsignarRepuestos;
