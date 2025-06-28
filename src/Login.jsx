import { generateCodeChallenge, generateCodeVerifier } from './auth/pkceUtils';
import DKLogo from './DKLogo';
import SpotifyLogo from './SpotifyLogo';
import { ScanSearch, AudioLines, LibraryBig } from "lucide-react";

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const redirectUri ='https://instructorplaylist.netlify.app/callback';
const scope = 'playlist-read-private playlist-modify-private playlist-modify-public user-library-read user-top-read streaming user-read-email user-read-private user-modify-playback-state';

function Login() {
  const handleLogin = async () => {
    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem('verifier', verifier);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scope,
      redirect_uri: redirectUri,
      code_challenge_method: 'S256',
      code_challenge: challenge
    });

    window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
  };

  return (
    <>      
      {/* Fixed-positioned logos */}
      <div className="absolute top-0 left-0 z-10">
        <SpotifyLogo />
      </div>
      <div className="absolute top-0 right-0 z-10">
        <DKLogo />
      </div>

      {/* Page Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-8 md:px-12 lg:px-24 space-y-20 text-left">
        
        {/* Hero Section */}
        <div className="bg-white/30 backdrop-blur-md rounded-3xl shadow-2xl px-6 sm:px-12 md:px-24 py-16 w-full max-w-4xl">
          <h1 className="text-black font-bold mb-2 text-[clamp(2rem,5vw,4rem)] leading-tight flex mx-auto justify-center">🏃🏽‍♂️ Instructor Playlist</h1>
          <h2 className="text-black font-bold mb-6 text-[clamp(1.25rem,3vw,2rem)] flex mx-auto justify-center">Your Mix, Made Fast.</h2>
          <p className="text-black mb-10 text-[clamp(1rem,2vw,1.25rem)] max-w-2xl mx-auto">
            Being a fitness instructor requires a lot of effort, much of which happens behind the scenes.
            Save time creating playlists for your fitness classes while tailoring it to your exact needs.
          </p>
          <button
            onClick={handleLogin}
            className="bg-green-500 text-white text-lg sm:text-xl px-8 py-3 mx-auto justify-center flex rounded-full hover:bg-green-800 transition-colors"
          >
            Login with Spotify
          </button>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl sm:px-8">
          {[{icon: <ScanSearch className="w-6 h-6 text-black text-[clamp(1.25rem,2.5vw,1.5rem)]" />, title: "Explore Your Music", text: "Find the perfect vibe with a wider scope of your saved music."},
            {icon: <AudioLines className="w-6 h-6 text-black text-[clamp(1.25rem,2.5vw,1.5rem)]" />, title: "Select Perfect Songs", text: "Choose songs that will fit the exact timeline of your class."},
            {icon: <LibraryBig className="w-6 h-6 text-black text-[clamp(1.25rem,2.5vw,1.5rem)]" />, title: "Save Your Playlist", text: "Save your playlist directly in-app to your Spotify account."}
          ].map((feature, i) => (
            <div key={i} className="bg-white/30 backdrop-blur-md rounded-3xl shadow-2xl py-12 px-8 text-left">
              <div className="flex items-center space-x-3 mb-4">
                {feature.icon}
                <h3 className="text-[clamp(1.25rem,2.5vw,1.5rem)] font-semibold">{feature.title}</h3>
              </div>
              <p className="text-black text-[clamp(1rem,2vw,1.25rem)]">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Login;
