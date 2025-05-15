// Galaxia Music Player
// Creates a floating music player that works across the entire site

(function() {
    console.log('Music player script loaded');
    
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
    
    let audioPlayer = new Audio();
    audioPlayer.volume = 0.5;
    let currentTrack = '';
    let isMuted = false;
    
    // Create the music player UI
    function createMusicPlayer() {
        const playerContainer = document.createElement('div');
        playerContainer.id = 'music-player-container';
        playerContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 250px;
            background-color: #000;
            border: 2px solid #4169E1;
            border-radius: 10px;
            padding: 10px;
            color: white;
            font-family: Arial, sans-serif;
            z-index: 10000;
            box-shadow: 0 0 20px rgba(0, 0, 255, 0.5);
        `;
        
        // Create track info display
        const trackInfo = document.createElement('div');
        trackInfo.id = 'track-info';
        trackInfo.style.cssText = `
            text-align: center;
            margin-bottom: 10px;
            color: #4169E1;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        trackInfo.textContent = 'Loading music...';
        
        // Create change track button
        const changeButton = document.createElement('button');
        changeButton.textContent = 'Change Track';
        changeButton.style.cssText = `
            width: 100%;
            padding: 8px;
            margin-bottom: 10px;
            background: linear-gradient(to bottom, #4169E1, #1E40AF);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        `;
        changeButton.addEventListener('click', playRandomTrack);
        
        // Create volume controls
        const volumeControls = document.createElement('div');
        volumeControls.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        const muteButton = document.createElement('button');
        muteButton.id = 'mute-button';
        muteButton.textContent = '🔊';
        muteButton.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
        `;
        muteButton.addEventListener('click', toggleMute);
        
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.min = '0';
        volumeSlider.max = '1';
        volumeSlider.step = '0.1';
        volumeSlider.value = '0.5';
        volumeSlider.style.cssText = `
            flex-grow: 1;
        `;
        volumeSlider.addEventListener('input', changeVolume);
        
        // Assemble the player
        volumeControls.appendChild(muteButton);
        volumeControls.appendChild(volumeSlider);
        
        playerContainer.appendChild(trackInfo);
        playerContainer.appendChild(changeButton);
        playerContainer.appendChild(volumeControls);
        
        // Add to document body
        document.body.appendChild(playerContainer);
        
        console.log('Music player UI created');
        return { trackInfo, muteButton, volumeSlider };
    }
    
    // Play a random track
    function playRandomTrack() {
        const randomIndex = Math.floor(Math.random() * musicTracks.length);
        playTrack(musicTracks[randomIndex]);
    }
    
    // Play a specific track
    function playTrack(trackPath) {
        console.log(`Attempting to play: ${trackPath}`);
        
        // Update display
        const trackInfo = document.getElementById('track-info');
        if (trackInfo) trackInfo.textContent = 'Loading...';
        
        // Stop current track
        audioPlayer.pause();
        
        // Try with original path
        try {
            audioPlayer = new Audio(trackPath);
            audioPlayer.volume = document.querySelector('input[type="range"]').value;
            
            audioPlayer.addEventListener('canplaythrough', () => {
                audioPlayer.play();
                currentTrack = trackPath;
                
                // Update track display
                const trackName = trackPath.split('/').pop().replace('.mp3', '');
                if (trackInfo) trackInfo.textContent = trackName;
                console.log(`Now playing: ${trackName}`);
            });
            
            audioPlayer.addEventListener('error', () => {
                console.warn(`Error with path: ${trackPath}, trying alternate`);
                // Try alternate path
                tryAlternatePath(trackPath);
            });
            
            // When track ends, play another
            audioPlayer.addEventListener('ended', playRandomTrack);
            
        } catch (error) {
            console.error(`Error creating audio player: ${error}`);
            tryAlternatePath(trackPath);
        }
    }
    
    // Try alternate path format
    function tryAlternatePath(originalPath) {
        const alternatePath = originalPath.replace('front-end/', '');
        console.log(`Trying alternate path: ${alternatePath}`);
        
        try {
            audioPlayer = new Audio(alternatePath);
            audioPlayer.volume = document.querySelector('input[type="range"]').value;
            
            audioPlayer.addEventListener('canplaythrough', () => {
                audioPlayer.play();
                currentTrack = alternatePath;
                
                // Update track display
                const trackName = alternatePath.split('/').pop().replace('.mp3', '');
                const trackInfo = document.getElementById('track-info');
                if (trackInfo) trackInfo.textContent = trackName;
                console.log(`Now playing: ${trackName}`);
            });
            
            audioPlayer.addEventListener('error', () => {
                console.error(`Both paths failed for: ${originalPath}`);
                const trackInfo = document.getElementById('track-info');
                if (trackInfo) trackInfo.textContent = 'Error playing music';
                
                // Try another track after a delay
                setTimeout(playRandomTrack, 3000);
            });
            
            // When track ends, play another
            audioPlayer.addEventListener('ended', playRandomTrack);
            
        } catch (error) {
            console.error(`Error with alternate path: ${error}`);
            const trackInfo = document.getElementById('track-info');
            if (trackInfo) trackInfo.textContent = 'Error playing music';
            
            // Try another track after a delay
            setTimeout(playRandomTrack, 3000);
        }
    }
    
    // Toggle mute
    function toggleMute() {
        const muteButton = document.getElementById('mute-button');
        const volumeSlider = document.querySelector('input[type="range"]');
        
        if (isMuted) {
            // Unmute
            audioPlayer.volume = volumeSlider.value;
            if (muteButton) muteButton.textContent = '🔊';
            isMuted = false;
        } else {
            // Mute
            audioPlayer.volume = 0;
            if (muteButton) muteButton.textContent = '🔇';
            isMuted = true;
        }
    }
    
    // Change volume
    function changeVolume(e) {
        const muteButton = document.getElementById('mute-button');
        audioPlayer.volume = e.target.value;
        
        // Update mute button
        if (parseFloat(e.target.value) === 0) {
            if (muteButton) muteButton.textContent = '🔇';
            isMuted = true;
        } else {
            if (muteButton) muteButton.textContent = '🔊';
            isMuted = false;
        }
    }
    
    // Initialize everything
    function init() {
        console.log('Initializing music player');
        createMusicPlayer();
        playRandomTrack();
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
