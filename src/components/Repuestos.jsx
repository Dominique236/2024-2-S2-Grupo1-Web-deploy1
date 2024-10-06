import React, { useState, useEffect, useContext } from 'react';
import Tabla from './Tabla';
import { PulseLoader } from 'react-spinners';
import NavBar from './NavBar';
import { WAREHOUSE_ENDPOINT, SPARE_ENDPOINT, INVENTORY_ENDPOINT } from '../utils/apiRoutes';
import { UserContext } from '../contexts/UserContext';
import { type } from '@testing-library/user-event/dist/type';
import InventarioAdvancedFiltersPopup from './InventarioAdvancedFiltersPopup';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import axios from 'axios';



const Repuestos = () => {
    const { userRole } = useContext(UserContext);
    const [inventoryFilas, setInventoryFilas] = useState([]);
    const [filter, setFilter] = useState('');
    const [isLoadingSpare, setIsLoadingSpare] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filterConditions, setFilterConditions] = useState([]);
    const [filterInventoryWarehouse, setFilterInventoryWarehouse] = useState('');
    const [inventoryFilter, setInventoryFilter] = useState([]);
    const [filteredSpareRows, setFilteredSpareRows] = useState([]);
    const [spareFilas, setSpareFilas] = useState([]);

    const [spareAdder, setSpareAdder] = useState(false);
    const [spareAddClickCount, setSpareAddClickCount] = useState(0);
    const [spareEditor, setSpareEditor] = useState(false);
    const [spareToEdit, setSpareToEdit] = useState(null)
    const [spareEditClickCount, setSpareEditClickCount] = useState(0);
    const [inventoryCreator, setInventoryCreator] = useState(false);
    const [createInventoryClickCount, setCreateInventoryClickCount] = useState(0);
    const [spareDeleteClickCount, setSpareDeleteClickCount] = useState(0);
    const [spareUpdateClickCount, setSpareUpdateClickCount] = useState(0);

    const [spareId, setSpareId] = useState();
    const [spareName, setSpareName] = useState('');
    const [spareType, setSpareType] = useState('');
    const [spareQuantity, setSpareQuantity] = useState();

    const [warehouseId, setWarehouseId] = useState();

    const [estadoNuevo, setEstadoNuevo] = useState(false);
    const [estadoReacondicionado, setEstadoReacondicionado] = useState(false);
    const [estadoReparacion, setEstadoReparacion] = useState(false);

    const [spareOptions, setSpareOptions] = useState([]);
    const [warehouseOptions, setWarehouseOptions] = useState([]);

    const columnsSpares = [
        { nombre: "Repuesto", llave: "name" },
        { nombre: "Tipo", llave: "type" },
        { nombre: "Bodega", llave: "warehouseName" },
        { nombre: "Cantidad Disponible", llave: "quantity" },
        { nombre: "", llave: "editButton" }
    ];

    const [tempFilterInventoryWarehouse, setTempFilterInventoryWarehouse] = useState('');
    const [borrarFiltrosClicked, setBorrarFiltrosClicked] = useState(false);


    useEffect(() => {
        if (!borrarFiltrosClicked) {
            handleApplyFilters();
        } else {
            setBorrarFiltrosClicked(false);
        }
    }, [filterInventoryWarehouse, inventoryFilas, borrarFiltrosClicked]);

    useEffect(() => {
        fetchInventoryData();
    }, []);

    useEffect(() => {
        const fetchSpareOptions = async () => {
            try {
                const response = await axios.get(SPARE_ENDPOINT);
                const spareSelectOptions = response.data.map(item => ({
                    value: item.id,
                    label: `${item.name}: ${item.type}`,
                }));
                setSpareOptions(spareSelectOptions);
            } catch (error) {
                console.error('Error fetching spare options:', error);
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
                console.error('Error fetching warehouse options:', error);
            }
        };

        fetchSpareOptions();
        fetchWarehouseOptions();
    }, []);

    const fetchSpareOptions = async () => {
            try {
                const response = await axios.get(SPARE_ENDPOINT);
                const spareSelectOptions = response.data.map(item => ({
                    value: item.id,
                    label: `${item.name}: ${item.type}`,
                }));
                setSpareOptions(spareSelectOptions);
            } catch (error) {
                console.error('Error fetching spare options:', error);
            }
        };

    
    const fetchInventoryData = async () => {
        setIsLoadingSpare(true);
        try {
            const [spareResponse, inventoryResponse] = await Promise.all([
                fetch(SPARE_ENDPOINT),
                fetch(INVENTORY_ENDPOINT)
            ]);

            if (!spareResponse.ok || !inventoryResponse.ok) {
                throw new Error('Failed to fetch spares and inventory data');
            }

            const [spareData, inventoryData] = await Promise.all([
                spareResponse.json(),
                inventoryResponse.json()
            ]);

            // console.log('Fetched spare data:', spareData);
            // console.log('Fetched inventory data:', inventoryData);

            const combinedData = inventoryData.map(inventoryItem => {
                // console.log('Inventory Item ID:', inventoryItem.spare_id);
                const spareItem = spareData.find(spare => spare.id === inventoryItem.spare_id);

                return {
                    id: inventoryItem.id,
                    name: inventoryItem ? inventoryItem.Spare.name : 'Unknown Spare',
                    type: inventoryItem ? inventoryItem.Spare.type : 'Unknown Type',
                    warehouseName: inventoryItem.Warehouse.state == "Activo" ? inventoryItem.Warehouse.name : 'Bodega Eliminada',
                    quantity: inventoryItem.quantity,
                    editButton: 
                    <button className="bg-white rounded px-2 py-2 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => { setSpareToEdit({
                            id: inventoryItem.id,
                            name: inventoryItem ? inventoryItem.Spare.name : 'Unknown Spare',
                            name2: inventoryItem ? inventoryItem.Spare.name : 'Unknown Spare',
                            type: inventoryItem ? inventoryItem.Spare.type : 'Unknown Type',
                            warehouseName: inventoryItem.Warehouse ? inventoryItem.Warehouse.name : 'Unknown Warehouse',
                            quantity: inventoryItem.quantity,
                            warehouseId: inventoryItem.warehouse_id,
                            spare_id: inventoryItem.spare_id
                        }); setSpareEditor(true); }}>
                        Editar
                    </button>
                };
            });

            setInventoryFilas(combinedData);
            setSpareFilas(spareData);
        
        } catch (error) {
            console.error('Error fetching machine data:', error);
        }
        setIsLoadingSpare(false);
    };

    const handleCreateInventory = async (e) => {
        e.preventDefault();
        if(spareId === "" || spareQuantity === "" || warehouseId === ""){
            alert('Faltan datos para agregar repuesto.');
            setCreateInventoryClickCount(0);
            return;
        }
        try {
            const inventoryCreateResponse = await fetch(INVENTORY_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    spare_id: spareId,
                    quantity: spareQuantity,
                    warehouse_id: warehouseId,
                }),
            });

            if (!inventoryCreateResponse.ok) {
                throw new Error('Failed to add inventory');
            }
            
            setInventoryCreator(false);
            setCreateInventoryClickCount(0);
            setSpareName('');
            setSpareType('');
            setWarehouseId('');
            setSpareQuantity(0);
            setSpareId(0);
            fetchInventoryData();
        } catch (error) {
            console.error('Error adding spare:', error);
            setCreateInventoryClickCount(0);
            alert('Error al añadir repuesto. Intente nuevamente.');
        }
    };

    const createInventoryConfirmation = (e) => {
        if (createInventoryClickCount === 0) {
            if (e) {
                e.preventDefault();
            }
            setCreateInventoryClickCount(1); 
        } else if (createInventoryClickCount === 1) {
            if (e) {
                e.preventDefault();
            }
            handleCreateInventory(e);
        }
    };

    const handleAddSpare = async (e) => {
        e.preventDefault();
        if(spareName === "" || spareType === ""){
            alert('Faltan datos para agregar repuesto.');
            setCreateInventoryClickCount(0);
            return;
        }
        try {
            const response = await fetch(SPARE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: spareName,
                    type: spareType
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add spare');
            }
            setSpareAdder(false);
            setSpareAddClickCount(0);
            setSpareName('');
            setSpareType('');
            fetchInventoryData();
            ///////////////////////////////////////////////////////////////////////
            fetchSpareOptions()
        } catch (error) {
            console.error('Error adding spare:', error);
            setSpareAddClickCount(0);
            alert('Error al añadir repuesto. Intente nuevamente.');
        }
    };

    const spareAddConfirmation = (e) => {
        if (spareAddClickCount === 0) {
            if (e) {
                e.preventDefault();
            }
            setSpareAddClickCount(1); 
        } else if (spareAddClickCount === 1) {
            if (e) {
                e.preventDefault();
            }
            handleAddSpare(e);
        }
    };

    const handleEditSpare = async (e) => {
        e.preventDefault();
        if(!spareToEdit || !spareToEdit.id){
            alert('Faltan datos para editar repuesto.');
            setSpareEditClickCount(0);
            return;
        }
        // console.log("spare id", spareToEdit)
        try {
            const response = await fetch(SPARE_ENDPOINT + '/' + spareToEdit.spare_id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: spareToEdit.type,
                    name: spareToEdit.name
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to edit spare');
            }
            setSpareEditor(false);
            setSpareToEdit(null);
            setSpareEditClickCount(0);
            fetchInventoryData();
        } catch (error) {
            console.error('Error editing spare:', error);
            setSpareEditClickCount(0);
            alert('Error al editar repuesto. Intente nuevamente.');
        }
    };

    const handleUpdateInventory = async (e) => {
        e.preventDefault();
        if(!spareToEdit || !spareToEdit.id){
            alert('Faltan datos para actualizar inventario.');
            return;
        }
        try {
            const response = await fetch(INVENTORY_ENDPOINT + '/' + spareToEdit.id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quantity: spareToEdit.quantity
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update inventory');
            }
            setSpareEditor(false);
            setSpareToEdit(null);
            setSpareUpdateClickCount(0);
            fetchInventoryData();
        } catch (error) {
            console.error('Error updating inventory:', error);
            setSpareUpdateClickCount(0);
            alert('Error al actualizar inventario. Intente nuevamente.');
        }
    };

    const spareEditConfirmation = (e) => {
        if (spareEditClickCount === 0) {
            if (e) {
                e.preventDefault();
            }
            setSpareEditClickCount(1); 
        } else if (spareEditClickCount === 1) {
            if (e) {
                e.preventDefault();
                // console.log('spareToEdit:', spareToEdit)
            }
            handleEditSpare(e);
        }
    };

    const spareUpdateConfirmation = (e) => {
        if (spareUpdateClickCount === 0) {
            if (e) {
                e.preventDefault();
            }
            setSpareUpdateClickCount(1); 
        } else if (spareUpdateClickCount === 1) {
            if (e) {
                e.preventDefault();
            }
            handleUpdateInventory(e);
        }
    };

    const handleDeleteSpare = async (e) => {
        e.preventDefault();
        //if(spareId === ""){
        if (!spareToEdit || !spareToEdit.id) {
            alert('Falta el código para eliminar repuesto');
            setSpareDeleteClickCount(0);
            return;
        }
        try {
            const response = await fetch(INVENTORY_ENDPOINT + '/' + spareToEdit.id, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete spare');
            }
            setSpareEditor(false);
            setSpareDeleteClickCount(0);
            fetchInventoryData();
            setSpareToEdit(null);
        } catch (error) {
            console.error('Error deleting spare:', error);
            setSpareDeleteClickCount(0);
            alert('Error eliminando repuesto. Intente nuevamente.');
        }
    };

    const spareDeleteConfirmation = () => {
        if (spareDeleteClickCount === 0) {
          //alert('Are you sure you want to submit?');
          setSpareDeleteClickCount(1); 
        } else if (spareDeleteClickCount === 1) {
          //alert('Submitted!');
          setSpareDeleteClickCount(0);
        }
    };

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    

    const handleOpenFilters = () => {
        setShowFilters(true);
    };

    const handleCloseFilters = () => {
        setShowFilters(false);
    };

    const handleApplyFilters = () => {
        let newFilteredRows = inventoryFilas;
        if (estadoNuevo || estadoReacondicionado || estadoReparacion) {
            newFilteredRows = newFilteredRows.filter((fila) => 
                (estadoNuevo && fila.type === 'Nuevo') ||
                (estadoReacondicionado && fila.type === 'Reacondicionado') ||
                (estadoReparacion && fila.type === 'En reparación')

            );
        }

        if (filterInventoryWarehouse) {
            newFilteredRows = newFilteredRows.filter(fila => fila.warehouseName === filterInventoryWarehouse)
        }
        setFilterConditions([estadoNuevo, estadoReacondicionado, estadoReparacion]);
        setFilteredSpareRows(newFilteredRows);
        setShowFilters(false);
    };

    const handleUndoFilters = () => {
        let newFilteredRows = inventoryFilas;

        if (filterConditions[0] || filterConditions[1] || filterConditions[2]) {
            newFilteredRows = newFilteredRows.filter((fila) =>
                (!filterConditions[0] || fila.type === 'Nuevo') &&
                (!filterConditions[1] || fila.type === 'Reacondicionado') &&
                (!filterConditions[2] || fila.type === 'En reparación')
            );
        }

        if (filterConditions[3]) {
            newFilteredRows = newFilteredRows.filter((fila) =>
                fila.warehouseName === filterConditions[0]
            );
        }
        setFilterConditions([]);
        setInventoryFilter(newFilteredRows);
    };

    const handleBorrarFiltros = () => {
        setEstadoNuevo(false);
        setEstadoReacondicionado(false);
        setEstadoReparacion(false);
        setFilterInventoryWarehouse('');

        setFilteredSpareRows(inventoryFilas);
    };
    

    return (
        <div>
        
            <div className='relative flex flex-grow h-auto flex-col lg:px-8 mb-10 mt-4'>
                <div className='flex justify-between items-end'>
                    <div>
                        <h1 className='text-3xl first-line:font-bold text-gray-800'>Repuestos</h1>
                    </div>
                    <div>
                        {userRole === 'admin' && (
                            <>
                                <div className='flex justify-between items-end'>
                                    <button
                                        onClick={() => setSpareAdder(true)}
                                        className="bg-white rounded mr-3 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                    >
                                        Agregar repuesto
                                    </button>
                                    <button
                                        onClick={() => setInventoryCreator(true)}
                                        className="bg-white rounded px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                    >
                                        Crear inventario
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                    
                <Tabla 
                    columnas={columnsSpares} filas={filteredSpareRows} isLoading={isLoadingSpare}
                    buttonAdvancedFilterText="Filtros avanzados" buttonAdvancedFilter={handleOpenFilters} 
                    buttonClearFilterText="Limpiar filtros" buttonClearFilter={handleBorrarFiltros}
                />
                

                <InventarioAdvancedFiltersPopup 
                    show={showFilters}
                    onClose={handleCloseFilters}
                    onApply={handleApplyFilters}
                    onUndo={handleUndoFilters}
                    estadoNuevo={estadoNuevo}
                    estadoReacondicionado={estadoReacondicionado}
                    estadoReparacion={estadoReparacion}
                    filterInventoryWarehouse={filterInventoryWarehouse}

                    handleEstadoNuevoChange={(e) => setEstadoNuevo(e.target.checked)}
                    handleEstadoReacondicionadoChange={(e) => setEstadoReacondicionado(e.target.checked)}
                    handleEstadoReparacionChange={(e) => setEstadoReparacion(e.target.checked)}
                    handleFilterInventoryWarehouseChange={(warehouse) => setFilterInventoryWarehouse(warehouse)}
                />
            </div>

            {inventoryCreator && (
                <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl ml-10 mr-10">
                                <form onSubmit={handleCreateInventory}>
                                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    
                                        <button
                                            onClick={() => {
                                                setInventoryCreator(false);
                                            }}
                                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        <h3 className="text-base font-bold leading-6 text-xl text-teal-600 mb-2" id="modal-title">Crear inventario</h3>
                                    
                                        <div className="mt-2 mb-2">
                                            <label htmlFor='spare_type' className='block'>Tipo de repuesto:</label>
                                            <Autocomplete
                                                id="spare_type"
                                                options={spareOptions}
                                                getOptionLabel={(option) => option.label}
                                                renderInput={(params) => <TextField {...params} label="Elegir repuesto" variant="outlined" />}
                                                value={spareOptions.find(option => option.value === spareId) || null}
                                                onChange={(event, newValue) => setSpareId(newValue ? newValue.value : '')}
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label htmlFor='warehouse_id' className='block'>Bodega:</label>
                                            <Autocomplete
                                                id="warehouse_id"
                                                options={warehouseOptions}
                                                getOptionLabel={(option) => option.label}
                                                renderInput={(params) => <TextField {...params} label="Elegir bodega" variant="outlined" />}
                                                value={warehouseOptions.find(option => option.value === warehouseId) || null}
                                                onChange={(event, newValue) => setWarehouseId(newValue ? newValue.value : '')}
                                            />
                                        </div> 

                                        <div className="mb-3">
                                            <label htmlFor='spare_quantity' className='block'>Cantidad:</label>
                                            <input 
                                                required 
                                                type='number' 
                                                id='spare_quantity' 
                                                value={spareQuantity} 
                                                onChange={(e) => setSpareQuantity(e.target.value)} 
                                                min="0" 
                                                onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') { e.preventDefault(); } }} 
                                                className='w-full p-2 border border-gray-300 rounded-md' 
                                            />
                                        </div>
                                    
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        {createInventoryClickCount === 0 ? (
                                            <button 
                                                className='rounded-md border border-turquesa-500 text-turquesa-500 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    if (spareId && warehouseId && spareQuantity) {
                                                        createInventoryConfirmation(e);
                                                    } else {
                                                        alert("Por favor, complete todos los campos.");
                                                    }
                                                }}
                                            >
                                                Crear Inventario
                                            </button>
                                        ) : (
                                            <button 
                                                className='rounded-md text-white bg-turquesa-600 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                onClick={(e) => {
                                                    if (spareId && warehouseId && spareQuantity) {
                                                        handleCreateInventory(e);
                                                        setInventoryCreator(false);
                                                    } else {
                                                        e.preventDefault();
                                                        alert("Por favor, complete todos los campos.");
                                                    }
                                                }}
                                                disabled={!spareId || !warehouseId || !spareQuantity}
                                            >
                                                Confirmar adición
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {spareAdder && (
                <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl ml-10 mr-10">
                                    <form onSubmit={handleAddSpare}>
                                        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                        
                                            <button
                                                onClick={() => {
                                                    setSpareAdder(false);
                                                }}
                                                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                            <h3 className="text-base font-bold leading-6 text-xl text-teal-600 mb-2" id="modal-title">Agregar repuesto</h3>
                                        
                                            <div className="mt-2 mb-2">
                                                <label htmlFor='spare_name' className='block'>Nombre:</label>
                                                <input required type='text' id='spare_name' value={spareName} onChange={(e) => setSpareName(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md' />
                                            </div>

                                            <div className="mb-3">
                                                <label htmlFor='spare_type' className='block'>Tipo de repuesto:</label>
                                                <select required id='spare_type' value={spareType} onChange={(e) => setSpareType(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md'>
                                                    <option value="">Seleccionar tipo</option>
                                                    <option value="Nuevo">Nuevo</option>
                                                    <option value="Reacondicionado">Reacondicionado</option>
                                                    <option value="En reparación">En reparación</option>
                                                </select>
                                            </div>
                                        
                                        </div>
                                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                            {spareAddClickCount === 0 ? (
                                                <button 
                                                    className='rounded-md border border-turquesa-500 text-turquesa-500 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                    onClick={(e) => {
                                                        spareAddConfirmation(e);
                                                    }}
                                                >
                                                    Agregar repuesto
                                                </button>
                                            ) : (
                                                <button 
                                                    className='rounded-md text-white bg-turquesa-600 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                    onClick={(e) => {
                                                        handleAddSpare(e);
                                                        setSpareAdder(false);
                                                    }}
                                                >
                                                    Confirmar adición
                                                </button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            {spareEditor && spareToEdit && (
                userRole === 'admin' ? (
                    <>
                        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl ml-10 mr-10">
                                        {spareToEdit && (
                                            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                                <button
                                                    onClick={() => {
                                                        setSpareEditor(false);
                                                        setSpareToEdit(null);
                                                    }}
                                                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                                <div className="mt-2 mb-2">
                                                    <label htmlFor='spare_name' className='block'><strong>Nombre:</strong> {spareToEdit.name2}</label>
                                                </div>

                                                <div style={{ display: 'flex' }} className="mb-4 mt-5 ">
                                                    <div style={{ flex: 1 }}>
                                                        <form onSubmit={handleEditSpare}>
                                                            <h2 className="text-base font-bold leading-6 text-md text-teal-600 mb-2" id="modal-title">Editar información de repuesto</h2>
                                                            
                                                            <div className="mb-3">
                                                                <label htmlFor='spare_name' className='block'>Nombre del repuesto:</label>
                                                                <input
                                                                    required
                                                                    type='text'
                                                                    id='spare_name'
                                                                    value={spareToEdit.name}
                                                                    onChange={(e) => setSpareToEdit({ ...spareToEdit, name: e.target.value })}
                                                                    className='w-full p-2 border border-gray-300 rounded-md'
                                                                />
                                                            </div>

                                                            <div className="mb-3">
                                                                <label htmlFor='spare_type' className='block'>Tipo de repuesto:</label>
                                                                <select required id='spare_type' value={spareToEdit.type} onChange={(e) => setSpareToEdit({ ...spareToEdit, type: e.target.value })} className='w-full p-2 border border-gray-300 rounded-md'>
                                                                    <option value="">Seleccionar tipo</option>
                                                                    <option value="Nuevo">Nuevo</option>
                                                                    <option value="Reacondicionado">Reacondicionado</option>
                                                                    <option value="En reparación">En reparación</option>
                                                                </select>
                                                            </div>

                                                            <div className="py-3 sm:flex sm:flex-row-reverse">
                                                                {spareEditClickCount === 0 ? (
                                                                    <button 
                                                                        className='rounded-md border border-turquesa-500 text-turquesa-500 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                                        onClick={(e) => {
                                                                            if (spareToEdit.name && spareToEdit.type) {
                                                                                spareEditConfirmation(e);
                                                                            } else {
                                                                                e.preventDefault();
                                                                                alert("Por favor, complete todos los campos.");
                                                                            }
                                                                        }}
                                                                    >
                                                                        Editar repuesto
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        className='rounded-md text-white bg-turquesa-600 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                                        onClick={(e) => {
                                                                            if (spareToEdit.name && spareToEdit.type) {
                                                                                spareEditConfirmation(e);
                                                                                setSpareEditor(false);
                                                                            } else {
                                                                                e.preventDefault();
                                                                                alert("Por favor, complete todos los campos.");
                                                                            }
                                                                        }}
                                                                    >
                                                                        Confirmar edición
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </form>
                                                    </div>
                                                    
                                                    <div style={{ flex: 1 }} className='ml-5'>
                                                        <form onSubmit={handleUpdateInventory}>
                                                            <h2 className="text-base font-bold leading-6 text-md text-teal-600 mb-2" id="modal-title">Actualizar cantidad en inventario</h2>
                                                            <div className="mb-3">
                                                                <label htmlFor='spare_quantity' className='block'>Cantidad:</label>
                                                                <input required type='number' id='spare_quantity' value={spareToEdit.quantity} onChange={(e) => {
                                                                        const newQuantity = Math.max(0, parseInt(e.target.value, 10));
                                                                        setSpareToEdit({ ...spareToEdit, quantity: newQuantity });
                                                                    }} className='w-full p-2 border border-gray-300 rounded-md' />
                                                            </div>
                                                            <div className="py-3 sm:flex sm:flex-row-reverse">
                                                                {spareUpdateClickCount === 0 ? (
                                                                    <button 
                                                                        className='rounded-md border border-turquesa-500 text-turquesa-500 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                                        onClick={(e) => {
                                                                            if (spareToEdit.name && spareToEdit.type) {
                                                                                spareUpdateConfirmation(e);
                                                                            } else {
                                                                                e.preventDefault();
                                                                                alert("Por favor, complete todos los campos.");
                                                                            }
                                                                        }}                 
                                                                    >
                                                                        Actualizar cantidad
                                                                    </button>
                                                                ) : (
                                                                    <button 
                                                                        className='rounded-md text-white bg-turquesa-600 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                                        onClick={(e) => {
                                                                            if (spareToEdit.name && spareToEdit.type) {
                                                                                handleUpdateInventory(e);
                                                                                setSpareEditor(false);
                                                                            } else {
                                                                                e.preventDefault();
                                                                                alert("Por favor, complete todos los campos.");
                                                                            }
                                                                        }}
                                                                    >
                                                                        Confirmar edición
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                
                                            </div>
                                        )}
                                                
                                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                            
                                            {spareDeleteClickCount === 0 ? (
                                                <button 
                                                    type="button"
                                                    className='rounded-md border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                    onClick={(e) => {
                                                        spareDeleteConfirmation(e);
                                                    }}
                                                >
                                                    Eliminar respuesto
                                                </button>
                                            ) : (
                                                <button 
                                                    type="button"
                                                    className='rounded-md text-white bg-red-600 hover:bg-red-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                    onClick={(e) => {
                                                        handleDeleteSpare(e);
                                                        setSpareEditor(false);
                                                    }}
                                                >
                                                    Confirmar eliminación
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                        
                ) : (
                    (() => {
                        alert("Esta opción no está disponible");
                        setSpareEditor(false);
                        setSpareToEdit(null);
                    })()
                )
            )}
    </div>
)}

export default Repuestos;