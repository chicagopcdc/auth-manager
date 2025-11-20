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

      <footer style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <p>
            <a href="https://docs.pedscommons.org/PcdcPrivacyNotice/" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </p>
        </footer>
    </BrowserRouter>
  );
}

export default App;
