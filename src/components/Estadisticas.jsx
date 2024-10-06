import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import MachineOTCounter from './EstadMachineOTCounter';
import BuildingOTCounter from './EstadBuildingOTCounter';
import TechScore from './EstadTechScore';
import OTHours from './EstadOTHours';
import { TabView, TabPanel } from 'primereact/tabview';
import LavadoraIcon from './IconLavadora';
import EstadBuildingHours from './EstadBuildingHours';

const Estadisticas = () => {
    return (
        <div>
            <NavBar />
            <div className='container mt-20 mx-auto px-4 mb-10'>
                <div className='flex justify-between items-end'>
                    <div>
                        <h1 className='text-3xl mt-10 font-bold text-gray-800'>Estadísticas</h1>
                    </div>
                </div>
                <div className='bg-white rounded-lg shadow-lg p-2 mt-2'>
                    <TabView className='bg-white'>
                        <TabPanel 
                            header="OTs por máquina" 
                            leftIcon={<span className="mr-2"><LavadoraIcon /></span>}>                          
                            <div className='mt-3 ml-3'> 
                                <h1 className='text-turquesa-500 font-bold text-lg'> OTs por máquina</h1>
                                <div className="card bg-white p-2">
                                    <MachineOTCounter ots={"cantidad_OT_activas"}/>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel header="OTs por edificio" leftIcon="pi pi-building mr-2">
                            <div className='mt-3 ml-3'> 
                                <h1 className='text-turquesa-500 font-bold text-lg'>OTs por edificio</h1>
                                <div className="card bg-white p-2 justify-center h-auto">
                                    <BuildingOTCounter ots={"cantidad_OT_activas"}/>
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel header="OTs reabiertas por técnico" leftIcon="pi pi-user mr-2">
                        <div className='mt-3 ml-3'> 
                                <h1 className='text-turquesa-500 font-bold text-lg'>OTs reabiertas en misma máquina en últimos 10 días</h1>
                                <div className="card bg-white p-2 justify-center h-auto">
                                    <TechScore /> 
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel header="HHs por OT" leftIcon="pi pi-user mr-2">
                        <div className='mt-3 ml-3'> 
                                <h1 className='text-turquesa-500 font-bold text-lg'>HHs por OT terminadas</h1>
                                <div className="card bg-white p-2 justify-center h-auto">
                                    <OTHours /> 
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel header="HHs por Edificio" leftIcon="pi pi-building mr-2">
                            <div className='mt-3 ml-3'> 
                                <h1 className='text-turquesa-500 font-bold text-lg'>Horas-Hombre por Edificio</h1>
                                <div className="card bg-white p-2 justify-center h-auto">
                                    <EstadBuildingHours /> 
                                </div>
                            </div>
                        </TabPanel>
                    </TabView>
                </div>
                
                
            </div>
        </div>
    );
}

export default Estadisticas;
