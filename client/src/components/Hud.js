import React from 'react';
import { Box, Tabs, Tab, Typography, Divider } from '@mui/material';
import ProfessionCard from './ProfessionCard';

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
  </div>
);

const Hud = () => {
  const [tab, setTab] = React.useState(0);
  return (
    <Box sx={{ width: 320, bgcolor: 'rgba(0,0,0,0.2)', borderLeft: '1px solid rgba(255,255,255,0.08)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth" textColor="inherit" indicatorColor="secondary">
        <Tab label="События" />
        <Tab label="Финансы" />
        <Tab label="Активы" />
        <Tab label="Журнал" />
      </Tabs>
      <Divider />
      <TabPanel value={tab} index={0}>
        <Typography variant="body1" sx={{ opacity: 0.8 }}>Здесь будут карточки событий и действия</Typography>
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <ProfessionCard />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <Typography variant="body1">Список активов</Typography>
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <Typography variant="body1">Журнал событий</Typography>
      </TabPanel>
    </Box>
  );
};

export default Hud;




