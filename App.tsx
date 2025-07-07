import * as React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Entry from './components/Entry';
import ViewPage from './components/ViewPage';
import { DailyTaking } from './types';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        {location.pathname !== '/' && (
          <IconButton edge="start" color="inherit" aria-label="back" onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
        )}
        <Button color="inherit" onClick={() => navigate('/')}>Home</Button>
        <Button color="inherit" onClick={() => navigate('/entry')}>Entry</Button>
        <Button color="inherit" onClick={() => navigate('/view')}>View</Button>
      </Toolbar>
    </AppBar>
  );
}

function App() {
  const [entryData, setEntryData] = React.useState<DailyTaking | null>(null);

  const handleEntryChange = (data: DailyTaking) => {
    setEntryData(data);
  };

  return (
    <Router>
      <Header />
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/entry" element={<Entry onChange={handleEntryChange} />} />
          <Route path="/view" element={<ViewPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
