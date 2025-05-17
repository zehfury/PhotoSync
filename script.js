// DOM Elements
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureBtn = document.getElementById('capture-btn');
const galleryBtn = document.getElementById('gallery-btn');
const backBtn = document.getElementById('back-btn');
const cameraSection = document.getElementById('camera-section');
const gallerySection = document.getElementById('gallery-section');
const gallery = document.getElementById('gallery');
const errorMessage = document.getElementById('error-message');
const layoutSection = document.getElementById('layout-section');
const layoutCards = document.querySelectorAll('.layout-card');

// Constants
const STORAGE_KEY = 'photobooth_images';
const MAX_STORAGE_SIZE = 4.5 * 1024 * 1024; // 4.5MB limit for localStorage

// State
let stream = null;

// Filter and delay/multi-photo controls
const filterBtns = document.querySelectorAll('.filter-btn');
const delaySelect = document.getElementById('delay');
const countdownOverlay = document.getElementById('countdown-overlay');

let currentFilter = 'none';
let selectedLayout = null;

// Add customize section logic
const customizeSection = document.getElementById('customize-section');
const photoStrip = document.getElementById('photo-strip');
const frameColors = document.getElementById('frame-colors');
const photoShapes = document.getElementById('photo-shapes');
const stickers = document.getElementById('stickers');
const logoOptions = document.getElementById('logo-options');
const addDateCheckbox = document.getElementById('add-date');
const retakeBtn = document.getElementById('retake-btn');
const downloadBtn = document.getElementById('download-btn');

// Customization state
let capturedPhotos = [];
let selectedFrameColor = '#fff';
let selectedShape = 'rect';
let selectedSticker = null;
let selectedLogo = 'ENG';
let addDate = false;

// Layout pose mapping
const layoutPoses = { A: 3, B: 4, C: 2, D: 6 };

// Frame color options with gradients
const frameColorOptions = [
    // Solid colors
    '#fff', '#f8bbd0', '#e1bee7', '#c5cae9', '#b3e5fc', '#c8e6c9', '#fff9c4', '#ffccbc',
    // Gradients (linear-gradient)
    'linear-gradient(45deg, #ff9a9e, #fad0c4)',
    'linear-gradient(45deg, #a18cd1, #fbc2eb)',
    'linear-gradient(45deg, #fad0c4, #ffd1ff)',
    'linear-gradient(45deg, #84fab0, #8fd3f4)',
    'linear-gradient(45deg, #ff9a9e, #fecfef)',
    'linear-gradient(45deg, #f6d365, #fda085)',
    'linear-gradient(45deg, #fbc2eb, #a6c1ee)',
    'linear-gradient(45deg, #d4fc79, #96e6a1)',
    'linear-gradient(45deg, #a1c4fd, #c2e9fb)',
    'linear-gradient(45deg, #feada6, #f5efef)',
    'linear-gradient(45deg, #a8edea, #fed6e3)',
    'linear-gradient(45deg, #89f7fe, #66a6ff)',
    'linear-gradient(45deg, #cd9cf2, #f6f3ff)',
    'linear-gradient(45deg, #e0c3fc, #8ec5fc)',
    'linear-gradient(45deg, #f093fb, #f5576c)',
    'linear-gradient(45deg, #4facfe, #00f2fe)',
    'linear-gradient(45deg, #43e97b, #38f9d7)',
    'linear-gradient(45deg, #fa709a, #fee140)',
    'linear-gradient(45deg, #667eea, #764ba2)',
    'linear-gradient(45deg, #ff0844, #ffb199)'
];

// Photo shape options
const shapeOptions = [
    { value: 'rect', icon: '▭' },
    { value: 'square', icon: '▢' },
    { value: 'circle', icon: '◯' }
];

// Sticker options (expanded with more fun and trendy options)
const stickerOptions = [
    '❌', '🌟', '💫', '✨', '⭐', '🌙', '☀️', '🌈', '💖', '💝', '💕', '💗', '💓', '💘', '💞',
    '🦋', '🌸', '🌺', '🌹', '🌷', '🍀', '🌿', '🎀', '👑', '💎', '🎵', '🎶', '🌊', '🔮',
    '🐱', '🐰', '🦊', '🐼', '🦄', '🦁', '🐯', '🐨', '🦋', '🦢',
    '✌️', '🤍', '💅', '💫', '🎭', '🎪', '🎡', '🎨', '🎬',
    '🍭', '🍬', '🍫', '🧁', '🍰', '🎂', '🍪', '🍩',
    '💭', '💫', '⚡️', '💥', '❤️‍🔥', '🌈', '🪄'
];

// Initialize the application
async function init() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        video.srcObject = stream;
    } catch (err) {
        showError('Camera access denied or not available');
        console.error('Error accessing camera:', err);
    }
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    setTimeout(() => {
        errorMessage.classList.remove('show');
    }, 3000);
}

// Apply filter to video
function applyFilter(filter) {
    video.style.filter = filter;
}

// Handle filter button click
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        applyFilter(currentFilter);
    });
});

// Show countdown overlay
function showCountdown(seconds) {
    return new Promise(resolve => {
        countdownOverlay.textContent = seconds;
        countdownOverlay.classList.add('show');
        let count = seconds;
        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownOverlay.textContent = count;
            } else {
                clearInterval(interval);
                countdownOverlay.classList.remove('show');
                resolve();
            }
        }, 1000);
    });
}

// Capture photo (restored)
function capturePhoto() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.filter = currentFilter;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg');
    savePhoto(imageData);
}

// Multi-photo capture with delay
async function startCaptureSession() {
    capturedPhotos = [];
    const delay = parseInt(delaySelect.value, 10);
    for (let i = 0; i < numPhotos; i++) {
        if (delay > 0) {
            await showCountdown(delay);
        }
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.filter = currentFilter;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        capturedPhotos.push(imageData);
        // Small pause between photos except last
        if (i < numPhotos - 1) {
            await new Promise(res => setTimeout(res, 500));
        }
    }
    showCustomizeSection();
}

// Save photo to localStorage
function savePhoto(imageData) {
    try {
        let photos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        
        // Check if adding this image would exceed storage limit
        const newSize = new Blob([imageData]).size;
        const currentSize = new Blob([JSON.stringify(photos)]).size;
        
        if (currentSize + newSize > MAX_STORAGE_SIZE) {
            showError('Storage is full. Please delete some photos first.');
            return;
        }
        
        photos.push(imageData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
        updateGallery();
    } catch (err) {
        showError('Error saving photo');
        console.error('Error saving photo:', err);
    }
}

// Update gallery view
function updateGallery() {
    gallery.innerHTML = '';
    const photos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    photos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        const img = document.createElement('img');
        img.src = photo;
        img.alt = `Photo ${index + 1}`;
        
        const actions = document.createElement('div');
        actions.className = 'actions';
        
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = 'Download';
        downloadBtn.onclick = () => downloadPhoto(photo, index);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete';
        deleteBtn.onclick = () => deletePhoto(index);
        
        actions.appendChild(downloadBtn);
        actions.appendChild(deleteBtn);
        
        item.appendChild(img);
        item.appendChild(actions);
        gallery.appendChild(item);
    });
}

// Download photo
function downloadPhoto(photoData, index) {
    const link = document.createElement('a');
    link.href = photoData;
    link.download = `photo_${index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Delete photo
function deletePhoto(index) {
    try {
        let photos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        photos.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
        updateGallery();
    } catch (err) {
        showError('Error deleting photo');
        console.error('Error deleting photo:', err);
    }
}

// Switch views
function switchToGallery() {
    cameraSection.classList.remove('active');
    gallerySection.classList.add('active');
    updateGallery();
}

function switchToCamera() {
    gallerySection.classList.remove('active');
    cameraSection.classList.add('active');
}

// Layout selection logic
layoutCards.forEach(card => {
    card.addEventListener('click', () => {
        layoutCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedLayout = card.dataset.layout;
        numPhotos = layoutPoses[selectedLayout] || 1;
        // Hide layout, show camera
        layoutSection.classList.remove('active');
        cameraSection.classList.add('active');
    });
});

// Event Listeners
captureBtn.removeEventListener('click', capturePhoto);
captureBtn.addEventListener('click', startCaptureSession);
galleryBtn.addEventListener('click', switchToGallery);
backBtn.addEventListener('click', switchToCamera);

// Check browser support
if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    showError('Your browser does not support the required features');
} else {
    init();
}

// On load, set default filter
applyFilter(currentFilter);

// On load, show only layout section
window.addEventListener('DOMContentLoaded', () => {
    layoutSection.classList.add('active');
    cameraSection.classList.remove('active');
    gallerySection.classList.remove('active');
});

// Render frame color options
function renderFrameColors() {
    frameColors.innerHTML = '';
    frameColorOptions.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'color-swatch' + (selectedFrameColor === color ? ' selected' : '');
        if (color.startsWith('linear-gradient')) {
            swatch.style.background = color;
        } else {
            swatch.style.backgroundColor = color;
        }
        swatch.addEventListener('click', function() {
            selectedFrameColor = color;
            renderFrameColors();
            renderPhotoStrip();
        });
        frameColors.appendChild(swatch);
    });
}

// Render shape options
function renderPhotoShapes() {
    photoShapes.innerHTML = '';
    shapeOptions.forEach(shape => {
        const btn = document.createElement('button');
        btn.className = 'shape-btn' + (selectedShape === shape.value ? ' selected' : '');
        btn.innerHTML = shape.icon;
        btn.onclick = () => {
            selectedShape = shape.value;
            renderPhotoShapes();
            renderPhotoStrip();
        };
        photoShapes.appendChild(btn);
    });
}

// Render sticker options
function renderStickers() {
    stickers.innerHTML = '';
    stickerOptions.forEach(sticker => {
        const btn = document.createElement('button');
        btn.className = 'sticker-btn' + (selectedSticker === sticker ? ' selected' : '');
        btn.innerHTML = sticker;
        btn.onclick = () => {
            selectedSticker = sticker === '❌' ? null : sticker;
            renderStickers();
            renderPhotoStrip();
        };
        stickers.appendChild(btn);
    });
}

// Render logo options
function renderLogoOptions() {
    const logoBtns = logoOptions.querySelectorAll('.logo-btn');
    logoBtns.forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.logo === selectedLogo);
        btn.onclick = () => {
            selectedLogo = btn.dataset.logo;
            renderLogoOptions();
            renderPhotoStrip();
        };
    });
}

// Listen for add date
addDateCheckbox && addDateCheckbox.addEventListener('change', () => {
    addDate = addDateCheckbox.checked;
    renderPhotoStrip();
});

// Render the photo strip preview
function renderPhotoStrip() {
    photoStrip.innerHTML = '';
    // Create the strip container
    const strip = document.createElement('div');
    strip.className = 'photo-strip';
    strip.style.setProperty('--frame-color', selectedFrameColor);
    // Set a slightly darker border for brilliance
    let borderColor = selectedFrameColor;
    try {
        if (selectedFrameColor.startsWith('#') && selectedFrameColor.length === 7) {
            // Simple darken by 20%
            let r = Math.max(0, parseInt(selectedFrameColor.substr(1,2),16) - 32);
            let g = Math.max(0, parseInt(selectedFrameColor.substr(3,2),16) - 32);
            let b = Math.max(0, parseInt(selectedFrameColor.substr(5,2),16) - 32);
            borderColor = `rgb(${r},${g},${b})`;
        }
    } catch(e) {}
    strip.style.setProperty('--frame-border', borderColor);
    // Set photo shape
    let photoRadius = '16px';
    if (selectedShape === 'square') photoRadius = '0';
    else if (selectedShape === 'circle') photoRadius = '50%';
    strip.style.setProperty('--photo-radius', photoRadius);
    // Add photos
    capturedPhotos.forEach((photo, idx) => {
        const photoWrapper = document.createElement('div');
        photoWrapper.style.position = 'relative';
        const img = document.createElement('img');
        img.className = 'strip-photo';
        img.src = photo;
        photoWrapper.appendChild(img);
        // Sticker for this photo
        if (selectedSticker) {
            const sticker = document.createElement('span');
            sticker.className = 'strip-sticker';
            sticker.style.top = '10px';
            sticker.style.right = '10px';
            sticker.style.position = 'absolute';
            sticker.textContent = selectedSticker;
            photoWrapper.appendChild(sticker);
        }
        strip.appendChild(photoWrapper);
    });
    // Logo and date at the bottom
    if (selectedLogo || addDate) {
        const logoDiv = document.createElement('div');
        logoDiv.className = 'strip-logo';
        // Translation and font
        let logoText = '';
        if (selectedLogo === 'ENG') {
            logoText = 'photobooth';
            logoDiv.style.fontFamily = 'Poppins, Arial, sans-serif';
        } else if (selectedLogo === 'KOR') {
            logoText = '포토부스';
            logoDiv.style.fontFamily = 'Noto Sans KR, Arial, sans-serif';
        } else if (selectedLogo === 'CN') {
            logoText = '照相亭';
            logoDiv.style.fontFamily = 'Noto Sans SC, Arial, sans-serif';
        }
        logoDiv.textContent = logoText;
        strip.appendChild(logoDiv);

        // Add date in a separate div below the logo
        if (addDate) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'strip-date';
            dateDiv.style.fontSize = '0.9rem';
            dateDiv.style.color = '#666';
            dateDiv.style.marginTop = '7px';
            dateDiv.textContent = new Date().toLocaleDateString();
            strip.appendChild(dateDiv);
        }
    }
    photoStrip.appendChild(strip);
}

// Show customize section after photos are taken
function showCustomizeSection() {
    cameraSection.classList.remove('active');
    layoutSection.classList.remove('active');
    gallerySection.classList.remove('active');
    customizeSection.classList.add('active');
    renderFrameColors();
    renderPhotoShapes();
    renderStickers();
    renderLogoOptions();
    renderPhotoStrip();
}

// Retake button
retakeBtn && retakeBtn.addEventListener('click', () => {
    customizeSection.classList.remove('active');
    cameraSection.classList.add('active');
    capturedPhotos = [];
});

// Download button
function downloadComposite() {
    // High-res export settings
    const exportWidth = 800;
    const photoCount = capturedPhotos.length;
    const photoHeight = 640;
    const photoWidth = 720;
    const stripPadding = 40;
    const photoMargin = 32;
    const logoHeight = 80;
    const stripHeight = stripPadding * 2 + photoCount * photoHeight + (photoCount - 1) * photoMargin + logoHeight;
    const canvas = document.createElement('canvas');
    canvas.width = exportWidth;
    canvas.height = stripHeight;
    const ctx = canvas.getContext('2d');

    // Fill background with frame color or gradient
    if (selectedFrameColor.startsWith('linear-gradient')) {
        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, exportWidth, stripHeight);
        const colors = selectedFrameColor.match(/#[a-fA-F0-9]{6}/g);
        if (colors && colors.length >= 2) {
            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(1, colors[1]);
            ctx.fillStyle = gradient;
        }
    } else {
        ctx.fillStyle = selectedFrameColor;
    }
    ctx.fillRect(0, 0, exportWidth, stripHeight);

    // Add rounded corners to the strip
    ctx.save();
    const cornerRadius = 24;
    ctx.beginPath();
    ctx.moveTo(cornerRadius, 0);
    ctx.lineTo(exportWidth - cornerRadius, 0);
    ctx.quadraticCurveTo(exportWidth, 0, exportWidth, cornerRadius);
    ctx.lineTo(exportWidth, stripHeight - cornerRadius);
    ctx.quadraticCurveTo(exportWidth, stripHeight, exportWidth - cornerRadius, stripHeight);
    ctx.lineTo(cornerRadius, stripHeight);
    ctx.quadraticCurveTo(0, stripHeight, 0, stripHeight - cornerRadius);
    ctx.lineTo(0, cornerRadius);
    ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
    ctx.closePath();
    ctx.clip();

    // Draw each photo
    let y = stripPadding;
    capturedPhotos.forEach((photo, idx) => {
        const img = new Image();
        img.src = photo;
        
        // Calculate photo container dimensions
        const containerWidth = photoWidth;
        const containerHeight = photoHeight;
        const x = (exportWidth - containerWidth) / 2;

        // Apply photo shape mask
        ctx.save();
        if (selectedShape === 'circle') {
            ctx.beginPath();
            ctx.arc(x + containerWidth/2, y + containerHeight/2, containerHeight/2, 0, Math.PI * 2);
            ctx.clip();
        } else if (selectedShape === 'square') {
            ctx.beginPath();
            ctx.rect(x, y, containerWidth, containerHeight);
            ctx.clip();
        } else {
            // Default rectangle with rounded corners
            const photoRadius = 16;
            ctx.beginPath();
            ctx.moveTo(x + photoRadius, y);
            ctx.lineTo(x + containerWidth - photoRadius, y);
            ctx.quadraticCurveTo(x + containerWidth, y, x + containerWidth, y + photoRadius);
            ctx.lineTo(x + containerWidth, y + containerHeight - photoRadius);
            ctx.quadraticCurveTo(x + containerWidth, y + containerHeight, x + containerWidth - photoRadius, y + containerHeight);
            ctx.lineTo(x + photoRadius, y + containerHeight);
            ctx.quadraticCurveTo(x, y + containerHeight, x, y + containerHeight - photoRadius);
            ctx.lineTo(x, y + photoRadius);
            ctx.quadraticCurveTo(x, y, x + photoRadius, y);
            ctx.clip();
        }

        // Draw the photo
        ctx.drawImage(img, x, y, containerWidth, containerHeight);
        ctx.restore();

        // Add sticker if selected
        if (selectedSticker) {
            ctx.font = '72px serif';
            ctx.textBaseline = 'top';
            ctx.textAlign = 'right';
            ctx.fillText(selectedSticker, x + containerWidth - 20, y + 20);
        }

        y += containerHeight + photoMargin;
    });

    // Add logo text with exact styling from preview
    ctx.font = 'bold 48px Poppins, Arial, sans-serif';
    ctx.fillStyle = '#000000'; // Black color to match preview
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let logoText = '';
    if (selectedLogo === 'ENG') logoText = 'photobooth';
    else if (selectedLogo === 'KOR') logoText = '포토부스';
    else if (selectedLogo === 'CN') logoText = '照相亭';
    
    // Calculate positions to match preview exactly
    const totalBottomSpace = 120; // Space for logo and date
    const logoY = stripHeight - totalBottomSpace + 20;
    ctx.fillText(logoText, exportWidth/2, logoY);

    // Add date with exact styling from preview
    if (addDate) {
        ctx.font = '32px Poppins, Arial, sans-serif';
        ctx.fillStyle = '#000000'; // Black color to match preview
        const date = new Date().toLocaleDateString();
        const dateY = stripHeight - 40; // Position closer to bottom
        ctx.fillText(date, exportWidth/2, dateY);
    }

    // Draw stickers with exact positioning
    if (selectedSticker) {
        const stickerSize = 72; // Larger size for stickers
        capturedPhotos.forEach((photo, idx) => {
            const containerWidth = photoWidth;
            const containerHeight = photoHeight;
            const x = (exportWidth - containerWidth) / 2;
            const y = stripPadding + (containerHeight + photoMargin) * idx;
            
            ctx.font = `${stickerSize}px serif`;
            ctx.textBaseline = 'top';
            ctx.textAlign = 'right';
            // Position sticker in top right corner with proper padding
            ctx.fillText(selectedSticker, x + containerWidth - 20, y + 20);
        });
    }

    // Download with maximum quality
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png', 1.0);
    link.download = 'photobooth.png';
    link.click();
}
downloadBtn && downloadBtn.addEventListener('click', downloadComposite);

// Update: Remove photoCountSelect and set numPhotos from layout
let numPhotos = 1;

// Add Back to Layouts button functionality
const backToLayoutBtn = document.getElementById('back-to-layout-btn');
if (backToLayoutBtn) {
    backToLayoutBtn.addEventListener('click', () => {
        cameraSection.classList.remove('active');
        layoutSection.classList.add('active');
    });
}