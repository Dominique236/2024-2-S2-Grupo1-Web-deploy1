import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import { OT_ENDPOINT, MACHINE_ENDPOINT, USER_ENDPOINT, BUILDING_ENDPOINT } from '../utils/apiRoutes';
import DatePicker from 'react-datepicker';
import { PulseLoader } from 'react-spinners';
import 'react-datepicker/dist/react-datepicker.css';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const EditarOrden = () => {
    const navigate = useNavigate();
    const { idOT } = useParams(); // id de la ot
    const [idmachine, setIdmachine] = useState(''); // desplegable
    const [idtechnician, setIdtechnician] = useState(''); // desplegable falta obtener
    const [status, setStatus] = useState(''); // desplegable
    const [fetched, setFetched] = useState(false);

    const [isLoading, setIsLoading] = useState(true);

    const [comment, setComment] = useState(''); // input
    const [name, setName] = useState('');
    const [priority, setPriority] = useState(''); // desplegable
    const [revisiondate, setRevisiondate] = useState(new Date()); // Inicializa la fecha con la fecha actual
    const [allMachineOptions, setAllMachineOptions] = useState([]);
    const [machineOptions, setMachineOptions] = useState([]);
    const [technicianOptions, setTechnicianOptions] = useState([]); // Estado para almacenar las opciones de técnicos

    const [buildingOptions, setBuildingOptions] = useState([]);
    const [idbuilding, setIdbuilding] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const otResponse = await axios.get(OT_ENDPOINT + `/${idOT}`);
                const machineResponse = await axios.get(MACHINE_ENDPOINT);
                const userResponse = await axios.get(USER_ENDPOINT);

                const otData = otResponse.data;
                setIdmachine(otData.machine_id);
                setIdtechnician(otData.workorder_technician_id);
                setStatus(otData.workorder_status);
                setComment(otData.workorder_comment);
                setName(otData.workorder_name);
                setPriority(otData.workorder_priority);

                if (otData.revisiondate) {
                    setRevisiondate(new Date(otData.revisiondate));
                } else {
                    setRevisiondate(new Date());
                }

                const machineOptions = machineResponse.data.map(item => ({
                    value: item.id,
                    label: `${item.code} - ${item.type} - ${item.model}`,
                    building_id: item.building_id
                }));
                setAllMachineOptions(machineOptions);
                // Set machine options based on building id
                setMachineOptions(machineOptions.filter(machine => machine.building_id === otData.building_id));

                const technicianData = userResponse.data.map(user => (
                    user.user_metadata.role === 'tecnico' ? {
                        value: user.user_id,
                        label: `${user.user_metadata.name} ${user.user_metadata.last_name}`,
                    } : null
                ));

                setTechnicianOptions(technicianData.filter(option => option !== null));
                setIdbuilding(otData.building_id); // Set the default building id
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false); // Set loading state to false after data fetching (even if there's an error)
            }
        };

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

        fetchData();
        fetchBuildingsOptions();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!idmachine || !idtechnician || !name) {
            alert('Por favor complete todos los campos.');
            return;
        }

        try {
            const requestData = {
                id_machine: idmachine,
                technician_id: idtechnician,
                status: status,
                comment: comment,
                name: name,
                priority: priority,
                revision_date: revisiondate.toISOString(),
            };

            await axios.put(OT_ENDPOINT + `/${idOT}`, requestData);

            navigate('/ordenes');
        } catch (error) {
            console.error('Error updating work order:', error);
            alert('Hubo un error al actualizar la orden de trabajo. Por favor, inténtelo de nuevo más tarde.');
        }
    };

    const handleVolver = () => {
        navigate('/ordenes');
    };

    const handleSelectBuilding = (value) => {
        const selectedBuildingId = value;
        setIdbuilding(selectedBuildingId);

        if (selectedBuildingId === "") {
            setMachineOptions(allMachineOptions);
        } else {
            const filteredMachineOptions = allMachineOptions.filter(machine => machine.building_id === Number(selectedBuildingId));
            setMachineOptions(filteredMachineOptions);
        }
    };

    const handleSelectChange = (e) => {
        const selectedId = e.target.value;
        setIdmachine(selectedId); // set id maquina
    };

    const handleSelectRecommendedTechnician = async () => {
        try {
            const response = await axios.get(`${OT_ENDPOINT}/${idOT}/recommendTech`);
            const recommendations = response.data.recommendations;

            if (recommendations && recommendations.length > 0) {
                // Encuentra al técnico con el mayor número de órdenes activas en el mismo edificio
                const recommendedTechnician = recommendations.reduce((max, tech) => {
                    return parseInt(tech.active_ots_in_same_building) > parseInt(max.active_ots_in_same_building) ? tech : max;
                }, recommendations[0]);

                // Actualiza el estado del técnico seleccionado
                setIdtechnician(recommendedTechnician.technician_id);
            } else {
                alert('No hay recomendaciones disponibles.');
            }
        } catch (error) {
            console.error('Error fetching recommended technician:', error);
            alert('Hubo un error al obtener el técnico recomendado. Por favor, inténtelo de nuevo más tarde.');
        }
    };

    return (
        <div>
            <NavBar />
            <div className='container mx-auto px-4 mb-10'>
                <h3 className='text-3xl mt-10 first-line:font-bold text-gray-800'>Editar Orden de Trabajo</h3>
                <form onSubmit={handleSubmit} className='bg-white mt-5 p-8 rounded-lg shadow-md '>
                    {isLoading ? (
                        <div className="flex w-full justify-center items-center mt-4 h-24">
                            <PulseLoader color="#319795" />
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-6 gap-4">
                                <div><p>Filtrar por edificio: </p></div>
                                <div className="col-span-2">
                                    <Autocomplete
                                        id="idbuilding"
                                        options={buildingOptions}
                                        getOptionLabel={(option) => option.label}
                                        value={idbuilding !== '' ? buildingOptions.find(option => option.value === idbuilding) : null}
                                        onChange={(event, newValue) => {
                                            if (newValue !== null && newValue !== undefined) {
                                                handleSelectBuilding(newValue.value);
                                            } else {
                                                handleSelectBuilding('');
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Seleccione un Edificio"
                                                variant="outlined"
                                                className='w-full p-2 border border-gray-300 rounded-md'
                                                style={{ width: '300px', fontSize: '14px', minHeight: '35px' }}
                                            />
                                        )}
                                    />
                                </div>

                                <div><p>Selecciona fecha de revisión:</p></div>
                                <div className="col-span-2">
                                    <div>
                                        <DatePicker
                                            selected={revisiondate} // Propiedad que indica la fecha seleccionada
                                            onChange={date => setRevisiondate(date)} // Función que se ejecuta al cambiar la fecha
                                            className='w-full p-2 border border-gray-300 rounded-md' // Clase para estilos CSS
                                            style={{ width: '300px'}}
                                        />
                                    </div>
                                </div>

                                <div><p>Seleccione máquina:</p></div>
                                <div className="col-span-2">
                                    <select 
                                        id='idmachine' value={idmachine} 
                                        onChange={handleSelectChange} 
                                        className='p-2 border border-gray-300 rounded-md'
                                        style={{ width: '300px'}}
                                    >
                                        <option value="">Seleccione una Máquina</option>
                                        {machineOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div><p>Nombre de la OT:</p></div>
                                <div className="col-span-2">
                                    <input 
                                        type='text' id='name' value={name} 
                                        onChange={(e) => setName(e.target.value)} required 
                                        className='p-2 border border-gray-300 rounded-md' 
                                        style={{ width: '300px'}}
                                    />
                                </div>

                                <div><p>Seleccione técnico:</p></div>
                                <div className="col-span-2">
                                    <select 
                                        id='idtechnician' value={idtechnician} 
                                        onChange={(e) => setIdtechnician(e.target.value)} 
                                        className='w-full p-2 border border-gray-300 rounded-md'
                                        style={{ width: '300px'}}
                                    >
                                        <option value="">Seleccione un Técnico</option>
                                        {technicianOptions.map(option => (
                                            <option key={option.value} value={option.value}>{option.label}</option>
                                        ))}
                                    </select>
                                    <button 
                                        type="button" onClick={handleSelectRecommendedTechnician} 
                                        className='bg-turquesa-500 hover:bg-turquesa-400 text-white text-sm font-semibold p-2 rounded-md mt-3'
                                        style={{ width: '200px'}}
                                    >
                                        Usar técnico recomendado
                                    </button>
                                </div>

                                <div><p>Comentario:</p></div>
                                <div className="col-span-2">
                                    <textarea 
                                        type='text' id='comment' value={comment} 
                                        onChange={(e) => setComment(e.target.value)} required 
                                        className='w-full p-2 border border-gray-300 rounded-md' 
                                        style={{ width: '300px', height: '100px'}}
                                    />
                                </div>

                                <div><p>Seleccione status:</p></div>
                                <div className="col-span-2">
                                    <select 
                                        id='status' value={status} onChange={(e) => setStatus(e.target.value)} 
                                        className='w-full p-2 border border-gray-300 rounded-md'
                                        style={{ width: '300px'}}
                                    >
                                        <option value="Inactiva">Inactiva</option>
                                        <option value="Por Visitar">Por Visitar</option>
                                        <option value="Resuelta">Resuelta</option>
                                    </select>
                                </div>

                                <div><p></p></div>
                                <div className="col-span-2" style={{ width: '300px'}}></div>

                                <div><p>Seleccione prioridad:</p></div>
                                <div className="col-span-2">
                                    <select 
                                        id='priority' value={priority} onChange={(e) => setPriority(e.target.value)} 
                                        className='w-full p-2 border border-gray-300 rounded-md'
                                        style={{ width: '300px'}}
                                    >
                                        <option value="Alta">Alta</option>
                                        <option value="Media">Media</option>
                                        <option value="Baja">Baja</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    <div className='mt-5 flex justify-center'>
                        <button onClick={handleVolver} className='bg-white mr-3 rounded px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'>
                            Volver
                        </button>
                        <button type='submit' className='bg-naranja-500 hover:bg-naranja-400 font-semibold text-white p-2 rounded-md'>
                            Enviar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditarOrden;
