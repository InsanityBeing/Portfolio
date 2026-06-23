/**
 * ========================================
 * SHANIA ANDERSON PORTFOLIO - MAIN APP
 * ========================================
 * Single Page Application with hash-based routing
 */

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    
    // ========================================
    // ROUTER
    // ========================================
    const Router = {
        currentRoom: 'foyer',
        rooms: ['foyer', 'study', 'gallery', 'atelier', 'garden'],
        
        init() {
            // Listen for hash changes
            window.addEventListener('hashchange', () => this.navigate());
            
            // Initial navigation
            if (!window.location.hash) {
                window.location.hash = 'foyer';
            } else {
                this.navigate();
            }
            
            // Handle initial door animation on foyer
            if (window.location.hash === '#foyer' || window.location.hash === '') {
                setTimeout(() => this.animateDoor(), 500);
            }
        },
        
        navigate() {
            const hash = window.location.hash.replace('#', '') || 'foyer';
            const roomId = this.rooms.includes(hash) ? hash : 'foyer';
            
            this.currentRoom = roomId;
            this.showRoom(roomId);
            this.updateIndicators(roomId);
            this.updateFloorplan(roomId);
            
            // Trigger room-specific animations
            this.triggerRoomAnimations(roomId);
        },
        
        showRoom(roomId) {
            // Hide all rooms
            document.querySelectorAll('.room').forEach(room => {
                room.classList.remove('active');
            });
            
            // Show target room
            const targetRoom = document.getElementById(`room-${roomId}`);
            if (targetRoom) {
                targetRoom.classList.add('active');
                // Re-trigger staggered animations
                const content = targetRoom.querySelector('.room-content');
                if (content) {
                    content.querySelectorAll('.room-header, .study-shelves, .gallery-grid, .atelier-accordion, .garden-container')
                        .forEach((el, index) => {
                            el.style.animation = 'none';
                            // Force reflow
                            void el.offsetHeight;
                            el.style.animation = `fadeInUp 0.8s ease ${0.2 + index * 0.15}s forwards`;
                        });
                }
            }
        },
        
        updateIndicators(roomId) {
            document.querySelectorAll('.room-dot').forEach(dot => {
                dot.classList.toggle('active', dot.dataset.room === roomId);
            });
        },
        
        updateFloorplan(roomId) {
            document.querySelectorAll('.floorplan-room').forEach(room => {
                room.classList.toggle('active', room.dataset.room === roomId);
            });
        },
        
        triggerRoomAnimations(roomId) {
            // Foyer specific
            if (roomId === 'foyer') {
                this.animateDoor();
            }
            
            // Load content if not already loaded
            if (roomId === 'study' && !document.querySelector('#writingContainer .writing-card')) {
                ContentLoader.loadWriting();
            }
            if (roomId === 'gallery') {
                ContentLoader.loadGallery();
            }
            if (roomId === 'atelier' && !document.querySelector('#atelierContainer .accordion-item')) {
                ContentLoader.loadAtelier();
            }
        },
        
        animateDoor() {
            const door = document.querySelector('.foyer-door');
            const welcome = document.querySelector('.foyer-welcome');
            
            if (!door || !welcome) return;
            
            // Only animate if not already opened
            if (door.classList.contains('door-open')) return;
            
            // Open door after a moment
            setTimeout(() => {
                door.classList.add('door-open');
                
                // Show welcome after door opens
                setTimeout(() => {
                    welcome.classList.remove('hidden');
                    // Force reflow
                    void welcome.offsetHeight;
                    welcome.classList.add('visible');
                }, 800);
            }, 300);
        }
    };
    
    // ========================================
    // CONTENT LOADER
    // ========================================
    const ContentLoader = {
        data: {},
        
        async loadAll() {
            try {
                const [writing, gallery, atelier] = await Promise.all([
                    fetch('data/writing.json').then(r => r.json()),
                    fetch('data/gallery.json').then(r => r.json()),
                    fetch('data/atelier.json').then(r => r.json())
                ]);
                
                this.data = { writing, gallery, atelier };
                
                // Load initial content based on current room
                const currentRoom = window.location.hash.replace('#', '') || 'foyer';
                if (currentRoom === 'study') this.loadWriting();
                if (currentRoom === 'gallery') this.loadGallery();
                if (currentRoom === 'atelier') this.loadAtelier();
                
            } catch (error) {
                console.warn('Content loading error:', error);
                // Use fallback content
                this.loadFallbackContent();
            }
        },
        
        loadWriting() {
            const container = document.getElementById('writingContainer');
            if (!container) return;
            
            const writingData = this.data.writing || [];
            
            container.innerHTML = writingData.map(item => `
                <div class="writing-card" data-id="${item.id}">
                    <div class="card-category">${item.category || 'Writing'}</div>
                    <div class="card-title">${item.title}</div>
                    <div class="card-excerpt">${item.excerpt || ''}</div>
                    <div class="card-readmore">Read More →</div>
                </div>
            `).join('');
            
            // Add click handlers
            container.querySelectorAll('.writing-card').forEach(card => {
                card.addEventListener('click', () => {
                    const id = card.dataset.id;
                    const item = writingData.find(w => w.id === id);
                    if (item) this.openWritingModal(item);
                });
            });
        },
        
        openWritingModal(item) {
            let modal = document.getElementById('writingModal');
            
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'writingModal';
                modal.className = 'writing-modal';
                document.body.appendChild(modal);
            }
            
            modal.innerHTML = `
                <div class="writing-modal-content">
                    <button class="writing-modal-close">✕</button>
                    <div class="modal-title">${item.title}</div>
                    <div class="modal-category">${item.category || 'Writing'}</div>
                    ${(item.sections || []).map(section => `
                        <div class="modal-section">
                            <h4>${section.heading || ''}</h4>
                            <p>${section.content || ''}</p>
                        </div>
                    `).join('')}
                </div>
            `;
            
            modal.classList.add('active');
            
            modal.querySelector('.writing-modal-close').addEventListener('click', () => {
                modal.classList.remove('active');
            });
            
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        },
        
        loadGallery() {
            const photoContainer = document.getElementById('photoContainer');
            const videoContainer = document.getElementById('videoContainer');
            
            if (!photoContainer || !videoContainer) return;
            
            const galleryData = this.data.gallery || {};
            
            // Photos
            const photos = galleryData.photos || [];
            photoContainer.innerHTML = photos.map(photo => `
                <div class="photo-item">
                    <img src="${photo.src}" alt="${photo.alt || ''}" loading="lazy">
                    <div class="photo-title">${photo.title || ''}</div>
                </div>
            `).join('');
            
            // Videos
            const videos = galleryData.videos || [];
            videoContainer.innerHTML = videos.map(video => `
                <div class="video-item">
                    <iframe 
                        src="https://www.youtube.com/embed/${video.youtubeId}?autoplay=0&mute=1&rel=0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        loading="lazy"
                    ></iframe>
                </div>
            `).join('');
            
            // Tab switching
            document.querySelectorAll('.gallery-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    const tabName = tab.dataset.tab;
                    document.getElementById('photoContainer').classList.toggle('hidden', tabName !== 'photos');
                    document.getElementById('videoContainer').classList.toggle('hidden', tabName !== 'videos');
                });
            });
        },
        
        loadAtelier() {
            const container = document.getElementById('atelierContainer');
            if (!container) return;
            
            const atelierData = this.data.atelier || [];
            
            container.innerHTML = atelierData.map((item, index) => `
                <div class="accordion-item" data-id="${item.id}">
                    <div class="accordion-header" data-index="${index}">
                        <div class="accordion-thumb">
                            <img src="${item.thumbnail || 'assets/images/atelier/placeholder.jpg'}" alt="${item.title}" loading="lazy">
                        </div>
                        <div class="accordion-info">
                            <div class="accordion-title">${item.title}</div>
                            <div class="accordion-desc">${item.description || ''}</div>
                        </div>
                        <div class="accordion-arrow">▼</div>
                    </div>
                    <div class="accordion-body">
                        <div class="accordion-body-inner">
                            ${item.fullContent || ''}
                        </div>
                    </div>
                </div>
            `).join('');
            
            // Accordion click handlers
            container.querySelectorAll('.accordion-header').forEach(header => {
                header.addEventListener('click', () => {
                    const item = header.closest('.accordion-item');
                    const body = item.querySelector('.accordion-body');
                    const isActive = item.classList.contains('active');
                    
                    // Close others
                    container.querySelectorAll('.accordion-item').forEach(other => {
                        if (other !== item) {
                            other.classList.remove('active');
                            other.querySelector('.accordion-body').style.maxHeight = '0';
                        }
                    });
                    
                    if (isActive) {
                        item.classList.remove('active');
                        body.style.maxHeight = '0';
                    } else {
                        item.classList.add('active');
                        body.style.maxHeight = body.scrollHeight + 'px';
                    }
                });
            });
        },
        
        loadFallbackContent() {
            // Fallback content if JSON fails
            const container = document.getElementById('writingContainer');
            if (container && !container.querySelector('.writing-card')) {
                container.innerHTML = `
                    <div class="writing-card">
                        <div class="card-category">Script</div>
                        <div class="card-title">Sample Script</div>
                        <div class="card-excerpt">This is a placeholder. Replace with your actual content.</div>
                        <div class="card-readmore">Read More →</div>
                    </div>
                `;
            }
        }
    };
    
    // ========================================
    // FLOORPLAN
    // ========================================
    const Floorplan = {
        init() {
            const toggleBtn = document.getElementById('floorplanToggle');
            const overlay = document.getElementById('floorplanOverlay');
            const closeBtn = overlay.querySelector('.floorplan-close');
            const roomLinks = overlay.querySelectorAll('.floorplan-room');
            
            toggleBtn.addEventListener('click', () => {
                overlay.classList.toggle('active');
                document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
            });
            
            closeBtn.addEventListener('click', () => {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            });
            
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
            
            roomLinks.forEach(link => {
                link.addEventListener('click', () => {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                });
            });
            
            // Update key status in floorplan
            document.addEventListener('keyFound', (e) => {
                const room = e.detail.room;
                const keyIcon = overlay.querySelector(`.floorplan-room[data-room="${room}"] .room-key`);
                if (keyIcon) {
                    keyIcon.textContent = '🔑';
                    keyIcon.classList.add('found');
                }
            });
        }
    };
    
    // ========================================
    // KEY SYSTEM
    // ========================================
    const KeySystem = {
        keys: {
            foyer: false,
            study: false,
            gallery: false,
            atelier: false,
            garden: false
        },
        
        init() {
            this.setupKeySpots();
            this.updateKeyCount();
        },
        
        setupKeySpots() {
            // Foyer: Click door handle after door opens
            const handle = document.querySelector('.door-handle');
            if (handle) {
                handle.addEventListener('click', () => this.findKey('foyer'));
            }
            
            // Study: Click on a specific book (the third card)
            document.addEventListener('click', (e) => {
                const cards = document.querySelectorAll('.writing-card');
                if (cards.length >= 3 && e.target.closest('.writing-card:nth-child(3)')) {
                    this.findKey('study');
                }
            });
            
            // Gallery: Click the curtain (video tab)
            document.addEventListener('click', (e) => {
                if (e.target.closest('.gallery-tab[data-tab="videos"]')) {
                    setTimeout(() => this.findKey('gallery'), 500);
                }
            });
            
            // Atelier: Click the last accordion item
            document.addEventListener('click', (e) => {
                const items = document.querySelectorAll('.accordion-item');
                if (items.length >= 1 && e.target.closest('.accordion-item:last-child .accordion-header')) {
                    this.findKey('atelier');
                }
            });
            
            // Garden: Click portrait
            const portrait = document.querySelector('.garden-portrait');
            if (portrait) {
                portrait.addEventListener('click', () => this.findKey('garden'));
            }
        },
        
        findKey(room) {
            if (this.keys[room]) return; // Already found
            
            this.keys[room] = true;
            this.updateKeyCount();
            
            // Dispatch event for floorplan
            document.dispatchEvent(new CustomEvent('keyFound', { detail: { room } }));
            
            // Visual feedback
            this.showKeyFound(room);
            
            // Check if all keys are found
            if (this.allKeysFound()) {
                setTimeout(() => this.showManifesto(), 1000);
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
            
            // Simple notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(10,10,10,0.9);
                border: 1px solid var(--gold);
                padding: 2rem 3rem;
                border-radius: 8px;
                color: var(--cream);
                font-family: var(--font-heading);
                font-size: 1.2rem;
                z-index: 3000;
                text-align: center;
                backdrop-filter: blur(8px);
                animation: fadeIn 0.5s ease;
                box-shadow: 0 0 60px rgba(201,169,110,0.1);
            `;
            notification.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔑</div>
                <div>You found a key in <strong style="color: var(--gold);">${roomNames[room]}</strong>!</div>
                <div style="font-size: 0.8rem; margin-top: 0.5rem; color: rgba(255,255,255,0.4);">
                    ${this.allKeysFound() ? 'All keys found! The manifesto awaits...' : `${Object.values(this.keys).filter(v => v).length}/5 keys found`}
                </div>
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.opacity = '0';
                notification.style.transition = 'opacity 0.5s ease';
                setTimeout(() => notification.remove(), 500);
            }, 2500);
        },
        
        showManifesto() {
            const modal = document.getElementById('manifestoModal');
            if (modal) {
                modal.classList.add('active');
            }
        }
    };
    
    // ========================================
    // INITIALIZE
    // ========================================
    Router.init();
    Floorplan.init();
    KeySystem.init();
    ContentLoader.loadAll();
    
    // Audio is initialized in audio.js
    // Glow is initialized in glow.js
    
    // Manifesto close handler
    document.querySelector('.manifesto-close')?.addEventListener('click', () => {
        document.getElementById('manifestoModal')?.classList.remove('active');
    });
    
    document.getElementById('manifestoModal')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            e.currentTarget.classList.remove('active');
        }
    });
    
    console.log('🏛️ Welcome to Shania Anderson\'s Mansion');
    console.log('🔑 Find the 5 hidden keys to unlock the Creative Director\'s Manifesto');
});
