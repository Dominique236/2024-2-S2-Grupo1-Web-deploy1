import React, { useState, useEffect, useContext } from "react";
import Tabla from './Tabla';
import NavBar from './NavBar';
import { MACHINE_ENDPOINT, WAREHOUSE_ENDPOINT, BUILDING_ENDPOINT } from '../utils/apiRoutes';
import { UserContext } from '../contexts/UserContext';
import MaquinasAdvancedFiltersPopup from "./MaquinasAdvancedFiltersPopup";


const Maquinas = () => {
    const [isLoading, setIsLoading] = useState(true);

    const [machineFilas, setMachineFilas] = useState([]);
    const [warehouseFilas, setWarehouseFilas] = useState([]);
    const [buildingFilas, setBuildingFilas] = useState([]);
    const [filter, setFilter] = useState('');

    const [generatorOpen, setGeneratorOpen] = useState(false);
    const [addOpen, setAddOpen] = useState(false);
    const [addClickCount, setAddClickCount] = useState(0);
    const [editOpen, setEditOpen] = useState(false);
    const [editClickCount, setEditClickCount] = useState(0);
    const [machineToEdit, setMachineToEdit] = useState(null);
   /*  const [deleteOpen, setDeleteOpen] = useState(false); */
    const [deleteClickCount, setDeleteClickCount] = useState(0);

    const [id, setId] = useState('');
    const [buildingId, setBuildingId] = useState('');
    const [code, setCode] = useState('');
    const [cuantumId, setCuantumId] = useState('');
    const [type, setType] = useState('Lavadora');
    const [model, setModel] = useState('');
    const [warehouseId, setWarehouseId] = useState('');
    const [supplier, setSupplier] = useState('');
    const [state, setState] = useState('');

    // Filtros avanzados
    const [estadoActiva, setEstadoActiva] = useState(true);
    const [estadoEliminada, setEstadoEliminada] = useState(false);
    const [tipoLavadora, setTipoLavadora] = useState(false);
    const [tipoSecadora, setTipoSecadora] = useState(false);
    const [filterSupplier, setFilterSupplier] = useState([]);
    const [filterLocation, setFilterLocation] = useState('');
    const [filterBuilding, setFilterBuilding] = useState('');
    const [filterWarehouse, setFilterWarehouse] = useState(''); 
    const [showFilters, setShowFilters] = useState(false);
    const [filteredRows, setFilteredRows] = useState([]);
    const [filterConditions, setFilterConditions] = useState([]);
    const [supplierOptions, setSupplierOptions] = useState([]);
    //const [locationOptions, setLocationOptions] = useState([]);
    const [buildingOptions, setBuildingOptions] = useState([]);
    const [warehouseOptions, setWarehouseOptions] = useState([]);


    const { userRole } = useContext(UserContext);

    const columnas = [
        { nombre: "ID", llave: "id" },
        { nombre: "Código (QR)", llave: "code" },
        { nombre: "Tipo de máquina", llave: "type" },
        { nombre: "Modelo", llave: "model" },
        { nombre: "Proveedor", llave: "supplier" },
        { nombre: "Estado", llave: "state" },
        { nombre: "Ubicación", llave: "location" }, 
        { nombre: "Quantum", llave: "cuantum_id" },
        { nombre: "", llave: "editButton" }
    ];

    useEffect(() => {
        fetchMachineData();
        handleBorrarFiltros() ////


    }, []);


    const fetchMachineData = async () => {
        setIsLoading(true);

        try {
            const machineResponse = await fetch(MACHINE_ENDPOINT);
            const warehouseResponse = await fetch(WAREHOUSE_ENDPOINT);
            const buildingResponse = await fetch(BUILDING_ENDPOINT);
            
            if (!machineResponse.ok || !warehouseResponse.ok || !buildingResponse.ok) {
                throw new Error('Failed to fetch data');
            }
            
            const machineData = await machineResponse.json();
            const warehouseData = await warehouseResponse.json();
            const buildingData = await buildingResponse.json();

            // console.log('Fetched machine data:', machineData)
            // console.log('Fetched warehouse data:', warehouseData)
            // console.log('Fetched building data:', buildingData)

            // Extract unique supplier names from machine data
            const uniqueSuppliers = [...new Set(machineData.map(machine => machine.supplier))];
            const supplierOptions = uniqueSuppliers.map(supplier => ({
                value: supplier,
                label: supplier
            }));
    
            // Map through machine data and set 'ubicacion' property based on building or warehouse
            const transformedData = machineData.map(machine => {
                const locationID = machine.building_id || machine.warehouse_id;
                const locationType = machine.building_id ? "building" : "warehouse";
                const locationData = locationType === "building" ?
                    buildingData.find(building => building.id === locationID) :
                    warehouseData.find(warehouse => warehouse.id === locationID);

                const location = locationData ?
                    (locationType === "building" ?
                        `Edificio: ${locationData.name}` :
                        `Bodega: ${locationData.name}`) :
                    "Ubicación no encontrada";
    
                return {
                    ...machine,
                    location: location.toString(),
                    editButton: 
                    <button className="bg-white rounded px-2 py-2 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={() => { setMachineToEdit({
                            id: machine.id,
                            code: machine ? machine.code : 'Unknown Code',
                            model: machine ? machine.model : 'Unknown Model',
                            supplier: machine ? machine.supplier : 'Unknown Supplier',
                            type: machine ? machine.type : 'Unknown Type',
                            state: machine ? machine.state : 'Unknown State',
                            location: machine ? location : 'Unknown Location',
                            cuantum_id: machine ? machine.cuantum_id : 'Unknown Quantum',
                            warehouseId: machine ? machine.warehouse_id : 'Unknown warehouse_id',
                            buildingId: machine ? machine.building_id : 'Unknown building_id',

                        }); setEditOpen(true); 
                    }}>
                        Editar
                    </button>
                };
            });

            const uniqueBuildings = [...new Set(transformedData.map(machine => machine.building))];
            const buildingOptions = uniqueBuildings.map(building => ({
                value: building,
                label: building
            }));

            const uniqueWarehouses = [...new Set(transformedData.map(machine => machine.warehouse))];
            const warehouseOptions = uniqueWarehouses.map(warehouse => ({
                value: warehouse,
                label: warehouse
            }));

            setMachineFilas(transformedData);
            setBuildingFilas(buildingData);
            setWarehouseFilas(warehouseData);
            //setLocationOptions(locationOptions);
            setBuildingOptions(buildingOptions);
            setWarehouseOptions(warehouseOptions);
            setSupplierOptions(supplierOptions);

            setFilteredRows(transformedData);

            

        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setIsLoading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if(code === ""){
            alert('Código de Máquina es requerido para generar QR');
            return;
        }
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        if((buildingId === "" && warehouseId === "") || code === "" || model === "" || supplier === ""){
            alert('Faltan datos para agregar máquina.');
            setAddClickCount(0);
            return;
        }
        try {
            const requestBody = {
                code: code,
                model: model,
                supplier: supplier,
                type: type,
                cuantum_id: cuantumId,
            };
    
            // Add building_id or warehouse_id based on which one is present
            if (buildingId !== "") {
                requestBody.building_id = buildingId;
            } else {
                requestBody.warehouse_id = warehouseId;
            }
    
            const response = await fetch(MACHINE_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error('Failed to add machine');
            }
            setAddOpen(false);
            setAddClickCount(0);
            setCode('');   
            setModel('');
            setSupplier('');
            setType('Lavadora');
            setCuantumId('');
            setBuildingId('');
            setWarehouseId('');
            fetchMachineData();
        } catch (error) {
            console.error('Error adding machine:', error);
            setAddClickCount(0);
            alert('Error al añadir máquina. Intente nuevamente.');
        }
    };

    const addConfirmation = (e) => {
        if (addClickCount === 0) {
            if (e) {
                e.preventDefault();
            }
            setAddClickCount(1); 
        } else if (addClickCount === 1) {
            if (e) {
                e.preventDefault();
            }
            handleAddSubmit(e);
        }
    };
    
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if(!machineToEdit || machineToEdit.id === ""){

            setEditClickCount(0);
            return;
        }
        // console.log("machine1:", machineToEdit)
        
        try {
            /*const requestBody = {
                code: code,
                model: model,
                supplier: supplier,
                type: type,
                cuantum_id: cuantumId
            };
    
            // Add building_id or warehouse_id based on which one is present
            if (buildingId !== "") {
                requestBody.building_id = buildingId;
            } else {
                requestBody.warehouse_id = warehouseId;
            }*/

            let requestbuildingId = null;
            let requestwarehouseId = null;

            if (machineToEdit.buildingId === "") {
                requestbuildingId = null;
                requestwarehouseId = machineToEdit.warehouseId;
            } else {
                requestbuildingId = machineToEdit.buildingId;
                requestwarehouseId = null;
            }

    
            const response = await fetch(MACHINE_ENDPOINT + '/' + machineToEdit.id, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: machineToEdit.code,
                    model: machineToEdit.model,
                    supplier: machineToEdit.supplier,
                    type: machineToEdit.type,
                    state: machineToEdit.state,
                    building_id: requestbuildingId,
                    warehouse_id: requestwarehouseId,
                    cuantum_id: machineToEdit.cuantum_id
                }),
            });
            // console.log("machine2:", "code:", machineToEdit.code,
            //         "model:", machineToEdit.model,
            //         "supplier:", machineToEdit.supplier,
            //         "type:", machineToEdit.type,
            //         "state:", machineToEdit.state,
            //         "building_id:", requestbuildingId,
            //         "warehouse_id:", requestwarehouseId,
            //         "cuantum_id:", machineToEdit.cuantum_id)
            

            if (!response.ok) {
                throw new Error('Failed to update machine');
            }
            setEditOpen(false);
            setEditClickCount(0);
            fetchMachineData();
            setMachineToEdit(null);
        } catch (error) {
            console.error('Error updating machine:', error);
            setEditClickCount(0);
            alert('Error al editar máquina. Intente nuevamente.');
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
            handleEditSubmit(e);
        }
    };
    

    const handleDeleteSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }
        if(!machineToEdit || !machineToEdit.id){
            alert('Falta el código para eliminar máquina');
            setDeleteClickCount(0);
            return;
        }
        try {
            const response = await fetch(MACHINE_ENDPOINT + '/' + machineToEdit.id, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to delete machine');
            }
            setDeleteClickCount(0);
            setEditOpen(false);
            fetchMachineData();
            setMachineToEdit(null);
        } catch (error) {
            console.error('Error deleting machine:', error);
            setDeleteClickCount(0);
            alert('Error eliminando máquina. Intente nuevamente.');
        }
    };

    const deleteConfirmation = (e) => {
        if (deleteClickCount === 0) {
            if (e) {
                e.preventDefault();
            }
            setDeleteClickCount(1); 
        } else if (deleteClickCount === 1) {
            setDeleteClickCount(0);
        }
    };

    const filteredMachineRows = machineFilas.filter((fila) =>
        Object.values(fila).some((value) =>
            value && typeof value !== 'object' && // Verifica si el valor no es nulo ni un objeto
            value.toString().toLowerCase().includes(filter.toLowerCase())
        )
    );

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    };

    const filterRows = (filterValue) => {
        const newFilteredRows = machineFilas.filter((fila) =>
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
        let newFilteredRows = machineFilas;
        if (estadoActiva || estadoEliminada) {
            newFilteredRows = newFilteredRows.filter((fila) => 
                (estadoActiva && fila.state === 'Activo') ||
                (estadoEliminada && fila.state === 'Eliminado')
            );
        }
        if (tipoLavadora || tipoSecadora) {
            newFilteredRows = newFilteredRows.filter((fila) =>
                (tipoLavadora && fila.type === 'Lavadora') ||
                (tipoSecadora && fila.type === 'Secadora')
            );
        }
        if (filterSupplier) {
            newFilteredRows = newFilteredRows.filter(fila => fila.supplier === filterSupplier);
        }
        if (filterBuilding) {
            newFilteredRows = newFilteredRows.filter(fila => 
                fila.location === 'Edificio: ' + filterBuilding 
            );
        }
        if (filterWarehouse) {
            newFilteredRows = newFilteredRows.filter(fila => 
                fila.location === 'Bodega: ' + filterWarehouse 
            );
        }

        

        setFilterConditions([estadoActiva, estadoEliminada, tipoLavadora, tipoSecadora]);
        setFilteredRows(newFilteredRows);
        // console.log("testeo:", filterBuilding)
        setShowFilters(false);
    };

    const handleUndoFilters = () => {
        let newFilteredRows = machineFilas;

        if (filterConditions[0] || filterConditions[1]) {
            newFilteredRows = newFilteredRows.filter((fila) =>
                (!filterConditions[0] || fila.state === 'Activo') &&
                (!filterConditions[1] || fila.state === 'Eliminado')
            );
        }

        if (filterConditions[2] || filterConditions[3]) {
            newFilteredRows = newFilteredRows.filter((fila) =>
                (!filterConditions[2] || fila.type === 'Lavadora') &&
                (!filterConditions[3] || fila.type === 'Secadora')
            );
        }

        if (filterConditions[4]) {
            newFilteredRows = newFilteredRows.filter((fila) =>
                fila.supplier === filterConditions[4]
            );
        }
        if (filterConditions[5]) {
            newFilteredRows = newFilteredRows.filter((fila) => 
                fila.location === filterConditions[5]
            );
        }
        if (filterConditions[6]) {
            newFilteredRows = newFilteredRows.filter((fila) => 
                fila.location === filterConditions[6]
            );
        }


        setFilterConditions([]);
        setFilteredRows(newFilteredRows);
    };

    const handleBorrarFiltros = () => {
        setEstadoActiva(false);
        setEstadoEliminada(false);
        setTipoLavadora(false);
        setTipoSecadora(false);
        setFilterSupplier('');
        setFilterBuilding('');
        setFilterWarehouse('');
        setFilteredRows(machineFilas);
        setFilterConditions([]);
    };

    return (
        <div>
            <NavBar />
            <div className='container mx-auto px-4 mb-10 pt-20'>
                <div className='flex justify-between items-end'>
                    <div>
                        <h1 className='text-3xl mt-10 first-line:font-bold text-gray-800'>Máquinas</h1>
                    </div>
                    <div>
                        {userRole === 'admin' && (
                            <>
                                <button
                                    onClick={() => setAddOpen(true)}
                                    className="bg-white rounded px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                >
                                    Agregar máquina
                                </button>
                            </>
                        )}
                    </div>
                </div>
                
                <div>

                    {addOpen && (
                        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                            <form onSubmit={handleAddSubmit}>
                                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                                    <button
                                                        onClick={() => {
                                                            setAddOpen(false);
                                                        }}
                                                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                    <h2 className="text-base font-semibold leading-6 text-turquesa-500 text-xl mb-3" id="modal-title">Agregar nueva máquina</h2>
                                                    <div className="sm:flex sm:items-start">
                                                            
                                                        <div className="max-w-2xl mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
                                                            <div className="lg:col-span-1">
                                                                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                                                    <div className="mb-2">
                                                                        <label htmlFor='type' className='type'>Tipo de máquina:</label>
                                                                        
                                                                        <select id='type' value={type} onChange={(e) => setType(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md'>
                                                                            <option value='Lavadora'>Lavadora</option>
                                                                            <option value='Secadora'>Secadora</option>
                                                                        </select>
                                                                    </div>
                                                                    <div className="mb-2">
                                                                        <label htmlFor='model' className='block'>Modelo:</label>
                                                                        <input required type='text' id='model' value={model} onChange={(e) => setModel(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md' />
                                                                    </div>
                                                                    <div className="mb-2">
                                                                        <label htmlFor='code' className='block'>Código Interno:</label>
                                                                        <input required type='text' id='code' maxLength={4} value={code} onChange={(e) => setCode(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md' />
                                                                    </div>
                                                                    <div className="mb-2">
                                                                        <label htmlFor='cuantum' className='block'>Quantum:</label>
                                                                        <input type='text' id='cuantum' value={cuantumId} onChange={(e) => setCuantumId(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md' />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="lg:col-span-1">
                                                                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                                                    <div className="mb-2">
                                                                        <label htmlFor='location' className='block'>Ubicación:</label>
                                                                            <select
                                                                                id='type'
                                                                                value={
                                                                                    warehouseId
                                                                                        ? `w_${warehouseId}`
                                                                                        : (buildingId
                                                                                            ? `b_${buildingId}`
                                                                                            : "")
                                                                                }
                                                                                onChange={(e) => {
                                                                                    const selectedValue = e.target.value;
                                                                                    const [type, id] = selectedValue.split('_');
                                                                                    const selectedId = parseInt(id);

                                                                                    if (type === 'w') {
                                                                                        // Selected a warehouse
                                                                                        setWarehouseId(selectedId);
                                                                                        setBuildingId(""); // Reset building ID if selecting a warehouse
                                                                                    } else if (type === 'b') {
                                                                                        // Selected a building
                                                                                        setWarehouseId(""); // Reset warehouse ID if selecting a building
                                                                                        setBuildingId(selectedId);
                                                                                    }
                                                                                }}
                                                                                className='w-full p-2 border border-gray-300 rounded-md'
                                                                            >
                                                                                <option value="">Elegir ubicación</option> {/* Default option */}
                                                                                {warehouseFilas.map((warehouse) => (
                                                                                    <option key={`warehouse_${warehouse.id}`} value={`w_${warehouse.id}`}>
                                                                                        Bodega: {warehouse.name} ({warehouse.address})
                                                                                    </option>
                                                                                ))}
                                                                                {buildingFilas.map((building) => (
                                                                                    <option key={`building_${building.id}`} value={`b_${building.id}`}>
                                                                                        Edificio: {building.name} ({building.address})
                                                                                    </option>
                                                                                ))}
                                                                            </select>

                                                                    </div>
                                                                    
                                                                    <div className="mb-2">
                                                                        <label htmlFor='supplier' className='block'>Proveedor:</label>
                                                                        <input required type='text' id='supplier' value={supplier} onChange={(e) => setSupplier(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md' />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                    
                                                    {addClickCount === 0 ? (
                                                        <button 
                                                            className='rounded-md border border-turquesa-500 text-turquesa-500 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                            onClick={(e) => {
                                                                addConfirmation(e);
                                                            }}
                                                        >
                                                            Agregar nueva máquina
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            className='rounded-md text-white bg-turquesa-600 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                            onClick={(e) => {
                                                                addConfirmation(e);
                                                                setAddOpen(false);
                                                            }}
                                                        >
                                                            Confirmar nueva máquina
                                                        </button>
                                                    )}
                                                </div>
                                            
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    )}

                    {editOpen && (
                        
                        userRole === 'admin' ? (
                            <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                                <form onSubmit={handleEditSubmit}>
                                                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                                        
                                                        <button
                                                            onClick={() => {
                                                                setEditOpen(false);
                                                                setMachineToEdit(null);
                                                            }}
                                                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                        <h2 className="text-base font-semibold leading-6 text-turquesa-500 text-xl mb-3" id="modal-title">Editar máquina</h2>
                                                        
                                                    
                                                            <div className="mb-2">
                                                                <label htmlFor='type' className='type'>Elegir máquina:</label>
                                                                <select id='type' value={machineToEdit ? machineToEdit.id : ''} 
                                                                    onChange={(e) => {
                                                                        const selectedMachineId = parseInt(e.target.value);
                                                                        const selectedMachine = machineFilas.find(machine => machine.id === selectedMachineId);
                                                                        // console.log("Selected machine:", selectedMachine);
                                                                        setMachineToEdit(selectedMachine);
                                                                    }}
                                                                    
                                                                    className='w-full p-2 border border-gray-300 rounded-md'>
                                                                    <option value="">Seleccionar máquina</option> {/* Add a default option */}
                                                                    {machineFilas.map((machine) => (
                                                                        <option key={machine.id} value={machine.id}>
                                                                            {machine.type}: {machine.code}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>    
                                                            {machineToEdit && (
                                                                <>
                                                                    <div className="max-w-2xl mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
                                                                        <div className="lg:col-span-1">
                                                                            <div className="mt-2 mb-2">
                                                                                <label htmlFor='type' className='type'>Tipo de máquina:</label>
                                                                                
                                                                                <select id='type' value={machineToEdit.type} onChange={(e) => setMachineToEdit({...machineToEdit, type: e.target.value})} className='w-full p-2 border border-gray-300 rounded-md'>
                                                                                    <option value='Lavadora'>Lavadora</option>
                                                                                    <option value='Secadora'>Secadora</option>
                                                                                </select>
                                                                            </div>
                                                                            <div className="mb-2">
                                                                                <label htmlFor='model' className='block'>Modelo:</label>
                                                                                <input required type='text' id='model' value={machineToEdit.model} onChange={(e) => setMachineToEdit({...machineToEdit, model: e.target.value})} className='w-full p-2 border border-gray-300 rounded-md' />
                                                                            </div>
                                                                            <div className="mt-2 mb-2">
                                                                                <label htmlFor='code' className='block'>Código(QR):</label>
                                                                                <input required type='text' id='code' minLength={4} maxLength={4} value={machineToEdit.code} onChange={(e) => setMachineToEdit({...machineToEdit, code: e.target.value})} className='w-full p-2 border border-gray-300 rounded-md' />
                                                                            </div>
                                                                            <div className="mb-2">
                                                                                <label htmlFor='cuantum' className='block'>Quantum:</label>
                                                                                <input required type='text' id='cuantum' value={machineToEdit.cuantum_id} onChange={(e) => setMachineToEdit({...machineToEdit, cuantum_id: e.target.value})} className='w-full p-2 border border-gray-300 rounded-md' />
                                                                            </div>
                                                                        </div>
                                                                        <div className="lg:col-span-1">
                                                                            <div className="mt-2 mb-2">
                                                                                <label htmlFor='location' className='block'>Ubicación:</label>
                                                                                    <select
                                                                                        id='type'
                                                                                        value={
                                                                                            machineToEdit.warehouseId
                                                                                                ? `w_${machineToEdit.warehouseId}`
                                                                                                : (machineToEdit.buildingId
                                                                                                    ? `b_${machineToEdit.buildingId}`
                                                                                                    : "")
                                                                                        }
                                                                                        onChange={(e) => {
                                                                                            const selectedValue = e.target.value;
                                                                                            const [type, id] = selectedValue.split('_');
                                                                                            const selectedId = parseInt(id);

                                                                                            if (type === 'w') {
                                                                                                // Selected a warehouse
                                                                                                setMachineToEdit(machineToEdit => ({...machineToEdit, warehouseId: selectedId, buildingId: ""}));
                                                                                            } else if (type === 'b') {
                                                                                                // Selected a building
                                                                                                setMachineToEdit(machineToEdit => ({...machineToEdit, warehouseId: "", buildingId: selectedId}));
                                                                                            }
                                                                                        }}
                                                                                        className='w-full p-2 border border-gray-300 rounded-md'
                                                                                    >
                                                                                        <option value="" data-type="">Elegir ubicación</option> {/* Default option */}
                                                                                        {warehouseFilas.map((warehouse) => (
                                                                                            <option key={`warehouse_${warehouse.id}`} value={`w_${warehouse.id}`} data-type="warehouse">
                                                                                                Bodega: {warehouse.name} ({warehouse.address})
                                                                                            </option>
                                                                                        ))}
                                                                                        {buildingFilas.map((building) => (
                                                                                            <option key={`building_${building.id}`} value={`b_${building.id}`} data-type="building">
                                                                                                Edificio: {building.name} ({building.address})
                                                                                            </option>
                                                                                        ))}
                                                                                    </select>


                                                                            </div>
                                                                            <div className="mb-2">
                                                                                <label htmlFor='supplier' className='block'>Proveedor:</label>
                                                                                <input required type='text' id='supplier' value={machineToEdit.supplier} onChange={(e) => setMachineToEdit({...machineToEdit, supplier: e.target.value})} className='w-full p-2 border border-gray-300 rounded-md' />
                                                                            </div>
                                                                            <div className="mb-2">
                                                                                <label htmlFor='type' className='type'>Estado:</label>
                                                                                
                                                                                <select id='type' value={machineToEdit.state} onChange={(e) => setMachineToEdit({...machineToEdit, state: e.target.value})} className='w-full p-2 border border-gray-300 rounded-md'>
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
                                                                className='rounded-md border border-turquesa-500 text-turquesa-500 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    if (
                                                                        machineToEdit.type &&
                                                                        machineToEdit.model &&
                                                                        machineToEdit.code.length >= 4 &&
                                                                        machineToEdit.cuantum_id &&
                                                                        (machineToEdit.warehouseId || machineToEdit.buildingId) &&
                                                                        machineToEdit.supplier &&
                                                                        machineToEdit.state
                                                                    ) {
                                                                        editConfirmation(e);
                                                                    } else {
                                                                        alert("Por favor, complete todos los campos correctamente.");
                                                                    }
                                                                }}
                                                            >
                                                                Editar máquina
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                className='rounded-md text-white bg-turquesa-600 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    if (
                                                                        machineToEdit.type &&
                                                                        machineToEdit.model &&
                                                                        machineToEdit.code.length >= 4 &&
                                                                        machineToEdit.cuantum_id &&
                                                                        (machineToEdit.warehouseId || machineToEdit.buildingId) &&
                                                                        machineToEdit.supplier &&
                                                                        machineToEdit.state
                                                                    ) {
                                                                        handleEditSubmit(e);
                                                                        setEditOpen(false);
                                                                    } else {
                                                                        alert("Por favor, complete todos los campos correctamente.");
                                                                    }
                                                                }}
                                                            >
                                                                Confirmar edición
                                                            </button>
                                                        )}

                                                        
                                                        {deleteClickCount === 0 ? (
                                                            <button 
                                                                className='rounded-md border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                                onClick={(e) => {
                                                                    deleteConfirmation(e);
                                                                }}
                                                            >
                                                                Eliminar máquina
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                className='rounded-md text-white bg-red-600 hover:bg-red-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto'
                                                                onClick={(e) => {
                                                                    handleDeleteSubmit(e);
                                                                    setEditOpen(false);
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
                                setEditOpen(false);
                                setMachineToEdit(null);
                            })()
                        )
                    )}

                    
                    {generatorOpen && (
                        <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                            <div className="bg-white px-4 pb-6 pt-5 sm:p-6 sm:pb-4 ">
                                                <div className="sm:flex sm:items-start">
                                                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                                        <button
                                                            onClick={() => {
                                                                setGeneratorOpen(false);
                                                            }}
                                                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                        <h3 className="text-base font-semibold leading-6 text-turquesa-500 text-xl mb-3" id="modal-title">Generador de QR para máquinas</h3>
                                                        <div className="grid grid-cols-2 mt-5">
                                                            <div className="lg:col-span-1">
                                                                <form onSubmit={handleSubmit}>
                                                                    <div>
                                                                        <label htmlFor='code' className='block'>Ingresa el código de la máquina que quisieras escanear:</label>
                                                                        <input 
                                                                            type='text' id='code' value={code} 
                                                                            maxLength={4}
                                                                            onChange={(e) => setCode(e.target.value)} 
                                                                            className='w-full p-2 border border-gray-300 rounded-md' 
                                                                        />
                                                                    </div>
                                                                    <div className='mt-5'>
                                                                        <button type='submit' className='w-full bg-turquesa-500 hover:bg-turquesa-400 font-semibold text-white p-2 rounded-md'>Ingresar código</button>
                                                                    </div>
                                                                </form>
                                                            </div>
                                                            <div className="lg:col-span-1 ml-4">
                                                                <div className="bg-white p-8 rounded shadow-lg">
                                                                    {/* GENERADOR DE QR AQUÍ */}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    )}
                    
                </div>
                <Tabla 
                    columnas={columnas} filas={filteredRows} isLoading={isLoading}
                    buttonAdvancedFilterText="Filtros avanzados" buttonAdvancedFilter={handleOpenFilters} 
                    buttonClearFilterText="Limpiar filtros" buttonClearFilter={handleBorrarFiltros}
                />
                <MaquinasAdvancedFiltersPopup 
                    show={showFilters}
                    onClose={handleCloseFilters}
                    onApply={handleApplyFilters}
                    onUndo={handleUndoFilters}
                    estadoActiva={estadoActiva}
                    estadoEliminada={estadoEliminada}
                    tipoLavadora={tipoLavadora}
                    tipoSecadora={tipoSecadora}
                    filterSupplier={filterSupplier}
                    filterLocation={filterLocation}
                    filterBuilding={filterBuilding}
                    filterWarehouse={filterWarehouse}

                    handleEstadoActivaChange={(e) => setEstadoActiva(e.target.checked)}
                    handleEstadoEliminadaChange={(e) => setEstadoEliminada(e.target.checked)}
                    handleTipoLavadoraChange={(e) => setTipoLavadora(e.target.checked)}
                    handleTipoSecadoraChange={(e) => setTipoSecadora(e.target.checked)}
                    handleFilterLocationChange={(location) => setFilterLocation(location)}
                    handleFilterBuildingChange={(building) => setFilterBuilding(building)}
                    handleFilterWarehouseChange={(warehouse) => setFilterWarehouse(warehouse)}
                    handleFilterSupplierChange={(supplier) => setFilterSupplier(supplier)}
                />
            </div>
        </div>
    );
}

export default Maquinas;