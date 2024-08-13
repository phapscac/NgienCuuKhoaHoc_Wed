const form = document.getElementById("form-data");
const textEn = document.getElementById("text-en");
const textVi = document.getElementById("text-vi");
const modal = document.getElementById("modal");
const inputFile = document.getElementById('image');
const video = document.getElementById('videoElement');
const img = document.getElementById("blah");
const imgView = document.getElementById("img-view");
const btnUpload = document.querySelector(".btn-upload");
const startButton = document.getElementById('startCamera');
const stopButton = document.getElementById('stopCamera');
const captureButton = document.getElementById('capturePhoto');
let stream;

function startCamera() {
    if (!stream && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (streamObject) {
                stream = streamObject;
                video.srcObject = stream;
                img.classList.add("d-none");
                video.classList.remove("d-none");
                startButton.classList.add("d-none");
                stopButton.classList.remove("d-none");
                captureButton.classList.remove("d-none");
            })
            .catch(function (error) {
                console.error('Error accessing the camera:', error);
            });
    } else {
        console.error('WebRTC is not supported in this browser.');
    }
}


function stopCamera() {
    if (stream) {
        var tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        img.classList.remove("d-none");
        video.classList.add("d-none");
        imgView.classList.add("d-none");

        startButton.classList.remove("d-none");
        stopButton.classList.add("d-none");
        captureButton.classList.add("d-none");

        video.srcObject = null;
        stream = null;
    }
}

function capturePhoto() {
    if (stream) {
        var context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        var imgData = canvas.toDataURL('image/png');
        imgView.src = imgData;

        var blob = dataURLtoBlob(imgData);

        var file = new File([blob], 'captured_photo.png');

        var dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        inputFile.files = dataTransfer.files;
        imgView.classList.remove("d-none");
    }
}
function dataURLtoBlob(dataURL) {
    var arr = dataURL.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}
function playAudioFromBase64(base64Data, fileName) {
    var audioUrl = "data:audio/mp3;base64," + base64Data;
    var audio = new Audio(audioUrl);
    audio.play();
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (inputFile.files.length === 0) {
        alert("Chưa có file hình ảnh");
        return;
    }

    modal.classList.add('active');

    const formData = new FormData(form);
    const options = {
        method: 'POST',
        body: formData
    };

    try {
        const response = await fetch('http://14.225.192.6:5000/api/v1/auto-create-caption', options);
        const data = await response.json();
        console.log(data);

        var btnPlayEn = `<button class='btn-play' data-type='en'><svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24" fill="none">
            <path d="M15 5V19M21 5V19M3 7.20608V16.7939C3 17.7996 3 18.3024 3.19886 18.5352C3.37141 18.7373 3.63025 18.8445 3.89512 18.8236C4.20038 18.7996 4.55593 18.4441 5.26704 17.733L10.061 12.939C10.3897 12.6103 10.554 12.446 10.6156 12.2565C10.6697 12.0898 10.6697 11.9102 10.6156 11.7435C10.554 11.554 10.3897 11.3897 10.061 11.061L5.26704 6.26704C4.55593 5.55593 4.20038 5.20038 3.89512 5.17636C3.63025 5.15551 3.37141 5.26273 3.19886 5.46476C3 5.69759 3 6.20042 3 7.20608Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg></button>`

        textEn.innerHTML = data.en.text + btnPlayEn;

        var btnPlayVi = `<button class='btn-play' data-type='vi'><svg xmlns="http://www.w3.org/2000/svg" width="30px" height="30px" viewBox="0 0 24 24" fill="none">
            <path d="M15 5V19M21 5V19M3 7.20608V16.7939C3 17.7996 3 18.3024 3.19886 18.5352C3.37141 18.7373 3.63025 18.8445 3.89512 18.8236C4.20038 18.7996 4.55593 18.4441 5.26704 17.733L10.061 12.939C10.3897 12.6103 10.554 12.446 10.6156 12.2565C10.6697 12.0898 10.6697 11.9102 10.6156 11.7435C10.554 11.554 10.3897 11.3897 10.061 11.061L5.26704 6.26704C4.55593 5.55593 4.20038 5.20038 3.89512 5.17636C3.63025 5.15551 3.37141 5.26273 3.19886 5.46476C3 5.69759 3 6.20042 3 7.20608Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg></button>`

        textVi.innerHTML = data.vi.text + btnPlayVi;

        const playButtons = document.querySelectorAll('.btn-play');

        playButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const audioType = btn.getAttribute('data-type');

                const audioBase64 = (audioType === "en") ? data.en.file : data.vi.file;
                playAudioFromBase64(audioBase64, `output_${audioType}`);
            });
        });

    } catch (error) {
        console.log('Fetch error:', error);
    } finally {
        modal.classList.remove('active');
    }
});
startButton.addEventListener('click', startCamera);
stopButton.addEventListener('click', stopCamera);
captureButton.addEventListener('click', capturePhoto);
btnUpload.addEventListener('click', stopCamera);
