import { AiOutlineMenu } from '@react-icons/all-files/ai/AiOutlineMenu';
import { AiOutlineClose } from '@react-icons/all-files/ai/AiOutlineClose';
import { useAuth0 } from '@auth0/auth0-react';
import React, { useState, Fragment, useContext } from 'react';
import { Menu, Transition } from '@headlessui/react'
import { Link } from 'react-router-dom';
import logo from '../assets/LOGO_SPEED_CLEAN_white.png';
import { UserContext } from '../contexts/UserContext';
import { Menubar } from 'primereact/menubar';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const NavBar = () => {
    const [nav, setNav] = useState(false);
    const { logout } = useAuth0();
    const [showConfirm, setShowConfirm] = useState(false);
    const { userRole } = useContext(UserContext);

    const handleNav = () => {
        setNav(!nav);
    }

    const handleLogout = () => {
        setShowConfirm(true); // Mostrar el pop-up de confirmación antes de cerrar sesión
    }

    const confirmLogout = () => {
        logout({ returnTo: 'https://speed-clean-ciclo1.netlify.app/'});
    }

    const items = [
        {
            label: 'Solicitudes',
            items: [
                {
                    label: 'Servicio al Cliente',
                    url: '/solicitudes'
                },
                {
                    label: 'Solicitudes de Repuesto',
                    url: '/solicitudesrepuestos'
                },
                {
                    label: 'Solicitudes de Herramienta',
                    url: '/solicitudesherramientas'
                }
            ]
        },
        {
            label: 'Órdenes',
            url: '/ordenes'
        },
        {
            label: 'Personas',
            items: [
                {
                    label: 'Clientes',
                    url: '/clientes'
                },
                {
                    label: 'Usuarios',
                    url: '/usuarios'
                }
            ]
        },
        {
            label: 'Inventario',
            url: '/inventario'
        },
        {
            label: 'Máquinas',
            url: '/maquinas'
        },
        {
            label: 'Edificios',
            url: '/edificios'
        },
        {
            label: 'Estadísticas',
            url: '/estadisticas'
        },
        {
            label: 'Correo',
            url: '/correo'
        },
        {
            label: 'Cerrar sesión',
            command: handleLogout
        },
    ];

    // Función para filtrar los items según el rol del usuario
    const filterItemsByRole = (items, userRole) => {
        // Filtrar para usuarios que NO son admin
        if (userRole !== 'admin') {
            items = items.filter(item => item.label !== 'Personas'); // Eliminar la sección "Personas"
            items = items.filter(item => item.label !== 'Correo'); // Eliminar la sección "Correo"
        }
        // Filtrar para usuarios que NO son admin o finanzas
        if (userRole !== 'admin' && userRole !== 'finanzas') {
            items = items.filter(item => item.label !== 'Estadísticas'); // Eliminar la sección "Estadísticas"
        }
        
        return items;
    };

    // Aplicamos el filtrado
    const filteredItems = filterItemsByRole(items, userRole);

    return (
        <>
            {showConfirm && (
                <div className="fixed top-0 left-0 w-full h-full bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center z-10 text-black">
                        <p>¿Estás seguro que quieres cerrar sesión?</p>
                        <div className="mt-4">
                            <button onClick={() => setShowConfirm(false)} className="mr-4 bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded-lg">Cancelar</button>
                            <button onClick={confirmLogout} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg">Cerrar Sesión</button>
                        </div>
                    </div>
                </div>
            )}
            <div className='fixed top-0 left-0 right-0 z-50 flex justify-between drop-shadow-md items-center h-20 px-4 text-white bg-turquesa-500'>
                <img src={logo} style={{ width: '15%'}} alt='SpeedClean Logo'/>
                <Menubar model={filteredItems} className='custom-menu text-sm bg-transparent md:justify-self-end'/>
            </div>
        </>
    );
}

export default NavBar;
