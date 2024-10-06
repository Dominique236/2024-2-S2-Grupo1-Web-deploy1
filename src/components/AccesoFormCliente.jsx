import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SOLICITUD_ENDPOINT } from '../utils/apiRoutes';
import axios from 'axios';

// Imagenes
import logo from '../assets/speedclean-logo.png'; 

const AccesoFormCliente = () => {
    const [num_maquina, setNum_maquina] = useState(''); //cuantum
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();
        const numPattern = /^[0-9]+$/; // Regular expression to match only numbers

        if (num_maquina === "") {
            alert('Identificador de la máquina es requerido');
            return;
        } 
        if (num_maquina.length !== 4) {
            alert('Debe escribir exactamente 4 dígitos');
            return;
        } 
        if (!numPattern.test(num_maquina)) {
            alert('El número de máquina debe contener solo dígitos');
            return;
        }

        try {
            const response = await axios.get(`${SOLICITUD_ENDPOINT}/form-init/${num_maquina}`);
            const { machine_id, machine_model, building_address, building_county } = response.data;

            if (machine_id && machine_model && building_address && building_county) {
                navigate('/formcliente/' + num_maquina);
            } else {
                alert('Machine not found');
            }
        } catch (error) {
            console.error('Error fetching machine data:', error);
            alert('Máquina con ID ' + num_maquina + ' no encontrado');
        }
    
    };


    return (
        <div className='h-screen flex justify-center items-center'>
            <form onSubmit={handleSubmit} className='bg-white p-10 rounded-lg shadow-md'>
                <div className='flex justify-center items-center mb-5'> 
                    <img src={logo} alt='SpeedClean Logo' />
                </div>
                <h1 className='text-2xl font-bold text-center'>Servicio Técnico</h1>
                <p className='text-l text-center'>Ingresa los 4 números que identifican a la máquina con el problema. <br />Estos se ubican sobre el código QR</p>
                <div className='mt-5'>
                    <label htmlFor='num_maquina' className='block'>Número de Máquina</label>
                    <input type='text' id='num_maquina' value={num_maquina} onChange={(e) => setNum_maquina(e.target.value)} maxLength={4} className='w-full p-2 border border-gray-300 rounded-md' />
                </div>
                <div className='mt-5'>
                    <button type='submit' className='w-full bg-turquesa-500 hover:bg-turquesa-600 text-white p-2 rounded-md'>Solicitar Servicio</button>
                </div>
            </form>
        </div>
    );
};

export default AccesoFormCliente;
