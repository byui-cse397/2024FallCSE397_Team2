document.getElementById('search').addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const items = document.querySelectorAll('.portfolio-item');

    items.forEach(item => {
        const matches = item.textContent.toLowerCase().includes(query);
        item.style.display = matches ? '' : 'none';
    });
});
