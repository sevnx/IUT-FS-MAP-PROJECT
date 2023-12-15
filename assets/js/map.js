const myStyles = [
    {
        featureType: "poi",
        elementType: "labels",
        stylers: [
            {visibility: "off"}
        ]
    },
    {elementType: "geometry", stylers: [{color: "#1A1A1A"}]},
    {elementType: "labels.text.stroke", stylers: [{color: "#000000"}]},
    {elementType: "labels.text.fill", stylers: [{color: "#FFFFFF"}]},
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{color: "#d59563"}],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{color: "#d59563"}],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{color: "#000000"}],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{color: "#6b9a76"}],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{color: "#38414e"}],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{color: "#212a37"}],
    },
    {
        featureType: "road",
        elementType: "labels.text.fill",
        stylers: [{color: "#9ca5b3"}],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{color: "#746855"}],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{color: "#1f2835"}],
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        stylers: [{color: "#f3d19c"}],
    },
    {
        featureType: "transit",
        elementType: "geometry",
        stylers: [{color: "#2f3948"}],
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        stylers: [{color: "#d59563"}],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{color: "#000000"}],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{color: "#515c6d"}],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{color: "#000000"}],
    }
];

const PARIS_BOUNDS = {
    north: 59,
    south: 40,
    west: -6,
    east: 10,
};

function getGoogleMap() {
    const defaultParisCoordinates = [48.864716, 2.349014];
    return new google.maps.Map(document.getElementById('map'), {
        zoom: 12.5,
        maxZoom: 16,
        minZoom: 12.5,
        restriction: {
            latLngBounds: PARIS_BOUNDS,
            strictBounds: false,
        },
        center: new google.maps.LatLng(...defaultParisCoordinates),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        fullscreenControl: false,
        backgroundColor: "1A1A1A",
        styles: myStyles,
        disableDefaultUI: true
    });
}