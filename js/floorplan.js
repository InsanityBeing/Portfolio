/**
 * ========================================
 * FLOORPLAN - Compass Navigation
 * ========================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    
    const Floorplan = {
        overlay: null,
        toggleBtn: null,
        closeBtn: null,
        isOpen: false,
        
        init() {
            this.overlay = document.getElementById('floorplanOverlay');
            this.toggleBtn = document.getElementById('floorplanToggle');
            this.closeBtn = this.overlay?.querySelector('.floorplan-close');
            
            if (!this.overlay || !this.toggleBtn) return;
            
            this.setupEvents();
            this.setupRoomLinks();
            this.setupHamburger();
            
            // Close on escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        },
        
        setupEvents() {
            this.toggleBtn.addEventListener('click', () => this.toggle());
            
            if (this.closeBtn) {
                this.closeBtn.addEventListener('click', () => this.close());
            }
            
            // Close on overlay click
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) {
                    this.close();
                }
            });
        },
        
        setupRoomLinks() {
            const links = this.overlay.querySelectorAll('.floorplan-room');
            links.forEach(link => {
                link.addEventListener('click', (e) => {
                    // Let hash change happen
                    setTimeout(() => this.close(), 100);
                });
            });
        },
        
        setupHamburger() {
            const hamburger = document.getElementById('hamburgerToggle');
            if (!hamburger) return;
            
            hamburger.addEventListener('click', () => {
                this.toggle();
                hamburger.classList.toggle('active');
            });
            
            // Close when room navigated
            window.addEventListener('hashchange', () => {
                if (this.isOpen) {
                    this.close();
                    hamburger.classList.remove('active');
                }
            });
        },
        
        toggle() {
            this.isOpen ? this.close() : this.open();
        },
        
        open() {
            this.overlay.classList.add('active');
            this.isOpen = true;
            document.body.style.overflow = 'hidden';
            
            // Update key status
            this.updateKeyStatus();
        },
        
        close() {
            this.overlay.classList.remove('active');
            this.isOpen = false;
            document.body.style.overflow = '';
            
            const hamburger = document.getElementById('hamburgerToggle');
            if (hamburger) {
                hamburger.classList.remove('active');
            }
        },
        
        updateKeyStatus() {
            // Get key status from KeySystem
            const keys = window.KeySystem?.keys || {};
            const keyIcons = this.overlay.querySelectorAll('.room-key');
            
            keyIcons.forEach(icon => {
                const room = icon.closest('.floorplan-room')?.dataset.room;
                if (room && keys[room]) {
                    icon.textContent = '🔑';
                    icon.classList.add('found');
                }
            });
        }
    };
    
    // Initialize
    Floorplan.init();
    
    // Expose for debugging
    window.Floorplan = Floorplan;
});
