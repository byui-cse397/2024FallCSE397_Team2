const folderUrl = 'https://api.github.com/repos/byui-cse397/2024FallCSE397_Team2/contents/Backend/HTML_file_destination?ref=backend-tests';

fetch(folderUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    console.log('Fetched list of files from GitHub folder:', folderUrl);
    return response.json();
  })
  .then(files => {
    console.log('List of files retrieved:', files);
    const htmlFiles = files.filter(file => file.name.endsWith('.html'));

    console.log('Filtered HTML files:', htmlFiles);

    htmlFiles.forEach((file, index) => {
      const fileUrl = file.download_url;
      console.log(`Fetching HTML file: ${file.name} from ${fileUrl}`);

      fetch(fileUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          console.log(`Successfully fetched: ${file.name}`);

          return response.text();
        })
        .then(data => {
          console.log(`Fetched content from ${file.name}`);

          const parser = new DOMParser();
          const doc = parser.parseFromString(data, 'text/html');

          const title = doc.querySelector('li p') ? doc.querySelector('li p').textContent.slice(15).trim() : 'No Title';
          const name = doc.querySelector('li:nth-of-type(2) p') ? doc.querySelector('li:nth-of-type(2) p').textContent.slice(14).trim() : 'No Name';
          const year = doc.querySelector('li:nth-of-type(3) p') ? doc.querySelector('li:nth-of-type(3) p').textContent.slice(6).trim() : 'No Year';
          const major = doc.querySelector('li:nth-of-type(4) p') ? doc.querySelector('li:nth-of-type(4) p').textContent.slice(7).trim() : 'No Major';
          const description = doc.querySelector('li:nth-of-type(5)') ? doc.querySelector('li:nth-of-type(5)').textContent.slice(14).trim() : 'No Major';

          const newDiv = document.createElement('div');
          newDiv.classList.add('html-content');
          newDiv.id = `html-file-${index}`;

          newDiv.innerHTML = `
            <img src="./images/placeholder.svg" alt="Project Image" class="project-image">
            <h2 class="project-title">${title}</h2>
            <h3 class="project-name">${name}</h3>
            <p class="project-year-major">${year} in ${major}</p>
            <p class="project-description">${description}</p>
          `;

            

            newDiv.addEventListener('click', () => {
                openPopup(data);
                });

          const targetDiv = document.querySelector('.catalog');
          targetDiv.appendChild(newDiv);
        })
        .catch(error => console.error(`Error fetching ${file.name}:`, error));
    });
  })
  .catch(error => console.error('Error fetching folder content:', error));



function openPopup(data) {
    const popupDiv = document.createElement('div');
    popupDiv.classList.add('popup-container');
  
    popupDiv.innerHTML = `
      <div class="popup-content">
        <button class="popup-close" onclick="closePopup()">X</button>
        <div>${data}</div>
      </div>
    `;
  
    document.body.appendChild(popupDiv);
  }
  
  function closePopup() {
    const popup = document.querySelector('.popup-container');
    if (popup) {
      popup.remove();
    }
  }  