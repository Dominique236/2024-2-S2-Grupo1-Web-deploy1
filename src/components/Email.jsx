import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { SOLICITUD_ENDPOINT, EMAIL_ENDPOINT } from '../utils/apiRoutes'; 
import NavBar from './NavBar';

const Email = () => {
    const navigate = useNavigate();
    const { idSol } = useParams();
    const [clientEmail, setClientEmail] = useState('');
    const [clientName, setClientName] = useState('');
    const [subject, setSubject] = useState('');
    const [text, setText] = useState('');
    const [solState, setSolState] = useState('');
    const [techCompensation, setTechCompensation] = useState('');

    useEffect(() => {
        const fetchClientData = async () => {
            try {
                const response = await axios.get(`${SOLICITUD_ENDPOINT}/${idSol}`);
                const { client_email, client_name, request_state, request_tech_compensation } = response.data;
                setClientEmail(client_email);
                setClientName(client_name);
                setSolState(request_state);
                setTechCompensation(request_tech_compensation);

                const techMessage = request_tech_compensation || '[Detalle de recomendación de indemnización no enviado por el técnico]';

                if (request_state === "Aceptada") {
                    setSubject('Solicitud de indemnización de SpeedClean aprobada');
                    setText(
                      `Estimad@ ${client_name}, \n` +
                      "Respondiendo a su solicitud de devolución, se ha determinado la restitución total del dinero. \n\n" +
                      "Agradecemos su preferencia y reiteramos nuestro compromiso por brindarle a usted y toda la comunidad un buen servicio.\n\n" +
                      "Se despide atentamente, \n" +
                      "Equipo de Speed Clean"
                    );
                } else if (request_state === "Rechazada") {
                    setSubject('Solicitud de indemnización de SpeedClean rechazada');
                    setText(
                      `Estimad@ ${client_name}, \n` +
                      "Respondiendo a su solicitud de devolución, se ha determinado luego de revisar el estado de la máquina, que en este caso no corresponde una devolución. La razón de la falla de la máquina que entregaron nuestros especialistas es: \n" +
                      `${techMessage} \n\n` +
                      "Agradecemos su preferencia y entendiendo que pudiesen existir más antecedentes por parte suya no dude en contactarnos. \n\n" +
                      "Se despide atentamente, \n" +
                      "Equipo de SpeedClean"
                    );
                } else if (request_state === "Pendiente") {
                    setText(`Estimad@ ${client_name}, \nJunto con saludar, le informamos que `);
                }

            } catch (error) {
                console.error('Error fetching client data', error);
            }
        };

        fetchClientData();
    }, [idSol]);

    const handleVolver = () => {
        navigate('/solicitudes');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(clientEmail)) {
            alert('Por favor, ingrese una dirección de correo electrónico válida.');
            return;
        }

        if (!clientEmail || !subject || !text) {
            alert('Por favor, complete todos los campos.');
            return;
        }

        try {
            const requestData = {
                "email": clientEmail,
                "subject": subject,
                "text": text
            };
            await axios.post(EMAIL_ENDPOINT, requestData);
            alert('Correo enviado con éxito');
            navigate('/solicitudes');
        } catch (error) {
            console.error('Error sending email', error);
            alert('Error al enviar el correo');
        }
    };

    return (
        <div>
            <NavBar />
            <div className='container mx-auto px-4 mb-10'>
                <h3 className='text-3xl mt-10 first-line:font-bold text-gray-800'>Enviar Correo</h3>
            
                <form onSubmit={handleSubmit} className='bg-white mt-5 p-8 rounded-lg shadow-md'>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='email'>Destinatario</label>
                        <input 
                            type='email' 
                            id='email' 
                            value={clientEmail} 
                            onChange={(e) => setClientEmail(e.target.value)} 
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' 
                            required
                        />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='subject'>Asunto</label>
                        <input 
                            type='text' 
                            id='subject' 
                            value={subject} 
                            onChange={(e) => setSubject(e.target.value)} 
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' 
                            required
                        />
                    </div>
                    <div className='mb-4'>
                        <label className='block text-gray-700 text-sm font-bold mb-2' htmlFor='text'>Texto</label>
                        <textarea 
                            id='text' 
                            value={text} 
                            onChange={(e) => setText(e.target.value)} 
                            className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' 
                            rows='10' 
                            required
                        />
                    </div>
                    <div className='flex justify-center mt-5'>
                        <button 
                            type='button' 
                            onClick={handleVolver} 
                            className='bg-white mr-3 rounded px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto'>
                            Volver
                        </button>
                        <button 
                            type='submit' 
                            className='bg-turquesa-500 hover:bg-turquesa-400 font-semibold text-white p-2 rounded-md'>
                            Enviar
                        </button>
                    </div>   
                </form>
            </div>
        </div>
    );
};

export default Email;
