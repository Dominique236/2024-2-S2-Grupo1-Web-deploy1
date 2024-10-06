import React, { useState, useEffect, useContext } from 'react';
import Tabla from './Tabla';
import { PulseLoader } from 'react-spinners';
import NavBar from './NavBar';
import { WAREHOUSE_ENDPOINT, SPARE_ENDPOINT, INVENTORY_ENDPOINT } from '../utils/apiRoutes';
import { UserContext } from '../contexts/UserContext';
/* import { type } from '@testing-library/user-event/dist/type';
import InventarioAdvancedFiltersPopup from './InventarioAdvancedFiltersPopup'; */
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
/* import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete'; */
import axios from 'axios';
import Repuestos from './Repuestos';
import { TabView, TabPanel } from 'primereact/tabview';
import Clientes from './Clientes';
import Herramientas from './Herramientas';



const Inventario = () => {
    const { userRole } = useContext(UserContext);
    const [warehouseFilas, setWarehouseFilas] = useState([]);
    const [warehouseFilter, setWarehouseFilter] = useState('');
    const [isLoadingWarehouse, setIsLoadingWarehouse] = useState(true);


    const [warehouseEditor, setWarehouseEditor] = useState(false);
    const [warehouseToEdit, setWarehouseToEdit] = useState();
    const [warehouseEditClickCount, setWarehouseEditClickCount] = useState(0);
    const [warehouseAdder, setWarehouseAdder] = useState(false);
    const [warehouseAddClickCount, setWarehouseAddClickCount] = useState(0);
    const [warehouseDeleteClickCount, setWarehouseDeleteClickCount] = useState(0);

    const [warehouseId, setWarehouseId] = useState();
    const [warehouseName, setWarehouseName] = useState('');
    const [warehouseAddress, setWarehouseAddress] = useState('');
    const [warehouseState, setWarehouseState] = useState('');

    useEffect(() => {
        fetchWarehouseData();
        
    }, []);

    const fetchWarehouseData = async () => {
        try {
            const response = await fetch(WAREHOUSE_ENDPOINT);
            if (!response.ok) {
                throw new Error('Failed to fetch warehouses data');
            }
            const data = await response.json();
            // console.log('Fetched warehouses data:', data); // Log the fetched data
            setWarehouseFilas(data);
            //setFilas(prevFilas => [...prevFilas, ...data]); // Merge fetched data with existing data
        } catch (error) {
            console.error('Error fetching warehouse data:', error);
        } finally {
            setIsLoadingWarehouse(false); // Set loading state to false after data fetching (even if there's an error)
        }
    };

    const handleAddWarehouse = async (e) => {
        e.preventDefault();
        if(warehouseName === "" || warehouseAddress === ""){
            alert('Faltan datos para agregar bodega.');
            setWarehouseAddClickCount(0);
            return;
        }
        try {
            const response = await fetch(WAREHOUSE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: warehouseName,
                    address: warehouseAddress,
                    state: warehouseState,
                    warehouse_id: warehouseId
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add warehouse');
            }
            setWarehouseAdder(false);
            setWarehouseAddClickCount(0);
            setWarehouseName('');
            setWarehouseAddress('');
            setWarehouseState('');
            setWarehouseId('');
            fetchWarehouseData();
        } catch (error) {
            console.error('Error adding warehouse:', error);
            setWarehouseAddClickCount(0);
            alert('Error al añadir bodega. Intente nuevamente.');
        }
    };

    const warehouseAddConfirmation = (e) => {
        if (warehouseAddClickCount === 0) {
            if (e) {
                e.preventDefault();
            }
            setWarehouseAddClickCount(1); 
        } else if (warehouseAddClickCount === 1) {
            if (e) {
                e.preventDefault();
            }
            handleAddWarehouse(e);
        }
    };

    const handleEditWarehouse = async (e) => {
        e.preventDefault();
        if (!warehouseToEdit || warehouseToEdit.id === "") {
            alert('Faltan datos para editar bodega.');
            setWarehouseEditClickCount(0);
            return;
        }
        try {
            const response = await fetch(WAREHOUSE_ENDPOINT + '/' + warehouseToEdit.id, {
                method: 'PUT', // or 'PATCH' depending on your API endpoint
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: warehouseToEdit.name,
                    address: warehouseToEdit.address,
                    state: warehouseToEdit.state
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update warehouse');
            }
            setWarehouseEditor(false);
            setWarehouseToEdit(null);
            setWarehouseEditClickCount(0);
            fetchWarehouseData();
        } catch (error) {
            console.error('Error updating warehouse:', error);
            setWarehouseEditClickCount(0);
            alert('Error al editar bodega. Intente nuevamente.');
        }
    };

    const warehouseEditConfirmation = (e) => {
        if (warehouseEditClickCount === 0) {
            if (e) {
                e.preventDefault();
            }
            setWarehouseEditClickCount(1); 
        } else if (warehouseEditClickCount === 1) {
            if (e) {
                e.preventDefault();
            }
            handleEditWarehouse(e);
        }
    };

    const handleDeleteWarehouse = async (e) => {
        if (e) {
            e.preventDefault();
        }
        if(!warehouseToEdit || !warehouseToEdit.id === "" ){
            alert('Falta el código para eliminar bodega');
            setWarehouseDeleteClickCount(0);
            return;
        }
        try {
            const response = await fetch(WAREHOUSE_ENDPOINT + '/' + warehouseToEdit.id, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete warehouse');
            }
            setWarehouseDeleteClickCount(0);
            setWarehouseEditor(false);
            fetchWarehouseData();
        } catch (error) {
            console.error('Error deleting warehouse:', error);
            alert('Error eliminando bodega. Intente nuevamente.');
        }
    };

    const warehouseDeleteConfirmation = (e) => {
        if (warehouseDeleteClickCount === 0) {
            //alert('Are you sure you want to submit?');
            if (e) {
                e.preventDefault();
            }
            setWarehouseDeleteClickCount(1); 
        } else if (warehouseDeleteClickCount === 1) {
            //alert('Submitted!');
            handleDeleteWarehouse();
        }
    };

    const filteredWarehouseRows = warehouseFilas.filter((fila) =>
        Object.values(fila).some((value) =>
            value && typeof value !== 'object' && // Verifica si el valor no es nulo ni un objeto
            value.toString().toLowerCase().includes(warehouseFilter.toLowerCase())
        )
    );

    const handleWarehouseFilterChange = (e) => {
        setWarehouseFilter(e.target.value);
    };


    return (
        <div>
            <NavBar />
            <div className='container mx-auto px-4 mb-10'>
                <div className='mt-24 contents lg:fixed lg:inset-0 lg:flex'>
                    {/* BODEGAS */}
                    <div className='lg:w-72 lg:border-r lg:px-6 xl:w-80'>
                        <h3 className='text-xl mt-10 first-line:font-bold text-gray-800'>Bodegas</h3>  
                        <div className='flex justify-between align-end mt-2'>
                            <div>
                                <IconField iconPosition="left">
                                    <InputIcon className="pi pi-search" />
                                    <InputText 
                                        type="search"
                                        value={warehouseFilter}
                                        onChange={handleWarehouseFilterChange}
                                        placeholder="Buscar..." 
                                        className="p-inputtext-sm"
                                    />
                                </IconField>
                            </div>
                            <div>
                                {userRole === 'admin' && (
                                    <>
                                        <button
                                            onClick={() => setWarehouseAdder(true)}
                                            className="bg-white rounded px-2 py-2 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto mb-2"
                                        >
                                            Agregar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        

                        
                        
                        {isLoadingWarehouse ? ( // Conditionally render loading message while loading is true
                            <div className="flex justify-center items-center mt-4 h-24">
                                <PulseLoader color="#319795" />
                            </div>
                        ) : (
                            filteredWarehouseRows.map(warehouse => (
                                <div className="mt-2 border-t border-black">
                                    <dl className="divide-y divide-black">
                                        <div key={warehouse.id} className="px-4 sm:px-0">
                                            <div className='flex justify-between items-center mt-2'>
                                                <h3 className="text-base font-semibold leading-7 text-gray-900">{warehouse.name}</h3>
                                                <div className='flex'>
                                                    {userRole === 'admin' && (
                                                        <button
                                                            onClick={() => {
                                                                setWarehouseToEdit(warehouse); // Set the warehouse to edit
                                                                setWarehouseEditor(true); // Open the editor modal
                                                            }}
                                                            className="bg-white rounded px-2 py-2 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                                        >
                                                            Editar
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">{warehouse.address}</p>
                                            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Estado: {warehouse.state}</p>
                                        </div>
                                    </dl>
                                </div>
                            )))}
                    </div>

                    {/* INVENTARIO */}
                    <div className='relative flex flex-grow h-auto flex-col px-4 sm:px-6 lg:px-8  mb-10'>
                        <h1 className='text-3xl mt-10 first-line:font-bold text-gray-800'>Inventario</h1>
                    
                        <TabView className='mt-4'>
                            <TabPanel header="Repuestos" leftIcon="pi pi-cog mr-2">
                                <Repuestos />
                            </TabPanel>
                            <TabPanel header="Herramientas" leftIcon="pi pi-wrench mr-2">
                                <Herramientas /> {/* REEMPLAZARRRRRRRR */}
                            </TabPanel>
                        </TabView>
                        
                    </div>
                </div>
            </div>
            {warehouseAdder && (
                <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl ml-10 mr-10">
                                    <form onSubmit={handleAddWarehouse}>
                                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                            <button
                                                onClick={() => {
                                                    setWarehouseAdder(false);
                                                }}
                                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <h3 className="text-base font-bold leading-6 text-teal-600 text-xl" id="modal-title">Agregar bodega</h3>
                                            
                                            <div className="mt-2 mb-2">
                                                <label htmlFor='warehouse_name' className='block'>Nombre:</label>
                                                <input required type='text' id='warehouse_name' value={warehouseName} onChange={(e) => setWarehouseName(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md' />
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor='warehouse_address' className='block'>Dirección:</label>
                                                <input required type='text' id='warehouse_address' value={warehouseAddress} onChange={(e) => setWarehouseAddress(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md' />
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                            
                                            {warehouseAddClickCount === 0 ? (
                                                <button 
                                                    className='rounded-md border border-turquesa-500 text-turquesa-500 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                    onClick={(e) => {
                                                        warehouseAddConfirmation(e);
                                                    }}
                                                >
                                                    Agregar nueva bodega
                                                </button>
                                            ) : (
                                                <button 
                                                    className='rounded-md text-white bg-turquesa-600 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                    onClick={(e) => {
                                                        warehouseAddConfirmation(e);
                                                        setWarehouseAdder(false);
                                                    }}
                                                >
                                                    Confirmar nueva bodega
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            {warehouseEditor && warehouseToEdit && (
                <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl ml-10 mr-10">
                                    <form onSubmit={handleEditWarehouse}>
                                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                            
                                            <button
                                                onClick={() => {
                                                    setWarehouseEditor(false);
                                                    setWarehouseToEdit(null);
                                                }}
                                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <h2 className="text-base font-bold leading-6 text-xl text-teal-600 mb-2" id="modal-title">Editar bodega</h2>
                                            <div className="mt-2 mb-2">
                                                <label htmlFor='warehouse_name' className='block'>Nombre:</label>
                                                <input required type='text' id='warehouse_name' value={warehouseToEdit.name} onChange={(e) => setWarehouseToEdit({ ...warehouseToEdit, name: e.target.value })} className='w-full p-2 border border-gray-300 rounded-md' />
                                            </div>
                                            <div className="mb-3">
                                                <label htmlFor='warehouse_address' className='block'>Dirección:</label>
                                                <input required type='text' id='warehouse_address' value={warehouseToEdit.address} onChange={(e) => setWarehouseToEdit({ ...warehouseToEdit, address: e.target.value })} className='w-full p-2 border border-gray-300 rounded-md' />
                                            </div>
                                            <div className="mb-2">
                                                <label htmlFor='type' className='type'>Estado:</label>
                                                <select id='type' value={warehouseToEdit.state} onChange={(e) => setWarehouseToEdit({ ...warehouseToEdit, state: e.target.value })} className='w-full p-2 border border-gray-300 rounded-md'>
                                                    <option value='Activo'>Activo</option>
                                                    <option value='Eliminado'>Eliminado</option>
                                                </select>
                                            </div>
                                            
                                        </div>
                                        
                                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                            {warehouseEditClickCount === 0 ? (
                                                <button 
                                                    className='rounded-md border border-turquesa-500 text-turquesa-500 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                    onClick={(e) => {
                                                        warehouseEditConfirmation(e);
                                                    }}
                                                >
                                                    Editar
                                                </button>
                                            ) : (
                                                <button 
                                                    className='rounded-md text-white bg-turquesa-600 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                    onClick={(e) => {
                                                        warehouseEditConfirmation(e);
                                                        setWarehouseEditor(false);
                                                    }}
                                                >
                                                    Confirmar edición
                                                </button>
                                            )}
                                            {warehouseDeleteClickCount === 0 ? (
                                                <button 
                                                    className='rounded-md border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                    onClick={(e) => {
                                                        warehouseDeleteConfirmation(e);
                                                    }}
                                                >
                                                    Eliminar
                                                </button>
                                            ) : (
                                                <button 
                                                    className='rounded-md text-white bg-red-600 hover:bg-red-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                    onClick={(e) => {
                                                        warehouseDeleteConfirmation(e);
                                                        setWarehouseEditor(false);
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
                )}

            
    </div>
)}

export default Inventario;