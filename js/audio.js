//Variables del audio
const AudioContext = window.AudioContext || windows.webkitAudioContext;
let audioCtx;
var audio = document.getElementById("audio");
let track;

var playPauseBtn = document.getElementById("playPauseBtn");
var baile = document.getElementById("baile");

var select = document.getElementById("canciones");
var selectedOption = select.options[select.selectedIndex];

var estadoElemento = document.getElementById("estado");
var tiempoRestanteElemento = document.getElementById("tiempo");
var duracionTotalElemento = document.getElementById("dur");

var volumeSlider = document.getElementById("volumeSlider");
var volumeIcon = document.getElementById("volumeIcon");
var isMuted = false;
var previousVolume;

function init(){
    audioCtx = new AudioContext();
    track = audioCtx.createMediaElementSource(audio);

    track.connect(audioCtx.destination);
}

function playPause(){
    if(select.selectedIndex !== 0){
        if (audio.paused) {
            audio.play(); //REPRODUCIR
            playPauseBtn.innerHTML = "<img src='../svg/pause.svg' alt='Pause'>";
            baile.src="../img/baile.gif";
            estadoElemento.textContent = "Iniciado"; 
        } 
        else{
            audio.pause();
            playPauseBtn.innerHTML = "<img src='../svg/play.svg' alt='Play'>";
            baile.src="../img/baile.png"; 
            estadoElemento.textContent = "Pausado"; 
        }
    }
}

function stopAudio() {
    baile.src="../img/baile.png"; // Robot deja de bailar
    audio.pause();
    estadoElemento.textContent = "Finalizado"; 
    audio.currentTime = 0;
    playPauseBtn.innerHTML = "<img src='./svg/play.svg' alt='Play'>";
}

function cambiarCancion() {
    selectedOption = select.options[select.selectedIndex];
    var nombreElemento = document.getElementById("nombre");
    var estadoElemento = document.getElementById("estado");

    playPauseBtn.innerHTML = "<img src='../svg/play.svg' alt='play'>";
    audio.src = selectedOption.value; // Cambiamos la cancion
    baile.src="../img/baile.png"; //Ponemos al robot a bailar

    // Actualizar la información en la interfaz
    nombreElemento.textContent = selectedOption.text;
    tiempoRestanteElemento.textContent = "0:00"; 
    estadoElemento.textContent = "Pausado"; 
}


// Esperar a que se cargue la información del audio
audio.addEventListener('loadedmetadata', obtenerDuracionTotal);


function obtenerDuracionTotal() {
    // Obtener la duración total del audio
    var duracionTotal = audio.duration;

    // Verificar si la duración es un número válido
    if (!isNaN(duracionTotal)) 
    {
        var duracionMinutos = Math.floor(duracionTotal / 60);
        var duracionSegundos = Math.floor(duracionTotal % 60);

        duracionTotalElemento.textContent = duracionMinutos + "' " + duracionSegundos + "''";
    } else {
        console.error('La duración del audio no es un número válido.');
    }
}

// Actualiza la duración en tiempo real mientras se reproduce el audio
audio.addEventListener('timeupdate', function () {
    
    var currentTime = audio.currentTime;
    var duration = audio.duration;

    if (!isNaN(duration)){
        // Calcula el tiempo restante
        var tiempoRestante = duration - currentTime;

        // Formatea el tiempo restante en minutos y segundos
        var minutos = Math.floor(tiempoRestante / 60);
        var segundos = Math.floor(tiempoRestante % 60);

        // Añade ceros delante si es necesario para mantener el formato MM:SS
        minutos = minutos < 10 ? '0' + minutos : minutos;
        segundos = segundos < 10 ? '0' + segundos : segundos;

        // Actualiza el elemento en la interfaz con el tiempo restante
        tiempoRestanteElemento.textContent = minutos + ':' + segundos;
    }
    else{
        audio.play();
        audio.pause();
    }

});

function changeVolume() {
    var volume = volumeSlider.value;
    audio.volume = volume / 100;

    // Actualizar el icono de volumen según el nivel
    updateVolumeIcon(volume);

    // Recordar el valor del volumen antes de activar el mute
    if (isMuted && volume > 0) {
        previousVolume = volume;
        isMuted = false;
    }
}

function toggleMute() {
    isMuted = !isMuted;

    if (isMuted) {
        // Activar mute
        previousVolume = volumeSlider.value;
        if (previousVolume == 0) {
            previousVolume = 50;
        }
        
        audio.volume = 0;
        volumeSlider.value = 0;
        volumeIcon.innerHTML = "<img src='../svg/mute.svg' alt='Mute'>";
    } else {
        // Desactivar mute
        audio.volume = previousVolume / 100;
        volumeSlider.value = previousVolume;
        updateVolumeIcon(previousVolume);
    }
}

function updateVolumeIcon(volume) {
    if (volume == 0) {
        volumeIcon.innerHTML = "<img src='../svg/mute.svg' alt='Mute'>";
    } else if (volume > 0 && volume <= 50) {
        volumeIcon.innerHTML = "<img src='../svg/low.svg' alt='Low Volume'>";
    } else {
        volumeIcon.innerHTML = "<img src='../svg/high.svg' alt='High Volume'>";
    }
}