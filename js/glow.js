/**
 * ========================================
 * GLOW EFFECT - The Signature Element
 * ========================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    
    const Glow = {
        container: null,
        circle: null,
        isMobile: window.innerWidth <= 768,
        isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        currentX: -100,
        currentY: -100,
        targetX: -100,
        targetY: -100,
        animationFrame: null,
        
        init() {
            if (this.isTouch) {
                this.setupMobileGlow();
                return;
            }
            
            this.createGlowElements();
            this.setupEventListeners();
            this.animateGlow();
            
            // Update on resize
            window.addEventListener('resize', () => {
                this.isMobile = window.innerWidth <= 768;
                if (this.isMobile) {
                    this.destroyDesktopGlow();
                    this.setupMobileGlow();
                }
            });
        },
        
        createGlowElements() {
            // Ambient overlay
            const ambient = document.createElement('div');
            ambient.className = 'glow-ambient';
            document.body.prepend(ambient);
            
            // Vignette
            const vignette = document.createElement('div');
            vignette.className = 'glow-vignette';
            document.body.prepend(vignette);
            
            // Glow container
            this.container = document.createElement('div');
            this.container.className = 'glow-container';
            document.body.prepend(this.container);
            
            // Glow circle
            this.circle = document.createElement('div');
            this.circle.className = 'glow-circle';
            this.container.appendChild(this.circle);
            
            // Add pulse class for ambient breathing
            this.circle.style.animation = 'pulseGlow 4s ease-in-out infinite';
        },
        
        setupEventListeners() {
            // Mouse move
            document.addEventListener('mousemove', (e) => {
                this.targetX = e.clientX;
                this.targetY = e.clientY;
                
                // Update circle position
                if (this.circle) {
                    this.circle.style.left = e.clientX + 'px';
                    this.circle.style.top = e.clientY + 'px';
                }
            });
            
            // Mouse enter/leave for room changes
            document.addEventListener('mouseenter', () => {
                if (this.circle) {
                    this.circle.style.opacity = '1';
                }
            });
            
            document.addEventListener('mouseleave', () => {
                if (this.circle) {
                    this.circle.style.opacity = '0';
                }
            });
            
            // Update glow intensity based on room
            window.addEventListener('hashchange', () => {
                this.updateRoomIntensity();
            });
            
            // Initial room intensity
            setTimeout(() => this.updateRoomIntensity(), 100);
        },
        
        updateRoomIntensity() {
            const hash = window.location.hash.replace('#', '') || 'foyer';
            const rooms = document.querySelectorAll('.room');
            
            rooms.forEach(room => {
                room.classList.remove('glow-intense', 'glow-subtle');
                if (room.dataset.room === hash) {
                    if (hash === 'foyer') room.classList.add('glow-intense');
                    if (hash === 'study') room.classList.add('glow-subtle');
                }
            });
        },
        
        animateGlow() {
            // Smooth follow with easing
            const ease = 0.08;
            
            this.currentX += (this.targetX - this.currentX) * ease;
            this.currentY += (this.targetY - this.currentY) * ease;
            
            if (this.circle) {
                this.circle.style.left = this.currentX + 'px';
                this.circle.style.top = this.currentY + 'px';
            }
            
            this.animationFrame = requestAnimationFrame(() => this.animateGlow());
        },
        
        setupMobileGlow() {
            // Create fixed pulse for mobile
            const pulse = document.createElement('div');
            pulse.className = 'glow-pulse';
            document.body.prepend(pulse);
            
            // Ambient overlay for mobile
            const ambient = document.createElement('div');
            ambient.className = 'glow-ambient';
            ambient.style.opacity = '0.3';
            document.body.prepend(ambient);
            
            // Vignette
            const vignette = document.createElement('div');
            vignette.className = 'glow-vignette';
            document.body.prepend(vignette);
        },
        
        destroyDesktopGlow() {
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
            if (this.container) {
                this.container.remove();
            }
            document.querySelector('.glow-ambient')?.remove();
            document.querySelector('.glow-vignette')?.remove();
        }
    };
    
    // Initialize glow
    Glow.init();
    
    // Expose for debugging
    window.Glow = Glow;
});
