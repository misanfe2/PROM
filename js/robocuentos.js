var video = document.getElementById("mainVideo");
var playPauseBtn = document.getElementById("playPauseBtn");
var stopBtn = document.getElementById("stopBtn");
var fastForwardBtn = document.getElementById("fastForwardBtn");
var progressBar = document.getElementById("progressBar");
var durationInfo = document.getElementById("durationInfo");
var fullscreenBtn = document.getElementById("fullscreenBtn");
var volumeSlider = document.getElementById("volumeSlider");
var volumeIcon = document.getElementById("volumeIcon");

var isMuted = false;
var previousVolume;

// Función para inicializar el reproductor de video y configurar los eventos asociados
function initializeVideoPlayer() {

    // Restablecer el estado del reproductor de video
    video.pause();
    video.currentTime = 0;
    playPauseBtn.innerHTML = "<img src='./svg/play.svg' alt='Play'>";
    progressBar.value = 0;
    durationInfo.textContent = "00:00 / 00:00";
    volumeSlider.value = 100;
    volumeIcon.innerHTML = "<img src='./svg/high.svg' alt='High Volume'>";

    // Asignar eventos al reproductor de video
    playPauseBtn.onclick = playPause;
    stopBtn.onclick = stopVideo;
    fastForwardBtn.onclick = fastForward;
    video.addEventListener("timeupdate", updateProgressBar);
    fullscreenBtn.onclick = toggleFullscreen;
    volumeSlider.oninput = changeVolume;
    volumeIcon.onclick = toggleMute;

    // Asignar eventos a las miniaturas de video
    let videoList = document.querySelectorAll('.vid-container .list-group-item');
    videoList.forEach(vid => {
        vid.onclick = () => {
            let thumbnailSrc = vid.querySelector('.list-video').src;
            let title = vid.querySelector('.list-title').innerHTML;

            // Modificar la ruta de la miniatura a la carpeta ./vid/
            let videoSrc = thumbnailSrc.replace('/img/', '/vid/').replace('.png', '.mp4');

            // Actualizar el video principal
            video.src = videoSrc;
            video.play(); // Reproducir automáticamente el nuevo video
            playPauseBtn.innerHTML = "<img src='./svg/pause.svg' alt='Pause'>";
            video.style.border = "5px solid green"; // Cambiar el borde a verde cuando se reproduce automáticamente

            // Actualizar el título del video principal
            document.querySelector('.mainvid-container h2').innerHTML = title;
        };
    });
}

// Llamar a la función de inicialización del reproductor de video al cargar la página
initializeVideoPlayer();

// Función para reproducir o pausar el video
function playPause() {
    var video = document.getElementById("mainVideo");
    var playPauseBtn = document.getElementById("playPauseBtn");

    if (video.paused) {
        video.play();
        playPauseBtn.innerHTML = "<img src='./svg/pause.svg' alt='Pause'>";
        video.style.border = "5px solid green"; // Cambiar el borde a verde cuando se reproduce
    } else {
        video.pause();
        playPauseBtn.innerHTML = "<img src='./svg/play.svg' alt='Play'>";
        video.style.border = "5px solid red"; // Cambiar el borde a rojo cuando está en pausa
    }
}

// Función para detener el video y restablecerlo al principio
function stopVideo() {
    var video = document.getElementById("mainVideo");
    var playPauseBtn = document.getElementById("playPauseBtn");

    video.pause();
    video.currentTime = 0;
    playPauseBtn.innerHTML = "<img src='./svg/play.svg' alt='Play'>";
    video.style.border = "5px solid red"; // Cambiar el borde a rojo cuando se detiene el video
}


// Función para avanzar rápidamente en el video
function fastForward() {
    var video = document.getElementById("mainVideo");
    video.currentTime += 10;
}

// Función para actualizar la barra de progreso del video
function updateProgressBar() {
    var video = document.getElementById("mainVideo");
    var progressBar = document.getElementById("progressBar");
    var durationInfo = document.getElementById("durationInfo");

    var value = (video.currentTime / video.duration) * 100;

    // Verificar si el valor es un número finito
    if (!isFinite(value)) {
        // Si no es un número finito, establecer el valor a 0
        value = 0;
    }

    progressBar.value = value;

    // Formatear la duración actual y total del video
    var currentMinutes = Math.floor(video.currentTime / 60);
    var currentSeconds = Math.floor(video.currentTime % 60);
    var totalMinutes = Math.floor(video.duration / 60);
    var totalSeconds = Math.floor(video.duration % 60);

    durationInfo.textContent = padTime(currentMinutes) + ":" + padTime(currentSeconds) + " / " +
        padTime(totalMinutes) + ":" + padTime(totalSeconds);
}

// Función para formatear el tiempo en minutos y segundos con ceros a la izquierda si es necesario
function padTime(time) {
    return time < 10 ? "0" + time : time;
}

// Función para alternar el modo de pantalla completa
function toggleFullscreen() {
    var video = document.getElementById("mainVideo");

    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.mozRequestFullScreen) {
        video.mozRequestFullScreen(); // Firefox
    } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen(); // Chrome and Safari
    }
}

// Función para cambiar el volumen del video
function changeVolume() {
    var video = document.getElementById("mainVideo");
    var volumeSlider = document.getElementById("volumeSlider");
    var volumeIcon = document.getElementById("volumeIcon");
    var volume = volumeSlider.value;

    video.volume = volume / 100;

    // Actualizar el icono de volumen según el nivel
    updateVolumeIcon(volume);

    // Recordar el valor del volumen antes de activar el mute
    if (isMuted && volume > 0) {
        previousVolume = volume;
        isMuted = false;
    }
}

// Función para alternar el mute del video
function toggleMute() {
    var video = document.getElementById("mainVideo");
    var volumeSlider = document.getElementById("volumeSlider");
    var volumeIcon = document.getElementById("volumeIcon");

    if (video.volume === 0 || isMuted) {
        // Si está en silencio o ya se está silenciado, desactivar mute
        video.volume = previousVolume / 100;
        volumeSlider.value = previousVolume;
        updateVolumeIcon(previousVolume);
        isMuted = false;
    } else {
        // Si no está en silencio, activar mute
        previousVolume = volumeSlider.value;
        video.volume = 0;
        volumeSlider.value = 0;
        volumeIcon.innerHTML = "<img src='./svg/mute.svg' alt='Mute'>";
        isMuted = true;
    }
}



// Función para actualizar el icono de volumen según el nivel
function updateVolumeIcon(volume) {
    var volumeIcon = document.getElementById("volumeIcon");

    if (volume == 0) {
        volumeIcon.innerHTML = "<img src='./svg/mute.svg' alt='Mute'>";
    } else if (volume > 0 && volume <= 50) {
        volumeIcon.innerHTML = "<img src='./svg/low.svg' alt='Low Volume'>";
    } else {
        volumeIcon.innerHTML = "<img src='./svg/high.svg' alt='High Volume'>";
    }
}
