import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import { PulseLoader } from 'react-spinners';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { OT_ENDPOINT, MACHINE_ENDPOINT, USER_ENDPOINT, BUILDING_ENDPOINT, SUBTASK_ENDPOINT } from '../utils/apiRoutes';

const CrearOrden = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    const [idmachine, setIdmachine] = useState('');
    const [idtechnician, setIdtechnician] = useState('');
    const [idbuilding, setIdbuilding] = useState('');
    const [comment, setComment] = useState('');
    const [selectedTaskIds, setSelectedTaskIds] = useState([]); // Ciclo 1: estado para subtarea seleccionada
    const [name, setName] = useState('Diagnóstico Lavadora');
    const [taskOptions, setTaskOptions] = useState([]); // Ciclo 1: nuevo estado para todas las subtareas
    const [allMachineOptions, setAllMachineOptions] = useState([]); // Nuevo estado para todas las máquinas
    const [machineOptions, setMachineOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [buildingOptions, setBuildingOptions] = useState([]);
    const [allBuildingOptions, setAllBuildingOptions] = useState([]);

    useEffect(() => {
        const fetchBuildingsOptions = async () => {
            try {
                const response = await axios.get(BUILDING_ENDPOINT);
                const buildingSelectOptions = response.data.map(item => ({
                    value: item.id,
                    label: `${item.name} - ${item.address} - ${item.county}`,
                }));
                setBuildingOptions(buildingSelectOptions);
                setAllBuildingOptions(buildingSelectOptions);
            } catch (error) {
                console.error('Error fetching building options:', error);
            }
        };

        const fetchMachineOptions = async () => {
            try {
                const response = await axios.get(MACHINE_ENDPOINT);
                const selectOptions = response.data.map(item => ({
                    value: item.code,
                    label: `${item.code} - ${item.type} - ${item.model}`,
                    table_id: item.id,
                    building_id: item.building_id
                }));
                setMachineOptions(selectOptions);
                setAllMachineOptions(selectOptions);
            } catch (error) {
                console.error('Error fetching machine options:', error);
            }
        };

        const fetchUserOptions = async () => {
            try {
                const response = await axios.get(USER_ENDPOINT);
                const technicianUsers = response.data.map(user => (
                    user.user_metadata.role === 'tecnico' ? {
                        value: user.user_id,
                        label: `${user.user_metadata.name} ${user.user_metadata.last_name}`,
                    } : null
                ));
                const tecnicos = technicianUsers.filter(user => user !== null);
                setUserOptions(tecnicos);
            } catch (error) {
                console.error('Error fetching user options:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBuildingsOptions();
        fetchMachineOptions();
        fetchUserOptions();
    }, []);

    useEffect(() => {
        const fetchTaskOptions = async () => {
            if (idmachine) { 
                try {
                    const response = await axios.get(`${SUBTASK_ENDPOINT}/machine/${idmachine}`);
                    setTaskOptions(response.data);
                } catch (error) {
                    console.error('Error fetching task options:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
    
        fetchTaskOptions();
    }, [idmachine]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!idmachine || !idtechnician || !name) {
            alert('Por favor complete todos los campos.');
            return;
        }

        try {
            const requestData = {
                code: idmachine,
                technician_id: idtechnician,
                name: name,
                comment: comment,
                subtasks: selectedTaskIds,
                type: "Reparacion"
            };
            const response = await axios.post(OT_ENDPOINT, requestData);

            if (response.data.message === 'Ya hay una OT para esta máquina.') {
                alert('Ya hay una OT para esta máquina.');
                return;
            }
            navigate('/ordenes');
        } catch (error) {
            console.error('Error creating work order:', error);
            alert('Hubo un error al crear la orden de trabajo. Por favor, inténtelo de nuevo más tarde.');
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

    const handleSelectMachine = (value) => {
        const selectedMachineId = value;
        setIdmachine(selectedMachineId);
        const selectedMachine = allMachineOptions.filter(machine => machine.value === value);
        setIdbuilding(selectedMachine[0].building_id)
    };

    const handleSelectChange = (e) => {
        const selectedId = e.target.value;
        setIdmachine(selectedId);
    };

    const handleSelectRecommendedTechnician = async (e) => {
        if (!idbuilding) {
            alert('Por favor, seleccione un edificio.');
            return;
        }

        try {
            const response = await axios.get(`${OT_ENDPOINT}/recommendTech/building/${idbuilding}`);
            const recommendations = response.data.recommendations;

            if (recommendations.length > 0) {
                // Encontrar el técnico con la mayor cantidad de órdenes activas en el mismo edificio
                const recommendedTechnician = recommendations.reduce((prev, current) => 
                    (parseInt(current.active_ots_in_same_building) > parseInt(prev.active_ots_in_same_building)) ? current : prev
                );

                // Actualizar el estado del técnico seleccionado
                setIdtechnician(recommendedTechnician.technician_id);
            } else {
                alert('No se encontraron recomendaciones de técnicos para este edificio.');
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
                <h3 className='text-3xl mt-10 first-line:font-bold text-gray-800'>Crear Orden de Trabajo</h3>
                <form onSubmit={handleSubmit} className='mt-5 bg-white p-6 rounded-lg shadow-md '>
                    {isLoading ? (
                        <div className="flex w-full justify-center items-center mt-4 h-24">
                            <PulseLoader color="#319795" />
                        </div>
                    ) : (
                        <>
                            <table className='align-text-bottom border-separate border-spacing-3'>
                                <tbody>
                                    <tr className='items-center'>
                                        <td><label htmlFor='warehouse_name' className='block'>Filtrar por edificio:</label></td>
                                        <td className='full'>

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
                                                  style={{ minWidth: '600px', fontSize: '16px',  minHeight: '40px' }}
                                                />
                                              )}
                                            />

                                        </td>
                                    </tr>
                                    <tr className='items-center'>
                                        <td><label htmlFor='machine_name' className='block'>Seleccione máquina:</label></td>
                                        <td className='full'>
                                            <Autocomplete
                                                id="idmachine"
                                                options={machineOptions}
                                                getOptionLabel={(option) => option.label}
                                                value={idmachine !== '' ? machineOptions.find(option => option.value === idmachine) : null}
                                                onChange={(event, newValue) => {
                                                    if (newValue !== null && newValue !== undefined) {
                                                        handleSelectMachine(newValue.value); // Actualiza el estado idmachine en el componente padre
                                                    } else {
                                                        handleSelectMachine(''); // Si el valor es null o undefined, asigna un valor vacío al estado idmachine
                                                    }
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Seleccione una Máquina"
                                                        variant="outlined"
                                                        className='w-full p-2 border border-gray-300 rounded-md'
                                                        style={{ minWidth: '600px', fontSize: '16px', minHeight: '40px' }}
                                                    />
                                                )}
                                            />
                                        </td>
                                    </tr>
                                    <tr className='items-center'>
                                        <td><label htmlFor='warehouse_name' className='block'>Seleccione técnico:</label></td>
                                        <td className='full'>
                                            <select id='idtechnician' value={idtechnician} onChange={(e) => setIdtechnician(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md'>
                                                <option value="">Seleccione un Técnico</option>
                                                {userOptions.map(option => (
                                                    <option key={option.value} value={option.value}>{option.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <div className='flex justify-center'>
                                                <button 
                                                    type='button' onClick={handleSelectRecommendedTechnician} 
                                                    className='bg-turquesa-500 text-sm hover:bg-turquesa-400 font-semibold text-white p-2 rounded-md'
                                                >
                                                    Usar técnico recomendado
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr className='items-center'>
                                        <td><label htmlFor='warehouse_name' className='block'>Descripción OT:</label></td>
                                        <td className='full'>
                                            <input type='text' id='name' value={name} onChange={(e) => setName(e.target.value)} required className='w-full p-2 border border-gray-300 rounded-md' />
                                        </td>
                                    </tr>
                                    <tr className='items-center'> 
                                        <td><label htmlFor='warehouse_name' className='block'>Comentario OT:</label></td>
                                        <td className='full'>
                                            <input type='text' id='comment' value={comment} onChange={(e) => setComment(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md' />
                                        </td>
                                    </tr>
                                    <tr className='items-center'> 
                                        <td><label htmlFor='warehouse_name' className='block'>Subtareas OT:</label></td>
                                        <td className='full'>
                                        <Autocomplete
                                            multiple
                                            id="task"
                                            options={taskOptions}
                                            getOptionLabel={(option) => option.description} 
                                            onChange={(event, newValue) => {
                                                const selectedTaskIds = newValue.map(task => task.id);  
                                                setSelectedTaskIds(selectedTaskIds);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Seleccione una Subtarea"
                                                    variant="outlined"
                                                    className='w-full p-2 border border-gray-300 rounded-md'
                                                    style={{ minWidth: '600px', fontSize: '16px', minHeight: '40px' }}
                                                />
                                            )}
                                        />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </>
                    )}
                    <div className='mt-5 flex justify-center'>
                        <button 
                            onClick={handleVolver} 
                            className='bg-white mr-3 rounded px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                        >
                            Volver
                        </button>
                        <button type='submit' className='bg-naranja-500 ml-3 hover:bg-naranja-400 text-white font-semibold p-2 rounded-md'>
                            Crear Orden
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CrearOrden;
