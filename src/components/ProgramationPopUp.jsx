import React from 'react';

const ProgramationPopUp = ({ mensaje, onClose }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="bg-white p-8 rounded-lg shadow-lg relative z-10 w-[400px]">
                <p className="text-xl font-semibold text-center mb-4">{mensaje}</p>
                <div className="flex justify-center">
                    <button onClick={onClose} className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProgramationPopUp;
