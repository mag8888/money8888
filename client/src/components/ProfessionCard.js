import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, Divider, Grid, Paper } from '@mui/material';
import socket from '../socket';

const SectionHeader = ({ children }) => (
  <Box sx={{ bgcolor: '#6E4D92', color: 'white', px: 1, py: 0.5, borderRadius: 0.5, mb: 1, width: 'fit-content' }}>
    <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: 1 }}>{children}</Typography>
  </Box>
);

const Row = ({ label, value }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.4 }}>
    <Typography variant="body2" sx={{ opacity: 0.9 }}>{label}</Typography>
    <Typography variant="body2" sx={{ fontWeight: 700 }}>{value ?? '—'}</Typography>
  </Box>
);

const currency = (n) => (typeof n === 'number' ? n.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—');

const ProfessionCard = ({ roomId }) => {
  const [me, setMe] = useState(null);

  useEffect(() => {
    console.log('ProfessionCard useEffect triggered for roomId:', roomId, 'socket.id:', socket.id);

    const onPlayers = (list) => {
      console.log('ProfessionCard received players list:', list);
      const found = Array.isArray(list) ? list.find(p => p.id === socket.id) : null;
      console.log('ProfessionCard found me:', found);
      if (found) setMe(found);
    };
    const onPlayerUpdated = (player) => {
      console.log('ProfessionCard player updated:', player);
      if (player?.id === socket.id) setMe(player);
    };
    
    if (roomId) {
      console.log('ProfessionCard emitting getPlayers for roomId:', roomId);
      socket.emit('getPlayers', roomId);
    } else {
      console.warn('ProfessionCard: roomId is null or undefined, cannot get players.');
    }
    
    socket.on('playersList', onPlayers);
    socket.on('playerUpdated', onPlayerUpdated);
    
    return () => {
      console.log('ProfessionCard cleanup for roomId:', roomId);
      socket.off('playersList', onPlayers);
      socket.off('playerUpdated', onPlayerUpdated);
    };
  }, [roomId]);

  const totalIncome = useMemo(() => {
    if (!me) return 0;
    const salary = Number(me.salary || 0);
    const passive = Number(me.passiveIncome || 0);
    return salary + passive;
  }, [me]);

  const expensesEntries = useMemo(() => {
    if (!me || !me.expenses) return [];
    const entries = Object.entries(me.expenses).map(([k, v]) => ({ key: k, value: v }));
    // Order common fields roughly like on the card
    const order = ['taxes', 'homeMortgage', 'carLoan', 'creditCard', 'retail', 'other'];
    return entries.sort((a, b) => (order.indexOf(a.key) - order.indexOf(b.key)));
  }, [me]);

  if (!me) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Загрузка данных игрока...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ID: {socket.id}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Room ID: {roomId || 'N/A'}
        </Typography>
      </Box>
    );
  }

  // Debug information
  console.log('ProfessionCard render - me:', me);
  console.log('ProfessionCard - totalExpenses:', me.totalExpenses);
  console.log('ProfessionCard - expenses:', me.expenses);

  return (
    <Paper elevation={6} sx={{ p: 2, bgcolor: '#F5E8D3', color: '#2c1b33', borderRadius: 2, border: '1px solid #d2c2aa' }}>
      <Grid container spacing={2}>
        <Grid item xs={7}>
          <SectionHeader>INCOME</SectionHeader>
          <Row label={`${me.profession || 'Profession'} Salary:`} value={`$${currency(me.salary)}`} />
          <Row label={'Interest/Dividends'} value={`$${currency(me.passiveIncome)}`} />
          <Row label={'Real Estate/Business'} value={'—'} />

          <Box sx={{ my: 1 }} />
          <SectionHeader>EXPENSES</SectionHeader>
          {expensesEntries.map(e => (
            <Row key={e.key} label={e.key} value={`$${currency(e.value)}`} />
          ))}
        </Grid>

        <Grid item xs={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, textAlign: 'right' }}>INCREASE PASSIVE INCOME TO ESCAPE THE RAT RACE.</Typography>
            <Box sx={{ border: '2px solid #6E4D92', borderRadius: 1, p: 1 }}>
              <Row label={'Total Expenses:'} value={`$${currency(me.totalExpenses)}`} />
            </Box>
            <Row label={'Passive Income:'} value={`$${currency(me.passiveIncome)}`} />
            <Divider sx={{ my: 0.5 }} />
            <Row label={'CASH:'} value={`$${currency(me.balance)}`} />
            <Divider sx={{ my: 0.5 }} />
            <Row label={'Total Income:'} value={`$${currency(totalIncome)}`} />
            <Row label={'Total Expenses:'} value={`$${currency(me.totalExpenses)}`} />
            <Row label={'PAYDAY'} value={`$${currency((me.monthlyCashflow ?? (totalIncome - (me.totalExpenses || 0))) || 0)}`} />
          </Box>
        </Grid>

        <Grid item xs={6}>
          <SectionHeader>ASSETS</SectionHeader>
          <Row label={'Stocks/Funds/CDs'} value={'—'} />
          <Row label={'Real Estate/Business'} value={'—'} />
        </Grid>
        <Grid item xs={6}>
          <SectionHeader>LIABILITIES</SectionHeader>
          {me.liabilities && Object.entries(me.liabilities).map(([k, v]) => (
            <Row key={k} label={k} value={`$${currency(v)}`} />
          ))}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default ProfessionCard;


