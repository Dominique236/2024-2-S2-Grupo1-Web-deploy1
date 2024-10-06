import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const AgregarHerramientaPopup = ({ open, onClose, onAdd, users, warehouseOptions }) => {
    const [name, setName] = useState('');
    const [model, setModel] = useState('');
    const [warehouse, setWarehouse] = useState(null);
    const [technician, setTechnician] = useState(null);
    const [confirmAdd, setConfirmAdd] = useState(false);

    const handleAddTool = async () => {
        if (name.trim() === '' || model.trim() === '') {
            alert('Por favor completa todos los campos.');
            return;
        }

        if (!warehouse && !technician) {
            alert('Por favor selecciona una bodega o un técnico.');
            return;
        }

        if (!confirmAdd) {
            setConfirmAdd(true);
            return;
        }

        const newTool = {
            name,
            model,
            warehouse_id: warehouse ? warehouse.value : null,
            technitian_id: technician ? technician.idUsuario : null,
        };

        await onAdd(newTool);
        onClose();
    };

    const handleClose = () => {
        setConfirmAdd(false);
        onClose();
    };

    const modalStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            style={modalStyle}
        >
            <div className="bg-white p-4 rounded shadow-lg mx-auto w-96">
                <div className="flex justify-between items-center mb-4">
                    <h2 id="modal-title" className="text-2xl font-semibold text-teal-600">
                        Agregar Herramienta
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                        aria-label="Cerrar"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <TextField
                    label="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    className="mb-3"
                />
                <TextField
                    label="Modelo"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    className="mb-4"
                />
                <div className='mt-2 mb-1'>
                    Seleccionar ubicación: bodega o técnico:
                </div>
                <Autocomplete
                    options={warehouseOptions}
                    getOptionLabel={(option) => option.label}
                    value={warehouse}
                    onChange={(event, value) => {
                        setWarehouse(value);
                        setTechnician(null);
                    }}
                    renderInput={(params) => <TextField {...params} label="Bodega" variant="outlined" />}
                    fullWidth
                    margin="dense"
                    
                />
                <Autocomplete
                    options={users}
                    getOptionLabel={(option) => `${option.nombre} ${option.apellido}`}
                    value={technician}
                    onChange={(event, value) => {
                        if (value) {
                            setTechnician(value);
                            setWarehouse(null);
                        }
                    }}
                    renderInput={(params) => <TextField {...params} label="Técnico" variant="outlined" />}
                    fullWidth
                    margin="dense"
                    disabled={warehouse !== null} // Deshabilitar si la bodega está seleccionada
                    className="mb-3 mt-2"
                />
                {!confirmAdd ? (
                    <button
                        onClick={handleAddTool}
                        className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-turquesa-500 transition duration-300"
                    >
                        Agregar
                    </button>
                ) : (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleAddTool}
                            className="rounded-md text-white bg-turquesa-600 hover:bg-turquesa-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto"
                        >
                            Confirmar
                        </button>
                        <button
                            onClick={() => setConfirmAdd(false)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 ml-4"
                        >
                            Cancelar
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default AgregarHerramientaPopup;
