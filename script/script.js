if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => { 
            console.log('Service worker registred.'); 
        })
        .catch(error => {
            console.log('Service worker registration error: ', error.message)
        })
}


window.addEventListener('load', () => {
    const showGalleryButton = document.querySelector('.show-gallery-button');
    const showCameraButton = document.querySelector('.show-camera-button');
    let cameraSection = document.querySelector('.cameraSection');
    let gallerySection = document.querySelector('.gallerySection');
    let picture = document.querySelector('.pictureSection');

    showCameraButton.addEventListener('click', () => {
        cameraSection.classList.remove('hidden');

        if (gallerySection.classList !== 'hidden') {
            gallerySection.classList.add('hidden');
        } else {
            gallerySection.classList.remove('hidden');
        }
    });

    showGalleryButton.addEventListener('click', () => {
        gallerySection.classList.remove('hidden');
        picture.classList.add('hidden');

        if (cameraSection.classList !== 'hidden') {
            cameraSection.classList.add('hidden');
        } else {
            cameraSection.classList.remove('hidden');
        }
    });

    
    if ('mediaDevices' in navigator) {
        cameraSettings();
    }

    gallerySettings();
});



//Geolocation
function getPosition() {
    if ('geolocation' in navigator) {    
        let errorMessage = document.querySelector('.error-message');
        
        try {
            const geo = navigator.geolocation;
            geo.getCurrentPosition(pos => {
                let lat = pos.coords.latitude;
                let lng = pos.coords.longitude;
                getAdressFromPosition(lat, lng);
            }, error => {
                errorMessage.innerHTML = 'Please allow position and I will tell you where you are.';
            });
        } catch (e) {
            errorMessage.innerHTML = 'This device does not have access to the Geolocation API.';
        }
    } 
}

async function getAdressFromPosition(lat, lng) {
    let errorMessage = document.querySelector('.error-message');
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=b756363ff58242588fc1d3ba17062641`;
    try {
        const response = await fetch(url);
        const data = await response.json();

        if(data.error) {
            errorMessage.innerHTML = 'This device does not have access to the Geolocation API.';
        } else {
            const city = data.results[0].components.city_district;
            const country = data.results[0].components.country;
            saveAdressInLocalStorage(city, country);
        }
    } catch (error) {
        errorMessage.innerHTML = `Could not find your city. Errormessage${error}`
    }
}

function saveAdressInLocalStorage(city, country) {
    localStorage.setItem('city', city);
    localStorage.setItem('country', country);
}




//Notifications
async function notificationSettings() {
    let notificationPermission = false;
    const errorMessage = document.querySelector('.error-message')
    const answer = await Notification.requestPermission();
    
    if (answer == 'granted') {
        notificationPermission = true;
    } else if (answer == 'denied') {
        errorMessage.innerHTML = 'We do not have permission to show notification';
    } else {
        errorMessage.innerHTML = 'We do not have permission to show notification';
    }
}

//Show notification if allowed
function showNotification(image) {
    const options = {
        body: "Added to gallery",
        icon: image
    }

    navigator.serviceWorker.ready.then(reg => 
        reg.showNotification('New image', options));
}





//MediaDevices
function cameraSettings() {
    const cameraOnButton = document.querySelector('.camera-on');
    const cameraOffButton = document.querySelector('.camera-off')
    const takePictureButton = document.querySelector('.take-picture');
    const changeCameraButton = document.querySelector('.change-camera');

    const video = document.querySelector('.video');
    const errorMessage = document.querySelector('.error-message');
    const pictureImage = document.querySelector('.picture-taken');

    let stream;
    let facingMode = 'environment';

    cameraOnButton.addEventListener('click', async () => {
        getPosition();
        notificationSettings();
        errorMessage.innerHTML = '';
        try {
            const md = navigator.mediaDevices;
            stream = await md.getUserMedia({
                video: { width: 320, height: 320, facingMode: facingMode }
            })
            
            video.srcObject = stream;

            takePictureButton.classList.remove('hidden');
            changeCameraButton.classList.remove('hidden');
            cameraOnButton.classList.add('hidden');
            cameraOffButton.classList.remove('hidden');

        } catch (e) {
            errorMessage.innerHTML = 'Please allow the app to access camera'
        }
    });


    cameraOffButton.addEventListener('click', async () => {
        errorMessage.innerHTML = '';
        if (!stream) {
            errorMessage.innerHTML = 'No video to stop.';
            return;
        }
        let tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        
        takePictureButton.classList.add('hidden');
        changeCameraButton.classList.add('hidden');
        cameraOnButton.classList.remove('hidden');
        cameraOffButton.classList.add('hidden');
    });


    changeCameraButton.addEventListener('click', () => {
        if (facingMode == 'environment') {
            facingMode = 'user';
        } else {
            facingMode = 'environment';
        }
        cameraOffButton.click();
        cameraOnButton.click();
    });


    takePictureButton.addEventListener('click', async () => {
        let city = localStorage.getItem('city');
        let country = localStorage.getItem('country');

        errorMessage.innerHTML = '';
        if (!stream) {
            errorMessage.innerHTML = 'No video to take photo from.';
            return;
        }
        let tracks = stream.getTracks();
        let imgTrack = tracks[0]; 
        let capture = new ImageCapture(imgTrack);
        let blob = await capture.takePhoto();
    
        let imgUrl = URL.createObjectURL(blob);
        pictureImage.src = imgUrl;
        
        let cameraSection = document.querySelector('.cameraSection');
        let imgSection = document.querySelector('.pictureSection');
        imgSection.classList.remove('hidden');
        cameraSection.classList.add('hidden');

        addImageToGalley(pictureImage.src, city, country);
    });
}



//To choose if adding the picture to gallery or not
function addImageToGalley(image, city, country) {
    const yesButton = document.querySelector('.yesButton');
    const noButton = document.querySelector('.noButton');
    let cameraSection = document.querySelector('.cameraSection');
    let imgSection = document.querySelector('.pictureSection');
    let date = new Date().toISOString().slice(0,10);
    let position = document.querySelector('.position')

    if (city == null && country == null) {
        position.innerHTML = `Could not retrive location information.`
        city = 'City: Unknown',
        country = 'Country: Unknown'
    } else {
        position.innerHTML = `Picture was taken at ${city}, ${country}.`
    }


    let img = {
        imgUrl: image,
        city: city,
        country: country,
        date: date
    }

    yesButton.addEventListener('click', () => {
        if (img.imgUrl !== "") {
            createInGallery(img);
            showNotification(img.imgUrl);
            imgSection.classList.add('hidden');
            cameraSection.classList.remove('hidden');
            img.imgUrl = "";
        }
    })

    noButton.addEventListener('click', () => {
        img.imgUrl = "";
        imgSection.classList.add('hidden');
        cameraSection.classList.remove('hidden');
    })
}


//gallery with static pictures
function gallerySettings() {
    const allImages = document.querySelector('.allImages');

    let currentImages = [ 
        {
            imgUrl: 'forest.jpg',
            city: 'State of Amazonas',
            country: 'Brazil',
            time: '2017-10-05'
        },
        {
            imgUrl: 'ocean.jpg',
            city: 'Tasman Sea',
            country: 'New Zealand',
            time: '2017-12-08'
        }, {
            imgUrl: 'turtle.jpg',
            city: 'Indian Ocean',
            country: 'Australia',
            time: '2017-11-20'
        }];

    for(image of currentImages) {
        let theImage = document.createElement('div');
        theImage.classList.add('image');
        let url = image.imgUrl;
       
        theImage.innerHTML += 
        `<img src="img/${image.imgUrl}" alt="Picture in gallery" class="gallery-images">
        <p class="location">Photographed at ${image.time}, ${image.city}, ${image.country}.</p>`;


        let divElem = document.createElement('div');
        divElem.classList.add('pictureButtons');


        //To delete selected image
        let deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.innerHTML = 'Delete';

        deleteButton.addEventListener('click', () => {
            divElem.parentElement.remove();
        });


        //To download the image
        let downloadLink = document.createElement('a');
        downloadLink.setAttribute('download', url);
        downloadLink.classList.add('download-button')
        
        downloadLink.innerHTML = 'Download';
        downloadLink.href = 'img/' + url;

        downloadLink.addEventListener('click', () => {
            downloadLink.download = downloadLink.href;
        });  

        
        divElem.appendChild(deleteButton);
        divElem.appendChild(downloadLink);

        theImage.appendChild(divElem);
        allImages.append(theImage);
    }    
}




//Showing the new image in the gallery
function createInGallery(img) {
    const allImages = document.querySelector('.allImages');
    let newImages = [];
    newImages.push(img);

    for(image of newImages){
        let theImage = document.createElement('div');
        theImage.classList.add('image');
        let url = image.imgUrl;
       
        theImage.innerHTML += 
        `<img src="${image.imgUrl}" alt="Picture in gallery" class="gallery-images">
        <p class="location">Photographed at ${image.date}, ${image.city}, ${image.country}.</p>`;


        let divElem = document.createElement('div');
        divElem.classList.add('pictureButtons');


        //To delete selected image
        let deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.innerHTML = 'Delete';

        deleteButton.addEventListener('click', () => {
            divElem.parentElement.remove();
        });


        //To download the image
        let downloadLink = document.createElement('a');
        downloadLink.setAttribute('download', url);
        
        downloadLink.innerHTML = 'Download';
        downloadLink.href = url;

        downloadLink.addEventListener('click', () => {
            downloadLink.download = 'img.jpg';
        });  


        divElem.appendChild(deleteButton);
        divElem.appendChild(downloadLink);
        
        theImage.appendChild(divElem);
        allImages.append(theImage);
    }     
}