import React, { useState, useMemo } from 'react';
import { PulseLoader } from 'react-spinners';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { Button } from 'primereact/button';

const formatMoney = (money) => {
    return `$${money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

const Tabla = ({ 
    columnas, filas, onRowClick, isLoading, 
    buttonAdvancedFilterText, buttonAdvancedFilter, buttonClearFilterText, buttonClearFilter,
    showCantidadAsignar, onCantidadAsignarChange
}) => {
    
    const handleRowClick = (rowData) => {
        if (onRowClick) {
            onRowClick(rowData);
        }
    };

    const handleCantidadAsignarChange = (rowData, value) => {
        const cantidadEnBodega = rowData.quantity;
        const nuevaCantidadAsignar = Math.max(0, Math.min(value, cantidadEnBodega));
        
        if (onCantidadAsignarChange) {
            onCantidadAsignarChange(rowData, nuevaCantidadAsignar);
        }
    };

    const [globalFilter, setGlobalFilter] = useState(null);

    const renderHeader = () => {
        return (
            <div className="grid grid-flow-col auto-cols-max">
                <div className="flex justify-between">
                    <IconField iconPosition="left">
                        <InputIcon className="pi pi-search" />
                        <InputText 
                            type="search"
                            onInput={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Buscar..." />
                    </IconField>
                    {buttonAdvancedFilterText && (
                        <Button 
                            label={buttonAdvancedFilterText} onClick={buttonAdvancedFilter} 
                            outlined severity='base' icon="pi pi-filter" className="text-turquesa-500 ml-2 mr-1 text-sm"
                        />
                    )}
                    {buttonClearFilterText && (
                        <Button 
                            label={buttonClearFilterText} onClick={buttonClearFilter} 
                            text className='text-sm text-gray-500'
                        />
                    )}
                </div>
            </div>
        );
    };

    const header = useMemo(renderHeader, [
        buttonAdvancedFilterText, buttonAdvancedFilter,
        buttonClearFilterText, buttonClearFilter
    ]);

    const renderCantidadAsignarColumn = (rowData) => {
        return (
            <InputText 
                type="number" 
                value={rowData.cantidadAsignar || ''} 
                onChange={(e) => handleCantidadAsignarChange(rowData, parseInt(e.target.value, 10))}
            />
        );
    };

    const renderRequestedMoneyColumn = (rowData) => {
        return formatMoney(rowData.requested_money);
    };

    const renderStateColumn = (rowData) => {
        let tagClass = '';
        if (rowData.state === 'Pendiente') {
            tagClass = 'tag-naranja';
        } else if (rowData.state === 'Aceptada' || rowData.state === 'Aprobada' ) {
            tagClass = 'tag-verde';
        } else if (rowData.state === 'Rechazada') {
            tagClass = 'tag-rojo';
        } else if (rowData.state === 'Inactiva') {
            tagClass = 'tag-gris';
        } else {
            tagClass= '';
        }
        return <span className={`${tagClass}`}>{rowData.state}</span>;
    };

    const renderPriorityColumn = (rowData) => {
        let tagClass = '';
        if (rowData.priority === 'Alta') {
            tagClass = 'tag-rojo'; 
        } else if (rowData.priority === 'Media') {
            tagClass = 'tag-naranja';
        } else if (rowData.priority === 'Baja') {
            tagClass = 'tag-amarillo';
        }
        return <span className={`tag ${tagClass}`}>{rowData.priority}</span>;
    };

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg mt-3">
            {isLoading ? (
                <div className='card p-2 bg-white'>
                    <div className="flex justify-center items-center mt-4 h-24">
                        <PulseLoader color="#319795" />
                    </div>
                </div>
            ) : (
                <div className='card p-2 bg-white'>
                    <DataTable
                        value={filas}
                        className="p-datatable-customers text-sm"
                        paginator rows={10} rowsPerPageOptions={[10, 25, 50]} //
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        onRowClick={(e) => handleRowClick(e.data)}
                        globalFilter={globalFilter} header={header}
                        stripedRows 
                        removableSort                        
                        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} datos"

                        rowClassName={(rowData) => {
                            return {
                                'bg-[#d9f7be]': rowData.state === 'Aceptada' || rowData.state === 'Aprobada' || rowData.status === 'Resuelta' || rowData.status === 'Aceptada',
                                'bg-[#ffcccc]': rowData.state === 'Rechazada' || rowData.status === 'Rechazada',
                                'bg-blue-400': rowData.status === 'Acuso recibo',
                                'bg-[#ffe6cc]': rowData.status === 'Inactiva' || rowData.status === 'Retornada',
                                'hover:bg-gray-200': true, // Añadir clase para hover
                            };
                        }}
                    >
                        {columnas.map((columna) => (
                            <Column
                                key={columna.llave}
                                field={columna.llave}
                                header={columna.nombre}
                                sortable
                                body={
                                    columna.llave === 'requested_money' 
                                    ? renderRequestedMoneyColumn
                                    : columna.llave === 'state' 
                                    ? renderStateColumn 
                                    : columna.llave === 'priority'
                                    ? renderPriorityColumn
                                    : null
                                }
                            />
                        ))}
                        {showCantidadAsignar && (
                            <Column
                                field="cantidadAsignar"
                                header="Cantidad a Asignar"
                                body={renderCantidadAsignarColumn}
                            />
                        )}
                    </DataTable>
                </div>
            )}
        </div>
    );
};

export default Tabla;
