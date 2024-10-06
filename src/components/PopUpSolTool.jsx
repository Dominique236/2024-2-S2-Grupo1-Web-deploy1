import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { TOOL_REQUEST_ENDPOINT, WAREHOUSE_ENDPOINT, TOOL_ENDPOINT } from '../utils/apiRoutes';
import axios from 'axios';
import { PulseLoader } from 'react-spinners';
import { UserContext } from '../contexts/UserContext';
import { Card } from 'primereact/card';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const PopupSolRep = ({ fila, onClose }) => {
    const [solicitudData, setSolicitudData] = useState({});
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const navigate = useNavigate();
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [actionToConfirm, setActionToConfirm] = useState('');

    const [isLoadingSolicitud, setIsLoadingSolicitud] = useState(true);
    const { userRole } = useContext(UserContext);

    useEffect(() => {
        const fetchSolicitudData = async () => {
            try {
                const url = `${TOOL_REQUEST_ENDPOINT}/${fila.id}`;
                const response = await fetch(url);
                const data = await response.json();
                // console.log('Data received:', data);
                setSolicitudData(data);
            } catch (error) {
                console.error('Error fetching solicitud data:', error);
            } finally {
                setIsLoadingSolicitud(false);
            }
        };

        fetchSolicitudData();
    }, [fila.id]);

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                const response = await axios.get(WAREHOUSE_ENDPOINT);
                setWarehouses(response.data);
            } catch (error) {
                console.error('Error fetching warehouses:', error);
            }
        };

        if (actionToConfirm === 'Retornado' || actionToConfirm === 'Marcar como Solicitado') {
            fetchWarehouses();
        }
    }, [actionToConfirm]);

    const handleAceptar = (fila) => {
        navigate(`/asignarherramientas/${fila.id}`);
    };

    const handleRechazar = (fila) => {
        setActionToConfirm('Rechazar');
        setShowConfirmationModal(true);
    };

    const handleMarcarSolicitado = (fila) => {
        setActionToConfirm('Marcar como Solicitado');
        setShowConfirmationModal(true);
    };

    const handleAcusoRecibo = (fila) => {
        setActionToConfirm('Acuso recibo');
        setShowConfirmationModal(true);
    };

    const handleRetornado = (fila) => {
        setActionToConfirm('Retornado');
        setShowConfirmationModal(true);
    };

    const realizarAccion = async (accion) => {
        if ((accion === 'Retornado' || accion === 'Marcar como Solicitado') && !selectedWarehouse) {
            alert("Seleccione una bodega de destino para la herramienta");
            return;
        }

        const url = `${TOOL_REQUEST_ENDPOINT}/${fila.id}`;
        let body = {};
        switch (accion) {
            case 'Aceptar':
                body = { status: 'Aceptada' };
                break;
            case 'Rechazar':
                body = { status: 'Rechazada' };
                break;
            case 'Marcar como Solicitado':
                body = { status: 'Solicitada',
                         tool_id: null };
                try {
                    await axios.put(`${TOOL_ENDPOINT}/${fila.tool_id}`, {
                        technitian_id: null,
                        warehouse_id: selectedWarehouse,
                    });
                    window.location.reload();
                } catch (error) {
                    console.error('Error al', accion.toLowerCase(), ':', error);
                }
                break;
            case 'Acuso recibo':
                body = { status: 'Acuso recibo' };
                break;
            case 'Retornado':
                body = { status: 'Retornada' };
                try {
                    await axios.put(`${TOOL_ENDPOINT}/${fila.tool_id}`, {
                        technitian_id: null,
                        warehouse_id: selectedWarehouse,
                    });
                    window.location.reload();
                } catch (error) {
                    console.error('Error al', accion.toLowerCase(), ':', error);
                }
                break;
            default:
                break;
        }

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
                        <h2 className="text-teal-600 text-xl font-semibold mb-6">Detalles de la Solicitud de Herramienta</h2>
                        <div className="mb-4">
                            {isLoadingSolicitud ? (
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
                                        <div className="basis-1/2  p-2 border border-gray-300 border-dashed rounded-md">
                                            <p><strong className='text-turquesa-500'>Datos solicitud de herramienta:</strong></p>
                                            <table className="align-text-bottom text-sm border-separate border-spacing-x-1">
                                                <tbody>
                                                    <tr className='align-top'>
                                                        <td><p><strong>ID Solicitud de Herramienta:</strong></p></td>
                                                        <td className='pl-3'><p>{fila.id}</p></td>
                                                    </tr>
                                                    <tr className='align-top'>
                                                        <td><p><strong>Estado:</strong></p></td>
                                                        <td className='pl-3'><p>{fila.status}</p></td>
                                                    </tr>
                                                    <tr className='align-top'>
                                                        <td><p><strong>Nombre Herramienta:</strong></p></td>
                                                        <td className='pl-3'><p>{solicitudData.tool_name}</p></td>
                                                    </tr>
                                                    <tr className='align-top'>
                                                        <td><p><strong>Modelo Herramienta:</strong></p></td>
                                                        <td className='pl-3'><p>{solicitudData.tool_model}</p></td>
                                                    </tr>
                                                    <tr className='align-top'>
                                                        <td><p><strong>ID herramienta asignada:</strong></p></td>
                                                        <td className='pl-3'><p>{solicitudData.tool_id}</p></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="basis-1/2 p-2 border border-gray-300 border-dashed rounded-md">
                                            <p><strong className='text-turquesa-500'>Datos Técnico:</strong></p>
                                            <table className="align-text-bottom text-sm border-separate border-spacing-x-2">
                                                <tbody>
                                                    <tr className='align-top'>
                                                        <td><p><strong>Nombre Técnico:</strong></p></td>
                                                        <td className='pl-3'><p>{fila.technitian?.name} {fila.technitian?.last_name}</p></td>
                                                    </tr>
                                                    <tr className='align-top'>
                                                        <td><p><strong>RUT Técnico:</strong></p></td>
                                                        <td className='pl-3'><p>{fila.technitian?.rut}</p></td>
                                                    </tr>
                                                    <tr className='align-top'>
                                                        <td><p><strong>Teléfono Técnico:</strong></p></td>
                                                        <td className='pl-3'><p>{fila.technitian?.phone}</p></td>
                                                    </tr>
                                                    <tr className='align-top'>
                                                        <td><p><strong>Correo Técnico:</strong></p></td>
                                                        <td className='pl-3'><p>{fila.technitian?.email}</p></td>
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
                        {userRole !== "tecnico" && (
                            <>
                                <div className="flex justify-center space-x-4">
                                    <div className='ml-10'>
                                        {fila.status === "Solicitada" && (
                                            <>
                                                <button onClick={() => handleAceptar(fila)} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                                                    Asignar Herramienta
                                                </button>
                                                <button onClick={() => handleRechazar(fila)} className="ml-5 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                                                    Rechazar
                                                </button>
                                            </>
                                        )}
                                        {(fila.status === "Aceptada" || fila.status === "Rechazada") && (
                                            <button onClick={() => handleMarcarSolicitado(fila)} className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                                                Marcar como Solicitada
                                            </button>
                                        )}
                                        {fila.status === "Acuso recibo" && (
                                            <>
                                                <button onClick={() => handleRetornado(fila)} className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                                                    Marcar como Retornado
                                                </button>
                                            </>
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
                            {(actionToConfirm === 'Retornado' || actionToConfirm === 'Marcar como Solicitado') && (
                                <Autocomplete
                                    options={warehouses}
                                    getOptionLabel={(option) => option.name}
                                    onChange={(event, newValue) => setSelectedWarehouse(newValue ? newValue.id : null)}
                                    renderInput={(params) => <TextField {...params} label="Seleccionar Bodega" />}
                                    className="mb-4"
                                />
                            )}
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
};

export default PopupSolRep;
