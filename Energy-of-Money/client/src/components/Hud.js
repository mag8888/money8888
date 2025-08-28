import React from 'react';
import { Box, Tabs, Tab, Typography, Divider, Card, CardContent, Chip, Grid } from '@mui/material';
import ProfessionCard from './ProfessionCard';
import { 
  Home as HomeIcon, 
  Business as BusinessIcon, 
  TrendingUp as TrendingUpIcon, 
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon 
} from '@mui/icons-material';

// Компонент для отображения активов
const AssetsPanel = ({ assets = [] }) => {
  console.log('🔄 [AssetsPanel] Rendering with assets:', assets);
  
  const getAssetIcon = (type) => {
    switch (type) {
      case 'realEstate': return <HomeIcon />;
      case 'business': return <BusinessIcon />;
      case 'stock': return <TrendingUpIcon />;
      case 'doodad': return <ShoppingCartIcon />;
      default: return <AttachMoneyIcon />;
    }
  };

  const getAssetColor = (type) => {
    switch (type) {
      case 'realEstate': return '#4CAF50';
      case 'business': return '#FF9800';
      case 'stock': return '#2196F3';
      case 'doodad': return '#F44336';
      default: return '#9C27B0';
    }
  };

  if (!assets || assets.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          У вас пока нет активов
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.5 }}>
          Покупайте карточки на игровом поле
        </Typography>

      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h6" sx={{ mb: 2, color: '#fff' }}>
        Ваши активы ({assets.length})
      </Typography>
      

      
      <Grid container spacing={1}>
        {assets.map((asset, index) => (
          <Grid item xs={12} key={asset.id || index}>
            <Card sx={{ 
              bgcolor: 'rgba(255,255,255,0.1)', 
              border: `1px solid ${getAssetColor(asset.type)}`,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
            }}>
              <CardContent sx={{ p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ 
                    color: getAssetColor(asset.type), 
                    mr: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {getAssetIcon(asset.type)}
                  </Box>
                  <Typography variant="subtitle2" sx={{ color: '#fff', flex: 1 }}>
                    {asset.name || `Актив ${index + 1}`}
                  </Typography>
                  <Chip 
                    label={asset.type || 'unknown'} 
                    size="small" 
                    sx={{ 
                      bgcolor: getAssetColor(asset.type),
                      color: '#fff',
                      fontSize: '0.7rem'
                    }} 
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ color: '#ccc' }}>
                    Стоимость: ${asset.cost?.toLocaleString() || 'N/A'}
                  </Typography>
                  {asset.cashflow && (
                    <Typography variant="caption" sx={{ color: '#4CAF50' }}>
                      +${asset.cashflow}/мес
                    </Typography>
                  )}
                </Box>
                
                {asset.description && (
                  <Typography variant="caption" sx={{ color: '#aaa', display: 'block' }}>
                    {asset.description}
                  </Typography>
                )}
                

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
  </div>
);

const Hud = ({ playerAssets = [] }) => {
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
        <AssetsPanel assets={playerAssets} />
      </TabPanel>
      <TabPanel value={tab} index={3}>
        <Typography variant="body1">Журнал событий</Typography>
      </TabPanel>
    </Box>
  );
};

export default Hud;




