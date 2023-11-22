
var aSelected = ["FR-B","FR-E","FR-F","FR-J","FR-N","FR-P","FR-R","FR-T","FR-U","FR-V"];
    
new jvm.Map({
    container: $("#map_regions"),
    map: "fr_regions_merc",
    backgroundColor: "#ffffff00",
    regionsSelectable: false, 
    regionsSelectableOne: false,  
    regionStyle: {  
        initial: {
            fill: "#72992b",
            stroke: "#fff"
        },    
        hover: {
            fill: "#d3d1d1",
            "fill-opacity": 1,
            cursor: "default"
        },
        selected: {
            fill: "#72992b",
        },
        selectedHover: {
            fill: "#780001",
            cursor: "pointer"
        }
    },
    panOnDrag: false,
    zoomOnScroll: false,
    zoomButtons : false,
    selectedRegions: aSelected,
    onRegionClick: function (event, code) {
        if($.inArray(code, aSelected) !== -1) {
            // $(".departement").find("a[rel="+code+"]").click();
        }
    }
});