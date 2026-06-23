/**
 * ========================================
 * KEY SYSTEM - Find 5 Hidden Keys
 * ========================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    
    const KeySystem = {
        keys: {
            foyer: false,
            study: false,
            gallery: false,
            atelier: false,
            garden: false
        },
        keySpots: {
            foyer: '.door-handle',
            study: '.writing-card:nth-child(3)',
            gallery: '.gallery-tab[data-tab="videos"]',
            atelier: '.accordion-item:last-child .accordion-header',
            garden: '.garden-portrait'
        },
        initialized: false,
        
        init() {
            if (this.initialized) return;
            this.initialized = true;
            
            this.setupKeySpots();
            this.updateKeyCount();
            
            // Listen for room changes to re-setup spots
            window.addEventListener('hashchange', () => {
                // Some spots need re-attaching after content load
                setTimeout(() => this.setupKeySpots(), 500);
            });
            
            // Also setup when content loads
            document.addEventListener('contentLoaded', () => {
                setTimeout(() => this.setupKeySpots(), 300);
            });
        },
        
        setupKeySpots() {
            // Foyer: Door handle
            const handle = document.querySelector('.door-handle');
            if (handle) {
                handle.removeEventListener('click', this.handleKeyClick.bind(this, 'foyer'));
                handle.addEventListener('click', this.handleKeyClick.bind(this, 'foyer'));
            }
            
            // Study: Third writing card
            // Using event delegation
            document.querySelector('.study-shelves')?.addEventListener('click', (e) => {
                const card = e.target.closest('.writing-card:nth-child(3)');
                if (card) {
                    this.findKey('study');
                }
            });
            
            // Gallery: Video tab
            document.querySelector('.gallery-tab[data-tab="videos"]')?.addEventListener('click', () => {
                setTimeout(() => this.findKey('gallery'), 300);
            });
            
            // Atelier: Last accordion item
            document.querySelector('#atelierContainer')?.addEventListener('click', (e) => {
                const lastItem = e.target.closest('.accordion-item:last-child .accordion-header');
                if (lastItem) {
                    this.findKey('atelier');
                }
            });
            
            // Garden: Portrait
            const portrait = document.querySelector('.garden-portrait');
            if (portrait) {
                portrait.removeEventListener('click', this.handleKeyClick.bind(this, 'garden'));
                portrait.addEventListener('click', this.handleKeyClick.bind(this, 'garden'));
            }
        },
        
        handleKeyClick(room, e) {
            // For foyer, only if door is open
            if (room === 'foyer') {
                const door = document.querySelector('.foyer-door');
                if (!door || !door.classList.contains('door-open')) return;
            }
            this.findKey(room);
        },
        
        findKey(room) {
            if (this.keys[room]) return;
            
            this.keys[room] = true;
            this.updateKeyCount();
            
            // Dispatch event for floorplan
            document.dispatchEvent(new CustomEvent('keyFound', { detail: { room } }));
            
            // Visual feedback
            this.showKeyFound(room);
            
            // Check if all keys found
            if (this.allKeysFound()) {
                setTimeout(() => this.showManifesto(), 1200);
            }
        },
        
        allKeysFound() {
            return Object.values(this.keys).every(v => v === true);
        },
        
        updateKeyCount() {
            const count = Object.values(this.keys).filter(v => v).length;
            const keyDisplay = document.getElementById('keyCount');
            if (keyDisplay) {
                keyDisplay.textContent = count;
            }
        },
        
        showKeyFound(room) {
            const roomNames = {
                foyer: 'Foyer',
                study: 'Study',
                gallery: 'Gallery',
                atelier: 'Atelier',
                garden: 'Garden'
            };
            
            // Create notification
            const notification = document.createElement('div');
            notification.className = 'key-notification';
            notification.innerHTML = `
                <div class="key-notification-icon">🔑</div>
                <div class="key-notification-text">
                    Found a key in <strong>${roomNames[room]}</strong>!
                    <span class="key-notification-count">${Object.values(this.keys).filter(v => v).length}/5</span>
                </div>
            `;
            
            // Style
            Object.assign(notification.style, {
                position: 'fixed',
                bottom: '100px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(10,10,10,0.92)',
                border: '1px solid var(--gold)',
                padding: '1rem 2rem',
                borderRadius: '8px',
                color: 'var(--cream)',
                fontFamily: 'var(--font-body)',
                fontSize: '1rem',
                zIndex: '3000',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 0 60px rgba(201,169,110,0.1)',
                animation: 'slideUp 0.5s ease',
                maxWidth: '90%'
            });
            
            // Add style for animation if not exists
            if (!document.getElementById('keyNotificationStyle')) {
                const style = document.createElement('style');
                style.id = 'keyNotificationStyle';
                style.textContent = `
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                        to { opacity: 1; transform: translateX(-50%) translateY(0); }
                    }
                    .key-notification-icon { font-size: 2rem; }
                    .key-notification-text { line-height: 1.4; }
                    .key-notification-count { 
                        display: block; 
                        font-size: 0.7rem; 
                        color: rgba(255,255,255,0.4);
                        font-family: var(--font-accent);
                        letter-spacing: 0.05em;
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s ease';
                setTimeout(() => notification.remove(), 500);
            }, 3000);
        },
        
        showManifesto() {
            const modal = document.getElementById('manifestoModal');
            if (modal) {
                modal.classList.add('active');
            }
        }
    };
    
    // Initialize
    KeySystem.init();
    
    // Expose for debugging
    window.KeySystem = KeySystem;
});
