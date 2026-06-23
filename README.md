# Shania Anderson - Creative Portfolio

A Victorian gothic portfolio website with a cinematic, immersive experience.

## Features
- Dark, moody aesthetic with blush-gold glow effect
- Five unique "rooms" (Foyer, Study, Gallery, Atelier, Garden)
- Hidden key system with manifesto reward
- Floorplan navigation with compass overlay
- Ambient audio (fireplace + wind)
- Responsive design (mobile-first)
- Content managed via JSON files

## Setup Instructions

### 1. Clone or download this repository

### 2. Replace placeholder content

**Images:**
- `assets/images/garden/` - Add your portrait photo
- `assets/images/gallery/` - Add your photography work
- `assets/images/atelier/` - Add case study thumbnails

**Audio:**
- `assets/audio/ambient.mp3` - Add your ambient track

**Content:**
- `data/writing.json` - Update with your scripts, treatments, research
- `data/gallery.json` - Update with your photos and YouTube video IDs
- `data/atelier.json` - Update with your case studies

### 3. Update contact form

In `index.html`, replace `YOUR_FORM_ID` in the form action with your Formspree form ID:
```html
<form id="contactForm" action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
