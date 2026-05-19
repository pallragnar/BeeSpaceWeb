/**
 * Bee Space Press Kit - Interactive Features
 * Polykite Games
 */

// ===========================
// Smooth Scrolling for Navigation
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all navigation links
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const navHeight = document.querySelector('.navigation').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ===========================
    // Active Navigation Highlighting
    // ===========================
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('.section, .factsheet');
        const navHeight = document.querySelector('.navigation').offsetHeight;
        const scrollPosition = window.scrollY + navHeight + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNavLink);

    // ===========================
    // Image Gallery Modal
    // ===========================
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.querySelector('.modal-caption');
    const closeModal = document.querySelector('.modal-close');
    const imageItems = document.querySelectorAll('.image-item img');

    imageItems.forEach(img => {
        img.addEventListener('click', function() {
            modal.style.display = 'block';
            modalImg.src = this.src;
            modalCaption.textContent = this.alt;
        });
    });

    // Close modal on click
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside the image
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });

    // ===========================
    // Download Handlers with JSZip
    // ===========================

    /**
     * Fetches image as blob using XMLHttpRequest (better for local files)
     * @param {String} url - Image URL
     * @returns {Promise<Blob>}
     */
    function fetchImageAsBlob(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'blob';

            xhr.onload = function() {
                if (xhr.status === 200 || xhr.status === 0) { // 0 for local files
                    resolve(xhr.response);
                } else {
                    reject(new Error(`Failed to load ${url}: ${xhr.status}`));
                }
            };

            xhr.onerror = function() {
                reject(new Error(`Network error loading ${url}`));
            };

            xhr.send();
        });
    }

    /**
     * Creates a zip file from an array of image URLs and triggers download
     * @param {Array} imageUrls - Array of image URLs to include in zip
     * @param {String} zipFilename - Name of the zip file to download
     */
    async function createAndDownloadZip(imageUrls, zipFilename) {
        try {
            showNotification('Preparing download...');
            const zip = new JSZip();
            const folder = zip.folder('assets');

            let successCount = 0;
            let failCount = 0;

            // Fetch all images and add them to the zip
            const promises = imageUrls.map(async (url) => {
                try {
                    const blob = await fetchImageAsBlob(url);
                    const filename = url.split('/').pop().split('?')[0]; // Remove query params if any
                    folder.file(filename, blob);
                    successCount++;
                    console.log(`Successfully added: ${filename}`);
                    return filename;
                } catch (error) {
                    failCount++;
                    console.error(`Error fetching ${url}:`, error);
                    return null;
                }
            });

            await Promise.all(promises);

            console.log(`Added ${successCount} files, ${failCount} failed`);

            if (successCount === 0) {
                showNotification('No files could be added to zip. Check console for errors.');
                return;
            }

            // Generate the zip file
            showNotification(`Creating zip with ${successCount} files...`);
            const content = await zip.generateAsync({
                type: 'blob',
                compression: 'DEFLATE',
                compressionOptions: { level: 6 }
            });

            console.log(`Zip file size: ${(content.size / 1024).toFixed(2)} KB`);

            // Trigger download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = zipFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up after a delay
            setTimeout(() => URL.revokeObjectURL(link.href), 100);

            showNotification(`Download started! (${successCount} files)`);
            console.log(`Download ${zipFilename} triggered successfully`);
        } catch (error) {
            console.error('Error creating zip:', error);
            showNotification('Error creating download. Please try again.');
        }
    }

    // Download all images
    const downloadImagesBtn = document.getElementById('download-images');
    if (downloadImagesBtn) {
        downloadImagesBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            // Collect all screenshot URLs from the gallery
            const imageItems = document.querySelectorAll('#screenshot-gallery .image-item img');
            const imageUrls = Array.from(imageItems)
                .map(img => img.src)
                .filter(src => src && !src.includes('data:'));

            if (imageUrls.length === 0) {
                showNotification('No images found to download');
                return;
            }

            await createAndDownloadZip(imageUrls, 'bee-space-screenshots.zip');
        });
    }

    // Download all logos
    const downloadLogosBtn = document.getElementById('download-logos');
    if (downloadLogosBtn) {
        downloadLogosBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            // Collect all logo URLs from the logo section
            const logoItems = document.querySelectorAll('#logo .logo-item img');
            const logoUrls = Array.from(logoItems)
                .map(img => img.src)
                .filter(src => src && !src.includes('data:'));

            if (logoUrls.length === 0) {
                showNotification('No logos found to download');
                return;
            }

            await createAndDownloadZip(logoUrls, 'bee-space-logos.zip');
        });
    }

    // Download all videos
    const downloadVideosBtn = document.getElementById('download-videos');
    if (downloadVideosBtn) {
        downloadVideosBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            // Collect all video URLs from the video section
            const videoSources = document.querySelectorAll('#videos video source');
            const videoUrls = Array.from(videoSources)
                .map(source => source.src)
                .filter(src => src && !src.includes('data:'));

            if (videoUrls.length === 0) {
                showNotification('No videos found to download');
                return;
            }

            await createAndDownloadZip(videoUrls, 'bee-space-videos.zip');
        });
    }

    // Download all assets
    const downloadAllBtn = document.getElementById('download-all');
    if (downloadAllBtn) {
        downloadAllBtn.addEventListener('click', async function(e) {
            e.preventDefault();

            try {
                showNotification('Preparing complete press kit...');
                const zip = new JSZip();

                // Create folders for organization
                const screenshotsFolder = zip.folder('screenshots');
                const logosFolder = zip.folder('logos');
                const bannersFolder = zip.folder('banners');
                const videosFolder = zip.folder('videos');

                // Collect all image URLs
                const screenshotItems = document.querySelectorAll('#screenshot-gallery .image-item img');
                const screenshotUrls = Array.from(screenshotItems)
                    .map(img => ({ url: img.src, alt: img.alt }))
                    .filter(item => item.url && !item.url.includes('data:'));

                const logoItems = document.querySelectorAll('#logo .logo-item img');
                const logoUrls = Array.from(logoItems)
                    .map(img => ({ url: img.src, alt: img.alt }))
                    .filter(item => item.url && !item.url.includes('data:'));

                const bannerImg = document.querySelector('.header-banner img');
                const bannerUrls = bannerImg && bannerImg.src && !bannerImg.src.includes('data:')
                    ? [{ url: bannerImg.src, alt: bannerImg.alt }]
                    : [];

                // Collect all video URLs
                const videoSources = document.querySelectorAll('#videos video source');
                const videoUrls = Array.from(videoSources)
                    .map(source => ({ url: source.src }))
                    .filter(item => item.url && !item.url.includes('data:'));

                // Fetch and add screenshots
                const screenshotPromises = screenshotUrls.map(async (item) => {
                    try {
                        const blob = await fetchImageAsBlob(item.url);
                        const filename = item.url.split('/').pop().split('?')[0];
                        screenshotsFolder.file(filename, blob);
                        console.log(`Added screenshot: ${filename}`);
                    } catch (error) {
                        console.error(`Error fetching ${item.url}:`, error);
                    }
                });

                // Fetch and add logos
                const logoPromises = logoUrls.map(async (item) => {
                    try {
                        const blob = await fetchImageAsBlob(item.url);
                        const filename = item.url.split('/').pop().split('?')[0];
                        logosFolder.file(filename, blob);
                        console.log(`Added logo: ${filename}`);
                    } catch (error) {
                        console.error(`Error fetching ${item.url}:`, error);
                    }
                });

                // Fetch and add banner
                const bannerPromises = bannerUrls.map(async (item) => {
                    try {
                        const blob = await fetchImageAsBlob(item.url);
                        const filename = item.url.split('/').pop().split('?')[0];
                        bannersFolder.file(filename, blob);
                        console.log(`Added banner: ${filename}`);
                    } catch (error) {
                        console.error(`Error fetching ${item.url}:`, error);
                    }
                });

                // Fetch and add videos
                const videoPromises = videoUrls.map(async (item) => {
                    try {
                        const blob = await fetchImageAsBlob(item.url);
                        const filename = item.url.split('/').pop().split('?')[0];
                        videosFolder.file(filename, blob);
                        console.log(`Added video: ${filename}`);
                    } catch (error) {
                        console.error(`Error fetching ${item.url}:`, error);
                    }
                });

                // Wait for all fetches to complete
                await Promise.all([...screenshotPromises, ...logoPromises, ...bannerPromises, ...videoPromises]);

                // Generate the zip file
                showNotification('Creating zip file...');
                const content = await zip.generateAsync({
                    type: 'blob',
                    compression: 'DEFLATE',
                    compressionOptions: { level: 6 }
                });

                // Trigger download
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = 'bee-space-press-kit.zip';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);

                showNotification('Download started!');
                console.log('Complete press kit download triggered successfully');
            } catch (error) {
                console.error('Error creating press kit:', error);
                showNotification('Error creating download. Please try again.');
            }
        });
    }

    // ===========================
    // Lazy Loading for Images
    // ===========================
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        });

        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => imageObserver.observe(img));
    }

    // ===========================
    // Copy to Clipboard Functionality
    // ===========================
    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification('Copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy: ', err);
            });
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                showNotification('Copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
            document.body.removeChild(textArea);
        }
    }

    // Add copy functionality to contact email
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    emailLinks.forEach(link => {
        link.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            const email = this.textContent;
            copyToClipboard(email);
        });
    });

    // ===========================
    // Notification System
    // ===========================
    function showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background-color: var(--secondary-color);
            color: white;
            padding: 15px 25px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 2000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // ===========================
    // Back to Top Button
    // ===========================
    const backToTopBtn = document.createElement('button');
    backToTopBtn.innerHTML = '↑';
    backToTopBtn.className = 'back-to-top';
    backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background-color: var(--primary-color);
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 24px;
        cursor: pointer;
        display: none;
        z-index: 999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
    `;
    document.body.appendChild(backToTopBtn);

    // Show/hide back to top button
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    backToTopBtn.addEventListener('mouseenter', function() {
        this.style.backgroundColor = 'var(--accent-color)';
        this.style.transform = 'scale(1.1)';
    });

    backToTopBtn.addEventListener('mouseleave', function() {
        this.style.backgroundColor = 'var(--primary-color)';
        this.style.transform = 'scale(1)';
    });

    // ===========================
    // Print Styles
    // ===========================
    window.addEventListener('beforeprint', function() {
        // Close modal if open
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    });

    // ===========================
    // Analytics Placeholder
    // ===========================
    function trackEvent(category, action, label) {
        console.log('Analytics Event:', { category, action, label });
        // In production, integrate with your analytics service
        // Example: gtag('event', action, { 'event_category': category, 'event_label': label });
    }

    // Track download button clicks
    document.querySelectorAll('.download-link, .button').forEach(btn => {
        btn.addEventListener('click', function() {
            trackEvent('Downloads', 'Click', this.textContent.trim());
        });
    });

    // Track external links
    document.querySelectorAll('a[target="_blank"]').forEach(link => {
        link.addEventListener('click', function() {
            trackEvent('External Links', 'Click', this.href);
        });
    });

    console.log('Bee Space Press Kit initialized successfully!');
});
