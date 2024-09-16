import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAudio, faFileVideo, faFileImage, faFilePdf, faFileWord, faFileExcel, faFilePowerpoint, faFileCode, faFileArchive, faFileAlt } from '@fortawesome/free-regular-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function Dropbox({ users }) {
  const [file, setFile] = useState(null);
  const [allowedUsers, setAllowedUsers] = useState(users.map(user => user.id));
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    fetch(`http://localhost:5000/dashboard/files/${userId}`)
      .then(res => res.json())
      .then(data => setUploadedFiles(data))
      .catch(err => console.error('Error fetching files:', err));
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUserSelect = (e) => {
    const userId = parseInt(e.target.value);
    setAllowedUsers((prev) =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploader_id', localStorage.getItem('userId'));
    formData.append('allowed_users', JSON.stringify(allowedUsers));

    const res = await fetch('http://localhost:5000/dashboard/upload', {
      method: 'POST',
      body: formData
    });

    if (res.ok) {
      const data = await res.json();
      alert('File uploaded successfully!');
      setUploadedFiles(prevFiles => [...prevFiles, data.file]);
      setFile(null);
    } else {
      alert('File upload failed!');
    }
  };

  const handleFileDelete = async (fileId) => {
    const res = await fetch(`http://localhost:5000/dashboard/file/${fileId}`, {
      method: 'DELETE',
    });

    if (res.ok) {
      setUploadedFiles(uploadedFiles.filter(file => file.id !== fileId));
      alert('File deleted successfully!');
    } else {
      alert('Failed to delete the file.');
    }
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();

    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return <FontAwesomeIcon icon={faFileImage} className="text-blue-500" />;
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
        return <FontAwesomeIcon icon={faFileVideo} className="text-purple-500" />;
      case 'mp3':
      case 'wav':
      case 'ogg':
        return <FontAwesomeIcon icon={faFileAudio} className="text-green-500" />;
      case 'pdf':
        return <FontAwesomeIcon icon={faFilePdf} className="text-red-500" />;
      case 'doc':
      case 'docx':
        return <FontAwesomeIcon icon={faFileWord} className="text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FontAwesomeIcon icon={faFileExcel} className="text-green-600" />;
      case 'ppt':
      case 'pptx':
        return <FontAwesomeIcon icon={faFilePowerpoint} className="text-orange-600" />;
      case 'zip':
      case 'rar':
      case '7z':
        return <FontAwesomeIcon icon={faFileArchive} className="text-yellow-500" />;
      case 'js':
      case 'html':
      case 'css':
      case 'json':
        return <FontAwesomeIcon icon={faFileCode} className="text-gray-600" />;
      case 'txt':
        return <FontAwesomeIcon icon={faFileAlt} className="text-gray-500" />;
      default:
        return <FontAwesomeIcon icon={faFileAlt} className="text-gray-400" />;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-6">
      <h2 className="text-3xl font-bold mb-4">Dropbox</h2>

      {/* Dropzone */}
      <div
        className="border-dashed border-4 border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50"
        onClick={() => document.getElementById('file-input').click()}
      >
        {file ? (
          <p className="text-green-600 font-semibold">Selected file: {file.name}</p>
        ) : (
          <p className="text-gray-500">Drag & drop a file here or click to select a file</p>
        )}
        <input
          type="file"
          id="file-input"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <label className="block text-lg mt-4 font-medium">Select Users Who Can View:</label>
      <div className="h-32 overflow-y-scroll grid grid-cols-2 gap-4 border rounded-lg p-4 bg-gray-100">
        {users.map(user => (
          <div key={user.id} className="flex items-center">
            <input
              type="checkbox"
              id={`user-${user.id}`}
              value={user.id}
              checked={allowedUsers.includes(user.id)}
              onChange={handleUserSelect}
              className="mr-2"
            />
            <label htmlFor={`user-${user.id}`}>{user.username}</label>
          </div>
        ))}
      </div>

      <button
        onClick={handleUpload}
        className="mt-4 bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded transition duration-200"
      >
        Upload
      </button>

      {/* Display uploaded files */}
      <h3 className="text-2xl font-semibold mt-6">Uploaded Files</h3>
      <ul className="space-y-4">
        {uploadedFiles.length > 0 ? (
          uploadedFiles.map(file => (
            <li key={file.id} className="flex justify-between items-center p-4 bg-gray-100 rounded shadow-sm">
              <div className="flex items-center space-x-4">
                {getFileIcon(file.filename)}
                <a
                  href={`http://localhost:5000/download/${file.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-semibold underline"
                >
                  {file.filename}
                </a>
              </div>
              <button
                onClick={() => handleFileDelete(file.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 transition duration-200"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </li>
          ))
        ) : (
          <li className="text-gray-500">No files available</li>
        )}
      </ul>
    </div>
  );
}

export default Dropbox;
