import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const EditToolPopup = ({ open, editedTool, warehouseOptions, users, handleUpdateTool, handleCloseEdit, handleDeleteTool }) => {
    const [editedName, setEditedName] = useState('');
    const [editedModel, setEditedModel] = useState('');
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [confirmEdit, setConfirmEdit] = useState(false);

    useEffect(() => {
        if (editedTool) {
            setEditedName(editedTool.name || '');
            setEditedModel(editedTool.model || '');
            setSelectedWarehouse(editedTool.warehouse_id ? warehouseOptions.find(option => option.value === editedTool.warehouse_id) : null);
            setSelectedTechnician(editedTool.technician_id ? users.find(user => user.id === editedTool.technician_id) : null);
        }
    }, [editedTool, warehouseOptions, users]);

    const handleSave = async () => {
        if (editedName.trim() === '' || editedModel.trim() === '') {
            alert('Por favor completa todos los campos.');
            return;
        }

        if (!selectedWarehouse && !selectedTechnician) {
            alert('Por favor selecciona una bodega o un técnico.');
            return;
        }

        if (!confirmEdit) {
            setConfirmEdit(true);
            return;
        }

        const updatedTool = {
            ...editedTool,
            name: editedName,
            model: editedModel,
            warehouse_id: selectedWarehouse ? selectedWarehouse.value : null,
            technitian_id: selectedTechnician ? selectedTechnician.idUsuario : null,
        };

        await handleUpdateTool(updatedTool);
        handleCloseEdit();
    };

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que quieres eliminar esta herramienta?')) {
            await handleDeleteTool(editedTool.id); // Llamar a la función para eliminar la herramienta
            handleCloseEdit();
        }
    };

    const handleClose = () => {
        setConfirmEdit(false);
        handleCloseEdit();
    };

    const handleWarehouseChange = (event, value) => {
        setSelectedWarehouse(value);
        setSelectedTechnician(null); // Limpiar la selección de técnico al seleccionar bodega
    };

    const handleTechnicianChange = (event, value) => {
        setSelectedTechnician(value);
        setSelectedWarehouse(null); // Limpiar la selección de bodega al seleccionar técnico
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div className="bg-white p-4 rounded shadow-lg mx-auto w-96">
                <div className="flex justify-between items-center mb-4">
                    <h2 id="modal-title" className="text-2xl font-semibold text-teal-600">
                        Editar Herramienta
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
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    fullWidth
                    variant="outlined"
                    margin="dense"
                    className="mb-3"
                />
                <TextField
                    label="Modelo"
                    value={editedModel}
                    onChange={(e) => setEditedModel(e.target.value)}
                    fullWidth
                    variant="outlined"
                    margin="normal"
                    className="mb-3"
                />
                <Autocomplete
                    options={warehouseOptions}
                    getOptionLabel={(option) => option.label}
                    value={selectedWarehouse}
                    onChange={handleWarehouseChange}
                    renderInput={(params) => <TextField {...params} label="Bodega" variant="outlined" />}
                    fullWidth
                    margin="dense"
                    className="mb-3"
                />
                <Autocomplete
                    options={users}
                    getOptionLabel={(option) => `${option.nombre} ${option.apellido}`}
                    value={selectedTechnician}
                    onChange={handleTechnicianChange}
                    renderInput={(params) => <TextField {...params} label="Técnico" variant="outlined" />}
                    fullWidth
                    margin="dense"
                    disabled={selectedWarehouse !== null} // Deshabilitar si la bodega está seleccionada
                    className="mb-3"
                />
                {!confirmEdit ? (
                    <>
                    <button
                        onClick={handleSave}
                        className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700 transition duration-300 mr-2"
                    >
                        Guardar
                    </button>
                    <button
                        onClick={handleDelete}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300 mt-4"
                    >
                        Eliminar Herramienta
                    </button>
                </>
                ) : (
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleSave}
                            className="rounded-md text-white bg-teal-600 hover:bg-teal-500 hover:text-white px-3 py-2 text-sm font-semibold shadow-sm sm:ml-3 sm:w-auto"
                        >
                            Confirmar
                        </button>
                        <button
                            onClick={() => setConfirmEdit(false)}
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

export default EditToolPopup;
