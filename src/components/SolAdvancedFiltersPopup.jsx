import React from 'react';

const SolAdvancedFiltersPopup = ({
    show,
    onClose,
    onApply,

    estadoPendiente,
    estadoAprobada,
    estadoRechazada,
    razonNoSeca,
    razonNoCentrifuga,
    razonNoParte,
    razonNoAcepta,
    razonNoDevuelve,
    razonOtra,
    recomendacionPendiente,
    recomendacionAprobar,
    recomendacionRechazar,

    handleEstadoPendienteChange,
    handleEstadoAprobadaChange,
    handleEstadoRechazadaChange,
    handleRazonNoSecaChange,
    handleRazonNoCentrifugaChange,
    handleRazonNoParteChange,
    handleRazonNoAceptaChange,
    handleRazonNoDevuelveChange,
    handleRazonOtraChange,
    handleRecomendacionPendiente,
    handleRecomendacionAprobar,
    handleRecomendacionRechazar

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
                        <label className="block"> <input type="checkbox" checked={estadoAprobada} onChange={handleEstadoAprobadaChange} className="custom-checkbox mr-2 leading-tight"/>Aceptada</label>
                        <label className="block"> <input type="checkbox" checked={estadoRechazada} onChange={handleEstadoRechazadaChange} className="custom-checkbox mr-2 leading-tight"/>Rechazada</label>
                    </div>

                    <div className="basis-2/4">
                        <p><strong>Razón de No Servicio</strong></p>
                        <label className="block"> <input type="checkbox" checked={razonNoSeca} onChange={handleRazonNoSecaChange} className="custom-checkbox mr-2 leading-tight"/>Secadora no seca</label>
                        <label className="block"> <input type="checkbox" checked={razonNoCentrifuga} onChange={handleRazonNoCentrifugaChange} className="custom-checkbox mr-2 leading-tight"/>Lavadora no centrifuga</label>
                        <label className="block"> <input type="checkbox" checked={razonNoParte} onChange={handleRazonNoParteChange} className="custom-checkbox mr-2 leading-tight"/>Lavadora no parte</label>
                        <label className="block"> <input type="checkbox" checked={razonNoAcepta} onChange={handleRazonNoAceptaChange} className="custom-checkbox mr-2 leading-tight"/>Monedero no acepta monedas</label>
                        <label className="block"> <input type="checkbox" checked={razonNoDevuelve} onChange={handleRazonNoDevuelveChange} className="custom-checkbox mr-2 leading-tight"/>Monedero no descuenta monedas</label>
                        <label className="block"> <input type="checkbox" checked={razonOtra} onChange={handleRazonOtraChange} className="custom-checkbox mr-2 leading-tight"/>Otra</label>
                    </div>

                    <div className="basis-1/4">
                        <p><strong>Recomendación Técnico</strong></p>
                        <label className="block"> <input type="checkbox" checked={recomendacionPendiente} onChange={handleRecomendacionPendiente} className="custom-checkbox mr-2 leading-tight"/>Pendiente</label>
                        <label className="block"> <input type="checkbox" checked={recomendacionAprobar} onChange={handleRecomendacionAprobar} className="custom-checkbox mr-2 leading-tight"/>Indemnizar</label>
                        <label className="block"> <input type="checkbox" checked={recomendacionRechazar} onChange={handleRecomendacionRechazar} className="custom-checkbox mr-2 leading-tight"/>No indemnizar</label>
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

export default SolAdvancedFiltersPopup;
