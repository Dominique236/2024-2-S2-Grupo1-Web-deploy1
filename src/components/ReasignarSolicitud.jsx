import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { SOLICITUD_ENDPOINT, OT_ENDPOINT, USER_ENDPOINT, BUILDING_ENDPOINT } from '../utils/apiRoutes'; // Asumo que USER_ENDPOINT contiene la ruta para obtener los usuarios
import DatePicker from 'react-datepicker';
import { PulseLoader } from 'react-spinners';
import NavBar from './NavBar';
import 'react-datepicker/dist/react-datepicker.css';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const ReasignarSolicitud = () => {
    const navigate = useNavigate();
    const { idSol } = useParams();
    const [isLoading, setIsLoading] = useState(true);

    const [allOTOptions, setAllOTOptions] = useState([]);
    const [OtOptions, setOtOptions] = useState([]);
    const [idOTnueva, setIdOTnueva] = useState('');
    const [workOrderData, setWorkOrderData] = useState(null);
    const [NewworkOrderData, setNewWorkOrderData] = useState(null);
    const [technicianName, setTechnicianName] = useState('');
    const [newTechnicianName, setNewTechnicianName] = useState('');

    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState('');

    const [buildingOptions, setBuildingOptions] = useState([]);
    const [idbuilding, setIdbuilding] = useState('');

    useEffect(() => {
        axios.get(OT_ENDPOINT)
            .then(response => {
                const data = response.data;
                const filteredData = data.filter(item => item.status === "Por Visitar");
                //console.log("testeo: ", filteredData)
                const selectOptions = filteredData.map(item => ({
                    value: item.id,
                    label: `id: ${item.id} - N° máquina: ${item.Machine.code} - status: ${item.status} - prioridad:${item.priority}`,
                    building_id: item.Machine.building_id
                }));


                setOtOptions(selectOptions);
                setAllOTOptions(selectOptions);
            })
            .catch(error => {
                console.error('Error al obtener los datos de la API:', error);
            });
    
        axios.get(SOLICITUD_ENDPOINT + `/${idSol}`)
            .then(response => {
                const { work_order_id } = response.data;
                axios.get(OT_ENDPOINT + `/${work_order_id}`)
                    .then(response => {
                        setWorkOrderData(response.data);
                        const technicianId = response.data.workorder_technician_id;
                        // Obtener el nombre del técnico utilizando su ID
                        axios.get(USER_ENDPOINT + `/${technicianId}`)
                            .then(response => {
                                setTechnicianName(`${response.data.user_metadata.name} ${response.data.user_metadata.last_name}`);
                            })
                            .catch(error => {
                                console.error('Error al obtener el nombre del técnico:', error);
                            });
                    })
                    .catch(error => {
                        console.error('Error al obtener los datos del work order:', error);
                    });
            })
            .catch(error => {
                console.error('Error al obtener los datos de la solicitud:', error);
            })
            .finally(() => {
                setIsLoading(false); // Establecer isLoading en false cuando todas las operaciones estén completas
            });

        axios.get(OT_ENDPOINT + `/${idOTnueva}`)
        .then(response => {
            setNewWorkOrderData(response.data);
            const newTechnicianId = response.data.workorder_technician_id;
            // Obtener el nombre del técnico de la OT destino utilizando su ID
            axios.get(USER_ENDPOINT + `/${newTechnicianId}`)
                .then(response => {
                    setNewTechnicianName(`${response.data.user_metadata.name} ${response.data.user_metadata.last_name}`);
                })
                .catch(error => {
                    console.error('Error al obtener el nombre del técnico de la OT destino:', error);
                });
        })
        .catch(error => {
            console.error('Error al obtener los datos de la orden de trabajo seleccionada:', error);
        });

        const fetchBuildingsOptions = async () => {
            try {
                const response = await axios.get(BUILDING_ENDPOINT);
                const buildingSelectOptions = response.data.map(item => ({
                    value: item.id,
                    label: `${item.name} - ${item.address} - ${item.county}`,
                }));
                setBuildingOptions(buildingSelectOptions);
            } catch (error) {
                console.error('Error fetching building options:', error);
            }
        };
        fetchBuildingsOptions();
    }, [idSol]);


    

    const handleSelectChange = (e) => {
        const selectedId = e.target.value;
        setIdOTnueva(selectedId);

        axios.get(OT_ENDPOINT + `/${selectedId}`)
            .then(response => {
                // console.log(response.data)
                setNewWorkOrderData(response.data);
            })
            .catch(error => {
                console.error('Error al obtener los datos de la orden de trabajo seleccionada:', error);
            });
    };

    //const selectOptionsFiltered = OtOptions.filter(option => workOrderData && option.value !== workOrderData.workorder_id);


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (idOTnueva === "") {
            alert("Debe seleccionar una OT válida.");
            return;
        }
        showConfirmation('Reasignar'); // Cambia 'Reasignar' por la acción que corresponda
    };

    const showConfirmation = (action) => {
        setActionToConfirm(action);
        setShowConfirmationModal(true);
    };

    const handleConfirmAction  = async (e) => {
        e.preventDefault();
        if (idOTnueva === "") {
            alert("Debe seleccionar una OT válida.");
            return;
        }
        try {
            const requestData = {
                "work_order_id": idOTnueva,
            };
            const response = await axios.put(SOLICITUD_ENDPOINT + `/${idSol}`, requestData);
            navigate('/solicitudes');
        } catch (error) {
            console.error('Error:', error);
        } 

        setShowConfirmationModal(false)
    };

    const handleVolver = () => {
        navigate('/solicitudes');
    };

    const handleSelectBuilding = (value) => {
        const selectedBuildingId = value;
        setIdbuilding(selectedBuildingId);

        if (selectedBuildingId === "") {
            setOtOptions(allOTOptions);
        } else {
            // console.log(allOTOptions)
            const filteredOTOptions = allOTOptions.filter(ot => ot.building_id === Number(selectedBuildingId));
            setOtOptions(filteredOTOptions);
        }
    };

    return (
        <div>
            <NavBar />
            <div className='container mx-auto px-4 mb-10'>
                <h3 className='text-3xl mt-10 first-line:font-bold text-gray-800'>Reasignar Solicitud </h3>
                <form onSubmit={handleSubmit} className='bg-white mt-5 p-8 rounded-lg shadow-md '>
                    {isLoading ? ( // Conditionally render loading message while loading is true
                        <div className="flex w-full justify-center items-center mt-4 h-24">
                            <PulseLoader color="#319795" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-6 gap-x-4 gap-y-10">
                                <div><p>Filtrar por edificio: </p></div>
                                <div className="col-span-2">
                                    <Autocomplete
                                        id="idbuilding"
                                        options={buildingOptions}
                                        getOptionLabel={(option) => option.label}
                                        value={idbuilding !== '' ? buildingOptions.find(option => option.value === idbuilding) : null}
                                        onChange={(event, newValue) => {
                                        if (newValue !== null && newValue !== undefined) {
                                            handleSelectBuilding(newValue.value); // Actualiza el estado filterbuilding en el componente padre
                                        } else {
                                            handleSelectBuilding(''); // Si el valor es null o undefined, asigna un valor vacío al estado filterbuilding
                                        }
                                        }}
                                        renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Seleccione un Edificio"
                                            variant="outlined"
                                            className='w-full p-2 border border-gray-300 rounded-md'
                                            style={{ width: '300px', fontSize: '14px', height: '30px' }}
                                        />
                                        )}
                                    />
                                </div>

                                <div><p>Seleccione OT destino:</p></div>
                                <div className="col-span-2">
                                    <select 
                                        id='idOTnueva' value={idOTnueva} onChange={handleSelectChange} 
                                        className='w-full p-2 border border-gray-300 rounded-md'
                                        style={{ width: '300px'}}
                                    >
                                        <option value="">Seleccione una OT</option>
                                        {OtOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                                {workOrderData && (
                                    <>
                                        <div className="col-span-3">
                                            <p><strong className='text-turquesa-500'>OT actual:</strong></p>
                                            <table className="align-text-bottom text-sm border-separate border-spacing-x-1">
                                                <tbody>
                                                    <tr className='align-top'>
                                                        <td><p><strong>ID Orden:</strong></p></td>
                                                        <td><p>{workOrderData.workorder_id}</p></td>
                                                    </tr>
                                                    <tr className='align-top'>
                                                        <td><p><strong>Técnico:</strong></p></td>
                                                        <td><p>{technicianName}</p></td>
                                                    </tr>
                                                    <tr className='align-top'>
                                                        <td><p><strong>Estado:</strong></p></td>
                                                        <td><p>{workOrderData.workorder_status}</p></td>
                                                    </tr>
                                                    <tr className='align-top'>
                                                        <td><p><strong>Prioridad:</strong></p></td>
                                                        <td><p>{workOrderData.workorder_priority}</p></td>
                                                    </tr>
                                                    <tr className='align-top'>
                                                        <td><p><strong>Descripción:</strong></p></td>
                                                        <td><p>{workOrderData.workorder_name}</p></td>
                                                    </tr>
                                                    <tr className='align-top'>
                                                        <td><p><strong>Comentario:</strong></p></td>
                                                        <td style={{ width: '350px'}}><p>{workOrderData.workorder_comment}</p></td>
                                                    </tr>
                                                    <tr></tr>
                                                    
                                                    <tr className='align-top'>
                                                        <td><p><strong>Fecha de revisión:</strong></p></td>
                                                        <td><p>{workOrderData.workorder_revision_date}</p></td>
                                                    </tr>
                                                    <tr className='align-top'>
                                                        <td className='w-1/3'><p><strong>Código Máquina (QR):</strong></p></td>
                                                        <td><p>{workOrderData.machine_code}</p></td>
                                                    </tr>
                                                    <tr className='align-top'>
                                                        <td><p><strong>Tipo Máquina:</strong></p></td>
                                                        <td><p>{workOrderData.machine_type}</p></td>
                                                    </tr>

                                                    <tr></tr>

                                                    <tr className='align-top'>
                                                        <td><p><strong>Nombre Edificio:</strong></p></td>
                                                        <td><p>{workOrderData.building_name}</p></td>
                                                    </tr>
                                                    <tr className='align-top'>
                                                        <td><p><strong>Dirección Edificio:</strong></p></td>
                                                        <td><p>{workOrderData.building_address}</p></td>
                                                    </tr>
                                                    <tr className='align-top'>
                                                        <td><p><strong>Comuna Edificio:</strong></p></td>
                                                        <td><p>{workOrderData.building_county}</p></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="col-span-3">
                                            {NewworkOrderData && (
                                                <>
                                                    <p><strong className='text-turquesa-500'>OT destino:</strong></p>
                                                    <table className="align-text-bottom text-sm border-separate border-spacing-x-1">
                                                        <tbody>
                                                            <tr className='align-top'>
                                                                <td><p><strong>ID Orden:</strong></p></td>
                                                                <td><p>{NewworkOrderData.workorder_id}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Técnico:</strong></p></td>
                                                                <td><p>{newTechnicianName}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Estado:</strong></p></td>
                                                                <td><p>{NewworkOrderData.workorder_status}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Prioridad:</strong></p></td>
                                                                <td><p>{NewworkOrderData.workorder_priority}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Descripción:</strong></p></td>
                                                                <td><p>{NewworkOrderData.workorder_name}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Comentario:</strong></p></td>
                                                                <td style={{ width: '350px'}}><p>{NewworkOrderData.workorder_comment}</p></td>
                                                            </tr>
                                                            <tr></tr>
                                                            
                                                            <tr className='align-top'>
                                                                <td><p><strong>Fecha de revisión:</strong></p></td>
                                                                <td><p>{NewworkOrderData.workorder_revision_date}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td  className='w-1/3'><p><strong>Código Máquina (QR):</strong></p></td>
                                                                <td><p>{NewworkOrderData.machine_code}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Tipo Máquina:</strong></p></td>
                                                                <td><p>{NewworkOrderData.machine_type}</p></td>
                                                            </tr>

                                                            <tr></tr>

                                                            <tr className='align-top'>
                                                                <td><p><strong>Nombre Edificio:</strong></p></td>
                                                                <td><p>{NewworkOrderData.building_name}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Dirección Edificio:</strong></p></td>
                                                                <td><p>{NewworkOrderData.building_address}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Comuna Edificio:</strong></p></td>
                                                                <td><p>{NewworkOrderData.building_county}</p></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className='flex justify-center mt-5'>
                                <button onClick={handleVolver} className='bg-white mr-3 rounded px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'>
                                    Volver
                                </button>
                                <button type='submit' className='bg-turquesa-500 hover:bg-turquesa-400 font-semibold text-white p-2 rounded-md'>Enviar</button>
                            </div>                  
                        </>
                    )} 
                </form>
            </div>

            {showConfirmationModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-25"></div>
                    <div className="bg-white p-8 rounded-lg shadow-lg relative z-10 w-[600px]">
                        <p className="text-xl font-semibold mb-4">¿Estás seguro de querer {actionToConfirm.toLowerCase()}?</p>
                        <div className="flex justify-center space-x-4">
                            <button onClick={handleConfirmAction} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
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

export default ReasignarSolicitud;
