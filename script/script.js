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
        console.log(city, country);

    } catch (e) {
        console.log('getAdressFromPosition error: ', e)
    }
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
        body: "This is your image",
        icon: image.src
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
    const allowLocationButton = document.querySelector('.allow-location');

    const video = document.querySelector('.video');
    const errorMessage = document.querySelector('.error-message');
    const pictureImage = document.querySelector('.picture-taken');

    let stream;
    let facingMode = 'environment';


    allowLocationButton.addEventListener('click', async () => {
        console.log('Hej');
        await getPosition();
        //allowLocationButton.classList.add('hidden');
    })



    cameraOnButton.addEventListener('click', async () => {
        errorMessage.innerHTML = '';
        try {
            const md = navigator.mediaDevices;
            stream = await md.getUserMedia({
                video: { width: 320, height: 320, facingMode: facingMode }
            })
            
            video.srcObject = stream;
            console.log(video.srcObject)

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

        notificationSettings(pictureImage);
        addImage(pictureImage, city, country);
    });
}


//To choose if adding the picture to gallery or not
function addImage(image, city, country) {
    const yesButton = document.querySelector('.yesButton');
    const noButton = document.querySelector('.noButton');
    let added = document.querySelector('.info')
    let divElem = document.querySelector('.pictureSection');
    let date = new Date().toISOString().slice(0,10);

    let img = {
        imgUrl: image.src,
        city: city,
        country: country,
        date: date
    }

    yesButton.addEventListener('click', () => {
        addToGallery(img);
        added.innerHTML = 'Image added to the gallery';
        img.imgUrl = "";
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

    let allImg = [ 
        {
            imgUrl: 'forest.jpg',
            city: 'State of Amazonas',
            country: 'Brazil',
            time: '2017-10-05'
        },
        {
            imgUrl: 'ocean.jpg',
            city: 'Tasman Sea',
            country: '',
            time: '2017-12-08'
        }, {
            imgUrl: 'turtle.jpg',
            city: 'Indian Ocean',
            country: '',
            time: '2017-11-20'
        }];

    for(image of allImg) {
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
        '<img src="img/' + image.imgUrl + '" alt="Picture in gallery" class="gallery-images">' +
        '<p class="location">Photographed at '+ image.time + ', ' + image.city + ', ' + image.country + '.</p>';
    

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