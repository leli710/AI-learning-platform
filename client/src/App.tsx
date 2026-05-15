import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        {/* דף הכניסה */}
        <Route path="/login" element={<Login />} />
        
        {/* אם המשתמש נכנס לדף לא קיים, נשלח אותו ללוגין */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;