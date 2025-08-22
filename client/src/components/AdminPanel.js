
import { useState } from 'react';
import socket from '../socket';

const AdminPanel = () => {
  const [decks, setDecks] = useState({}); // Load from server
  // UI for editing cards, professions
  const saveChanges = () => {
    socket.emit('updateConfig', decks); // Server saves to seed.json or DB
  };
  // Import/export buttons
  return <div>Admin CRUD UI</div>;
};

export default AdminPanel;


