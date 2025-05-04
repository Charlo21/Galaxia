// Character definitions for Galaxia
export const characters = {
    tibetanMastiff: {
        name: "Tibetan Mastiff",
        baseAttackPower: 12,
        specialAbility: "Guardian's Fury",
        color: "#8B4513",  // Saddle Brown
        soundEffect: "assets/sounds/effects/dog_attack.mp3.wav",
        model: "assets/models/tibetan_mastiff.fbx",
        stats: {
            health: 120,
            defense: 10,
            speed: 6
        }
    },
    sumatranTiger: {
        name: "Sumatran Tiger",
        baseAttackPower: 18,
        specialAbility: "Jungle Strike",
        color: "#FF4500",  // Orange Red
        soundEffect: "assets/sounds/effects/cat_sword attack.mp3.wav",
        model: "assets/models/sumatran_tiger.fbx",
        stats: {
            health: 95,
            defense: 7,
            speed: 10
        }
    },
    galaxyShip: {
        name: "Galaxy Ship",
        baseAttackPower: 22,
        specialAbility: "Nova Blast",
        color: "#4169E1",  // Royal Blue
        soundEffect: "assets/sounds/effects/ship_photon torpedo.mp3.wav",
        model: "assets/models/spaceship.fbx",
        stats: {
            health: 150,
            defense: 12,
            speed: 8
        }
    }
};
