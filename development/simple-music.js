// Simple background music player for Galaxia
// Just plays random music tracks with no UI controls

(function() {
    console.log('Simple music player initialized');
    
    // Force a fresh selection on each page load
    const timestamp = new Date().getTime();
    console.log(`Page load timestamp: ${timestamp}`);
    
    // Use timestamp as a seed for randomization
    Math.seedrandom = function(seed) {
        var m = 0x80000000;
        var a = 1103515245;
        var c = 12345;
        var z = seed || Math.floor(Math.random() * m);
        return function() {
            z = (a * z + c) % m;
            return z / m;
        };
    };
    
    // Initialize with current timestamp to ensure different selection each page load
    Math.random = Math.seedrandom(timestamp);
    
    // List of music tracks
    const musicTracks = [
        'front-end/assets/sounds/music/Cosmic Pulse.mp3',
        'front-end/assets/sounds/music/Galaxia Combat 01.mp3',
        'front-end/assets/sounds/music/High-Energy Techno & Industrial 2.1.mp3',
        'front-end/assets/sounds/music/High-Energy Techno & Industrial 2.2.mp3',
        'front-end/assets/sounds/music/High-Energy Techno & Industrial-Inspired 1.mp3',
        'front-end/assets/sounds/music/High-Energy Techno & Industrial-Inspired 3.1.mp3',
        'front-end/assets/sounds/music/High-Energy Techno & Industrial-Inspired 3.2.mp3',
        'front-end/assets/sounds/music/Industrial Orbit.mp3',
        'front-end/assets/sounds/music/Nebula Core 1.mp3',
        'front-end/assets/sounds/music/Nebula Core 2.mp3',
        'front-end/assets/sounds/music/Quantum Circuitry 1.mp3',
        'front-end/assets/sounds/music/Quantum Circuitry 2.mp3',
        'front-end/assets/sounds/music/Stellar Drift 1.mp3',
        'front-end/assets/sounds/music/Stellar Drift 2.mp3'
    ];
    
    // Alternative paths to try if the first ones don't work
    const altMusicTracks = musicTracks.map(path => path.replace('front-end/', ''));
    
    // Audio player
    let audioPlayer = new Audio();
    audioPlayer.volume = 0.5; // Default volume at 50%
    
    // Track the last played index to avoid repeats
    let lastPlayedIndex = parseInt(localStorage.getItem('lastPlayedMusicIndex') || '-1');
    console.log(`Last played index from previous session: ${lastPlayedIndex}`);
    
    // Play a random track different from the last one
    function playRandomTrack() {
        // Get a random index different from the last one
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * musicTracks.length);
        } while (randomIndex === lastPlayedIndex && musicTracks.length > 1);
        
        // Update the last played index and store it
        lastPlayedIndex = randomIndex;
        localStorage.setItem('lastPlayedMusicIndex', randomIndex.toString());
        console.log(`Saved track index ${randomIndex} to localStorage`);
        
        // Get the track paths
        const trackPath = musicTracks[randomIndex];
        const altTrackPath = altMusicTracks[randomIndex];
        
        // Log which track we're playing
        console.log(`Selected track ${randomIndex + 1}/${musicTracks.length}: ${trackPath.split('/').pop()}`);
        
        console.log(`Attempting to play: ${trackPath}`);
        
        // Try the primary path first
        audioPlayer = new Audio(trackPath);
        audioPlayer.volume = 0.5;
        
        // Set up event handlers
        audioPlayer.addEventListener('canplaythrough', () => {
            console.log(`Playing track: ${trackPath.split('/').pop()}`);
            audioPlayer.play();
        });
        
        audioPlayer.addEventListener('error', () => {
            console.log(`Error with primary path, trying alternate: ${altTrackPath}`);
            // Try the alternate path
            audioPlayer = new Audio(altTrackPath);
            audioPlayer.volume = 0.5;
            
            audioPlayer.addEventListener('canplaythrough', () => {
                console.log(`Playing track (alt path): ${altTrackPath.split('/').pop()}`);
                audioPlayer.play();
            });
            
            audioPlayer.addEventListener('error', () => {
                console.error(`Both paths failed for track index ${randomIndex}`);
                // Try another track
                setTimeout(playRandomTrack, 2000);
            });
            
            // When track ends, play another
            audioPlayer.addEventListener('ended', playRandomTrack);
        });
        
        // When track ends, play another
        audioPlayer.addEventListener('ended', playRandomTrack);
    }
    
    // Initialize by playing a random track when the page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', playRandomTrack);
    } else {
        playRandomTrack();
    }
})();
