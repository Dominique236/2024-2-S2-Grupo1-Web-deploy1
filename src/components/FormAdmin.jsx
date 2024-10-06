import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';

const FormAdmin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if(email === ""){
            alert('Email es requerido');
            return;
        } else if(password === ""){
            alert('Contraseña es requerida');
            return;
        }
        alert('Formulario enviado, bienvenido a SpeedClean');
        navigate('/solicitudes');

    };

    return (
        <div className='h-screen flex justify-center items-center'>
            <form onSubmit={handleSubmit} className='bg-white p-10 rounded-lg shadow-md'>
                <h1 className='text-2xl font-bold text-center'>Ingreso SpeedClean</h1>
                <div className='mt-5'>
                    <label htmlFor='email' className='block'>Email</label>
                    <input type='email' id='email' value={email} onChange={(e) => setEmail(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md' />
                </div>
                <div className='mt-5'>
                    <label htmlFor='password' className='block'>Contraseña</label>
                    <input type='password' id='password' value={password} onChange={(e) => setPassword(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md' />
                </div>
                <div className='mt-5'>
                    <button type='submit' className='w-full bg-turquesa-500 text-white p-2 rounded-md'>Ingresar</button>
                </div>
            </form>
        </div>
    )
};

export default FormAdmin;