// Sprite animation system for Galaxia
export class Sprite {
    constructor(ctx, x, y, width, height, color) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.frame = 0;
        this.animationSpeed = 0.1;
        this.state = 'idle';
    }

    draw() {
        // Temporary placeholder drawing until we have sprite sheets
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);

        // Add a glowing effect
        this.ctx.shadowColor = this.color;
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.arc(
            this.x + this.width/2,
            this.y + this.height/2,
            this.width/2,
            0,
            Math.PI * 2
        );
        this.ctx.fillStyle = this.color + '44'; // Add transparency
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    attack() {
        return new Promise(resolve => {
            // Animation frames
            let frames = 10;
            let currentFrame = 0;
            
            const animate = () => {
                if (currentFrame >= frames) {
                    this.state = 'idle';
                    resolve();
                    return;
                }

                this.state = 'attack';
                // Scale effect for attack
                const scale = 1 + Math.sin(currentFrame/frames * Math.PI) * 0.2;
                this.ctx.save();
                this.ctx.translate(this.x + this.width/2, this.y + this.height/2);
                this.ctx.scale(scale, scale);
                this.ctx.translate(-(this.x + this.width/2), -(this.y + this.height/2));
                this.draw();
                this.ctx.restore();

                currentFrame++;
                requestAnimationFrame(animate);
            };

            animate();
        });
    }

    specialAttack() {
        return new Promise(resolve => {
            // Animation frames
            let frames = 20;
            let currentFrame = 0;
            
            const animate = () => {
                if (currentFrame >= frames) {
                    this.state = 'idle';
                    resolve();
                    return;
                }

                this.state = 'specialAttack';
                // Rotation and scale effect for special attack
                const scale = 1 + Math.sin(currentFrame/frames * Math.PI) * 0.3;
                const rotation = (currentFrame/frames) * Math.PI * 2;
                
                this.ctx.save();
                this.ctx.translate(this.x + this.width/2, this.y + this.height/2);
                this.ctx.rotate(rotation);
                this.ctx.scale(scale, scale);
                this.ctx.translate(-(this.x + this.width/2), -(this.y + this.height/2));
                
                // Add special effects
                this.ctx.shadowColor = this.color;
                this.ctx.shadowBlur = 20;
                this.draw();
                
                // Add energy burst effect
                this.ctx.beginPath();
                for(let i = 0; i < 8; i++) {
                    const angle = (i/8) * Math.PI * 2;
                    const length = this.width * scale;
                    this.ctx.moveTo(this.x + this.width/2, this.y + this.height/2);
                    this.ctx.lineTo(
                        this.x + this.width/2 + Math.cos(angle + rotation) * length,
                        this.y + this.height/2 + Math.sin(angle + rotation) * length
                    );
                }
                this.ctx.strokeStyle = this.color;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                
                this.ctx.restore();

                currentFrame++;
                requestAnimationFrame(animate);
            };

            animate();
        });
    }
}
