import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { SOLICITUD_ENDPOINT } from '../utils/apiRoutes';

//imagenes
import logo from '../assets/speedclean-logo.png'; 


const formatRUT = (rut) => {
    // Elimina cualquier carácter no válido
    rut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    // Formatea el RUT
    if (rut.length > 7) {
      rut = rut.replace(/^(\d{1,2})(\d{3})(\d{3})(\w{1})$/, '$1.$2.$3-$4');
    } else if (rut.length === 7) {
      rut = rut.replace(/^(\d{1,3})(\d{3})(\d{1})$/, '$1.$2-$3');
    } else if (rut.length === 6) {
      rut = rut.replace(/^(\d{1,3})(\d{3})(\d{1})$/, '$1.$2-$3');
    } else if (rut.length === 5) {
      rut = rut.replace(/^(\d{1,2})(\d{3})(\d{1})$/, '$1.$2-$3');
    } else if (rut.length === 4) {
      rut = rut.replace(/^(\d{1,3})(\d{1})$/, '$1-$2');
    } else if (rut.length === 3) {
      rut = rut.replace(/^(\d{1,2})(\d{1})$/, '$1-$2');
    } else if (rut.length === 2) {
      rut = rut.replace(/^(\d{1})(\d{1})$/, '$1-$2');
    }
    return rut;
}

const machineDecode = (text) => {
    let ntext = '';
    for (let i = 0; i < text.length; i++) {
      let letra = text[i];
      let nl = String.fromCharCode(letra.charCodeAt(0) - 20);
      ntext += nl;
    }
    return ntext.replace('ACT.EQ-', '');
}

const FormCliente = () => {
    const [rut, setRut] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [telefono, setTelefono] = useState('');
    const [residente, setResidente] = useState(true);
    const [departamento, setDepartamento] = useState('');
    const [correo, setCorreo] = useState('');
    const [servicio, setServicio] = useState('Secadora no seca');
    const [otraRazon, setOtraRazon] = useState('');
    const [monto, setMonto] = useState('');
    const [medio, setMedio] = useState('electrónica');
    const [banco, setBanco] = useState('Banco Santander');
    const [tipocuenta, setTipocuenta] = useState('Cuenta Corriente');
    const [numerocuenta, setNumerocuenta] = useState('');
    const [direccion, setDireccion] = useState(''); // Estado para la dirección

    const { num_maquina } = useParams(); //cuantum
    const navigate = useNavigate();


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${SOLICITUD_ENDPOINT}/form-init/${num_maquina}`);
                const { building_address } = response.data;
                setDireccion(building_address); // Actualizar estado con la dirección obtenida
            } catch (error) {
                console.error('Error fetching machine address:', error);
            }
        };

        fetchData();
    }, [num_maquina]);

    const handleRutBlur = (e) => {
        const inputRut = e.target.value;
        const formattedRut = formatRUT(inputRut);
        setRut(formattedRut);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(correo)) {
                alert('Por favor, ingrese una dirección de correo electrónico válida.');
                return;
            }

        
        const numPattern = /^[0-9]+$/;

        if (medio === 'manual') {
            setBanco('');
            setTipocuenta('');
            setNumerocuenta('');
        }



        if (!numPattern.test(telefono)) {
            alert('Teléfono debe contener solo dígitos');
            return;
        }

        if (medio === 'electrónica' && !numPattern.test(numerocuenta)) {
            alert('Cuenta debe contener solo dígitos');
            return; 
        }

        try {
            
            let tipoSolicitud = servicio;
            let banco_send = banco;
            let tipocuenta_send = tipocuenta;
            let numerocuenta_send = numerocuenta;
            let departamento_send = departamento;
            let telefono_send = "+56" + telefono

            if (servicio === 'Otra razón') {
                tipoSolicitud = otraRazon;
            }
            if (medio === 'manual') {
                banco_send = '';
                tipocuenta_send = '';
                numerocuenta_send = '';
            }
            if (residente === false) {
                departamento_send = '';
            }


            const requestData = {
                "machine": num_maquina,  // code
                //"direccion": "Dirección XX",   //// falta obtener
                "rut": rut,
                "first_name": nombre,
                "last_name": apellido,
                "phone_number": telefono_send,    
                "department_number": departamento_send, //
                "email": correo,
                "comment": tipoSolicitud,
                "requested_money": monto, 
                "money_return_type": medio,
                "bank": banco_send,
                "account_type": tipocuenta_send,
                "account_number": numerocuenta_send
            };



            // Make the POST request
            const response = await axios.post(SOLICITUD_ENDPOINT, requestData);  

            // console.log('Response:', response.data);
            navigate('/finformcliente');
        } catch (error) {
            console.error('Error:', error);
            
        }

    };

    return (
        <div className='h-full flex justify-center items-center' >
            <form onSubmit={handleSubmit} className='bg-white p-10 rounded-lg shadow-md '>
                <div className='flex justify-center items-center mb-2'> 
                    <img src={logo} alt='SpeedClean Logo'/>
                </div>
                <h1 className='text-2xl font-bold text-center'>Solicitud de Servicio</h1>
                <p className='text-xl text-center'>Máquina Nº {machineDecode(num_maquina)}</p> 
                <p className='text-xl text-center'>Dirección: {direccion}</p> 
                <p className='text-xl font-bold text-left'><br />Ingrese sus datos</p>

                <div className='mt-5'>
                    <label htmlFor='rut' className='block'>RUT</label>
                    <input type='text' id='rut' value={rut} onChange={(e) => setRut(e.target.value)} onBlur={handleRutBlur} required  minLength={8} maxLength={12} className='w-full p-2 border border-gray-300 rounded-md'/>
                </div>
                <div className='mt-1'>
                    <label htmlFor='nombre' className='block'>Nombre</label>
                    <input type='text' id='nombre' value={nombre} onChange={(e) => setNombre(e.target.value)} required className='w-full p-2 border border-gray-300 rounded-md' /> 
                </div>
                <div className='mt-1'>
                    <label htmlFor='apellido' className='block'>Apellido</label>
                    <input type='text' id='apellido' value={apellido} onChange={(e) => setApellido(e.target.value)} required className='w-full p-2 border border-gray-300 rounded-md' /> 
                </div>
                <label htmlFor='telefono' className='block'>Teléfono Celular</label>
                <div className='mt-1 flex items-center'> 
                    <span className='mr-2'>+56</span>
                    <input type='text' id='telefono' value={telefono} onChange={(e) => setTelefono(e.target.value)} required minLength={9} maxLength={9} className='w-full p-2 border border-gray-300 rounded-md' /> 
                </div>

                <div className='mt-1'>
                    <label htmlFor='residente' className='block'>
                        <input type='checkbox' id='residente' defaultChecked onChange={(e) => setResidente(e.target.checked)} className='mr-2 custom-checkbox' />
                        Soy residente del edificio
                    </label>
                </div>

                {residente === true && (
                    <div className='mt-1'>
                        <label htmlFor='departamento' className='block'>Departamento</label>
                        <input type='text' id='departamento' value={departamento} onChange={(e) => setDepartamento(e.target.value)} required className='w-full p-2 border border-gray-300 rounded-md' /> 
                    </div>
                )}


                <div className='mt-1'>
                    <label htmlFor='correo' className='block'>Correo</label>
                    <input type='email' id='correo' value={correo} onChange={(e) => setCorreo(e.target.value)} required className='w-full p-2 border border-gray-300 rounded-md' /> 
                </div>

                <p className='text-xl font-bold text-left'><br />Ingrese su solicitud</p>
                <div className='mt-5'>
                    <select id='servicio' value={servicio} onChange={(e) => setServicio(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md'>
                        <option value='Secadora no seca'>Secadora no seca</option>
                        <option value='Lavadora no centrifuga'>Lavadora no centrifuga</option>
                        <option value='Lavadora no parte'>Lavadora no parte</option>
                        <option value='Monedero no acepta monedas'>Monedero no acepta monedas</option>
                        <option value='Monedero no descuenta monedas'>Monedero no descuenta monedas</option>
                        <option value='Otra razón'>Otra razón</option>
                    </select>
                </div>

                {servicio === 'Otra razón' && (
                    <div className='mt-1'>
                        <label htmlFor='otraRazon' className='block'>Detalles de la otra razón</label>
                        <input type='text' id='otraRazon' value={otraRazon} onChange={(e) => setOtraRazon(e.target.value)} required className='w-full p-2 border border-gray-300 rounded-md' />
                    </div>
                )}

                <div className='mt-1'>
                    <label htmlFor='monto' className='block'>Monto solicitado</label>
                    <input type='number' id='monto' value={monto} onChange={(e) => setMonto(e.target.value.replace(/\D/g, ''))} min='0' required className='w-full p-2 border border-gray-300 rounded-md' /> 
                </div>

                <div className='mt-1'>
                    <select id='medio' value={medio} onChange={(e) => setMedio(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md'>
                        <option value='electrónica'>Devolución vía electrónica</option>
                        <option value='manual'>Devolución vía manual</option>
                    </select>
                </div>

                {medio === 'electrónica' && (
                    <div className='mt-1' style={{ maxWidth: '500px', margin: 'auto' }}>
                        <p className='text-l font-bold text-left text-red-500'><br />A partir de la aceptación y término de la solicitud, se realizará la devolución el viernes de la semana siguiente.</p>
                        <p className='text-xl font-bold text-left'><br />Información bancaria</p>
                        <select id='banco' value={banco} onChange={(e) => setBanco(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md'>
                            <option value='Banco Santander'>Banco Santander</option>
                            <option value='Banco Santander Banefe'>Banco Santander Banefe</option>
                            <option value='Scotiabank Azul'>Scotiabank Azul</option>
                            <option value='Banco BICE'>Banco BICE</option>
                            <option value='Banco Internacional'>Banco Internacional</option>
                            <option value='Banco Itaú'>Banco Itaú</option>
                            <option value='Banco de Chile / Edwards-Citi'>Banco de Chile / Edwards-Citi</option>
                            <option value='Corpbanca'>Corpbanca</option>
                            <option value='Banco Crédito e Inversiones'>Banco Crédito e Inversiones</option>
                            <option value='Banco del Desarrollo'>Banco del Desarrollo</option>
                            <option value='Banco Estado'>Banco Estado</option>
                            <option value='Banco Falabella'>Banco Falabella</option>
                            <option value='Banco Security'>Banco Security</option>
                            <option value='Scotiabank'>Scotiabank</option>
                            <option value='HSBC Bank'>HSBC Bank</option>
                            <option value='Banco Ripley'>Banco Ripley</option>
                            <option value='Banco Consorcio'>Banco Consorcio</option>
                            <option value='Coopeuch'>Coopeuch</option>
                            <option value='Dresdner Bank Leteinamerika'>Dresdner Bank Leteinamerika</option>
                            <option value='Banco Do Brasil S.A.'>Banco Do Brasil S.A.</option>
                            <option value='JP Morgan Chase Bank'>JP Morgan Chase Bank</option>
                            <option value='Banco de la Nación Argentina'>Banco de la Nación Argentina</option>
                            <option value='The Bank of Tokyo - Mitsubishi'>The Bank of Tokyo - Mitsubishi</option>
                            <option value='Abn Amro Bank (Chile)'>Abn Amro Bank (Chile)</option>
                            <option value='Deutsche Bank (Chile)'>Deutsche Bank (Chile)</option>
                            <option value='HNS Banco'>HNS Banco</option>
                            <option value='Banco Monex'>Banco Monex</option>
                            <option value='BBVA Banco Bhif'>BBVA Banco Bhif</option>
                            <option value='Banco Conosur'>Banco Conosur</option>
                        </select>
                        <select id='tipocuenta' value={tipocuenta} onChange={(e) => setTipocuenta(e.target.value)} className='w-full p-2 border border-gray-300 rounded-md mt-1'>
                            <option value='Cuenta Corriente'>Cuenta Corriente</option>
                            <option value='Cuenta Vista'>Cuenta Vista</option>
                            <option value='Chequera Electrónica'>Chequera Electrónica</option>
                            <option value='Cuenta de Ahorro'>Cuenta de Ahorro</option>
                        </select>
                        <div className='mt-1'>
                            <label htmlFor='numerocuenta' className='block'>Número de Cuenta</label>
                            <input type='text' id='numerocuenta' value={numerocuenta} onChange={(e) => setNumerocuenta(e.target.value)} required maxLength={20} className='w-full p-2 border border-gray-300 rounded-md' /> 
                        </div>
                        
                    </div>
                )}

                {medio === 'manual' && (
                    <div className='mt-1' style={{ maxWidth: '500px', margin: 'auto' }}>
                        <p className='text-l font-bold text-left text-red-500'><br />Tenga en consideración que su devolución se efectuará hasta en 15 días hábiles (3 semanas) partir de la aceptación y término de la solicitud.</p>
                    </div>
                )}


                {/*Ver lo del captcha*/}

                
                <div className='mt-5'>
                    <button type='submit' className='w-full bg-turquesa-500 hover:bg-turquesa-600 text-white p-2 rounded-md'>Enviar</button>
                </div>
            </form>
        </div>
    )
};

export default FormCliente;
