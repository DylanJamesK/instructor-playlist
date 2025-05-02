import { useState } from 'react';
import { Edit, CirclePlus } from 'lucide-react';

export default function CardPanel() {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('Playlist Name');

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    setTitle(e.target.value);
  };

  const handleInputBlur = () => {
    setIsEditing(false);
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: '40px',
        marginBottom: '40px',
      }}
    >
      {/* Title, Subtitle, Icon */}
      <div style={{ marginBottom: '16px', marginTop: '100px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          {isEditing ? (
            <input
              type="text"
              id="playlistName"
              value={title}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              autoFocus
              style={{
                fontSize: '41.75px',
                fontWeight: 'bold',
                border: '1px dotted #ccc',
                borderRadius: '8px',
                padding: '4px',
                width: '545px',
              }}
            />
          ) : (
            <>
              <h2
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  margin: 0,
                  marginRight: '12px',
                }}
              >
                {title}
              </h2>
              <Edit
                size={18}
                style={{ cursor: 'pointer', marginTop: '20px' }}
                onClick={handleEditClick}
              />
            </>
          )}
        </div>
        <p style={{ fontSize: '16px', marginBottom: '8px', paddingBottom:'8px' }}>
          This is a subtitle for context or instructions.
        </p>
        <div
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '16px',
  }}
    >
    <CirclePlus size={45} style={{ color: '#ffffff', fill: '#000000' }} />

    <button
        className="button"
        style={{
        color: '#fff',
        padding: '8px 32px',
        borderRadius: '80px',
        border: 'none',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        }}
        onClick={() => alert('Create Playlist clicked!')}
    >
        Create Playlist
    </button>
    </div>      
    </div>

      {/* Gray Panel */}
      <div
        style={{
          flex: 1,
          height: '40vh',
          backgroundColor: '#ededed',
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Additional content can go here */}
      </div>
    </div>
  );
}
