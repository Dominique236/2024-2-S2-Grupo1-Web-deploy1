import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SPARE_REQUEST_ENDPOINT } from '../utils/apiRoutes';
import axios from 'axios';
import { PulseLoader } from 'react-spinners';
import { useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { Card } from 'primereact/card';

const PopupSolRep = ({ fila, datosAdicionales, onClose }) => {
   
    const [solicitudData, setSolicitudData] = useState({});
    const [ordenData, setOrdenData] = useState({});
    const navigate = useNavigate();
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState('');

    const [isLoadingSolicitud, setIsLoadingSolicitud] = useState(true);
    const [isLoadingOT, setIsLoadingOT] = useState(true);

    const { userRole } = useContext(UserContext);

    useEffect(() => {
        
        const url = `${SPARE_REQUEST_ENDPOINT}/${fila.id}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                // console.log('Data received:', data);
                setSolicitudData(data);
                
            })
            .catch(error => console.error('Error fetching solicitud data:', error))
            .finally(() => setIsLoadingSolicitud(false));
        
        
    }, [fila.id]);



    const ordenes_navigation = () => {
        const filtroWorkOrderId = fila.work_order_id;
        navigate('/ordenes', { state: { filtroWorkOrderId } });
    }


    const handleAprobar = (fila) => {
        navigate(`/asignarrepuestos/${fila.id}`);
    };

    const handleRechazar = (fila) => {
        setActionToConfirm('Rechazar');
        setShowConfirmationModal(true);
    };

    const handleMarcarPendiente = (fila) => {
        setActionToConfirm('Marcar como Pendiente');
        setShowConfirmationModal(true);
    };



    const realizarAccion = async (accion) => {
        const url = `${SPARE_REQUEST_ENDPOINT}/${fila.id}`;
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
            <div className="bg-white rounded-lg shadow-lg relative z-10 w-[1200px]">
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
                        <h2 className="text-teal-600 text-xl font-semibold mb-6">Detalles de la Solicitud de Repuesto</h2>
                        <div className="mb-4">
                            {isLoadingSolicitud ? ( // Conditionally render loading message while loading is true
                                    <div className="flex justify-center items-center mt-4 h-24">
                                        <PulseLoader color="#319795" />
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ display: 'flex' }} className="mb-4">
                                            <div style={{ flex: 1 }}>
                                                <p><strong className="text-teal-600">Creada:</strong> {fila.createdAt}</p>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <p><strong className="text-teal-600">Actualizada:</strong> {fila.updatedAt}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-row gap-5">
                                            <div className="basis-1/2  p-2 border border-gray-300 border-dashed rounded-md">{/*Datos Solicitud*/}
                                                <p><strong className='text-turquesa-500'>Datos solicitud de repuesto:</strong></p>
                                                <table className="align-text-bottom text-sm border-separate border-spacing-x-1">
                                                    <tbody>
                                                        <tr className='align-top'>
                                                            <td><p><strong>ID Solicitud de Repuesto:</strong></p></td>
                                                            <td className='pl-3'><p>{fila.id}</p></td>
                                                        </tr>
                                                        <tr className='align-top'>
                                                            <td><p><strong>Estado:</strong></p></td>
                                                            <td className='pl-3'><p>{fila.state}</p></td>
                                                        </tr>
                                                        <tr className='align-top'>
                                                            <td><p><strong>Cantidad:</strong></p></td>
                                                            <td className='pl-3'><p>{fila.quantity}</p></td>
                                                        </tr>
                                                        
                                                        <tr className='align-top'>
                                                            <td><p><strong>Nombre Repuesto:</strong></p></td>
                                                            <td className='pl-3'><p>{solicitudData.Spare.name}</p></td>
                                                        </tr>
                                                        <tr className='align-top'>
                                                            <td><p><strong>Tipo Repuesto:</strong></p></td>
                                                            <td className='pl-3'><p>{solicitudData.Spare.type}</p></td>
                                                        </tr>
                                                        <tr className='align-top'>
                                                            <td><p><strong>Estado Repuesto:</strong></p></td>
                                                            <td className='pl-3'><p>{solicitudData.Spare.state}</p></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="basis-1/2 p-2 border border-gray-300 border-dashed rounded-md"> {/*Datos Orden*/}
                                                <p><strong className='text-turquesa-500'>Datos orden:</strong></p>
                                                <table className="align-text-bottom text-sm border-separate border-spacing-x-2">
                                                    <tbody>
                                                        <tr className='align-top'>
                                                            <td><p><strong>ID Orden:</strong></p></td>
                                                            <td className='pl-3'><p>{fila.work_order_id}</p></td>
                                                        </tr>
                                                        <tr className='align-top'>
                                                            <td><p><strong>Técnico:</strong></p></td>
                                                            <td className='pl-3'><p>{fila.technitian_id}</p></td>
                                                        </tr>
                                                        <tr className='align-top'>
                                                            <td><p><strong>Estado:</strong></p></td>
                                                            <td className='pl-3'><p>{solicitudData.WorkOrder?.status}</p></td>
                                                        </tr>
                                                        <tr className='align-top'>
                                                            <td><p><strong>Prioridad:</strong></p></td>
                                                            <td className='pl-3'><p>{solicitudData.WorkOrder?.priority}</p></td> 
                                                        </tr>
                                                        <tr className='align-top'>
                                                            <td><p><strong>Descripción:</strong></p></td>
                                                            <td className='pl-3'><p>{solicitudData.WorkOrder?.name}</p></td>
                                                        </tr>
                                                        <tr className='align-top'>
                                                            <td><p><strong>Comentario:</strong></p></td>
                                                            <td className='pl-3'><p>{solicitudData.WorkOrder?.comment}</p></td>
                                                        </tr>
                                                        <tr className='align-top'>
                                                            <td><p><strong>Fecha de revisión:</strong></p></td>
                                                            <td className='pl-3'><p>{solicitudData.WorkOrder?.revision_date}</p></td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            
                                        </div>
                                    </>
                                )} 
                                
                        </div>
                        
                    </div>
                    <div className="rounded-lg sm:flex sm:flex-row-reverse sm:justify-center sm:px-6">
                        {userRole != "tecnico" && (
                            <>
                                <div className="flex justify-center space-x-4">
                                    <div className='mr-10'>

                                        <button onClick={ordenes_navigation} className="ml-5 bg-teal-600 hover:bg-teal-500  text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                                            Ir a OT
                                        </button>
                                    </div>

                                    <div className='ml-10'>
                                        {fila.state === "Pendiente" && (
                                            <>
                                                <button onClick={() => handleAprobar(fila)} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                                                    Asignar Repuestos
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

export default PopupSolRep;
