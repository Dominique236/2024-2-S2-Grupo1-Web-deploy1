import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Tabla from './Tabla';
import Popup from './PopUp';
import NavBar from './NavBar';
import { PulseLoader } from 'react-spinners';
import SolAdvancedFiltersPopup from './SolAdvancedFiltersPopup';
import { SOLICITUD_ENDPOINT, USER_ENDPOINT } from '../utils/apiRoutes';
import { useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { UserContext } from '../contexts/UserContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Solicitudes = () => {
    const { user } = useAuth0();
    const [isLoadingPage, setIsLoadingPage] = useState(true);
    const { userRole } = useContext(UserContext);

    const [selectedRow, setSelectedRow] = useState(null);
    const [filas, setFilas] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filteredRows, setFilteredRows] = useState([]);
    const [filterConditions, setFilterConditions] = useState([]);

    const location = useLocation();
    let filtroWorkOrderId = location.state?.filtroWorkOrderId;

    // Filtros avanzados
    const [estadoPendiente, setEstadoPendiente] = useState(true);
    const [estadoAprobada, setEstadoAprobada] = useState(false);
    const [estadoRechazada, setEstadoRechazada] = useState(false);
    const [razonNoSeca, setRazonNoSeca] = useState(false);
    const [razonNoCentrifuga, setRazonNoCentrifuga] = useState(false);
    const [razonNoParte, setRazonNoParte] = useState(false);
    const [razonNoAcepta, setRazonNoAcepta] = useState(false);
    const [razonNoDevuelve, setRazonNoDevuelve] = useState(false);
    const [razonOtra, setRazonOtra] = useState(false);
    const [recomendacionPendiente, setRecomendacionPendiente] = useState(false); 
    const [recomendacionAprobar, setRecomendacionAprobar] = useState(false);
    const [recomendacionRechazar, setRecomendacionRechazar] = useState(false);


    const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 6)));
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));

    const columnas = [
        { nombre: "Máquina (QR)", llave: "Machine.code" },
        { nombre: "Estado", llave: "state" },
        { nombre: "ID OT", llave: "work_order_id" },
        { nombre: "Razón Solicitud", llave: "comment" },
        { nombre: "Recomendación Técnico", llave: "technitians_recommendation" },
        { nombre: "Dinero Solicitado", llave: "requested_money" },
        { nombre: "Fecha Creación", llave: "createdAt" },
        { nombre: "Fecha Actualización", llave: "updatedAt" }
    ];

    useEffect(() => {
        fetchRequestData();
        fetchUserData();
    }, [startDate, endDate]);

    const fetchRequestData = async () => {
        setIsLoadingPage(true);
        try {
            const start = startDate.toISOString().split('T')[0];
            const end = endDate.toISOString().split('T')[0];
            const response = await fetch(`${SOLICITUD_ENDPOINT}?startDate=${start}&endDate=${end}`);
            if (!response.ok) {
                throw new Error('Failed to fetch request data');
            }
            const data = await response.json();
            // console.log('Fetched data:', data);

            for (let i = 0; i < data.length; i++) {
                data[i].createdAt = new Date(data[i].createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
                data[i].updatedAt = new Date(data[i].updatedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
                // console.log("data[i].requested_money: ", data[i].requested_money);
            }

            if (filtroWorkOrderId) {
                const filteredData = filtroWorkOrderId ? data.filter(row => row.work_order_id === filtroWorkOrderId) : data;
                // console.log("location: ", filtroWorkOrderId);
                setFilas(data);
                setFilteredRows(filteredData);
            } else {
                const filteredByEstado = estadoPendiente ? data.filter(row => row.state === 'Pendiente') : data;
                setFilas(data);
                setFilteredRows(filteredByEstado);
            }

        } catch (error) {
            console.error('Error fetching request data:', error);
        }
        setIsLoadingPage(false);
    };

    const fetchUserData = async () => {
        try {
            const response = await axios.get(USER_ENDPOINT);
            const usersData = response.data;
            localStorage.setItem('usuarios', JSON.stringify(usersData));
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleRowClick = (fila) => {
        const datosAdicionales = filas.filter((f) => f.id === fila.id);
        setSelectedRow({ fila, datosAdicionales });
    };

    const filterRows = (filterValue) => {
        const newFilteredRows = filas.filter((fila) =>
            Object.values(fila).some((value) =>
                value && typeof value !== 'object' && 
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
        let newFilteredRows = filas;

        if (estadoPendiente || estadoAprobada || estadoRechazada) {
            newFilteredRows = newFilteredRows.filter((fila) =>
                (estadoPendiente && fila.state === 'Pendiente') ||
                (estadoAprobada && fila.state === 'Aceptada') ||
                (estadoRechazada && fila.state === 'Rechazada')
            );
        }

        if (razonNoSeca || razonNoCentrifuga || razonNoParte ||
            razonNoAcepta || razonNoDevuelve || razonOtra)  {
                newFilteredRows = newFilteredRows.filter((fila) =>
                    (razonNoSeca && fila.comment === 'Secadora no seca') ||
                    (razonNoCentrifuga && fila.comment === 'Lavadora no centrifuga') ||
                    (razonNoParte && fila.comment === 'Lavadora no parte') ||
                    (razonNoAcepta && fila.comment === 'Monedero no acepta monedas') ||
                    (razonNoDevuelve && fila.comment === 'Monedero no descuenta monedas') ||
                    (razonOtra && ![
                        'Secadora no seca',
                        'Lavadora no centrifuga',
                        'Lavadora no parte',
                        'Monedero no acepta monedas',
                        'Monedero no descuenta monedas'
                    ].includes(fila.comment))
                );
            }

        if (recomendacionPendiente || recomendacionAprobar || recomendacionRechazar) {
                newFilteredRows = newFilteredRows.filter((fila) =>
                    (recomendacionPendiente && fila.technitians_recommendation === 'Pendiente') ||
                    (recomendacionAprobar && fila.technitians_recommendation === 'Indemnizar') ||
                    (recomendacionRechazar && fila.technitians_recommendation === 'No indemnizar')
                );
            }

        setFilterConditions([
            estadoPendiente, estadoAprobada, estadoRechazada,
            razonNoSeca, razonNoCentrifuga, razonNoParte,
            razonNoAcepta, razonNoDevuelve, razonOtra,
            recomendacionPendiente, recomendacionAprobar,
            recomendacionRechazar
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
                (!filterConditions[2] || fila.state === 'Rechazada') &&
                (!filterConditions[3] || fila.comment === 'Secadora no seca') &&
                (!filterConditions[4] || fila.comment === 'Lavadora no centrifuga') &&
                (!filterConditions[5] || fila.comment === 'Lavadora no parte') &&
                (!filterConditions[6] || fila.comment === 'Monedero no acepta monedas') &&
                (!filterConditions[7] || fila.comment === 'Monedero no descuenta monedas') &&
                (!filterConditions[8] || fila.comment === 'Otra') &&
                (!filterConditions[8] || fila.technitians_recommendation === 'Pendiente') &&
                (!filterConditions[8] || fila.technitians_recommendation === 'Indemnizar') &&
                (!filterConditions[8] || fila.technitians_recommendation === 'No indemnizar')
            );
        }

        setFilterConditions([]);
        setFilteredRows(newFilteredRows);
    };

    const handleBorrarFiltros = () => {
        setEstadoPendiente(false);
        setEstadoAprobada(false);
        setEstadoRechazada(false);
        setRazonNoSeca(false);
        setRazonNoCentrifuga(false);
        setRazonNoParte(false);
        setRazonNoAcepta(false);
        setRazonNoDevuelve(false);
        setRazonOtra(false);
        setRecomendacionPendiente(false); 
        setRecomendacionAprobar(false);
        setRecomendacionRechazar(false);

        setFiltro('');
        filterRows('');
    };

    const handleApplyDateFilter = () => {
        if (startDate > endDate) {
            alert('La fecha de inicio debe ser anterior a la fecha de fin.');
            return;
        }
        fetchRequestData();
    };

    return (
        <div>
            <NavBar />
            <div className='container mx-auto px-4 mb-10 pt-20'>
                <h1 className='text-3xl mt-10 first-line:font-bold text-gray-800'>Solicitudes de Servicio al Cliente</h1>
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
                                    <Popup fila={selectedRow.fila} datosAdicionales={selectedRow.datosAdicionales} onClose={() => setSelectedRow(null)} />
                                </>
                            )}
                            <SolAdvancedFiltersPopup
                                show={showFilters}
                                onClose={handleCloseFilters}
                                onApply={handleApplyFilters}
                                onUndo={handleUndoFilters} 
                                estadoPendiente={estadoPendiente}
                                estadoAprobada={estadoAprobada}
                                estadoRechazada={estadoRechazada}
                                razonNoSeca={razonNoSeca}
                                razonNoCentrifuga={razonNoCentrifuga}
                                razonNoParte={razonNoParte}
                                razonNoAcepta={razonNoAcepta}
                                razonNoDevuelve={razonNoDevuelve}
                                razonOtra={razonOtra}
                                recomendacionPendiente={recomendacionPendiente}
                                recomendacionAprobar={recomendacionAprobar}
                                recomendacionRechazar={recomendacionRechazar}

                                handleEstadoPendienteChange={(e) => setEstadoPendiente(e.target.checked)}
                                handleEstadoAprobadaChange={(e) => setEstadoAprobada(e.target.checked)}
                                handleEstadoRechazadaChange={(e) => setEstadoRechazada(e.target.checked)}
                                handleRazonNoSecaChange={(e) => setRazonNoSeca(e.target.checked)}
                                handleRazonNoCentrifugaChange={(e) => setRazonNoCentrifuga(e.target.checked)}
                                handleRazonNoParteChange={(e) => setRazonNoParte(e.target.checked)}
                                handleRazonNoAceptaChange={(e) => setRazonNoAcepta(e.target.checked)}
                                handleRazonNoDevuelveChange={(e) => setRazonNoDevuelve(e.target.checked)}
                                handleRazonOtraChange={(e) => setRazonOtra(e.target.checked)}
                                handleRecomendacionPendiente={(e) => setRecomendacionPendiente(e.target.checked)}
                                handleRecomendacionAprobar={(e) => setRecomendacionAprobar(e.target.checked)}
                                handleRecomendacionRechazar={(e) => setRecomendacionRechazar(e.target.checked)}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Solicitudes;
