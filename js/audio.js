/**
 * ========================================
 * AMBIENT AUDIO - Fireplace + Wind
 * ========================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    
    const AudioManager = {
        audio: null,
        isPlaying: false,
        isMuted: false,
        toggleBtn: null,
        
        init() {
            this.audio = document.getElementById('ambientAudio');
            this.toggleBtn = document.getElementById('audioToggle');
            
            if (!this.audio || !this.toggleBtn) return;
            
            // Set volume
            this.audio.volume = 0.3;
            
            // Setup toggle
            this.toggleBtn.addEventListener('click', () => this.toggle());
            
            // Try to autoplay
            this.tryAutoplay();
            
            // Handle visibility change (pause when tab hidden)
            document.addEventListener('visibilitychange', () => {
                if (document.hidden && this.isPlaying) {
                    this.audio.pause();
                } else if (!document.hidden && this.isPlaying && !this.audio.paused) {
                    this.audio.play().catch(() => {});
                }
            });
        },
        
        tryAutoplay() {
            // Autoplay with user gesture detection
            const playAudio = () => {
                if (!this.isPlaying) {
                    this.audio.play()
                        .then(() => {
                            this.isPlaying = true;
                            this.updateIcon();
                        })
                        .catch(() => {
                            // User gesture needed - wait for click
                            document.addEventListener('click', () => {
                                if (!this.isPlaying) {
                                    this.audio.play()
                                        .then(() => {
                                            this.isPlaying = true;
                                            this.updateIcon();
                                        })
                                        .catch(() => {});
                                }
                            }, { once: true });
                            
                            // Also try on any touch
                            document.addEventListener('touchstart', () => {
                                if (!this.isPlaying) {
                                    this.audio.play()
                                        .then(() => {
                                            this.isPlaying = true;
                                            this.updateIcon();
                                        })
                                        .catch(() => {});
                                }
                            }, { once: true });
                        });
                }
            };
            
            // Try immediately
            playAudio();
            
            // Also try on first interaction
            document.addEventListener('click', () => {
                if (!this.isPlaying) {
                    playAudio();
                }
            }, { once: true });
        },
        
        toggle() {
            if (this.isPlaying) {
                this.audio.pause();
                this.isPlaying = false;
                this.isMuted = true;
            } else {
                this.audio.play()
                    .then(() => {
                        this.isPlaying = true;
                        this.isMuted = false;
                    })
                    .catch(() => {});
            }
            this.updateIcon();
        },
        
        updateIcon() {
            if (this.toggleBtn) {
                const icon = this.toggleBtn.querySelector('.audio-icon');
                if (icon) {
                    icon.textContent = this.isPlaying ? '🔊' : '🔇';
                }
                this.toggleBtn.classList.toggle('muted', !this.isPlaying);
            }
        }
    };
    
    // Initialize
    AudioManager.init();
    
    // Expose for debugging
    window.AudioManager = AudioManager;
});
