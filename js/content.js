/**
 * ========================================
 * CONTENT LOADER - Fetches JSON data
 * ========================================
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';
    
    const ContentLoader = {
        data: {
            writing: [],
            gallery: { photos: [], videos: [] },
            atelier: []
        },
        loaded: false,
        
        async loadAll() {
            if (this.loaded) return;
            
            try {
                // Try to load from JSON files
                const [writing, gallery, atelier] = await Promise.all([
                    fetch('data/writing.json').then(r => r.json()).catch(() => null),
                    fetch('data/gallery.json').then(r => r.json()).catch(() => null),
                    fetch('data/atelier.json').then(r => r.json()).catch(() => null)
                ]);
                
                if (writing) this.data.writing = writing;
                if (gallery) this.data.gallery = gallery;
                if (atelier) this.data.atelier = atelier;
                
                this.loaded = true;
                
                // Load content for current room
                this.loadCurrentRoomContent();
                
                // Dispatch event
                document.dispatchEvent(new CustomEvent('contentLoaded'));
                
            } catch (error) {
                console.warn('Content loading failed, using placeholders:', error);
                this.loadFallbackContent();
            }
        },
        
        loadCurrentRoomContent() {
            const hash = window.location.hash.replace('#', '') || 'foyer';
            
            if (hash === 'study') this.loadWriting();
            if (hash === 'gallery') this.loadGallery();
            if (hash === 'atelier') this.loadAtelier();
        },
        
        loadWriting() {
            const container = document.getElementById('writingContainer');
            if (!container || container.querySelector('.writing-card')) return;
            
            const data = this.data.writing;
            
            if (!data || data.length === 0) {
                container.innerHTML = `
                    <div class="writing-card">
                        <div class="card-category">Placeholder</div>
                        <div class="card-title">Add Your Writing Here</div>
                        <div class="card-excerpt">Update the writing.json file with your scripts, treatments, and research papers.</div>
                        <div class="card-readmore">Read More →</div>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = data.map(item => `
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
                    const item = data.find(w => w.id === id);
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
            
            // Close on escape
            document.addEventListener('keydown', function handler(e) {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    modal.classList.remove('active');
                    document.removeEventListener('keydown', handler);
                }
            });
        },
        
        loadGallery() {
            const photoContainer = document.getElementById('photoContainer');
            const videoContainer = document.getElementById('videoContainer');
            
            if (!photoContainer || !videoContainer) return;
            
            // Don't reload if already loaded
            if (photoContainer.querySelector('.photo-item')) return;
            
            const data = this.data.gallery;
            
            // Photos
            const photos = data?.photos || [];
            photoContainer.innerHTML = photos.length > 0 ? photos.map(photo => `
                <div class="photo-item">
                    <img src="${photo.src}" alt="${photo.alt || ''}" loading="lazy">
                    <div class="photo-title">${photo.title || ''}</div>
                </div>
            `).join('') : `
                <div class="photo-item" style="display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.03);border-color:rgba(201,169,110,0.05);">
                    <span style="color:rgba(255,255,255,0.2);font-size:0.8rem;">Add photos to gallery.json</span>
                </div>
            `;
            
            // Videos
            const videos = data?.videos || [];
            videoContainer.innerHTML = videos.length > 0 ? videos.map(video => `
                <div class="video-item">
                    <iframe 
                        src="https://www.youtube.com/embed/${video.youtubeId}?autoplay=0&mute=1&rel=0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        loading="lazy"
                    ></iframe>
                </div>
            `).join('') : `
                <div class="video-item" style="display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.03);border-color:rgba(201,169,110,0.05);">
                    <span style="color:rgba(255,255,255,0.2);font-size:0.8rem;">Add video IDs to gallery.json</span>
                </div>
            `;
            
            // Tab switching
            document.querySelectorAll('.gallery-tab').forEach(tab => {
                tab.removeEventListener('click', this._tabHandler);
                tab.addEventListener('click', this._tabHandler = function() {
                    document.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    const tabName = this.dataset.tab;
                    document.getElementById('photoContainer').classList.toggle('hidden', tabName !== 'photos');
                    document.getElementById('videoContainer').classList.toggle('hidden', tabName !== 'videos');
                });
            });
        },
        
        loadAtelier() {
            const container = document.getElementById('atelierContainer');
            if (!container || container.querySelector('.accordion-item')) return;
            
            const data = this.data.atelier;
            
            if (!data || data.length === 0) {
                container.innerHTML = `
                    <div class="accordion-item">
                        <div class="accordion-header">
                            <div class="accordion-thumb">
                                <img src="assets/images/atelier/placeholder.jpg" alt="Placeholder">
                            </div>
                            <div class="accordion-info">
                                <div class="accordion-title">Add Your Case Studies</div>
                                <div class="accordion-desc">Update atelier.json with your projects</div>
                            </div>
                            <div class="accordion-arrow">▼</div>
                        </div>
                        <div class="accordion-body">
                            <div class="accordion-body-inner">
                                <p>This is a placeholder. Replace with your actual case studies by editing the atelier.json file.</p>
                            </div>
                        </div>
                    </div>
                `;
                this.setupAccordion(container);
                return;
            }
            
            container.innerHTML = data.map((item, index) => `
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
            
            this.setupAccordion(container);
        },
        
        setupAccordion(container) {
            container.querySelectorAll('.accordion-header').forEach(header => {
                header.removeEventListener('click', this._accordionHandler);
                header.addEventListener('click', this._accordionHandler = function() {
                    const item = this.closest('.accordion-item');
                    const body = item.querySelector('.accordion-body');
                    const isActive = item.classList.contains('active');
                    
                    // Close others
                    container.querySelectorAll('.accordion-item').forEach(other => {
                        if (other !== item) {
                            other.classList.remove('active');
                            const otherBody = other.querySelector('.accordion-body');
                            if (otherBody) otherBody.style.maxHeight = '0';
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
            // Load placeholder content
            const container = document.getElementById('writingContainer');
            if (container && !container.querySelector('.writing-card')) {
                container.innerHTML = `
                    <div class="writing-card">
                        <div class="card-category">Writing</div>
                        <div class="card-title">Your Content Here</div>
                        <div class="card-excerpt">Replace the writing.json file with your actual scripts, treatments, and research papers.</div>
                        <div class="card-readmore">Read More →</div>
                    </div>
                `;
            }
        }
    };
    
    // Load content
    ContentLoader.loadAll();
    
    // Also load when hash changes
    window.addEventListener('hashchange', () => {
        setTimeout(() => ContentLoader.loadCurrentRoomContent(), 200);
    });
    
    // Expose for debugging
    window.ContentLoader = ContentLoader;
});
