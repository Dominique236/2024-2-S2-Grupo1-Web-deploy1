import React from 'react';
import { useNavigate } from 'react-router-dom';

const InvalidAccessPopup = () => {
    const navigate = useNavigate(); // Hook para redireccionar

    const handleClose = () => {
        navigate('/solicitudes'); // Redirige a la página de inicio (en este caso, solicitudes)
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-25"></div>
            <div className="bg-white rounded-lg shadow-lg relative z-10 p-8 w-[500px]">
                <h2 className="text-xl font-semibold text-center mb-4">Acceso no permitido</h2>
                <p className="text-center mb-6">No tienes permisos para acceder a esta página.</p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={handleClose}  // Llama a la función handleClose
                        className="bg-teal-600 hover:bg-teal-500 text-white py-2 px-4 rounded-md"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvalidAccessPopup;
