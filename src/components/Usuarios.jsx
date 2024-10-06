import React, { useState, useEffect } from 'react';
import Tabla from './Tabla';
import NavBar from './NavBar';
import { USER_ENDPOINT } from '../utils/apiRoutes';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const Usuarios = () => {
    const [filasUsuarios, setFilasUsuarios] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth0();
    const [filter, setFilter] = useState('');

    const columnas = [
        { nombre: "Nombre", llave: "nombre" },
        { nombre: "Apellido", llave: "apellido" },
        { nombre: "Teléfono", llave: "telefono" },
        { nombre: "RUT", llave: "rut" },
        { nombre: "Correo", llave: "correo" },
        { nombre: "Permisos", llave: "permisos" },
    ];

    const fetch_users = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(USER_ENDPOINT);
            // console.log('Response:', response.data);

            // Transformar los datos de usuarios en filas para la tabla
            const usuariosTransformados = response.data.map(usuario => {
                let role = '';
                switch (usuario.user_metadata?.role) {
                    case 'admin':
                        role = 'Administrador';
                        break;
                    case 'tecnico':
                        role = 'Técnico';
                        break;
                    case 'finanzas':
                        role = 'Finanzas';
                        break;
                    default:
                        role = usuario.user_metadata?.role || '';
                }
                return {
                    idUsuario: usuario.user_id,
                    nombre: usuario.user_metadata ? usuario.user_metadata.name : '',
                    apellido: usuario.user_metadata ? usuario.user_metadata.last_name : '',
                    telefono: usuario.user_metadata ? usuario.user_metadata.phone : '',
                    rut: usuario.user_metadata ? usuario.user_metadata.rut : '',
                    correo: usuario.email,
                    permisos: role
                };
            });

            const usuariosTransformadosLocal = response.data.map(usuario => ({
                idUsuario: usuario.user_id,
                nombre: usuario.user_metadata ? usuario.user_metadata.name : '',
                apellido: usuario.user_metadata ? usuario.user_metadata.last_name : '',
                telefono: usuario.user_metadata ? usuario.user_metadata.phone : '',
                rut: usuario.user_metadata ? usuario.user_metadata.rut : '',
                correo: usuario.email,
                permisos: usuario.user_metadata ? usuario.user_metadata.role : ''
            }));


            // console.log('Filas de usuarios:', usuariosTransformados);

            // Guardar los datos en localStorage
            localStorage.setItem('filasUsuarios', JSON.stringify(usuariosTransformadosLocal));

            // Actualizar el estado con las filas de usuarios obtenidas
            setFilasUsuarios(usuariosTransformados);
        } catch (error) {
            console.error('Error fetching request data:', error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        // Cargar los datos desde localStorage si están disponibles
        fetch_users();

    }, []);

    const filteredRows = filasUsuarios.filter((fila) =>
        Object.values(fila).some((value) =>
            value && typeof value !== 'object' && // Verifica si el valor no es nulo ni un objeto
            value.toString().toLowerCase().includes(filter.toLowerCase())
        )
    );

    return (
        <div>
            <NavBar />
            <div className='container mx-auto px-4 mb-10 pt-20'>
                <h1 className='text-3xl mt-10 first-line:font-bold text-gray-800'>Usuarios</h1>
                
                <Tabla columnas={columnas} filas={filteredRows} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default Usuarios;
