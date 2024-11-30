document.getElementById('portfolioForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = {
        name: document.getElementById('name').value,
        year: document.getElementById('year').value,
        projectType: document.getElementById('projectType').value,
        description: document.getElementById('description').value,
    };

    const issueData = {
        title: `Portfolio Submission: ${formData.name}`,
        body: `
            **Year:** ${formData.year}
            **Project Type:** ${formData.projectType}
            **Description:**
            ${formData.description}
        `,
        labels: ['portfolio-submission'],
    };

    const response = await fetch('https://api.github.com/repos/YOUR_ORG/YOUR_REPO/issues', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer YOUR_PERSONAL_ACCESS_TOKEN`,
            'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify(issueData),
    });

    if (response.ok) {
        alert('Portfolio submitted successfully!');
    } else {
        alert('Failed to submit portfolio. Try again.');
    }
});
