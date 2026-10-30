// Certificate images also remain ordinary links when JavaScript is unavailable.
const certificateDialog = document.getElementById('certificate-dialog');
const certificateImage = document.getElementById('certificate-full-image');
const certificateTitle = document.getElementById('certificate-dialog-title');
let certificateTrigger;

document.querySelectorAll('[data-cert-preview]').forEach(link => {
    link.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !certificateDialog.showModal) return;
        event.preventDefault();
        certificateTrigger = link;
        certificateImage.src = link.href;
        certificateImage.alt = link.dataset.title;
        certificateTitle.textContent = link.dataset.title;
        certificateDialog.showModal();
    });
});
document.getElementById('certificate-close').addEventListener('click', () => certificateDialog.close());
certificateDialog.addEventListener('click', event => {
    if (event.target !== certificateDialog) return;
    const bounds = certificateDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) certificateDialog.close();
});
certificateDialog.addEventListener('close', () => certificateTrigger?.focus());
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileDrawer.classList.contains('active')) {
        closeDrawer();
        hamburgerMenu.focus();
    }
});
