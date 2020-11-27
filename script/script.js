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
    let cameraSection = document.querySelector('.camera');
    let gallerySection = document.querySelector('.the-gallery');

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
        
        if (cameraSection.classList !== 'hidden') {
            cameraSection.classList.add('hidden');
        } else {
            cameraSection.classList.remove('hidden');
        }
    });


    if ('mediaDevices' in navigator) {
        cameraSettings();
    }

    if ('geolocation' in navigator) {
        locationSettings();
    }

    ///notificationSettings();
    gallerySettings();
});





function cameraSettings(position) {
    const cameraOnButton = document.querySelector('.camera-on');
    const cameraOffButton = document.querySelector('.camera-off')
    const takePictureButton = document.querySelector('.take-picture');
    const changeCameraButton = document.querySelector('.change-camera')
    
    const errorMessage = document.querySelector('.error-message');
    const video = document.querySelector('video');
    const pictureTaken = document.querySelector('.picture-taken')

    let stream;
    let facingMode = 'environment';

    cameraOnButton.addEventListener('click', async () => {
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
    })

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
    })

    takePictureButton.addEventListener('click', async () => {
        errorMessage.innerHTML = '';
        if (!stream) {
            errorMessage.innerHTML = 'No video to take photo from.';
            return;
        }
        let tracks = stream.getTracks();
        let videoTrack = tracks[0];
        
        let capture = new ImageCapture(videoTrack);
        let blob = await capture.takePhoto();
        
        let imgUrl = URL.createObjectURL(blob);
        pictureTaken.src = imgUrl;
        console.log(pictureTaken.src);

        //notificationSettings(pictureTaken);
        addImage(pictureTaken.src, position)
    })

    changeCameraButton.addEventListener('click', () => {
        if (facingMode == 'environment') {
            facingMode = 'user';
        } else {
            facingMode = 'environment';
        }
        cameraOffButton.click();
        cameraOnButton.click();
    })
}



function locationSettings() {
    try {
        const geo = navigator.geolocation;
        geo.getCurrentPosition(pos => {
            let lat = pos.coords.latitude;
            let lng = pos.coords.longitude;
            getAdressFromPosition(lat, lng);
        }, error => {
            console.log(error);
        });
    } catch (e) {
        console.log('This device does not have access to the Geolocation API.');
    }
}


async function getAdressFromPosition(lat, lng) {
    try {
        const response = await fetch(`https://geocode.xyz/${lat},${lng}?json=1`);
        const data = await response.json();
        cameraSettings(data)

    } catch (e) {
        console.log(e)
    }
}

/*
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
*/

function addImage(image, position) {
    const yesButton = document.querySelector('.yesButton');
    const noButton = document.querySelector('.noButton');

    let img = {
        imgUrl: image,
        city: position.city,
        country: position.country
    }


    yesButton.addEventListener('click', () => {
        console.log('YesButton');
    })


    noButton.addEventListener('click', () => {
        console.log('Nobutton')
    })
}




function gallerySettings() {
    const galleryImg = document.querySelector('.the-gallery');
    let allImg = ['forest.jpg', 'ocean.jpg', 'turtle.jpg'];
 
    for(image of allImg) {
        let theImage = document.createElement('div');
        theImage.classList.add('image');
        let url = image;
       
        theImage.innerHTML += 
        '<img src="img/' + url + '" alt="Picture in gallery" class="gallery-images">' +
        '<p class="location">Photographed at ' + image.city + ', ' + image.country + '.</p>';
    

        //To download the image
        let downloadLink = document.createElement('a');
        downloadLink.setAttribute('download', url);
        
        downloadLink.innerHTML = 'Download';
        downloadLink.href = 'img/' + url;

        downloadLink.addEventListener('click', () => {
            downloadLink.download = downloadLink.href;
        })  

        //To delete selected image
        let deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.innerHTML = 'Delete';

        deleteButton.addEventListener('click', () => {
            console.log('delete', url);
        }) 


        theImage.appendChild(downloadLink);
        theImage.appendChild(deleteButton);
        galleryImg.append(theImage);
    }    
}