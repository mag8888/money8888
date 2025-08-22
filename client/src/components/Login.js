import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Avatar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import CasinoIcon from '@mui/icons-material/Casino';

const theme = createTheme({
  palette: { mode: 'dark', primary: { main: '#FFD700' }, background: { default: 'linear-gradient(to bottom, #0F0C29, #302B63, #24243E)' } },
});

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({ email, isAdmin: email === 'admin@example.com' });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ height: '100vh', background: theme.palette.background.default, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 1, fontSize: 40 }}><CasinoIcon /></Avatar>
          <Typography variant="h4" sx={{ color: 'white' }}>CashFlow Web</Typography>
        </Box>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 300 }}>
          <TextField fullWidth placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mb: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2, input: { color: 'white' } }} InputProps={{ sx: { '&:before': { borderBottom: 'none' }, '&:after': { borderBottom: 'none' } } }} required />
          <TextField fullWidth type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mb: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2, input: { color: 'white' } }} InputProps={{ sx: { '&:before': { borderBottom: 'none' }, '&:after': { borderBottom: 'none' } } }} required />
          <Button fullWidth variant="contained" color="primary" type="submit" sx={{ borderRadius: 20 }}>Войти</Button>
        </form>
      </Box>
    </ThemeProvider>
  );
};

export default Login;
