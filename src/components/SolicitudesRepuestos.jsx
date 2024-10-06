import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Tabla from './Tabla';
import NavBar from './NavBar';
import PopupSolRep from './PopUpSolRep';
import { PulseLoader } from 'react-spinners';
import SolRepAdvancedFiltersPopup from './SolRepAdvancedFiltersPopup';
import { SOLICITUD_ENDPOINT, USER_ENDPOINT, SPARE_REQUEST_ENDPOINT } from '../utils/apiRoutes';
import { useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { UserContext } from '../contexts/UserContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const SolicitudesRepuestos = () => {
    const { isAuthenticated, user } = useAuth0();
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    // const [userRole, setUserRole] = useState('');
    const { userRole, setUserRole } = useContext(UserContext);

    const [selectedRow, setSelectedRow] = useState(null);
    const [filas, setFilas] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filteredRows, setFilteredRows] = useState([]);
    const [filterConditions, setFilterConditions] = useState([]);

    //const location = useLocation();
    //let filtroWorkOrderId = location.state?.filtroWorkOrderId


    // Filtros avanzados
    const [estadoPendiente, setEstadoPendiente] = useState(true); 
    const [estadoAprobada, setEstadoAprobada] = useState(false);
    const [estadoRechazada, setEstadoRechazada] = useState(false);

    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 6)));
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));


    const columnas = [
        { nombre: "ID", llave: "id" },
        { nombre: "Estado", llave: "state" },
        { nombre: "Nombre Repuesto", llave: "Spare.name" },
        { nombre: "Cantidad", llave: "quantity" },
        { nombre: "ID OT", llave: "work_order_id" },
        { nombre: "Técnico", llave: "technitian_id" },
        { nombre: "Fecha Creación", llave: "createdAt" },
        { nombre: "Fecha Actualización", llave: "updatedAt" }
    ];

    useEffect(() => {
        fetchSpareRequestData();
    }, [startDate, endDate]); 

    const fetchSpareRequestData = async () => {
        setIsLoadingPage(true);
        try {
            const start = startDate.toISOString().split('T')[0];
            const end = endDate.toISOString().split('T')[0];
            const response = await fetch(`${SPARE_REQUEST_ENDPOINT}?startDate=${start}&endDate=${end}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch request data');
            }
            const data = await response.json();
            // console.log('Fetched data:', data);

            const user = await fetch(USER_ENDPOINT);
            if (!user.ok) {
                throw new Error('Failed to fetch user data');
            }
            const usersData = await user.json();

            for (let i = 0; i < data.length; i++) {
                data[i].createdAt = new Date(data[i].createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
                data[i].updatedAt = new Date(data[i].updatedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });

                const tecnico = usersData.find(user => user.user_id === data[i].technitian_id);
                data[i].technitian_id = tecnico ? `${tecnico.user_metadata.name} ${tecnico.user_metadata.last_name}` : data[i].technitian_id;
            }


            // Apply estadoPendiente filter
            const filteredByEstado = estadoPendiente ? data.filter(row => row.state === 'Pendiente') : data;
            setFilas(data);
            setFilteredRows(filteredByEstado); // Initialize filteredRows with filtered data // filteredByEstado
            

            

            

        } catch (error) {
            console.error('Error fetching request data:', error);
        }
        setIsLoadingPage(false);
    };

    useEffect(() => {
            const fetchUserRole = async () => {
            // Lógica para obtener el rol del usuario
            try {
                const response = await axios.get(`${USER_ENDPOINT}/${user.sub}`);
                const userData = response.data;                   
                setUserRole(userData.user_metadata.role);
            } catch (error) {
                console.error('Error fetching user roles:', error);
            }
            };
        
            fetchUserRole();
        }, []);


    const handleRowClick = (fila) => {
        const datosAdicionales = filas.filter((f) => f.id === fila.id);
        setSelectedRow({ fila, datosAdicionales });
    };

    const handleFilterChange = (e) => {
        setFiltro(e.target.value);
        filterRows(e.target.value);
    };

    const filterRows = (filterValue) => {
        const newFilteredRows = filas.filter((fila) =>
            Object.values(fila).some((value) =>
                value && typeof value !== 'object' && // Verifica si el valor no es nulo ni un objeto
                value.toString().toLowerCase().includes(filterValue.toLowerCase())
            )
        );
        setFilteredRows(newFilteredRows);
    };

    const handleOpenFilters = () => {
        setShowFilters(true);
    };

    const handleCloseFilters = () => {
        setShowFilters(false);
    };

    const handleApplyFilters = () => {
        // Filtrar según los checkboxes marcados
        let newFilteredRows = filas;

        if (estadoPendiente || estadoAprobada || estadoRechazada) {
            newFilteredRows = newFilteredRows.filter((fila) =>
                (estadoPendiente && fila.state === 'Pendiente') ||
                (estadoAprobada && fila.state === 'Aprobada') ||
                (estadoRechazada && fila.state === 'Rechazada')
            );
        }


        setFilterConditions([
            estadoPendiente, estadoAprobada, estadoRechazada
        ]);
        setFilteredRows(newFilteredRows);
        setShowFilters(false);
    };

    const handleUndoFilters = () => {
        setFilteredRows(filas);
        setShowFilters(false);

        let newFilteredRows = filas;

        if (filterConditions.some((condition) => condition)) {
            newFilteredRows = newFilteredRows.filter((fila) =>
                (!filterConditions[0] || fila.state === 'Pendiente') &&
                (!filterConditions[1] || fila.state === 'Aprobada') &&
                (!filterConditions[2] || fila.state === 'Rechazada') 
            );
        }

        setFilterConditions([]);
        setFilteredRows(newFilteredRows);

    };

    const handleBorrarFiltros = () => {
        setEstadoPendiente(false);
        setEstadoAprobada(false);
        setEstadoRechazada(false);


        // Limpia también el filtro de búsqueda
        setFiltro('');
        filterRows('');

    };

    return (
        <div>
            <NavBar />
            <div className='container mx-auto px-4 mb-10 pt-20'>
                <h1 className='text-3xl mt-10 first-line:font-bold text-gray-800'>Solicitudes de Repuestos</h1>
                <div>
                    {isLoadingPage ? (
                        <div className="flex justify-center items-center mt-4 h-24">
                            <PulseLoader color="#319795" />
                        </div>
                    ) : (
                        <>
                        <br></br>
                        <div className="flex mb-4">
                            <div className='content-center mr-3 font-medium'>
                                Mostrando solicitudes desde 
                            </div>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                dateFormat="dd-MM-yy"
                                className="px-4 py-2 border rounded"
                            />
                            <div className='content-center ml-3 mr-3 font-medium'>
                                hasta
                            </div>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                dateFormat="dd-MM-yy"
                                className="mr-2 px-4 py-2 border rounded"
                            />
                        </div>
                            <Tabla 
                                columnas={columnas} filas={filteredRows} 
                                onRowClick={handleRowClick} isLoading={isLoadingPage}
                                buttonAdvancedFilterText="Filtros avanzados" buttonAdvancedFilter={handleOpenFilters} 
                                buttonClearFilterText="Limpiar filtros" buttonClearFilter={handleBorrarFiltros}
                            />
                                {selectedRow && (
                                    <>
                                        <PopupSolRep fila={selectedRow.fila} datosAdicionales={selectedRow.datosAdicionales} onClose={() => setSelectedRow(null)} />
                                    </>
                                )}
                            <SolRepAdvancedFiltersPopup
                                show={showFilters}
                                onClose={handleCloseFilters}
                                onApply={handleApplyFilters}
                                onUndo={handleUndoFilters} 
                                estadoPendiente={estadoPendiente}
                                estadoAprobada={estadoAprobada}
                                estadoRechazada={estadoRechazada}

                                handleEstadoPendienteChange={(e) => setEstadoPendiente(e.target.checked)}
                                handleEstadoAprobadaChange={(e) => setEstadoAprobada(e.target.checked)}
                                handleEstadoRechazadaChange={(e) => setEstadoRechazada(e.target.checked)}
                            />
                        </>
                    )}

                </div>
            </div>
        </div>
    );
    
}

export default SolicitudesRepuestos;
