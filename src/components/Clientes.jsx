import React, { useState, useEffect } from 'react';
import Tabla from './Tabla';
import { CLIENT_ENDPOINT, BUILDING_ENDPOINT } from '../utils/apiRoutes';
import NavBar from './NavBar';
import { PulseLoader } from 'react-spinners';

const Clientes = () => {
    const [clientFilas, setClientFilas] = useState([]);
    const [buildingFilas, setBuildingFilas] = useState([]);
    
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [filter, setFilter] = useState("");

    //const [adder, setAdder] = useState(false);
    const [detail, setDetail] = useState(false);
    const [rowData, setRowData] = useState(null);
    const [clientDetailData, setClientDetailData] = useState(null);
    const [isLoadingClientDetail, setIsLoadingClientDetail] = useState(true);
    /* const [editor, setEditor] = useState(false);
    const [clientToEdit, setClientToEdit] = useState(null);
    const [deleter, setDeleter] = useState(false); */

    const [clientId, setClientId] = useState(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [rut, setRut] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [apartment, setApartment] = useState("");
    const [building, setBuilding] = useState("");
    const [bank, setBank] = useState("");
    const [accountType, setAccountType] = useState("");
    const [accountNumber, setAccountNumber] = useState("");

    const columnas = [
        { nombre: "ID Cliente", llave: "id" },
        { nombre: "Apellido", llave: "last_name" },
        { nombre: "Nombre", llave: "first_name" },
        { nombre: "RUT", llave: "rut" },
        { nombre: "Teléfono", llave: "phone_number" },
        { nombre: "Correo", llave: "email" }        
    ];

    const formatRUT = (rut) => {
        // Elimina cualquier carácter no válido
        rut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
        // Formatea el RUT
        if (rut.length > 7) {
          rut = rut.replace(/^(\d{1,2})(\d{3})(\d{3})(\w{1})$/, '$1.$2.$3-$4');
        } else if (rut.length === 7) {
          rut = rut.replace(/^(\d{1,3})(\d{3})(\d{1})$/, '$1.$2-$3');
        } else if (rut.length === 6) {
          rut = rut.replace(/^(\d{1,3})(\d{3})(\d{1})$/, '$1.$2-$3');
        } else if (rut.length === 5) {
          rut = rut.replace(/^(\d{1,2})(\d{3})(\d{1})$/, '$1.$2-$3');
        } else if (rut.length === 4) {
          rut = rut.replace(/^(\d{1,3})(\d{1})$/, '$1-$2');
        } else if (rut.length === 3) {
          rut = rut.replace(/^(\d{1,2})(\d{1})$/, '$1-$2');
        } else if (rut.length === 2) {
          rut = rut.replace(/^(\d{1})(\d{1})$/, '$1-$2');
        }
        return rut;
    };

    const handleRutBlur = (e) => {
        const inputRut = e.target.value;
        const formattedRut = formatRUT(inputRut);
        setRut(formattedRut);
    };

    useEffect(() => {
        fetchClientsData();
        fetchBuildingData();
    }, []);

    const fetchClientsData = async () => {
        setIsLoadingClients(true);
        try {
            const response = await fetch(CLIENT_ENDPOINT);
            if (!response.ok) {
                throw new Error('Failed to fetch machine data');
            }
            const data = await response.json();
            // console.log('Fetched data:', data); // Log the fetched data
            setClientFilas(data);
            //setFilas(prevFilas => [...prevFilas, ...data]); // Merge fetched data with existing data
        } catch (error) {
            console.error('Error fetching machine data:', error);
        }
        setIsLoadingClients(false);
    };

    const fetchClientDetailData = async (id) => {
        try {
            const response = await fetch(CLIENT_ENDPOINT + '/' + id);
            if (!response.ok) {
                throw new Error('Failed to fetch client data');
            }
            const data = await response.json();
            // console.log('Fetched data client :', data); // Log the fetched data
            setClientDetailData(data);
        } catch (error) {
            console.error('Error fetching one client data:', error);
        } finally {
            setIsLoadingClientDetail(false);
        }
    };
    
    /* const handleAddSubmit = async (e) => {
        e.preventDefault();
        if(firstName === "" || lastName === "" || rut === "" || phone === "" || email === "" || apartment === "" || building === "" || bank === "" || accountType === ""){
            alert('Faltan datos para agregar cliente.');
            return;
        }
        try {
            const response = await fetch(CLIENT_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    rut: rut,
                    phone_number: phone,
                    email: email,
                    department_number: apartment,
                    //building: building,
                    //bank: bank,
                    //account_type: accountType
                    //account_number: accountNumber
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add client');
            }
            setAdder(false);
            fetchClientsData();
        } catch (error) {
            console.error('Error adding client:', error);
            alert('Error al añadir cliente. Intente nuevamente.');
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if(!clientToEdit || clientToEdit.id === ""){
            alert('Faltan datos para editar cliente.');
            return;
        }
        try {
            const response = await fetch(CLIENT_ENDPOINT, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    last_name: clientToEdit.lastName,
                    first_name: clientToEdit.firstName,
                    rut: clientToEdit.rut,
                    phone_number: clientToEdit.phone,
                    email: clientToEdit.email,
                    department_number: apartment,
                    building: clientToEdit.building,
                    bank: clientToEdit.bank,
                    account_type: clientToEdit.accountType,
                    account_number: clientToEdit.accountNumber
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add client');
            }
            setEditor(false);
            setClientToEdit(null);
            fetchClientsData();
        } catch (error) {
            console.error('Error updating client:', error);
            alert('Error al editar cliente. Intente nuevamente.');
        }
    };

    const handleDeleteSubmit = async (e) => {
        e.preventDefault();
        if(rut === ""){
            alert('Faltan datos para agregar cliente.');
            return;
        }
        try {
            const response = await fetch(CLIENT_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to add client');
            }
            setDeleter(false);
            fetchClientsData();
        } catch (error) {
            console.error('Error adding client:', error);
            alert('Error al añadir cliente. Intente nuevamente.');
        }
    }; */

    const fetchBuildingData = async () => {
        try {
            const response = await fetch(BUILDING_ENDPOINT); 
            if (!response.ok) {
                throw new Error('Failed to fetch request data');
            }
            const data = await response.json();
            // console.log('Fetched buildings data:', data); 

            setBuildingFilas(data);
        } catch (error) {
            console.error('Error fetching request data:', error);
        }
    };

    const filteredClientRows = clientFilas.filter((fila) =>
        Object.values(fila).some((value) =>
            value && typeof value !== 'object' && // Verifica si el valor no es nulo ni un objeto
            value.toString().toLowerCase().includes(filter.toLowerCase())
        )
    );


    const handleRowClick = (client) => {
        setRowData(client);
        setDetail(true); // Open the editor modal
        fetchClientDetailData(client.id);
    };
    
    return (
        <div>
            <NavBar />
            <div className='container mx-auto px-4 mb-10 pt-20'>
                <h1 className='text-3xl mt-10 first-line:font-bold text-gray-800'>Clientes</h1>
        
                
                {detail && (
                    <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
                                        
                                            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                                <div className="sm:flex sm:items-start">
                                                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                                        <button
                                                            onClick={() => {
                                                                setDetail(false);
                                                                setRowData(null);
                                                                setClientDetailData(null);
                                                                setIsLoadingClientDetail(true);
                                                            }}
                                                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                        <h2 className="text-base font-semibold leading-6 text-turquesa-500 text-xl mb-3" id="modal-title">Detalles más recientes del cliente</h2>
                                                            {isLoadingClientDetail ? ( // Conditionally render loading message while loading is true
                                                                <div className="flex justify-center items-center mt-4 h-24">
                                                                    <PulseLoader color="#319795" />
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {rowData && (
                                                                        <>
                                                                        {clientDetailData && (
                                                                            <>
                                                                            <div className="grid grid-cols-2 mt-2 flex">
                                                                                <div className="lg:col-span-1 mr-10">
                                                                                    <div>
                                                                                        <p><strong className='text-turquesa-500'>Datos personales:</strong></p>
                                                                                        <table className="align-text-bottom border-separate border-spacing-x-2  ">
                                                                                            <tr>
                                                                                                <td><p><strong>Apellido:</strong></p></td>
                                                                                                <td><p>{clientDetailData.last_name}</p></td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td><p><strong>Nombre:</strong></p></td>
                                                                                                <td><p>{clientDetailData.first_name}</p></td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td><p><strong>Rut:</strong></p></td>
                                                                                                <td><p>{clientDetailData.rut}</p></td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td><p><strong>Correo electrónico:</strong></p></td>
                                                                                                <td><p>{clientDetailData.email}</p></td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td><p><strong>Número telefónico:</strong></p></td>
                                                                                                <td><p>{clientDetailData.phone_number}</p></td>
                                                                                            </tr>
                                                                                        </table>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="lg:col-span-1">
                                                                                    <div>
                                                                                        
                                                                                        <p><strong className='text-turquesa-500'>Datos Edificio:</strong></p>
                                                                                        <table className="align-text-bottom border-separate border-spacing-x-2  ">
                                                                                            <tr>
                                                                                                <td><p><strong>Edificio:</strong></p></td>
                                                                                                <td><p>{clientDetailData.building_name} ({clientDetailData.building_address})</p></td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td><p><strong>Departamento:</strong></p></td>
                                                                                                <td><p>{clientDetailData.department_number}</p></td>
                                                                                            </tr>
                                                                                        </table>
                                                                                    </div>
                                                                                    <div className='mt-5'>

                                                                                        <p><strong className='text-turquesa-500'>Datos Cuenta Bancaria:</strong></p>
                                                                                        <table className="align-text-bottom border-separate border-spacing-x-2  ">
                                                                                            <tr>
                                                                                                <td><p><strong>Banco:</strong></p></td>
                                                                                                <td><p>{clientDetailData.bank}</p></td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td><p><strong>Tipo de Cuenta:</strong></p></td>
                                                                                                <td><p>{clientDetailData.account_type}</p></td>
                                                                                            </tr>
                                                                                            <tr>
                                                                                                <td><p><strong>Número de Cuenta:</strong></p></td>
                                                                                                <td><p>{clientDetailData.account_number}</p></td>
                                                                                            </tr>
                                                                                        </table>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            

                                                                            
                                                                        </>
                                                                        )}
                                                                        </>
                                                                    )}
                                                                </>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                <button 
                                                    onClick={() => {
                                                        setClientToEdit(rowData);
                                                        setDetail(false);
                                                        setEditor(true);
                                                    }}
                                                    className="bg-white rounded px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                                >
                                                    Editar cliente
                                                </button>
                                            </div> */}
                                        
                                    </div>
                                </div>
                            </div>
                        </div>
                )}
                {/* {editor && clientToEdit && (
                    <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
                                        <form onSubmit={handleEditSubmit}>
                                            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                                <div className="sm:flex sm:items-start">
                                                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                                                        <button
                                                            onClick={() => {
                                                                setEditor(false);
                                                                setClientToEdit(null);
                                                            }}
                                                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                        <h2 className="text-base font-semibold leading-6 text-turquesa-500 text-xl mb-3" id="modal-title">Editar cliente</h2>
                                                        
                                                        <p><strong className='text-turquesa-500'>Datos personales:</strong></p>
                                                        <div className="grid grid-cols-3 mt-2">
                                                            <div className="lg:col-span-1 mr-5">
                                                                <div className="mb-2">
                                                                    <label htmlFor='lastName' className='block'>Apellido:</label>
                                                                    <input required type='text' id='lastName' value={clientToEdit.last_name} onChange={(e) => setClientToEdit({ ...clientToEdit, last_name: e.target.value })} className='w-full p-2 border border-gray-300 rounded-md' />
                                                                </div>
                                                                <div className="mb-3">
                                                                    <label htmlFor='email' className='block'>Correo electrónico:</label>
                                                                    <input required type='text' id='email' value={clientToEdit.email} onChange={(e) => setClientToEdit({ ...clientToEdit, email: e.target.value })} className='w-full p-2 border border-gray-300 rounded-md' />
                                                                </div>
                                                            </div>
                                                            <div className="lg:col-span-1 mr-5">
                                                                <div className="mb-2">
                                                                    <label htmlFor='firstName' className='block'>Nombre:</label>
                                                                    <input required type='text' id='firstName' value={clientToEdit.first_name} onChange={(e) => setClientToEdit({ ...clientToEdit, first_name: e.target.value })} className='w-full p-2 border border-gray-300 rounded-md' />
                                                                </div>
                                                                <div className="mb-2">
                                                                    <label htmlFor='phone' className='block'>Número telefónico:</label>
                                                                    <div className='flex items-center'>
                                                                        <span className='mr-2 text-gray-600'>+56</span>
                                                                        <input required type='text' id='phone' minLength={9} maxLength={9} value={clientToEdit.phone_number} onChange={(e) => setClientToEdit({ ...clientToEdit, phone_number: "+56" + e.target.value })} className='w-full p-2 border border-gray-300 rounded-md'/>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="lg:col-span-1">
                                                                <div className="mb-2">
                                                                    <label htmlFor='rut' className='block'>Rut:</label>
                                                                    <input required type='text' id='rut' value={clientToEdit.rut} onChange={(e) => setClientToEdit({ ...clientToEdit, rut: e.target.value })} onBlur={handleRutBlur} minLength={8} maxLength={12} className='w-full p-2 border border-gray-300 rounded-md' />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <p><strong className='text-turquesa-500'>Datos Edificio:</strong></p>
                                                        <div className="grid grid-cols-2 mt-2">
                                                            <div className="lg:col-span-1 mr-5">
                                                                <div className="mb-2">
                                                                    <label htmlFor='building' className='block'>Edificio:</label>
                                                                    <select required type='text' id='building' value={clientToEdit.building} onChange={(e) => setClientToEdit({ ...clientToEdit, building: e.target.value })} className='w-full p-2 border mb-2 border-gray-300 rounded-md'>
                                                                        <option value=''>Seleccionar edificio</option>
                                                                        {buildingFilas.map((building) => (
                                                                            <option key={"building_" + building.id} value={building.id}>
                                                                                Edificio: {building.name} ({building.address})
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="lg:col-span-1">
                                                                <div className="mb-2">
                                                                    <label htmlFor='dept_number' className='block'>Número de departamento:</label>
                                                                    <input required type='text' id='dept_number' value={clientToEdit.department_number} onChange={(e) => setClientToEdit({ ...clientToEdit, apartment: e.target.value })} className='w-full p-2 border border-gray-300 rounded-md' />
                                                                </div>
                                                            </div>
                                                        </div>    

                                                        <p><strong className='text-turquesa-500'>Datos Cuenta Bancaria:</strong></p>
                                                        <div className="grid grid-cols-3 mt-2">
                                                            <div className="lg:col-span-1 mr-5">
                                                                <div className="mb-2">
                                                                    <label htmlFor='bank' className='block'>Banco:</label>
                                                                    <select required type='text' id='banco' value={clientToEdit.bank} onChange={(e) => setClientToEdit({ ...clientToEdit, bank: e.target.value })} className=' mr-5 w-full p-2 border border-gray-300 rounded-md'>
                                                                        <option value='Banco Santander'>Banco Santander</option>
                                                                        <option value='Banco Santander Banefe'>Banco Santander Banefe</option>
                                                                        <option value='Scotiabank Azul'>Scotiabank Azul</option>
                                                                        <option value='Banco BICE'>Banco BICE</option>
                                                                        <option value='Banco Internacional'>Banco Internacional</option>
                                                                        <option value='Banco Itaú'>Banco Itaú</option>
                                                                        <option value='Banco de Chile / Edwards-Citi'>Banco de Chile / Edwards-Citi</option>
                                                                        <option value='Corpbanca'>Corpbanca</option>
                                                                        <option value='Banco Crédito e Inversiones'>Banco Crédito e Inversiones</option>
                                                                        <option value='Banco del Desarrollo'>Banco del Desarrollo</option>
                                                                        <option value='Banco Estado'>Banco Estado</option>
                                                                        <option value='Banco Falabella'>Banco Falabella</option>
                                                                        <option value='Banco Security'>Banco Security</option>
                                                                        <option value='Scotiabank'>Scotiabank</option>
                                                                        <option value='HSBC Bank'>HSBC Bank</option>
                                                                        <option value='Banco Ripley'>Banco Ripley</option>
                                                                        <option value='Banco Consorcio'>Banco Consorcio</option>
                                                                        <option value='Coopeuch'>Coopeuch</option>
                                                                        <option value='Dresdner Bank Leteinamerika'>Dresdner Bank Leteinamerika</option>
                                                                        <option value='Banco Do Brasil S.A.'>Banco Do Brasil S.A.</option>
                                                                        <option value='JP Morgan Chase Bank'>JP Morgan Chase Bank</option>
                                                                        <option value='Banco de la Nación Argentina'>Banco de la Nación Argentina</option>
                                                                        <option value='The Bank of Tokyo - Mitsubishi'>The Bank of Tokyo - Mitsubishi</option>
                                                                        <option value='Abn Amro Bank (Chile)'>Abn Amro Bank (Chile)</option>
                                                                        <option value='Deutsche Bank (Chile)'>Deutsche Bank (Chile)</option>
                                                                        <option value='HNS Banco'>HNS Banco</option>
                                                                        <option value='Banco Monex'>Banco Monex</option>
                                                                        <option value='BBVA Banco Bhif'>BBVA Banco Bhif</option>
                                                                        <option value='Banco Conosur'>Banco Conosur</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="lg:col-span-1 mr-5">
                                                                <div className="mb-2">
                                                                    <label htmlFor='acctype' className='block'>Tipo de Cuenta:</label>
                                                                    <select required type='text' id='tipocuenta' value={clientToEdit.account_type} onChange={(e) => setClientToEdit({ ...clientToEdit, accountType: e.target.value })} className='w-full mr-5 p-2 border border-gray-300 rounded-md'>
                                                                        <option value='Cuenta Corriente'>Cuenta Corriente</option>
                                                                        <option value='Cuenta Vista'>Cuenta Vista</option>
                                                                        <option value='Chequera Electrónica'>Chequera Electrónica</option>
                                                                        <option value='Cuenta de Ahorro'>Cuenta de Ahorro</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="lg:col-span-1 mr-5">
                                                                <div className="mb-2">
                                                                    <label htmlFor='accnumber' className='block'>Número de Cuenta:</label>
                                                                    <input required maxLength={20} type='text' id='accnumber' value={clientToEdit.account_number} onChange={(e) => setClientToEdit({ ...clientToEdit, accountNumber: e.target.value })} className='w-full p-2 border border-gray-300 rounded-md' />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                <button 
                                                    type="sumbit" 
                                                    className="inline-flex w-full justify-center rounded-md bg-turquesa-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-turquesa-400 sm:ml-3 sm:w-auto"
                                                >
                                                    Editar cliente
                                                </button>
                                            </div>
                                        
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                )}

                {deleter && (
                    <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
                            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                        <form onSubmit={handleDeleteSubmit}>
                                            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                                <div className="sm:flex sm:items-start">
                                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                                        <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Eliminar cliente</h3>
                                                        
                                                            <div className="mb-2">
                                                                <label htmlFor='rut' className='block'>Rut:</label>
                                                                <input required type='text' id='rut' value={rut} minLength={7} maxLength={8} onChange={(e) => setRut(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md' />
                                                            </div>
                                                            
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                <button 
                                                    type="sumbit" 
                                                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                                                >
                                                    Eliminar cliente
                                                </button>
                                                <button 
                                                    onClick={() => setDeleter(false)}
                                                    type="button" 
                                                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                                >
                                                    Volver
                                                </button>
                                            </div>
                                        
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                )} */}

                <Tabla columnas={columnas} filas={filteredClientRows} onRowClick={handleRowClick} isLoading={isLoadingClients} />

            </div>
        </div>
    );
}

export default Clientes;