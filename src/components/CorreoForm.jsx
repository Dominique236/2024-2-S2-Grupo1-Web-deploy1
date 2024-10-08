import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BUILDING_ENDPOINT, OT_ENDPOINT, CORREO_SUBMIT_ENDPOINT } from '../utils/apiRoutes'; 
import NavBar from './NavBar';
import { Button } from 'primereact/button'; 
import DatePicker from 'react-datepicker';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

const CorreoForm = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedBuildings, setSelectedBuildings] = useState([]);
    const [buildingOptions, setBuildingOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [filteredOTs, setFilteredOTs] = useState([]); 

    // Fetch building list from the server
    useEffect(() => {
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
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!startDate || !endDate || selectedBuildings.length === 0) {
            alert('Please fill out all fields');
            return;
        }

        const selectedBuildingIds = selectedBuildings.map(building => building.value);
        await fetchRequestData(startDate, endDate, selectedBuildingIds);
    };

    const fetchRequestData = async (startDate, endDate, selectedBuildingIds) => {
        setIsLoading(true);
        let allFilteredOTs = []; // Array to store all OTs from different buildings
    
        try {
            const start = startDate.toISOString();
            const end = endDate.toISOString();
    
            // Loop through each building ID and fetch the corresponding OTs
            for (const buildingId of selectedBuildingIds) {
                const response = await axios.get(`${OT_ENDPOINT}?startDate=${start}&endDate=${end}&buildingID=${buildingId}&status=Resuelta`);
                
                if (response.status !== 200) {
                    throw new Error(`Failed to fetch OT data for building ID: ${buildingId}`);
                }
    
                const data = response.data;
    
                // Add the fetched OTs to the allFilteredOTs array
                allFilteredOTs = [...allFilteredOTs, ...data];
            }
    
            // Store all the filtered OTs in the state
            setFilteredOTs(allFilteredOTs);
    
        } catch (error) {
            console.error('Error fetching OT data:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Generate email text from filtered OTs
    const generateEmailText = () => {
        if (filteredOTs.length === 0) return 'No se encontraron OTs.';


        return filteredOTs.map((ot) => 
            `Edificio: ${ot.Machine.Building.name}\nMáquina: ${ot.Machine.type}\nDescripción: ${ot.name}\nComentario: ${ot.comment}\nEstado: ${ot.status}\n\n`
        ).join('');
    };

    // Generate subject and recipient
    const generateEmailSubject = () => {
        if (!startDate || !endDate) return '';
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];
        return `OTs resuletas entre ${start} y ${end}`;
    };

    // Function to send email data to the backend
    const sendEmailData = async () => {
        const emailData = generateEmailData();
   
        try {
            const response = await axios.post(CORREO_SUBMIT_ENDPOINT, emailData);
            alert('Email data sent successfully.');
        } catch (error) {
            if (error.response) {
                // Server responded with a status code outside of 2xx range
                console.error('Response error data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            } else if (error.request) {
                // Request was made but no response was received
                console.error('No response received:', error.request);
            } else {
                // Something happened in setting up the request
                console.error('Error setting up request:', error.message);
            }
            alert('Error sending email data.');
        }
   };
   

    const generateEmailData = () => {
        const selectedBuildingIds = selectedBuildings.map(building => building.value);
        const start = startDate.toISOString().split('T')[0];
        const end = endDate.toISOString().split('T')[0];
        const emailData = {
            startDate: start, 
            endDate: end, 
            buildingIds: selectedBuildingIds
        }
        return emailData;
    };
    

    return (
        <div>
            <NavBar />
            <div className='container mx-auto px-4 mb-10'>
                <h3 className='text-3xl mt-10 font-bold text-gray-800'>Select Date Range and Building</h3>

                <form onSubmit={handleSubmit} className='bg-white mt-5 p-8 rounded-lg shadow-md'>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2'>Seleccionar edificios:</label>
                        <Autocomplete
                            multiple
                            id="buildings"
                            options={buildingOptions || []}
                            getOptionLabel={(option) => option.label || ''}
                            value={selectedBuildings || []}
                            onChange={(event, newValue) => {
                                setSelectedBuildings(newValue || []);
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Seleccione un Edificio"
                                    variant="outlined"
                                    className='w-full p-2 border border-gray-300 rounded-md'
                                    style={{ minWidth: '600px', fontSize: '16px', minHeight: '40px' }}
                                />
                            )}
                        />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2'>Fecha inicio:</label>
                        <DatePicker 
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            dateFormat="dd-MM-yy"
                            className="px-4 py-2 border rounded"
                            placeholderText="Ingresar fecha"
                        />
                    </div>

                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2'>Fecha termino:</label>
                        <DatePicker 
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={startDate}
                            dateFormat="dd-MM-yy"
                            className="mr-2 px-4 py-2 border rounded"
                            placeholderText="Ingresar fecha"
                        />
                    </div>

                    <div className='flex justify-center mt-5'>
                        <Button 
                            type='submit' 
                            label='Submit'
                            className='bg-turquesa-500 hover:bg-turquesa-400 font-semibold text-white p-2 rounded-md'
                        />
                    </div>
                </form>

                {/* Email content area */}
                <div className='mt-10'>
                    <h4 className='text-xl font-bold'>Detalle de email:</h4>

                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2'>Destinatario:</label>
                        <textarea
                            rows={2}
                            className='w-full border border-gray-300 p-2 rounded-md'
                            readOnly
                            value={"finanzas@finanzas.com"} // Display the recipient hardcoded
                        />
                    </div>

                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2'>Asunto:</label>
                        <textarea
                            rows={2}
                            className='w-full border border-gray-300 p-2 rounded-md'
                            readOnly
                            value={generateEmailSubject()} // Display the subject
                        />
                    </div>

                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2'>Información a enviar:</label>
                        <textarea
                            rows={10}
                            className='w-full border border-gray-300 p-2 rounded-md'
                            readOnly
                            value={generateEmailText()} // Display the email content
                        />
                    </div>

                    <div className='flex justify-center mt-5'>
                        <Button 
                            type='button' 
                            label='Send Email'
                            className='bg-turquesa-500 hover:bg-turquesa-400 font-semibold text-white p-2 rounded-md'
                            onClick={sendEmailData} // Call the function to send email data
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CorreoForm;
