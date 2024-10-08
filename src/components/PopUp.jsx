import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SOLICITUD_ENDPOINT, OT_ENDPOINT } from '../utils/apiRoutes';
import axios from 'axios';
import { PulseLoader } from 'react-spinners';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Card } from 'primereact/card';

const Popup = ({ fila, datosAdicionales, onClose }) => {
    const esSolicitud = fila.hasOwnProperty('work_order_id');
    const [solicitudData, setSolicitudData] = useState({});
    const [ordenData, setOrdenData] = useState({});
    const navigate = useNavigate();
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState('');

    const [isLoadingSolicitud, setIsLoadingSolicitud] = useState(true);
    const [isLoadingOT, setIsLoadingOT] = useState(true);

    const { userRole } = useContext(UserContext);

    useEffect(() => {
        if (esSolicitud) {
            const url = `${SOLICITUD_ENDPOINT}/${fila.id}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    // console.log('Data received:', data);
                    setSolicitudData(data);
                    //console.log("datosadicionales ", datosAdicionales)
                })
                .catch(error => console.error('Error fetching solicitud data:', error))
                .finally(() => setIsLoadingSolicitud(false));
        }
        if (!esSolicitud) {
            const url = `${OT_ENDPOINT}/${fila.id}`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    // console.log('Data received:', data);
                    // console.log("djksajdlksajkdlsadlsa", data.revision_date)
                    data.revision_date = new Date(data.revision_date).toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'numeric', 
                        day: 'numeric', 
                        hour: 'numeric', 
                        minute: 'numeric' 
                    });
                    // console.log("sadsakdjals", data.revision_date)
                    setOrdenData(data);
                    //console.log("datosadicionales ", datosAdicionales)
                })
                .catch(error => console.error('Error fetching orden data:', error))
                .finally(() => setIsLoadingOT(false));
        }
    }, [esSolicitud, fila.id]);

    const chat_navigation = () => {
        
        navigate('/chat', { state: { fila, datosAdicionales } });
    }

    const solicitudes_navigation = () => {
        const filtroWorkOrderId = fila.id;
        navigate('/solicitudes', { state: { filtroWorkOrderId } });
    }

    const ordenes_navigation = () => {
        const filtroWorkOrderId = fila.work_order_id;
        navigate('/ordenes', { state: { filtroWorkOrderId } });
    }

    const editarOT_navigation = () => {
        navigate('/editarorden/' + fila.id, { state: { fila } });
    }

    const reasignarSol_navigation = () => {
        navigate('/reasignarsolicitud/' + fila.id, { state: { fila: fila } });
      };

    const handleAprobar = (fila) => {
        setActionToConfirm('Aceptar');
        setShowConfirmationModal(true);
    };

    const handleRechazar = (fila) => {
        setActionToConfirm('Rechazar');
        setShowConfirmationModal(true);
    };

    const handleMarcarPendiente = (fila) => {
        setActionToConfirm('Marcar como Pendiente');
        setShowConfirmationModal(true);
    };

    const handleEnviarCorreo = () => {
        navigate('/email/' + fila.id, { state: { fila } });
    };

    const realizarAccion = async (accion) => {
        const url = `${SOLICITUD_ENDPOINT}/${fila.id}`;
        let body = {};
        switch (accion) {
            case 'Aceptar':
                body = { state: 'Aceptada' };
                break;
            case 'Rechazar':
                body = { state: 'Rechazada' };
                break;
            case 'Marcar como Pendiente':
                body = { state: 'Pendiente' };
                break;
            default:
                break;
        }
        // console.log("url: " + url)
        try {
            const response = await axios.put(url, body);
            // console.log(accion, fila, 'Response:', response.data);
            window.location.reload();
        } catch (error) {
            console.error('Error al', accion.toLowerCase(), ':', error);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {showConfirmationModal && (
                <div className="fixed inset-0 bg-black opacity-25"></div>
            )}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="card bg-white rounded-lg shadow-lg relative z-10 w-[1350px]">
                <Card className="md:w-25rem p-0">
            
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div>
                        <div className="mb-4">
                            {esSolicitud ? (
                                <>
                                    {isLoadingSolicitud ? ( // Conditionally render loading message while loading is true
                                        <div className="flex justify-center items-center mt-4 h-24">
                                            <PulseLoader color="#319795" />
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ flex: 1 }} className='aling-text-bottom'>
                                                    <h2 className="text-teal-600 text-xl font-semibold mb-6">Detalles de la Solicitud</h2>
                                                </div>
                                                <div style={{ flex: 1 }} className='text-md aling-text-bottom'>
                                                    <div style={{ display: 'flex' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <p><strong className="text-teal-600">Creada:</strong> {fila.createdAt}</p>
                                                        </div>    
                                                        <div style={{ flex: 1 }}>
                                                            <p><strong className="text-teal-600">Actualizada:</strong> {fila.updatedAt}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-row gap-4">
                                                <div className="basis-1/ p-2 border border-gray-300 border-dashed rounded-md">{/*Datos Solicitud*/}
                                                    <p><strong className='text-turquesa-500'>Datos solicitud:</strong></p>
                                                    <table className="align-text-bottom text-sm border-separate border-spacing-x-2">
                                                        <tbody>
                                                            <tr className='align-top'>
                                                                <td><p><strong>ID Solicitud:</strong></p></td>
                                                                <td><p>{fila.id}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>ID OT:</strong></p></td>
                                                                <td><p>{datosAdicionales[0].work_order_id}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Estado:</strong></p></td>
                                                                <td><p>{fila.state}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Razón Solicitud:</strong></p></td>
                                                                <td><p>{datosAdicionales[0].comment}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Recomendación Técnico:</strong></p></td>
                                                                <td><p>{fila.technitians_recommendation}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Detalles Recomendación:</strong></p></td>
                                                                <td><p>{fila.technitians_compensation}</p></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="basis-1/4  p-2 border border-gray-300 border-dashed rounded-md">{/*Datos Máquina*/}
                                                    <p><strong className='text-turquesa-500'>Datos máquina:</strong></p>
                                                    <table className="text-sm border-separate border-spacing-x-2">

                                                        <tbody>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Código Máquina (QR):</strong></p></td>
                                                                <td><p>{solicitudData.machine_code}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Tipo de Máquina:</strong></p></td>
                                                                <td><p>{solicitudData.machine_type}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Modelo Máquina:</strong></p></td>
                                                                <td><p>{solicitudData.machine_model}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Dirección Edificio:</strong></p></td>
                                                                <td><p>{solicitudData.building_address}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Comuna Edificio:</strong></p></td>
                                                                <td><p>{solicitudData.building_county}</p></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="basis-1/4  p-2 border border-gray-300 border-dashed rounded-md">{/*Datos Cliente*/}
                                                    <p><strong className='text-turquesa-500'>Datos cliente:</strong></p>
                                                    
                                                    <table className="align-text-bottom text-sm border-separate border-spacing-x-2">
                                                        <tbody>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Nombre Cliente:</strong></p></td>
                                                                <td><p>{solicitudData.client_name}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Correo:</strong></p></td>
                                                                <td><p>{solicitudData.client_email}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>RUT:</strong></p></td>
                                                                <td><p>{solicitudData.client_rut}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Teléfono:</strong></p></td>
                                                                <td><p>{solicitudData.client_phone}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Departamento:</strong></p></td>
                                                                <td><p>{solicitudData.client_department}</p></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="basis-1/4 p-2 border border-gray-300 border-dashed rounded-md">{/*Datos banco*/}
                                                    <p><strong className='text-turquesa-500'>Datos bancarios:</strong></p>
                                                    <table className="text-sm border-separate border-spacing-x-2">
                                                        <tbody>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Tipo de Devolución:</strong></p></td>
                                                                <td><p>{datosAdicionales[0].money_return_type}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Dinero Solicitado:</strong></p></td>
                                                                <td><p>${datosAdicionales[0].requested_money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Banco:</strong></p></td>
                                                                <td><p>{datosAdicionales[0].bank}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Tipo de Cuenta:</strong></p></td>
                                                                <td><p>{datosAdicionales[0].account_type}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Número de Cuenta:</strong></p></td>
                                                                <td><p>{datosAdicionales[0].account_number}</p></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <>
                                    {isLoadingOT ? (
                                        <div className="flex justify-center items-center mt-4 h-24">
                                            <PulseLoader color="#319795" />
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex' }}>
                                                <div style={{ flex: 1 }} className='aling-text-bottom'>
                                                    <h2 className="text-teal-600 text-xl font-semibold mb-6">Detalles de la Orden de Trabajo</h2>
                                                </div>
                                                <div style={{ flex: 1 }} className='text-md aling-text-bottom'>
                                                    <div style={{ display: 'flex' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <p><strong className="text-teal-600">Creada:</strong> {fila.createdAt}</p>
                                                        </div>    
                                                        <div style={{ flex: 1 }}>
                                                            <p><strong className="text-teal-600">Actualizada:</strong> {fila.updatedAt}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-row gap-5 ml-5 mr-5">
                                                <div className="basis-1/3 p-2 border border-gray-300 border-dashed rounded-md">{/*Datos Orden*/}
                                                    <p><strong className='text-turquesa-500'>Datos orden:</strong></p>
                                                    <table className="align-text-bottom text-sm border-separate border-spacing-x-2">
                                                        <tbody>
                                                            <tr className='align-top'>
                                                                <td><p><strong>ID Orden:</strong></p></td>
                                                                <td ><p>{fila.id}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Técnico:</strong></p></td>
                                                                <td ><p>{fila.technician_id}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Estado:</strong></p></td>
                                                                <td ><p>{fila.status}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Prioridad:</strong></p></td>
                                                                <td ><p>{fila.priority}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Descripción:</strong></p></td>
                                                                <td><p>{fila.name}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Comentario:</strong></p></td>
                                                                <td><p>{fila.comment}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Fecha de revisión:</strong></p></td>
                                                                <td><p>{fila.revision_date}</p></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="basis-1/3 p-2 border border-gray-300 border-dashed rounded-md">{/*Datos Máquina*/}
                                                    <p><strong className='text-turquesa-500'>Datos máquina:</strong></p>
                                                    <table className="align-text-bottom text-sm border-separate border-spacing-x-2">
                                                        <tbody>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Código Máquina (QR):</strong></p></td>
                                                                <td><p>{fila.Machine.code}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Quantum Máquina:</strong></p></td>
                                                                <td><p>{fila.Machine.cuantum_id}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Tipo Máquina:</strong></p></td>
                                                                <td><p>{fila.Machine.type}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Modelo Máquina:</strong></p></td>
                                                                <td><p>{fila.Machine.model}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Proveedor:</strong></p></td>
                                                                <td><p>{fila.Machine.supplier}</p></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="basis-1/3 p-2 border border-gray-300 border-dashed rounded-md">{/*Datos Edificio*/}
                                                    <p><strong className='text-turquesa-500'>Datos edificio:</strong></p>
                                                    <table className="align-text-bottom text-sm border-separate border-spacing-x-2">
                                                        <tbody>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Nombre Edificio:</strong></p></td>
                                                                <td><p>{ordenData?.building_name}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Dirección Edificio:</strong></p></td>
                                                                <td><p>{ordenData?.building_address}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Comuna Edificio:</strong></p></td>
                                                                <td><p>{ordenData?.building_county}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Teléfono Administrador:</strong></p></td>
                                                                <td><p>{ordenData?.building_admin_phone_number}</p></td>
                                                            </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Correo Administrador:</strong></p></td>
                                                                <td><p>{ordenData?.building_admin_email}</p></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="basis-1/3 p-2 border border-gray-300 border-dashed rounded-md">{/*Datos Subtareas*/}
                                                    <p><strong className='text-turquesa-500'>Datos Subtareas:</strong></p>
                                                    <table className="align-text-bottom text-sm border-separate border-spacing-x-2">
                                                        <tbody>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Tiempo estimado:</strong></p></td>
                                                                <td><p>{ordenData?.total_man_hours ? ordenData?.total_man_hours.toFixed(1) : "--"} horas</p></td>
                                                                </tr>
                                                            <tr className='align-top'>
                                                                <td><p><strong>Subtareas:</strong></p></td>
                                                                <td>
                                                                    {ordenData?.subtask_descriptions && ordenData?.subtask_descriptions.length > 0 ? (
                                                                        <ul>
                                                                            {ordenData?.subtask_descriptions.map((subtask, index) => (
                                                                                <li key={index}>- {subtask}</li>
                                                                            ))}
                                                                        </ul>
                                                                    ) : (
                                                                        <p>Sin subtareas</p>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                        
                    </div>


                    <div className="sm:flex sm:flex-row-reverse sm:justify-center sm:px-6">
                        {esSolicitud && userRole !== "tecnico" && (
                            <>
                                <div className="flex justify-center space-x-4">
                                    <div className='mr-10'>
                                        {userRole === 'admin' && (
                                            <button onClick={reasignarSol_navigation} className="bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 px-4 rounded-md transition duration-300"> 
                                                Reasignar OT
                                            </button>
                                        )}
                                        <button onClick={ordenes_navigation} className="ml-5 bg-teal-600 hover:bg-teal-500  text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                                            Ir a OT
                                        </button>
                            
                                            <button onClick={handleEnviarCorreo} className="ml-5 bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                                                Enviar Correo
                                            </button>
                            
                                    </div>

                                    <div className='ml-10'>
                                        {fila.state === "Pendiente" && (
                                            <>
                                                <button onClick={() => handleAprobar(fila)} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                                                    Aprobar
                                                </button>
                                                <button onClick={() => handleRechazar(fila)} className="ml-5 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                                                    Rechazar
                                                </button>
                                            </>
                                        )}
                                        {(fila.state === "Aceptada" || fila.state === "Rechazada") && (
                                            <button onClick={() => handleMarcarPendiente(fila)} className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                                                Marcar como Pendiente
                                            </button>
                                        )}

                                    </div>

                                    

                                </div>
                            </>
                        )}
                        {!esSolicitud && userRole !== 'finanzas' && (
                            <>
                                <div className="flex justify-center space-x-4">
                                    <button onClick={editarOT_navigation} className="bg-teal-600 hover:bg-teal-500  text-white font-semibold py-2 px-4 rounded-md transition duration-300"> 
                                        Editar OT
                                    </button>

                                    <button onClick={solicitudes_navigation} className="ml-5 bg-teal-600 hover:bg-teal-500  text-white font-semibold py-2 px-4 rounded-md transition duration-300"> 
                                        Solicitudes Asociadas
                                    </button>
                                    <button onClick={chat_navigation} className="bg-blue-500 hover:bg-blue-400 text-white font-semibold py-2 px-4 rounded-md transition duration-300"> 
                                        Ver Chat
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </Card>
                            
                    
                {showConfirmationModal && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="fixed inset-0 bg-black opacity-25"></div>
                        <div className="bg-white p-8 rounded-lg shadow-lg relative z-10 w-[600px]">
                            <p className="text-xl font-semibold text-center mb-4">¿Estás seguro de querer {actionToConfirm.toLowerCase()}?</p>
                            <div className="flex justify-center space-x-4">
                                <button onClick={() => realizarAccion(actionToConfirm)} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
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
        </div>
    );
}

export default Popup;
