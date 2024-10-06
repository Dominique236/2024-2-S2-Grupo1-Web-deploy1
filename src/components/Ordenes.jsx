import React, { useState, useEffect, useContext, useRef } from 'react';
import Papa from 'papaparse';
import { useNavigate, useLocation } from 'react-router-dom';
import Tabla from './Tabla';
import Popup from './PopUp';
import NavBar from './NavBar';
import OTAdvancedFiltersPopup from './OTAdvancedFiltersPopup';
import { OT_ENDPOINT, USER_ENDPOINT } from '../utils/apiRoutes';
import { UserContext } from '../contexts/UserContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

const Ordenes = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRow, setSelectedRow] = useState(null);
    const [filas, setFilas] = useState([]); // Todas las filas originales
    const [filteredRows, setFilteredRows] = useState([]); // Filas filtradas y mostradas en la tabla
    const [filtro, setFiltro] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterConditions, setFilterConditions] = useState([]);
    const [orden, setOrden] = useState('default'); // Por defecto, orden ascendente
    const fileInputRef = useRef(null); // Ciclo1: estado para subir archivo (programar OT)
    const navigate = useNavigate();
    const { userRole } = useContext(UserContext);
    const location = useLocation();
    const filtroWorkOrderId = location.state?.filtroWorkOrderId;

    // Filtros avanzados
    const [estadoPendiente, setEstadoPendiente] = useState(true); // true
    const [estadoResuelta, setEstadoResuelta] = useState(false);
    const [estadoInactiva, setEstadoInactiva] = useState(false);
    const [prioridadAlta, setPrioridadAlta] = useState(false);
    const [prioridadMedia, setPrioridadMedia] = useState(false);
    const [prioridadBaja, setPrioridadBaja] = useState(false);
    const [tipoLavadora, setTipoLavadora] = useState(false);
    const [tipoSecadora, setTipoSecadora] = useState(false);
    const [filterbuilding, setFilterBuilding] = useState('');
    // const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 6)));
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));


    const columnas = [
        { nombre: 'ID', llave: 'id' },
        { nombre: 'Descripción', llave: 'name' },
        { nombre: 'Código Máquina (QR)', llave: 'Machine.code' },
        { nombre: 'Tipo Máquina', llave: 'Machine.type' },
        { nombre: 'Modelo Máquina', llave: 'Machine.model' },
        { nombre: 'Técnico', llave: 'technician_id' },
        { nombre: 'Estado', llave: 'status' },
        { nombre: 'Prioridad', llave: 'priority' },
        { nombre: 'Edificio', llave: 'Machine.Building.name' },
        { nombre: 'Fecha Creación', llave: 'createdAt' },
        { nombre: 'Fecha Actualización', llave: 'updatedAt' }
    ];

    // Formatear fechas a cadenas legibles para la tabla
    const formatFechasFilas = (filas) => {
        return filas.map((fila) => ({
            ...fila,
            createdAt: fila.createdAt
                ? fila.createdAt.toLocaleDateString('es-ES', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
                : '-',
            updatedAt: fila.updatedAt
                ? fila.updatedAt.toLocaleDateString('es-ES', { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
                : '-'
        }));
    };

    // Ordenar las filas filtradas según la selección
    const handleOrdenar = (e) => {
        const ordenSeleccionado = e.target.value;
        
        // Solo aplica el orden si no es "default"
        if (ordenSeleccionado !== 'default') {
            setOrden(ordenSeleccionado);
        
            // Ordena las filas filtradas
            const filasOrdenadas = [...filteredRows].sort((a, b) => {
                if (ordenSeleccionado === 'asc') {
                    return new Date(a.createdAt) - new Date(b.createdAt);
                } else {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
            });
        
            setFilteredRows(filasOrdenadas);
        }
    };

    const aplicarOrden = (filasParaOrdenar) => {
        if (orden !== 'default') {
            return filasParaOrdenar.sort((a, b) => {
                if (orden === 'asc') {
                    return new Date(a.createdAt) - new Date(b.createdAt);
                } else {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                }
            });
        }
        return filasParaOrdenar;
    };
      

    // Fetch de los datos iniciales
    useEffect(() => {
        fetchRequestData();
    }, [startDate, endDate]);

    const fetchRequestData = async () => {
        setIsLoading(true);
        try {
            const start = startDate.toISOString().split('T')[0];
            const end = endDate.toISOString().split('T')[0];
            const response = await fetch(`${OT_ENDPOINT}?startDate=${start}&endDate=${end}`);
            if (!response.ok) {
                throw new Error('Failed to fetch request data');
            }
            const data = await response.json();
            const user = await fetch(USER_ENDPOINT);
            if (!user.ok) {
                throw new Error('Failed to fetch user data');
            }
            const usersData = await user.json();

            // Procesar los datos y dejar las fechas en formato de objeto Date
            for (let i = 0; i < data.length; i++) {
                data[i].createdAt = new Date(data[i].createdAt);
                data[i].updatedAt = new Date(data[i].updatedAt);

                const tecnico = usersData.find((user) => user.user_id === data[i].technician_id);
                data[i].technician_id = tecnico
                    ? `${tecnico.user_metadata.name} ${tecnico.user_metadata.last_name}`
                    : data[i].technician_id;
            }

            // Si hay un filtro aplicado en la URL
            if (filtroWorkOrderId) {
                const filteredData = data.filter((row) => row.id === filtroWorkOrderId);
                setFilas(data);
                setFilteredRows(aplicarOrden(filteredData)); // Aplicar orden a las filas filtradas
            } else {
                const filteredByEstado = estadoPendiente
                    ? data.filter((row) => row.status === 'Por Visitar')
                    : data;
                setFilas(data);
                setFilteredRows(aplicarOrden(filteredByEstado)); // Aplicar orden a las filas filtradas
            }
        } catch (error) {
            console.error('Error fetching request data:', error);
        }
        setIsLoading(false);
    };

    const handleFilterChange = (e) => {
        setFiltro(e.target.value);
        filterRows(e.target.value);
    };

    const handleOpenFilters = () => {
        setShowFilters(true);
    };

    const handleCloseFilters = () => {
        setShowFilters(false);
    };

    const handleRowClick = (fila) => {
        const datosAdicionales = filas.filter((f) => f.id === fila.id);
        // console.log("Datos adicion: ", datosAdicionales);
        setSelectedRow({ fila, datosAdicionales });
    };

    const filterRows = (filterValue) => {
        const newFilteredRows = filas.filter((fila) =>
            Object.values(fila).some(
                (value) =>
                    value &&
                    typeof value !== 'object' &&
                    value.toString().toLowerCase().includes(filterValue.toLowerCase())
            )
        );
        setFilteredRows(newFilteredRows);
    };

    const handleApplyFilters = () => {
        let newFilteredRows = filas;
    
        // Filtrar según las condiciones seleccionadas
        if (estadoPendiente || estadoResuelta || estadoInactiva) {
            newFilteredRows = newFilteredRows.filter((fila) =>
                (estadoPendiente && fila.status === 'Por Visitar') ||
                (estadoResuelta && fila.status === 'Resuelta') ||
                (estadoInactiva && fila.status === 'Inactiva')
            );
        }
    
        if (prioridadAlta || prioridadMedia || prioridadBaja) {
            newFilteredRows = newFilteredRows.filter((fila) =>
                (prioridadAlta && fila.priority === 'Alta') ||
                (prioridadMedia && fila.priority === 'Media') ||
                (prioridadBaja && fila.priority === 'Baja')
            );
        }
    
        if (tipoLavadora || tipoSecadora) {
            newFilteredRows = newFilteredRows.filter((fila) =>
                (tipoLavadora && fila.Machine.type === 'Lavadora') ||
                (tipoSecadora && fila.Machine.type === 'Secadora')
            );
        }
    
        if (filterbuilding) {
            newFilteredRows = newFilteredRows.filter(row => row.Machine?.Building?.name === filterbuilding);
        }
    
        // Guardar las condiciones actuales de los filtros
        setFilterConditions([
            estadoPendiente,
            estadoResuelta,
            estadoInactiva,
            prioridadAlta,
            prioridadMedia,
            prioridadBaja,
            tipoLavadora,
            tipoSecadora
        ]);
    
        // Aplicar orden a las filas filtradas
        newFilteredRows = aplicarOrden(newFilteredRows);
        setFilteredRows(newFilteredRows);

        setShowFilters(false); // Cerrar el popup
    };
    

    const handleCrearOT = () => {
        navigate('/crearOrden');
    };

    const handleBorrarFiltros = () => {
        // Limpiar todos los filtros y restaurar las filas originales
        setEstadoPendiente(false);
        setEstadoResuelta(false);
        setEstadoInactiva(false);
        setPrioridadAlta(false);
        setPrioridadMedia(false);
        setPrioridadBaja(false);
        setTipoLavadora(false);
        setTipoSecadora(false);
        setFilterBuilding('');
        setFiltro('');
        setFilteredRows(filas); // Restaurar las filas originales


        // Mantener el estado de orden actual y aplicarlo a las filas originales
        let newCleanRows = aplicarOrden(filteredRows);
        setFilteredRows(newCleanRows);
    };
      
    const handleFileChange = async (event) => {
        const file = event.target.files[0]; // Obtiene el archivo seleccionado
        if (file && file.type === 'text/csv') {
            console.log('Archivo subido:', file.name);
            
            Papa.parse(file, {
                header: true, 
                delimiter: ";", // Cambié el delimitador a punto y coma
                skipEmptyLines: true, 
                complete: async (results) => {
                    const jsonData = results.data.map((row) => {
                        return {
                            building_name: row.edificio,
                            technicians: row.tecnicos ? row.tecnicos.split(';').map(t => t.trim()) : [], // Convierte la lista de técnicos en array
                            date: row.fecha ? formatFecha(row.fecha) : null // Ajusta el formato de la fecha
                        };
                    });
                    
                    console.log('Datos convertidos a JSON:', jsonData);
    
                    // Enviar el JSON al backend
                    const url = `${OT_ENDPOINT}/maintenance`;
                    try {
                        const response = await axios.post(url, { data: jsonData }, {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                        console.log('Respuesta del servidor:', response.data);
                    } catch (error) {
                        console.log('Error al enviar los datos al servidor:', error);
                    }
                }
            });
        } else {
            alert('Debes subir un archivo de extensión .csv');
        }
    };
    
    // Función para formatear la fecha al formato YYYY-MM-DD
    const formatFecha = (fecha) => {
        const [day, month, year] = fecha.split('-');
        return `20${year}-${month}-${day}`; // Ajusta para el formato de año completo YYYY
    };
    

    return (
        <div>
            <NavBar />
            <div className='container mx-auto px-4 mb-10 pt-20'>
                <div className='flex justify-between items-end'>
                    <div>
                        <h1 className='text-3xl mt-10 first-line:font-bold text-gray-800'>Órdenes de Trabajo</h1>
                        <br></br>
                    </div>
                    <div className="flex gap-2">
                        {userRole !== 'finanzas' && (
                            <>
                                <input
                                    type="file"
                                    accept=".csv" // Acepta solo archivos .csv
                                    ref={fileInputRef} // Referencia para el input
                                    onChange={handleFileChange} // Manejar el cambio de archivo
                                    style={{ display: 'none' }} // Ocultar el input
                                />
                                <button onClick={() => fileInputRef.current.click()} className="bg-naranja-500 rounded px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-naranja-600 sm:mt-0 sm:w-auto">
                                    Programar OT
                                </button>

                                <button
                                    onClick={handleCrearOT}
                                    className="bg-naranja-500 rounded px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-naranja-600 sm:mt-0 sm:w-auto"
                                >
                                    Crear OT
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex mb-4">
                    <div className='content-center mr-3 font-medium'>
                        Mostrando órdenes desde 

                    </div>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        dateFormat="dd-MM-yy"
                        className="px-4 py-2 border rounded"
                        placeholderText="Ingresar fecha"
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
                        placeholderText="Ingresar fecha"
                    />
                </div>

                <div className="flex mb-4">
                    <br />
                    
                    <button
                        onClick={handleOpenFilters}
                        className="bg-gray-200 rounded px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300"
                    >
                        Filtros avanzados
                    </button>
                    <button
                        onClick={handleBorrarFiltros}
                        className="bg-gray-200 rounded px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-300 ml-2"
                    >
                        Limpiar filtros
                    </button>
                    <select
                        value={orden}
                        onChange={handleOrdenar}
                        className="bg-gray-200 rounded px-3 py-2 text-sm text-gray-800 ml-2"
                    >
                        <option value="default">Ordenar</option>
                        <option value="asc">Más antiguas primero</option>
                        <option value="desc">Más recientes primero</option>
                    </select>
                </div>




                <Tabla
                    columnas={columnas}
                    filas={formatFechasFilas(filteredRows)}
                    onRowClick={handleRowClick}
                    isLoading={isLoading}
                />

                
                {selectedRow && (
                    <Popup
                        fila={selectedRow.fila}
                        datosAdicionales={selectedRow.datosAdicionales}
                        onClose={() => setSelectedRow(null)}
                    />
                )}
                <OTAdvancedFiltersPopup
                    show={showFilters}
                    onClose={handleCloseFilters}
                    onApply={handleApplyFilters}
                    estadoPendiente={estadoPendiente}
                    estadoResuelta={estadoResuelta}
                    estadoInactiva={estadoInactiva}
                    prioridadAlta={prioridadAlta}
                    prioridadMedia={prioridadMedia}
                    prioridadBaja={prioridadBaja}
                    tipoLavadora={tipoLavadora}
                    tipoSecadora={tipoSecadora}
                    filterbuilding={filterbuilding}
                    handleEstadoPendienteChange={(e) => setEstadoPendiente(e.target.checked)}
                    handleEstadoResueltaChange={(e) => setEstadoResuelta(e.target.checked)}
                    handleEstadoInactivaChange={(e) => setEstadoInactiva(e.target.checked)}
                    handlePrioridadAltaChange={(e) => setPrioridadAlta(e.target.checked)}
                    handlePrioridadMediaChange={(e) => setPrioridadMedia(e.target.checked)}
                    handlePrioridadBajaChange={(e) => setPrioridadBaja(e.target.checked)}
                    handleTipoLavadoraChange={(e) => setTipoLavadora(e.target.checked)}
                    handleTipoSecadoraChange={(e) => setTipoSecadora(e.target.checked)}
                    handleFilterBuildingChange={(value) => setFilterBuilding(value)}
                />
            </div>
        </div>
    );
};


export default Ordenes;
