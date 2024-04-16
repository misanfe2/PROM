let map = L.map('map').setView([39.466082,-0.375211],19)
var marker = L.marker([39.466082,-0.375211]).addTo(map);

//Agregar tilelAyer mapa base desde openstreetmap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);