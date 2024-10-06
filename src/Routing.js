import React , {useEffect, useState, useContext} from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { UserContext } from './contexts/UserContext';
import axios from 'axios';
import { USER_ENDPOINT } from './utils/apiRoutes';
import NavBar from './components/NavBar';
import Hero from './components/Hero';
import Solicitudes from './components/Solicitudes';
import Ordenes from './components/Ordenes';
import Reportes from './components/Reportes';
import SolicitudesRepuestos from './components/SolicitudesRepuestos';
import Usuarios from './components/Usuarios';
import Clientes from './components/Clientes';
import Maquinas from './components/Maquinas';
import Inventario from './components/Inventario';
import AccesoFormCliente from './components/AccesoFormCliente';
import FormCliente from './components/FormCliente';
import FinFormCliente from './components/FinFormCliente';
import Chat from './components/Chat';
import CrearOrden from './components/CrearOrden';
import EditarOrden from './components/EditarOrden';
import ReasignarSolicitud from './components/ReasignarSolicitud';
import Edificios from './components/Edificios';
import Email from './components/Email';
import AsignarRepuestos from './components/AsignarRepuestos';
import Repuestos from './components/Repuestos';
import SolicitudesHerramientas from './components/SolicitudesHerramientas';
import Estadisticas from './components/Estadisticas';
import AsignarHerramientas from './components/AsignarHerramientas';
import InvalidAccessPopup from './components/InvalidAccessPopup';  
import CorreoForm from './components/CorreoForm';

const Routing = () => {
    const { isAuthenticated, user } = useAuth0();
    const { userRole } = useContext(UserContext);

    if (userRole != null){

    // Añade un estado de carga mientras esperas a obtener el rol del usuario
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Hero />} />
                <Route path="/serviciotecnico" element={<AccesoFormCliente />} />
                <Route path="/formcliente/:num_maquina" element={<FormCliente />} />
                <Route path="/finformcliente" element={<FinFormCliente />} />

                {isAuthenticated && userRole && (
                    <>
                        <Route path="/usuarios" element={
                            userRole === 'admin'
                                ? <Usuarios />
                                : <InvalidAccessPopup />
                        } />
                        
                        <Route path="/clientes" element={
                            userRole === 'admin'
                                ? <Clientes />
                                : <InvalidAccessPopup />
                        } />

                        <Route path="/estadisticas" element={
                            userRole === 'admin' || userRole === 'finanzas'
                                ? <Estadisticas />
                                : <InvalidAccessPopup />
                        } />

                        <Route path="/correo" element={
                            userRole === 'admin'
                                ? <CorreoForm />
                                : <InvalidAccessPopup />
                        } />

                        <Route path="/solicitudes" element={<Solicitudes />} />
                        <Route path="/ordenes" element={<Ordenes />} />
                        <Route path="/reportes" element={<Reportes />} />
                        <Route path="/solicitudesrepuestos" element={<SolicitudesRepuestos />} />
                        <Route path="/maquinas" element={<Maquinas />} />
                        <Route path="/inventario" element={<Inventario />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/crearOrden" element={<CrearOrden />} />
                        <Route path="/editarorden/:idOT" element={<EditarOrden />} />
                        <Route path="/reasignarsolicitud/:idSol" element={<ReasignarSolicitud />} />
                        <Route path="/edificios" element={<Edificios />} />
                        <Route path="/email/:idSol" element={<Email />} />
                        <Route path="/asignarrepuestos/:idSolRep" element={<AsignarRepuestos />} />
                        <Route path="/repuestos" element={<Repuestos />} />
                        <Route path="/solicitudesherramientas" element={<SolicitudesHerramientas />} />
                        <Route path="/asignarherramientas/:idSolTool" element={<AsignarHerramientas />} />
                        <Route path="/correo" element={<CorreoForm />} />
                    </>
                )}
            </Routes>
        </BrowserRouter>
    );
}
    
};
   


export default Routing;
