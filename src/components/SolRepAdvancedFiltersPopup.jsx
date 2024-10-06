import React from 'react';

const SolRepAdvancedFiltersPopup = ({
    show,
    onClose,
    onApply,

    estadoPendiente,
    estadoAprobada,
    estadoRechazada,

    handleEstadoPendienteChange,
    handleEstadoAprobadaChange,
    handleEstadoRechazadaChange

}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-25"></div>
            <div className="bg-white p-8 rounded-lg shadow-lg relative z-10 w-[800px]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition duration-300"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                </button>
                <h2 className="text-teal-600 text-xl font-semibold mb-6">Filtros Avanzados</h2>

                <div className="flex flex-row mb-4">
                    <div className="basis-1/4">
                        <p><strong>Estado</strong></p>
                        <label className="block"> <input type="checkbox" checked={estadoPendiente} onChange={handleEstadoPendienteChange} className="custom-checkbox mr-2 leading-tight"/>Pendiente</label>
                        <label className="block"> <input type="checkbox" checked={estadoAprobada} onChange={handleEstadoAprobadaChange} className="custom-checkbox mr-2 leading-tight"/>Aprobada</label>
                        <label className="block"> <input type="checkbox" checked={estadoRechazada} onChange={handleEstadoRechazadaChange} className="custom-checkbox mr-2 leading-tight"/>Rechazada</label>
                    </div>

                </div>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onApply}
                        className="bg-turquesa-500 hover:bg-turquesa-400 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
                    >
                        Aplicar Filtros
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SolRepAdvancedFiltersPopup;
