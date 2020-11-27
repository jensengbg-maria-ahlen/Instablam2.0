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
    
});


function gallerySettings() {
    const galleryImg = document.querySelector('.the-gallery');
    galleryImg.innerHTML = '';
    
    for(image of allImg.images) {
        let theImage = document.createElement('div');
        theImage.classList.add('image')
        theImage.innerHTML += 
            '<img src="' + image.imgUrl + '" alt="Picture in gallery" class="gallery-Images">' +
            '<p class="location">Photographed at ' + image.city + ', ' + image.country + '.</p>' +
            '<a href="#" download class="downloadLink">Download</i></a>' +
            '<button class="delete-button" value='+image.imgUrl+'>Delete</button>';
        galleryImg.append(theImage);
    }
    deleteImg();
    download();    
}


function download() {
    let downloadlink = document.querySelector('.downloadLink');

    downloadlink.addEventListener('click', () => {
        downloadLink.href = galleryImg.src;
        downloadLink.download = downloadLink.href;
    })    
}


function deleteImg() {
    let deleteButton = document.querySelectorAll('.delete-button');
    //console.log(deleteButton);

    for(let i = 0; i < deleteButton.length; i++) {    
        deleteButton[i].addEventListener('click', () => {
            console.log('hej')
            //deleteImg(deleteButton[i].value);
            getImages();
        })
    }
}