import { useEffect, useState } from 'react';
import Dropbox from '../components/Dropbox.js';

function DropboxPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/dashboard/users')
      .then((res) => res.json())
      .then((data) => {
        const filteredUsers = data.filter(user => !user.isAdmin);
        setUsers(filteredUsers);
      });
  }, []);

  return  <Dropbox users={users} />;
}

export default DropboxPage;
