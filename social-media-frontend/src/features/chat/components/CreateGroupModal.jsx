import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, List, ListItem, ListItemText, 
  Checkbox, ListItemAvatar, Avatar 
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { backendUrl } from '../../../Utils/backendUrl';

const CreateGroupModal = ({ open, onClose, onCreate }) => {
  const [groupName, setGroupName] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    if (open) {
      // Fetch followings to select from
      fetch(`${backendUrl}/api/message/followings`, { credentials: "include" })
        .then(res => res.json())
        .then(data => {
          if (data.status === 200 && data.followings[0]) {
            setFriends(data.followings[0].followings);
          }
        });
    }
  }, [open]);

  const handleToggle = (user) => {
    setSelectedUsers(prev => 
      prev.includes(user) ? prev.filter(u => u !== user) : [...prev, user]
    );
  };

  const handleSubmit = () => {
    if (!groupName || selectedUsers.length === 0) return;
    onCreate({ name: groupName, users: selectedUsers });
    setGroupName('');
    setSelectedUsers([]);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Create New Group</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Group Name"
          fullWidth
          variant="outlined"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
        <List sx={{ pt: 1, maxHeight: 300, overflow: 'auto' }}>
          {friends.map((friend) => (
            <ListItem key={friend} divider button onClick={() => handleToggle(friend)}>
              <ListItemAvatar>
                <Avatar><AccountCircle /></Avatar>
              </ListItemAvatar>
              <ListItemText primary={friend} />
              <Checkbox checked={selectedUsers.includes(friend)} />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={!groupName || selectedUsers.length === 0}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupModal;
