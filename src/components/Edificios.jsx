import React, { useState, useEffect, useContext } from 'react';
import Tabla from './Tabla';
import NavBar from './NavBar';
import { BUILDING_ENDPOINT } from '../utils/apiRoutes';
import { UserContext } from '../contexts/UserContext';
import EdificiosAdvancedFiltersPopup from './EdificiosAdvancedFiltersPopup';

const Edificios = () => {
    const [filas, setFilas] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [adder, setAdder] = useState(false);
    const [editor, setEditor] = useState(false);
    const [deleter, setDeleter] = useState(false);

    const [buildingToEdit, setBuildingToEdit] = useState();
    const [deleteClickCount, setDeleteClickCount] = useState(0);
    const [editClickCount, setEditClickCount] = useState(0);

    const [id, setId] = useState('');
    const [address, setAddress] = useState('');
    const [admin_phone_number, setAdminPhoneNumber] = useState('');
    const [admin_email, setAdminEmail] = useState('');
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [county, setCounty] = useState('');
    const [state, setState] = useState('Activo');

    const { userRole } = useContext(UserContext);


    const columnas = [
        //{ nombre: "ID Edificio", llave: "id" },
        { nombre: "Dirección", llave: "address" },
        { nombre: "Número administrador", llave: "admin_phone_number" },
        { nombre: "Email administrador", llave: "admin_email" },
        { nombre: "Nombre", llave: "name" },
        { nombre: "Código", llave: "code" },
        { nombre: "Comuna", llave: "county" },
        { nombre: "Estado", llave: "state" },
        { nombre: "", llave: "editButton" }
    ];

    // COMUNAS TIENEN TILDEEEE
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

    // Filtros avanzados
    const [estadoActivo, setEstadoActivo] = useState(true);
    const [estadoEliminado, setEstadoEliminado] = useState(false);
    const [filterComuna, setFilterComuna] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filteredRows, setFilteredRows] = useState([]);
    const [filterConditions, setFilterConditions] = useState([]);


    // Temporary filter states
    const [tempEstadoActivo, setTempEstadoActivo] = useState(true);
    const [tempEstadoEliminado, setTempEstadoEliminado] = useState(false);
    const [tempFilterComuna, setTempFilterComuna] = useState('');

    const [borrarFiltrosClicked, setBorrarFiltrosClicked] = useState(false);

    useEffect(() => {
        if (!borrarFiltrosClicked) {
            handleApplyFilters();
        } else {
            setBorrarFiltrosClicked(false); // Reset the flag
        }
    }, [estadoActivo, estadoEliminado, filterComuna, filas, borrarFiltrosClicked]);

    useEffect(() => {
        fetchBuildingData();
    }, []);

    const fetchBuildingData = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(BUILDING_ENDPOINT); 
            if (!response.ok) {
                throw new Error('Failed to fetch request data');
            }
            const data = await response.json();
            // console.log('Fetched data:', data); 
            const transformedData = data.map(building => ({
                ...building,
                editButton: (
                    <button
                        className="bg-white rounded px-2 py-2 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => {
                            setBuildingToEdit(building);
                            setEditor(true);
                        }}
                    >
                        Editar
                    </button>
                )
            }));

            setFilas(transformedData);
            setFilteredRows(transformedData); // Also set filteredRows to initial data
        } catch (error) {
            console.error('Error fetching request data:', error);
        }
        setIsLoading(false);
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

    const handleAddBuilding = async (e) => {
        e.preventDefault();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(admin_email)) {
                alert('Por favor, ingrese una dirección de correo electrónico válida.');
                return;
            }

            if (
                name.trim() === "" || 
                address.trim() === "" || 
                admin_phone_number.trim() === "" || 
                admin_email.trim() === "" || 
                code.trim() === "" || 
                county.trim() === "" || 
                state.trim() === ""
            ) {
                alert('Faltan datos para agregar edificio.');
                return;
            }
            
        try {
            const response = await fetch(BUILDING_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    address: address,
                    admin_phone_number: admin_phone_number,
                    admin_email: admin_email,
                    name: name,
                    code: code,
                    county: county,
                    state: state
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add building');
            }
            setAdder(false);
            fetchBuildingData();
        } catch (error) {
            console.error('Error adding building:', error);
            alert('Error al añadir bodega. Intente nuevamente.');
        }
    };

    const handleEditBuilding = async (e) => {
        e.preventDefault();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(buildingToEdit.admin_email)) {
                alert('Por favor, ingrese una dirección de correo electrónico válida.');
                return;
            }
            
        
        if (!buildingToEdit || buildingToEdit.id == "" ) {
            alert('Faltan datos para editar edificio.');
            return;
        }

        
        try {
            const response = await fetch(BUILDING_ENDPOINT + '/' + buildingToEdit.id, {
                method: 'PUT', // or 'PATCH' depending on your API endpoint
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: buildingToEdit.name,
                    address: buildingToEdit.address,
                    admin_phone_number: buildingToEdit.admin_phone_number,
                    admin_email: buildingToEdit.admin_email,
                    code: buildingToEdit.code,
                    county: buildingToEdit.county,
                    state: buildingToEdit.state
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update building');
            }
            setEditor(false);
            fetchBuildingData();
        } catch (error) {
            console.error('Error updating building:', error);
            alert('Error al editar edificio. Intente nuevamente.');
        }
    };

    const editConfirmation = (e) => {
        if (editClickCount === 0) {
            if (e) {
                e.preventDefault();
            }
            setEditClickCount(1); 
        } else if (editClickCount === 1) {
            if (e) {
                e.preventDefault();
            }
            handleEditBuilding(e);
        }
    };

    const handleDeleteBuilding = async (e) => {
        if (e) {
            e.preventDefault();
        }
        if(!buildingToEdit || !buildingToEdit.id){
            alert('Falta el código para eliminar edificio');
            return;
        }
        try {
            const response = await fetch(BUILDING_ENDPOINT + '/' + buildingToEdit.id, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete building');
            }
            setDeleteClickCount(0);
            setEditor(false);
            fetchBuildingData();
        } catch (error) {
            console.error('Error deleting building:', error);
            alert('Error eliminando edificio. Intente nuevamente.');
        }
    };

    const deleteConfirmation = (e) => {
        if (deleteClickCount === 0) {
            //alert('Are you sure you want to submit?');
            if (e) {
                e.preventDefault();
            }
            setDeleteClickCount(1); 
        } else if (deleteClickCount === 1) {
            //alert('Submitted!');
            handleDeleteBuilding();
        }
    };

    const handleOpenFilters = () => {
        setTempEstadoActivo(estadoActivo);
        setTempEstadoEliminado(estadoEliminado);
        setTempFilterComuna(filterComuna);
        setShowFilters(true);
    };

    const handleCloseFilters = () => {
        setShowFilters(false);
    };

    const handleApplyFilters = () => {
        let newFilteredRows = filas;
        if (tempEstadoActivo || tempEstadoEliminado) {
            newFilteredRows = newFilteredRows.filter((fila) => 
                (tempEstadoActivo && fila.state === 'Activo') ||
                (tempEstadoEliminado && fila.state === 'deleted')
            );
        }
        if (tempFilterComuna) {
            newFilteredRows = newFilteredRows.filter(fila => fila.county === tempFilterComuna);
        }
        setEstadoActivo(tempEstadoActivo);
        setEstadoEliminado(tempEstadoEliminado);
        setFilterComuna(tempFilterComuna);
        setFilteredRows(newFilteredRows);
        setShowFilters(false);
        /* setFilterConditions([estadoActivo, estadoEliminado]);
        setFilteredRows(newFilteredRows);
        setShowFilters(false); */
    };

    const handleUndoFilters = () => {
        let newFilteredRows = filas;

        if (filterConditions[0]) {
            newFilteredRows = newFilteredRows.filter((fila) =>
                fila.county === filterConditions[0]
            );
        }

        setFilterConditions([]);
        setFilteredRows(newFilteredRows);
    };

    const handleBorrarFiltros = () => {
        setTempEstadoActivo(true);
        setTempEstadoEliminado(false);
        setTempFilterComuna('');
        /* setEstadoActivo(true);
        setEstadoEliminado(false);
        setFilterComuna(''); */
        // Limpia también el filtro de búsqueda
        setFiltro('');
        //filterRows('');
        //setFilteredRows(filas);
        setBorrarFiltrosClicked(true);
    };

    return (
        <div>
            <NavBar />
            <div className='container mx-auto px-4 mb-10 pt-20'>
                <div className='flex justify-between items-end'>
                    <div>
                        <h1 className='text-3xl mt-10 first-line:font-bold text-gray-800'>Edificios</h1>
                    </div>
                    <div>
                        {userRole === 'admin' && (
                            <>
                                <button
                                    onClick={() => setAdder(true)}
                                    className="bg-white rounded px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                >
                                    Agregar edificio
                                </button>
                            </>
                        )}
                    </div>
                </div>
                
                <Tabla 
                    columnas={columnas} filas={filteredRows} isLoading={isLoading}
                    buttonAdvancedFilterText="Filtros avanzados" buttonAdvancedFilter={handleOpenFilters} 
                    buttonClearFilterText="Limpiar filtros" buttonClearFilter={handleBorrarFiltros}
                />
                <EdificiosAdvancedFiltersPopup
                    show={showFilters}
                    onClose={handleCloseFilters}
                    onApply={handleApplyFilters}
                    onUndo={handleUndoFilters}
                    estadoActivo={tempEstadoActivo}
                    estadoEliminado={tempEstadoEliminado}
                    filterComuna={tempFilterComuna}

                    handleEstadoActivoChange={(e) => setTempEstadoActivo(e.target.checked)}
                    handleEstadoEliminadoChange={(e) => setTempEstadoEliminado(e.target.checked)}
                    handleFilterCountyChange={(comuna) => setTempFilterComuna(comuna)}
                />
                
                {adder && (
                    <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl ml-10 mr-10">
                                        <form onSubmit={handleAddBuilding}>
                                            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                                <button
                                                    onClick={() => {
                                                        setAdder(false);
                                                    }}
                                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                                <h2 className="text-base font-semibold leading-6 text-turquesa-500 text-xl mb-3" id="modal-title">Agregar edificio</h2>
                                                <div className="max-w-2xl mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
                                                    <div className="lg:col-span-1">
                                                        <div className="mt-2 mb-2">
                                                            <label htmlFor='building_name' className='block'>Nombre:</label>
                                                            <input required type='text' id='building_name' value={name} onChange={(e) => setName(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md' />
                                                        </div>
                                                        <div className="mb-3">
                                                            <label htmlFor='building_address' className='block'>Dirección:</label>
                                                            <input required type='text' id='building_address' value={address} onChange={(e) => setAddress(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md' />
                                                        </div>
                                                        <div className="mt-2 mb-2">
                                                            <label htmlFor='building_name' className='block'>Número administrador:</label>
                                                            <input required type='text' id='admin_phone' value={admin_phone_number} onChange={(e) => setAdminPhoneNumber(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md' />
                                                        </div>
                                                        <div className="mb-3">
                                                            <label htmlFor='building_address' className='block'>Email administrador:</label>
                                                            <input required type='email' id='admin_email' value={admin_email} onChange={(e) => setAdminEmail(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md' />
                                                        </div>
                                                    </div>
                                                    <div className="lg:col-span-1">
                                                        <div className="mt-2 mb-2">
                                                            <label htmlFor='building_name' className='block'>Código:</label>
                                                            <input required type='text' id='building_code' value={code} onChange={(e) => setCode(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md' />
                                                        </div>
                                                        <div className="mb-3">
                                                            <label htmlFor='building_address' className='block'>Comuna:</label>
                                                            <select id='type' value={county} onChange={(e) => setCounty(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md'>
                                                                <option value="">Elegir comuna</option> {/* Default option */}
                                                                {comunasSantiago.map((comuna, index) => (
                                                                    <option key={index} value={comuna}>{comuna}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="mb-2">
                                                            <label htmlFor='type' className='type'>Estado:</label>
                                                            
                                                            <select id='type' value={state} onChange={(e) => setState(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md'>
                                                                <option value='Activo'>Activo</option>
                                                                <option value='deleted'>Eliminado</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                <button 
                                                    type="submit" 
                                                    className="inline-flex w-full justify-center rounded-md bg-turquesa-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-turquesa-400 sm:ml-3 sm:w-auto"
                                                >
                                                    Agregar edificio
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

{editor && (
    userRole === 'admin' ? (
        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl ml-10 mr-10">
                        <form onSubmit={handleEditBuilding}>
                            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                <button
                                    onClick={() => {
                                        setEditor(false);
                                    }}
                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                                <h2 className="text-base font-semibold leading-6 text-turquesa-500 text-xl mb-3" id="modal-title">Editar edificio</h2>
                                
                                {buildingToEdit && (
                                    <>
                                        {console.log(buildingToEdit.name)}
                                        <div className="max-w-2xl mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
                                            <div className="lg:col-span-1">
                                                <div className="mt-2 mb-2">
                                                    <label htmlFor='building_name' className='block'>Nombre:</label>
                                                    <input required type='text' id='building_name' value={buildingToEdit.name} onChange={(e) => setBuildingToEdit({...buildingToEdit, name: e.target.value})} className='w-full p-2 border border-gray-300 rounded-md' />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor='building_address' className='block'>Dirección:</label>
                                                    <input required type='text' id='building_address' value={buildingToEdit.address} onChange={(e) => setBuildingToEdit({...buildingToEdit, address: e.target.value})} className='w-full p-2 border border-gray-300 rounded-md' />
                                                </div>
                                                <div className="mt-2 mb-2">
                                                    <label htmlFor='admin_phone' className='block'>Número administrador:</label>
                                                    <input required type='text' id='admin_phone' value={buildingToEdit.admin_phone_number} onChange={(e) => setBuildingToEdit({...buildingToEdit, admin_phone_number: e.target.value})} className='w-full p-2 border border-gray-300 rounded-md' />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor='admin_email' className='block'>Email administrador:</label>
                                                    <input required type='email' id='admin_email' value={buildingToEdit.admin_email} onChange={(e) => setBuildingToEdit({...buildingToEdit, admin_email: e.target.value})} className='w-full p-2 border border-gray-300 rounded-md' />
                                                </div>
                                            </div>
                                            <div className="lg:col-span-1">
                                                <div className="mt-2 mb-2">
                                                    <label htmlFor='building_code' className='block'>Código:</label>
                                                    <input required type='text' id='building_code' value={buildingToEdit.code} onChange={(e) => setBuildingToEdit({...buildingToEdit, code: e.target.value})} className='w-full p-2 border border-gray-300 rounded-md' />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor='building_county' className='block'>Comuna:</label>
                                                    <select required id='building_county' value={buildingToEdit.county} onChange={(e) => setBuildingToEdit({...buildingToEdit, county: e.target.value})} className='w-full p-2 border border-gray-300 rounded-md'>
                                                        <option value="">Elegir comuna</option> {/* Default option */}
                                                        {comunasSantiago.map((comuna, index) => (
                                                            <option key={index} value={comuna}>{comuna}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="mb-2">
                                                    <label htmlFor='building_state' className='block'>Estado:</label>
                                                    <select required id='building_state' value={buildingToEdit.state} onChange={(e) => setBuildingToEdit({...buildingToEdit, state: e.target.value})} className='w-full p-2 border border-gray-300 rounded-md'>
                                                        <option value='Activo'>Activo</option>
                                                        <option value='Eliminado'>Eliminado</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                {editClickCount === 0 ? (
                                    <button 
                                        type="submit"
                                        className='rounded-md border border-turquesa-500 text-turquesa-500 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (document.querySelector('form').checkValidity()) {
                                                editConfirmation(e);
                                            } else {
                                                alert("Por favor, completa todos los campos antes de enviar.");
                                            }
                                        }}
                                    >
                                        Editar
                                    </button>
                                ) : (
                                    <button 
                                        type="submit"
                                        className='rounded-md text-white bg-turquesa-600 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (document.querySelector('form').checkValidity()) {
                                                handleEditBuilding(e);
                                                setEditor(false);
                                            } else {
                                                alert("Por favor, completa todos los campos antes de enviar.");
                                            }
                                        }}
                                    >
                                        Confirmar edición
                                    </button>
                                )}
                                {deleteClickCount === 0 ? (
                                    <button 
                                        type="submit"
                                        className='rounded-md border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (document.querySelector('form').checkValidity()) {
                                                deleteConfirmation(e);
                                            } else {
                                                alert("Por favor, completa todos los campos antes de enviar.");
                                            }
                                        }}
                                    >
                                        Eliminar
                                    </button>
                                ) : (
                                    <button 
                                        type="submit"
                                        className='rounded-md text-white bg-red-600 hover:bg-red-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (document.querySelector('form').checkValidity()) {
                                                handleDeleteBuilding(e);
                                                setDeleter(false);
                                            } else {
                                                alert("Por favor, completa todos los campos antes de enviar.");
                                            }
                                        }}
                                    >
                                        Confirmar eliminación
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        (() => {
            alert("Esta opción no está disponible");
            setEditor(false);
            setBuildingToEdit(null);
        })()
    )
)}




            </div>
        </div>
    );
}

export default Edificios;
