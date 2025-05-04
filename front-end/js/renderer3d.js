// 3D renderer for Galaxia characters
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';

export class CharacterRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
        
        // Set up renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(canvas.width, canvas.height);
        this.renderer.setClearColor(0x000000, 0);
        
        // Add lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        // Set up camera
        this.camera.position.z = 5;
        
        // Initialize loader
        this.loader = new GLTFLoader();
        
        // Store models
        this.models = {};
        this.currentModel = null;
        
        // Set up controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 10;
        
        // Start animation loop
        this.animate();

        // Loading indicator
        this.loadingElement = document.getElementById('loading');
    }
    
    async loadModel(characterId, modelPath) {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'block';
        }
        console.log(`Loading model: ${modelPath}`);

        return new Promise((resolve, reject) => {
            this.loader.load(modelPath,
                (gltf) => {
                    console.log(`Model loaded successfully: ${characterId}`);
                    const model = gltf.scene;
                    
                    // Center the model
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    model.position.sub(center);
                    
                    // Scale the model to fit the view
                    const size = box.getSize(new THREE.Vector3());
                    const maxDim = Math.max(size.x, size.y, size.z);
                    const scale = 2 / maxDim;
                    model.scale.multiplyScalar(scale);
                    
                    // Store the model
                    this.models[characterId] = model;

                    if (this.loadingElement && Object.keys(this.models).length === 3) {
                        this.loadingElement.style.display = 'none';
                    }
                    
                    resolve(model);
                },
                (xhr) => {
                    console.log(`${characterId} ${(xhr.loaded / xhr.total * 100)}% loaded`);
                },
                (error) => {
                    console.error(`Error loading model ${characterId}:`, error);
                    if (this.loadingElement) {
                        this.loadingElement.textContent = `Error loading ${characterId}. Please refresh.`;
                    }
                    reject(error);
                }
            );
        });
    }
    
    showCharacter(characterId) {
        console.log(`Showing character: ${characterId}`);
        // Remove current model if exists
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
        }
        
        // Show new model
        if (this.models[characterId]) {
            this.currentModel = this.models[characterId];
            this.scene.add(this.currentModel);
            console.log(`Character ${characterId} is now visible`);
        } else {
            console.error(`Model not found for character: ${characterId}`);
        }
    }
    
    async attack() {
        if (!this.currentModel) return;
        
        // Store original position and rotation
        const originalY = this.currentModel.rotation.y;
        const originalScale = this.currentModel.scale.x;
        
        // Attack animation
        const duration = 500; // milliseconds
        const start = Date.now();
        
        return new Promise(resolve => {
            const animate = () => {
                const now = Date.now();
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                
                // Rotate and scale during attack
                this.currentModel.rotation.y = originalY + Math.PI * 2 * progress;
                const scale = originalScale * (1 + Math.sin(progress * Math.PI) * 0.2);
                this.currentModel.scale.set(scale, scale, scale);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Reset to original state
                    this.currentModel.rotation.y = originalY;
                    this.currentModel.scale.set(originalScale, originalScale, originalScale);
                    resolve();
                }
            };
            
            animate();
        });
    }
    
    async specialAttack() {
        if (!this.currentModel) return;
        
        // Store original position and rotation
        const originalY = this.currentModel.rotation.y;
        const originalScale = this.currentModel.scale.x;
        
        // Special attack animation
        const duration = 1000; // milliseconds
        const start = Date.now();
        
        return new Promise(resolve => {
            const animate = () => {
                const now = Date.now();
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                
                // More dramatic rotation and scale
                this.currentModel.rotation.y = originalY + Math.PI * 4 * progress;
                this.currentModel.rotation.x = Math.sin(progress * Math.PI * 2) * 0.5;
                const scale = originalScale * (1 + Math.sin(progress * Math.PI * 2) * 0.3);
                this.currentModel.scale.set(scale, scale, scale);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    // Reset to original state
                    this.currentModel.rotation.y = originalY;
                    this.currentModel.rotation.x = 0;
                    this.currentModel.scale.set(originalScale, originalScale, originalScale);
                    resolve();
                }
            };
            
            animate();
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Update controls
        this.controls.update();
        
        // Slowly rotate the model
        if (this.currentModel) {
            this.currentModel.rotation.y += 0.005;
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    resize() {
        const width = this.canvas.clientWidth;
        const height = this.canvas.clientHeight;
        
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.renderer.setSize(width, height, false);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
    }

    clear() {
        this.renderer.clear();
    }

    drawEnemy(enemy) {
        // Implementation for drawing enemies in 3D space
        // This is a placeholder for now
    }
}
