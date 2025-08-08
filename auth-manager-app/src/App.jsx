import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './components/Login/Login';
import Users from './components/Users/Users';
import Permissions from './components/Permissions/Permissions';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/users' element={<Users />} />
        <Route path='/permissions' element={<Permissions />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
