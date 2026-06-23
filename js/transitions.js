/**
 * ========================================
 * TRANSITIONS - Room Fade & Staggered Animations
 * ========================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    
    const Transitions = {
        init() {
            // Handle room transitions
            window.addEventListener('hashchange', () => {
                this.animateRoomTransition();
            });
            
            // Initial animation
            setTimeout(() => this.animateRoomTransition(), 300);
        },
        
        animateRoomTransition() {
            const activeRoom = document.querySelector('.room.active');
            if (!activeRoom) return;
            
            // Get all staggered elements
            const elements = activeRoom.querySelectorAll(
                '.room-header, .study-shelves, .gallery-grid, .atelier-accordion, .garden-container, ' +
                '.foyer-welcome, .garden-profile, .garden-contact, .garden-links, .gallery-tabs'
            );
            
            // Reset and animate with stagger
            elements.forEach((el, index) => {
                el.style.animation = 'none';
                // Force reflow
                void el.offsetHeight;
                
                const delay = 0.1 + (index * 0.08);
                el.style.animation = `fadeInUp 0.6s ease ${delay}s forwards`;
            });
            
            // Special handling for foyer
            if (activeRoom.dataset.room === 'foyer') {
                const door = activeRoom.querySelector('.foyer-door');
                const welcome = activeRoom.querySelector('.foyer-welcome');
                
                if (door && !door.classList.contains('door-open')) {
                    setTimeout(() => {
                        door.classList.add('door-open');
                        setTimeout(() => {
                            if (welcome) {
                                welcome.classList.remove('hidden');
                                void welcome.offsetHeight;
                                welcome.classList.add('visible');
                            }
                        }, 800);
                    }, 300);
                }
            }
        }
    };
    
    // Initialize
    Transitions.init();
    
    // Expose for debugging
    window.Transitions = Transitions;
});
