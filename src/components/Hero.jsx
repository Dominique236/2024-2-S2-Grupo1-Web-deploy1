import {React} from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import logo from '../assets/speedclean-logo.png';

const Hero = () => {
    const { loginWithRedirect } = useAuth0();

    return (
        <div className='h-screen flex justify-center items-center bg-turquesa-500 text-black'>
            <div className="flex flex-col items-center bg-white p-8 rounded-lg shadow-lg">
                <img src={logo} style={{ width: '75%' }} alt='SpeedClean Logo' className="mb-8" />
                <h1 className='text-2xl mb-8'>¡Bienvenido!</h1>
                <button onClick={() => loginWithRedirect()} className="bg-turquesa-500 text-white font-semibold py-2 px-4 rounded-md transition duration-300 hover:bg-turquesa-600">Ingresar</button>
            </div>
        </div>
    );
}

export default Hero;
