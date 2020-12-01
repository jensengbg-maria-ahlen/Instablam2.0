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
    let errorMessage = document.querySelector('.error-message');

    if ('geolocation' in navigator) {    
        try {
            const geo = navigator.geolocation;
            geo.getCurrentPosition(pos => {
                let lat = pos.coords.latitude;
                let lng = pos.coords.longitude;
                getAdressFromPosition(lat, lng);
            }, error => {
                console.log('locationSettings error: ', error);
            });
        } catch (e) {
            errorMessage.innerHTML = 'This device does not have access to the Geolocation API.';
        }
    }
}

async function getAdressFromPosition(lat, lng) {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=b756363ff58242588fc1d3ba17062641`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        const city = data.results[0].components.city_district;
        const country = data.results[0].components.country;
        saveAdressInSessionStorage(city, country);

    } catch (e) {
        console.log('getAdressFromPosition error: ', e)
    }
}

function saveAdressInSessionStorage(city, country) {
    sessionStorage.setItem('city', city);
    sessionStorage.setItem('country', country);
}




//Notifications
async function notificationSettings(image) {
    let notificationPermission = false;
    const errorMessage = document.querySelector('.error-message')
    const answer = await Notification.requestPermission();
    
    if (answer == 'granted') {
        notificationPermission = true;
    } else if (answer == 'denied') {
        console.log('Notificaton: User denied notification');
    } else {
        console.log('Notification: user declined to answer');
    }

    if (!notificationPermission) {
        errorMessage.innerHTML = 'We do not have permission to show notification';
        return;
    }

    const options = {
        body: "Image added to gallery",
        icon: image
    }

    navigator.serviceWorker.ready.then(reg => 
        reg.showNotification('Image', options));
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
        let city = sessionStorage.getItem('city');
        let country = sessionStorage.getItem('country');

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
        
        let imgSection = document.querySelector('.pictureSection');
        imgSection.classList.remove('hidden');

        addImage(pictureImage.src, city, country);
    });
}


//To choose if adding the picture to gallery or not
function addImage(image, city, country) {
    const yesButton = document.querySelector('.yesButton');
    const noButton = document.querySelector('.noButton');
    let divElem = document.querySelector('.pictureSection');
    let date = new Date().toISOString().slice(0,10);

    let img = {
        imgUrl: image,
        city: city,
        country: country,
        date: date
    }


    yesButton.addEventListener('click', () => {
        if (img.imgUrl !== "") {
            addToGallery(img);
            notificationSettings(img.imgUrl);
            divElem.classList.add('hidden');
            img.imgUrl = "";
        }
    })

    noButton.addEventListener('click', () => {
        img.imgUrl = "";
        divElem.classList.add('hidden');
    })
    
}


//gallery with previous pictures
function gallerySettings() {
    const galleryImg = document.querySelector('.gallerySection');
    galleryImg.innerHTML = '';

    let currentImg = [ 
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

    for(image of currentImg) {
        let theImage = document.createElement('div');
        theImage.classList.add('image');
        let url = image.imgUrl;
       
        theImage.innerHTML += 
        '<h2>The gallery</h2>'+
        '<img src="img/' + image.imgUrl + '" alt="Picture in gallery" class="gallery-images">' +
        '<p class="location">Photographed at '+ image.time + ', ' + image.city + ', ' + image.country + '.</p>';
    

        //To download the image
        let downloadLink = document.createElement('a');
        downloadLink.setAttribute('download', url);
        
        downloadLink.innerHTML = 'Download';
        downloadLink.href = 'img/' + url;

        downloadLink.addEventListener('click', () => {
            downloadLink.download = downloadLink.href;
        });  

        //To delete selected image
        let deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.innerHTML = 'Delete';

        deleteButton.addEventListener('click', () => {
            deleteButton.parentElement.remove();
        });


        theImage.appendChild(downloadLink);
        theImage.appendChild(deleteButton);
        galleryImg.append(theImage);
    }    
}


//Adding and showing the new image in the gallery
function addToGallery(img) {
    const galleryImg = document.querySelector('.gallerySection');
    let newImages = [];
    newImages.push(img);

    for(image of newImages){
        let theImage = document.createElement('div');
        theImage.classList.add('image');
        let url = image.imgUrl;
       
        theImage.innerHTML += 
        '<img src="' + image.imgUrl + '" alt="Picture in gallery" class="gallery-images">' +
        '<p class="location">Photographed at '+ image.date + ', ' + image.city + ', ' + image.country + '.</p>';
    

        //To download the image
        let downloadLink = document.createElement('a');
        downloadLink.setAttribute('download', url);
        
        downloadLink.innerHTML = 'Download';
        downloadLink.href = url;

        downloadLink.addEventListener('click', () => {
            downloadLink.download = downloadLink.href;
        });  

        //To delete selected image
        let deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.innerHTML = 'Delete';

        deleteButton.addEventListener('click', () => {
            deleteButton.parentElement.remove();
        });


        theImage.appendChild(downloadLink);
        theImage.appendChild(deleteButton);
        galleryImg.append(theImage);
    }     
}