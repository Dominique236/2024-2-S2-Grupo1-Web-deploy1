import React from 'react';
import './App.css';
import Routing from './Routing';
import { UserProvider } from './contexts/UserContext';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';



function App() {
  return (
    <>
      <UserProvider>
        <Routing />
      </UserProvider>
    </>
  );
}

export default App;
