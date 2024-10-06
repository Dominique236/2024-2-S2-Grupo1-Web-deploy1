import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

//imagenes
import logo from '../assets/speedclean-logo.png'; 

const FinFormCliente = () => {

    const handleSubmit = (e) => {
        e.preventDefault();

    };


    return (
        <div className='h-screen flex justify-center items-center'>
            <form onSubmit={handleSubmit} className='bg-white p-10 rounded-lg shadow-md'>
                <div className='flex justify-center items-center mb-5'> 
                    <img src={logo} alt='SpeedClean Logo' />
                </div>
                <h1 className='text-2xl font-bold text-center'>Su solicitud fue recibida.</h1>
                <h1 className='text-2xl font-bold text-center'>Gracias por contactarse con nosotros.</h1>
            </form>
        </div>
    )
};

export default FinFormCliente;
