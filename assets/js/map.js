const myStyles = [
    {
        "featureType": "all",
        "elementType": "labels",
        "stylers": [{"visibility": "off"}]
    },
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
        {
            "visibility": "off"
        }
        ]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "labels",
        "stylers": [
        {
            "visibility": "simplified"
        }
        ]
    },
    {elementType: "geometry", stylers: [{color: "#1A1A1A"}]}, 
    {elementType: "labels.text.stroke", stylers: [{color: "#000000"}]},
    {elementType: "labels.text.fill", stylers: [{color: "#FFFFFF"}]},
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{color: "#38414e", "visibility": "simplified"}],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        "stylers": [{"visibility": "on"}]
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        "stylers": [{"visibility": "on"}]
    },
    {
        featureType: "road.highway",
        elementType: "labels.text.fill",
        "stylers": [{"visibility": "off"}]
    },
    {
        featureType: "transit",
        elementType: "geometry",
        "stylers": [{"visibility": "off"}]
    },
    {
        featureType: "transit.station",
        elementType: "labels.text.fill",
        "stylers": [{"visibility": "off"}]
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
    north: 49,
    south: 48.7,
    west: 2,
    east: 2.8,
};

function getGoogleMap() {
    return new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        maxZoom: 16,
        minZoom: 11,
        restriction: {
            latLngBounds: PARIS_BOUNDS,
            strictBounds: false,
        },
        center: new google.maps.LatLng(...defaultParisCoordinates),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        fullscreenControl: false,
        backgroundColor: "1A1A1A",
        styles: myStyles,
        disableDefaultUI: true,
    });
}