import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import { useAuth0 } from '@auth0/auth0-react';
import { CHAT_ENDPOINT } from '../utils/apiRoutes';
import axios from 'axios';
import { UserContext } from '../contexts/UserContext';

const Chat = () => {
    const location = useLocation();
    const fila = location.state?.fila;
    const datos_adicionales = location.state?.datosAdicionales;
    const machine = datos_adicionales && datos_adicionales.length > 0 ? datos_adicionales[0].Machine : null;
    const { user } = useAuth0();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const { userRole, setUserRole } = useContext(UserContext);

    const idOT = fila && fila.hasOwnProperty('id');
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [expandedImage, setExpandedImage] = useState(null);
    const [usuarios, setUsuarios] = useState([]);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${CHAT_ENDPOINT}/workorder/${fila.id}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching chat messages:', error);
        }
    };

    const fetchUsuarios = () => {
        const usuariosGuardados = localStorage.getItem('filasUsuarios');
        if (usuariosGuardados) {
            setUsuarios(JSON.parse(usuariosGuardados));
        }
    };

    useEffect(() => {
        if (idOT) {
            fetchMessages();
        }
    }, [idOT]);

    useEffect(() => {
        fetchUsuarios();
        const interval = setInterval(() => {
            fetchMessages();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        if (minutes < 10) {
            return `${day}/${month}/${year} ${hours}:0${minutes}`;
        }
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    const handleSendMessage = async () => {
        if (inputMessage.trim() !== '') {
            try {
                await axios.post(CHAT_ENDPOINT, {
                    id_work_order: fila.id,
                    id_user: user.sub,
                    content: inputMessage
                });
                setMessages([...messages, { content: inputMessage, user_id: user.sub, createdAt: new Date().toISOString() }]);
                setInputMessage('');
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    const handleSendImage = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('image', file);
            formData.append('id_user', user.sub);
            formData.append('id_work_order', fila.id);

            try {
                const response = await axios.post(`${CHAT_ENDPOINT}/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                // console.log('Image uploaded:', response.data);
                if (response.data.body.includes('error')) {
                    alert('Error al subir la imagen, debe ser .jpg o .jpeg');
                }
                const imageUrl = response.data.imageUrl;
                setMessages([...messages, { image: imageUrl, user_id: user.sub, createdAt: new Date().toISOString() }]);
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }
    };

    const getUserName = (userId) => {
        const user = usuarios.find(u => u.idUsuario === userId);
        return user ? `${user.nombre} ${user.apellido}` : 'Usuario';
    };

    const go_back = () => {
        navigate('/ordenes');
    };

    const renderMessageContent = (message) => {
        if (message.content) {
            if (message.content.match(/\.(jpeg|jpg|gif|png)$/) != null) {
                return (
                    <img
                        src={message.content}
                        alt="Imagen"
                        className="max-w-40 h-auto cursor-pointer"
                        onClick={() => setExpandedImage(message.content)}
                    />
                );
            } else {
                return message.content;
            }
        }
    };

    const scrollToBottomOnClick = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div>
            <NavBar />
            <div className='container mx-auto px-4'>

                <h1 className='text-3xl mt-10 first-line:font-bold text-gray-800'>Chat de Orden de Trabajo</h1>

                <div className="flex items-start content-start flex-row grid grid-cols-2 mt-4 gap-5 mb-8">
                    <div>
                        {idOT ? (
                            <>
                                <div className='max-w pl-10 pr-10 pt-5 pb-5 mr-5 bg-white rounded-xl overflow-hidden shadow-md'>
                                    <h2 className='text-turquesa-500 text-md'><strong>Detalles de OT</strong></h2>
                                    <table>
                                        <tbody>
                                            <tr>
                                                <td><p><strong>ID OT:</strong></p></td>
                                                <td><p>{fila.id}</p></td>
                                            </tr>
                                            <tr>
                                                <td><p><strong>ID Máquina:</strong></p></td>
                                                <td><p>{fila.id_machine}</p></td>
                                            </tr>
                                            <tr>
                                                <td><p><strong>Fecha Creación:</strong></p></td>
                                                <td><p>{fila.createdAt}</p></td>
                                            </tr>
                                            <tr>
                                                <td><p><strong>Fecha Actualización:</strong></p></td>
                                                <td><p>{fila.updatedAt}</p></td>
                                            </tr>
                                            <tr>
                                                <td><p><strong>Estado:</strong></p></td>
                                                <td><p>{fila.status}</p></td>
                                            </tr>
                                            <tr>
                                                <td><p><strong>Técnico:</strong></p></td>
                                                <td><p>{fila.technician_id}</p></td>
                                            </tr>
                                            <tr>
                                                <td><p><strong>Nombre OT:</strong></p></td>
                                            
                                                <td><p>{fila.name}</p></td>
                                            </tr>
                                            <tr>
                                                <td><p><strong>Dirección:</strong></p></td>
                                            
                                                <td><p>{machine.Building.address}, {machine.Building.county}</p></td>
                                            </tr>
                                            <tr>
                                                <td><p><strong>Edificio:</strong></p></td>
                                            
                                                <td><p>{machine.Building.name}</p></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    
                                </div>
                            </>
                        ) : (
                            <>
                                <p>Error cargando OT</p>
                            </>
                        )}
                    </div>
                    
                    <div>
                        <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-1">
                            <div className="w-full flex flex-col items-start p-4 bg-white rounded-xl overflow-hidden shadow-md" style={{ height: '400px', overflowY: 'scroll' }}>
                                <div className='max-w-3xl w-full'>
                                    {messages.map((message, index) => (
                                        <div key={index} className={`flex flex-col mb-4 ${message.user_id !== user.sub && !usuarios.find(u => u.idUsuario === message.user_id) ? 'text-center text-gray-500' : ''}`}>
                                            {message.user_id !== user.sub && !usuarios.find(u => u.idUsuario === message.user_id) ? (
                                                <div className="text-center text-gray-500">
                                                    {message.content} 
                                                    <br />
                                                    <span className={`text-xs text-center text-gray-400 ${message.user_id === user.sub ? 'ml-auto' : 'mr-auto'}`}>
                                                        {formatDate(message.createdAt)}
                                                    </span>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className={`${message.user_id === user.sub ? 'ml-auto' : 'mr-auto'}`}>
                                                        <div className={`inline-block px-4 py-2 rounded-lg ${message.user_id === user.sub ? 'bg-turquesa-500 text-white' : 'bg-gray-200'}`}>
                                                            {renderMessageContent(message)}
                                                        </div>
                                                    </div>
                                                    <span className={`text-xs text-gray-400 ${message.user_id === user.sub ? 'ml-auto' : 'mr-auto'}`}>
                                                        {message.user_id === user.sub ? `Yo ${formatDate(message.createdAt)}` : `${getUserName(message.user_id)} ${formatDate(message.createdAt)}`}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                        </dl>
                    </div>
                    
                    <div className="flex items-start content-start justify-center">
                        <button 
                            onClick={go_back} 
                            className="flex-none rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja-500"
                        >
                            Volver
                        </button>
                    </div>
                    
                    <div className="flex content-start items-start gap-x-4">
                            
                        <button onClick={scrollToBottomOnClick} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-md transition duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                        </button>
                        <input
                            type="text"
                            placeholder="Escriba su mensaje"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleSendMessage();
                                }
                            }}
                            className="min-w-0 flex-auto rounded-md border-0 px-3.5 py-2 shadow-md ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleSendImage}
                            className="hidden"
                            id="fileInput"
                        />
                        <label htmlFor="fileInput" className="flex-none cursor-pointer rounded-md bg-turquesa-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-turquesa-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turquesa-500">
                            Adjuntar Foto
                        </label>
                        <button
                            type="submit"
                            className="flex-none rounded-md bg-naranja-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-naranja-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naranja-500"
                            onClick={handleSendMessage}
                        >
                            Enviar
                        </button>
                    </div>
                </div>
            </div>

            {expandedImage && (
                <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 z-50 flex justify-center items-center">
                    <button
                        className="absolute top-0 right-0 m-4 text-white text-3xl"
                        onClick={() => setExpandedImage(null)}
                    >
                        &times;
                    </button>
                    <img
                        src={expandedImage}
                        alt="Imagen expandida"
                        className="max-w-full max-h-full w-auto h-auto"
                        onClick={() => setExpandedImage(null)}
                    />
                </div>
            )}
        </div>
    );
};

export default Chat;
