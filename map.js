// Map-related Variables
var map;
var styledMapType;
var infoWindow;
var coordJS;            // A JS object.
var coordGM;            // A Google Maps object.

// // Input-related Variables
// var textBox = $('#textBox')[0];
// var langBox = $('#langBox');
// var submitButton = $('#submitButton')[0];
// var langBoxVisible = false;
// var isInput = false;
// var textInput           // The text that the user input.

// // Icon-related Variables
// var searchIcon = $('#searchIcon');
// var loadingIcon = $('#loadingIcon');

// Language-related Variables
var langData;           // Translated strings from all languages.
var langInput;          // The language that the user input.
var langHover;          // The language that the user hover to.

var audio;

// Start website by hiding stuffs.
// loadingIcon.hide();

// Map initialization.
function initMap() {
  // Create the map.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 30, lng: 0},
    zoom: Math.ceil(Math.log2($(window).width())) - 8,
    minZoom: Math.ceil(Math.log2($(window).width())) - 8,
    maxZoom: 5,

    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,

    styles:
    [
      {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "administrative.neighborhood",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#c0b023"
          }
        ]
      },
      {
        "featureType": "poi",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "transit",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
          {
            "color": "#ffffff"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text",
        "stylers": [
          {
            "visibility": "off"
          }
        ]
      }
    ]

  });

  // // Style the map.
  // $.getJSON("mapstyle.json", function(data) {
  //   styledMapType = new google.maps.StyledMapType(data);
  //   map.mapTypes.set('styled_map', styledMapType);
  //   map.setMapTypeId('styled_map');
  // });

  // Create a changeable info window.
  createWindow();

  // Request fusion table for countries data.
  var script = document.createElement('script');
  var url = ['https://www.googleapis.com/fusiontables/v2/query?'];
  url.push('sql=');
  var query = 'SELECT name, kml_4326 FROM ' +
  '1foc3xO9DyfSIF6ofvN0kp2bxSfSeKog5FbdWdQ';
  var encodedQuery = encodeURIComponent(query);
  url.push(encodedQuery);
  url.push('&callback=drawMap');  // Callback to drawMap().
  url.push('&key=AIzaSyAm9yWCV7JPCTHCJut8whOjARd7pwROFDQ');
  script.src = url.join('');
  var body = document.getElementsByTagName('body')[0];
  body.appendChild(script);
}

// Draw countries on map.
function drawMap(data) {
  var rows = data['rows'];
  for (var i in rows) {
    var countryName = rows[i][0];
    if (countryName != 'Antarctica') {
      var newCoordinates = [];
      var geometries = rows[i][1]['geometries'];
      if (geometries) {
        for (var j in geometries) {
          newCoordinates.push(constructNewCoordinates(geometries[j]));
        }
      } else {
        newCoordinates = constructNewCoordinates(rows[i][1]['geometry']);
      }
      var country = new google.maps.Polygon({
        paths: newCoordinates,
        strokeColor: '#000000',
        strokeOpacity: 0.1,
        strokeWeight: 1,
        fillColor: '#FCF80D',
        fillOpacity: 0
      });

      // Country hover event.
      google.maps.event.addListener(country, 'mouseover', function(event) {
        //getCoordinates(event.latLng);
        //showWindow();
        this.setOptions({fillOpacity: 0.25}); //changes color of the countries

      });

      // TODO: Add code for mouse click.
      google.maps.event.addListener(country, 'click', function(event) {
        getCoordinates(event.latLng);
        showWindow();
      });

      // Country hover out event.
      google.maps.event.addListener(country, 'mouseout', function() {
        //hideWindow();
        this.setOptions({fillOpacity: 0});
      });

      country.setMap(map);
    }
  }
}

// Algorithm from Google to make coordinates.
function constructNewCoordinates(polygon) {
  var newCoordinates = [];
  var coordinates = polygon['coordinates'][0];
  for (var i in coordinates) {
    newCoordinates.push(new google.maps.LatLng(coordinates[i][1], coordinates[i][0]));
  }
  return newCoordinates;
}

// Get coordinates from mouse position.
function getCoordinates(pnt) {
  var latitude = pnt.lat();
  latitude = latitude.toFixed(4);
  var longitude = pnt.lng();
  longitude = longitude.toFixed(4);
  coordJS = {lat: latitude, lng: longitude};
  coordGM = new google.maps.LatLng(latitude, longitude);
}

// // Input handling.
// submitButton.addEventListener('click', function() {
//   console.log("Clicked");
//   searchIcon.hide();
//   loadingIcon.show();
//   if (langBoxVisible) {
//     langBox.slideUp();
//     langBoxVisible = false;
//   }
//
//   textInput = textBox.value;
//   textInput = textInput.split(' ').join('+');
//
//   var transUrl = "https://cors-anywhere.herokuapp.com/https://rede-182207.appspot.com/?lang=auto&text=" + textInput;
//
//   $.getJSON(transUrl, function (data) {
//     langData = data;
//     langInput = data.detected_language;
//
//     if (!langBoxVisible)
//     {
//       langBox.slideDown();
//       langBoxVisible = true;
//     }
//
//     $('#language')[0].innerHTML = convertLanguage(langInput);
//
//     isInput = true;
//
//     loadingIcon.hide();
//     searchIcon.show();
//     console.log("Done");
//   });
// });

// // Convert language from double digit to full name.
// function convertLanguage(lang) {
//   var arr = [];
//   for (i in isoLangs) {
//     arr.push([i, isoLangs[i]]);
//   }
//
//   var language;
//   for (var i = 0; i < arr.length; i++) {
//     if (lang == arr[i][0]) {
//       language = arr[i][1]['name'];
//     }
//   }
//   return language;
// }

// Create a changeable window.
function createWindow() {
  infoWindow = new google.maps.InfoWindow({
    content: '',
    position: {lat: 0, lng: 0},
    disableAutoPan: true
  });
}

// Show window at a certain position.
// TODO: Change this function.
function showWindow() {
  var geoUrl = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordJS.lat + "," + coordJS.lng + "&key=AIzaSyC4M03tlCkOASz4YWhYvFJdQDvN-gnxs0s";
  console.log(geoUrl);
  $.getJSON(geoUrl, function (data) {
    // TODO: Important variable.
    var countryName = getCountry(data.results[0].address_components);

    var flag; // This is image url.
    var language;
    var nationalAnthem; // This is image url.
    var currency;
    var currencyImage; // This is image url.
    var recentNews;
    var recentNewsLink; // This is image url.
    var funFact;
    var isNotAvailable; // bool

    // TODO: Make your own switch. Output info on each switch case.
    switch (countryName)
    {
      case "Afghanistan":
      flag = "http://flags.fmcdn.net/data/flags/w1160/af.png";
      language = "Dari and Pashto";
      nationalAnthem = "afanthem.mp3";
      currency = "Afghani";
      currencyImage = "http://theafghanistanexpress.com/wp-content/uploads/2013/04/Afghan-afghani-notes.jpg ";
      recentNews = "Afghan Girls' Robotics Team Warmly Welcomed In Holland ";
      recentNewsLink = "http://www.tolonews.com/science-technology/afghan-girls%E2%80%99-robotics-team-warmly-welcomed-holland";
      funFact = " Afghanistan's national games are 'buzkashi' or goat-grabbing. Afghanistan would like buzkashi, or goat-grabbing, to be an Olympic sport.";
      break;

      case "Indonesia":
      flag = "http://flags.fmcdn.net/data/flags/w1160/id.png";
      nationalAnthem = "idanthem.mp3";
      language = "Bahasa Indonesia";
      currency = "Rupiah";
      currencyImage = " https://upload.wikimedia.org/wikipedia/commons/3/30/Indonesian_Rupiah_%28IDR%29_banknotes.png";
      recentNews = "Indonesia's first daughter in a lavish javanese wedding ";
      recentNewsLink = "http://www.bbc.com/news/world-asia-41910823?intlink_from_url=http://www.bbc.com/news/topics/4aa966f9-091e-4dd1-8f10-a44ca20aec5d/indonesia&link_location=live-reporting-gallery";
      funFact = "New orangutan species discovered ";
      break;


      case "Paraguay":
      flag = "http://flags.fmcdn.net/data/flags/w1160/py.png";
      nationalAnthem = "pyanthem.mp3";
      language = "Paraguay Guarani and Spanish";
      currency = "Paraguay Guarani";
      currencyImage = "http://www.voyagerinfo.com/sites/default/files/users/15/paraguaymoney.jpg";
      recentNews = "Arentina, Uruguay and Paraguay launch bid to host the 2030 World Cup ";
      recentNewsLink = "http://en.mercopress.com/2017/10/05/argentina-uruguay-and-paraguay-launch-bid-to-host-the-2030-world-cup";
      funFact = "In Paraguay, pistol duelling is still legal as long as both parties are registered blood donors.";
      break;

      case "United States":
      flag = "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/1280px-Flag_of_the_United_States.svg.png";
      nationalAnthem = "usanthem.mp3";
      language = "English";
      currency = "US Dollars";
      currencyImage = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/USDnotes.png/252px-USDnotes.png";
      recentNews = " Trump Talks up Better Relations With Russia ";
      recentNewsLink = "https://www.usnews.com/news/politics/articles/2017-11-11/the-latest-trump-and-putin-cross-paths-again-in-vietnam";
      funFact = "According to the World Giving Index, Americans are the most likely people in the world to help a stranger.";
      break;


      default:
      isNotAvailable = true;

    }
    // var langUrl = "https://restcountries.eu/rest/v2/name/" + countryName;
    // $.getJSON(langUrl, function (data1) {
    //   langHover = data1[0].languages[0].iso639_1;
    //   var translated = translate(countryName, langHover);
    //
    //   infoWindow.setContent(translated);
    //   infoWindow.setPosition(coordGM);
    //   infoWindow.open(map);
    //   setTimeout(playSound, 3000);
    // });

    if (audio != null)
    {
      audio.pause();
audio.currentTime = 0;
    }
    audio = new Audio(nationalAnthem);
    audio.play();

    var content;
    if (isNotAvailable)
    {
      content = "<p class ='countryName' >" + countryName + "</p>";
    }
    else {
        content = "<p class ='countryName' ><b>" + countryName + "</b></p>" +  //<b> and </b> makes it bold
                    "<img class = 'flags' src= '" + flag + "'>" +
                    "<p class = 'language' >Language: " + language + "</p>" +
                    "<p class = 'currency' > " + countryName + " Currency: " + currency + "</p> " +
                    " <img class = 'money' src= ' " +currencyImage + "'> "+
                    "Recent News: <a href='" + recentNewsLink + "' + class = 'recentNews' > " + recentNews + "</a> " +
                    "<br><br>Fun Fact: <p class = 'funFact' > " + funFact + " </p>";
    }



    infoWindow.setContent(content);
    infoWindow.setPosition(coordGM);
    infoWindow.open(map);
  });

}

// Get country name from Geocode API.
function getCountry(addrComponents) {
  for (var i = 0; i < addrComponents.length; i++) {
    if (addrComponents[i].types[0] == "country") {
      return addrComponents[i].long_name;
    }
    if (addrComponents[i].types.length == 2) {
      if (addrComponents[i].types[0] == "political") {
        return addrComponents[i].long_name;
      }
    }
  }
  return false;
}

// Play sound.
// function playSound() {
//   responsiveVoice.speak(langData[langHover], voiceData[langHover]);
// }

// Translate text from one language to another.
function translate(countryName, langTrans) {
  // Names exception.
  switch (countryName)
  {
    case "India":
    langTrans = "hi";
    break;
    case "Pakistan":
    langTrans = "ur";
    break;
    case "Malaysia":
    langTrans = "ms";
    break;
    case "Cameroon":
    langTrans = "fr";
    break;
  }

  return langData[langTrans];
}

// Hide window when hover out.
function hideWindow() {
  infoWindow.setContent('');
  infoWindow.close();
}
