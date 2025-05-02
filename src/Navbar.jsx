import InstructorPlaylistLogo from './InstructorPlaylistLogo';
import SpotifyLogo from './SpotifyLogo';

export default function Navbar() {
  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        zIndex: 1000,
        background: 'transparent',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)', // optional
      }}
    >
      <SpotifyLogo />
      <InstructorPlaylistLogo/>
    </nav>
  );
}
