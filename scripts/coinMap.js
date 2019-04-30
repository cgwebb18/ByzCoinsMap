function startMap(map){
  map.on('load', function() {
    map.on('mouseover', 'mints', function(e) {
      var layer = e.features[0].layer.id
      var features = e.features;
      var coordinates = e.features[0].geometry.coordinates.slice();
      var place_n = e.features[0].properties["Mint"];
      popup = new mapboxgl.Popup({
          closeButton: false
        })
        .setLngLat(coordinates)
        .setHTML('<h4>' + place_n + '</h4>')
        .addTo(map);
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'mints', function() {
      popup.remove();
      map.getCanvas().style.cursor = '';
    });
    map.addSource('mints', {
      "type": "geojson",
      "data": "layer.geojson"
    });
    map.addLayer({
      "id": "mints",
      "type": "circle",
      "source": "mints",
      "paint": {
        "circle-color": "#FF0000"
      }
    });
    map.on('click', 'mints', function(e) {
      var coordinates = e.features[0].geometry.coordinates.slice();
      flyToMint(e.features[0]);

      // // Ensure that if the map is zoomed out such that multiple
      // // copies of the feature are visible, the popup appears
      // // over the copy being pointed to.
      // while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
      //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      // }
      //
      // new mapboxgl.Popup()
      //     .setLngLat(coordinates)
      //     .setHTML(descriptions)
      //     .addTo(map);
      // $('.mapboxgl-popup-close-button').text('X');
    });
  });
};


// these functions from: https://docs.mapbox.com/help/tutorials/building-a-store-locator/
function flyToMint(feature) {
  map.flyTo({
    center: feature.geometry.coordinates,
    zoom: 6
  });
}

//creates popup of coin pictures, you can scroll vertically through these and
//click on any of them to bring up their "card" on the sidebar

function createPopUp(currentFeature) {
  var popUps = document.getElementsByClassName('mapboxgl-popup');
  // Check if there is already a popup on the map and if so, remove it
  if (popUps[0]) popUps[0].remove();

  var popup = new mapboxgl.Popup({ closeOnClick: false })
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML('<h3>Sweetgreen</h3>' +
      '<h4>' + currentFeature.properties.address + '</h4>')
    .addTo(map);
}

function openMint(mint){
  var features = map.querySourceFeatures('mints', {filter: ['==', 'Mint', mint.id]});
  //check if it's open/closed and switch
  if (mint.className.includes('closed')){
    mint.className = 'mint_result open';
    mint.childNodes.forEach(function(element){
      if (element.className == 'mint_btn') {
        element.lastChild.className = 'caret caret-up';
      }
      if (element.nodeName == 'UL') {
        element.className = 'open';
      }
      if (features.length > 0){
        flyToMint(features[0]);
      }
    });
  }
  else {
    mint.className = 'mint_result closed';
    map.flyTo({
      center: [18.465510, 41.768844],
      zoom: 3.8
    });
    mint.childNodes.forEach(function(element){
      if (element.className == 'mint_btn') {
        element.lastChild.className = 'caret';
      }
      if (element.nodeName == 'UL') {
        element.className = 'closed';
      }
    });
  }

}


function changeResults(start, end) {
  //preview names of places on mouseover
  var filter = ['all', ['>=', 'Start', start], ['<=', 'End', end]];
  map.setFilter('mints', filter);
  setTimeout(function(){
    var r = document.getElementById('results')
    while (r.firstChild) {
      r.removeChild(r.firstChild);
    }
    var features = map.querySourceFeatures('mints', {filter: filter});
    features = features.slice(0, (features.length/2))
    features.forEach(function(element){
      console.log(element);
      var name = element.properties.Mint;
      var coins = element.properties;
      var div = document.createElement('div');
      div.id = name;
      div.className = 'mint_result closed';
      div.innerHTML = '<button class="mint_btn" onclick="openMint(' + name +')">' + name + '<span class="caret"></span></button>';
      var coin_list = document.createElement('ul');
      coin_list.className = 'closed';
      for (var c in coins) {
        if (c.slice(0,3) == 'BZC'){
            var c_r = document.createElement('li');
            c_r.className = 'coin_card';
            var c_d = JSON.parse(coins[c]);
            var a_num = c_d['Accession number'];
            c_r.innerHTML = '<div class="coin_thumb"><img id="' + a_num + '" src="' +
              c_d['obverse_url'] + '" class=sidebar_img />' +
              '<button class="flip" target="' + a_num + '" opp="' + c_d['reverse_url'] +
              '" > Reverse </button> </div>' + '<p class="card_info"> Accession Number: '
              + c_d['Accession number'] + '</p>' + '<p class="card_info"> Date: ' +
              c_d['Date'] + '</p>' + '<p class="card_info"> Denomination: ' +
              c_d['Denomination'] + '</p>' +
              '<p class="card_info"> Authority: ' + c_d['Ruler'] + '</p>' +
              '<p class="card_info"><a class="cat_link" href="https://www.doaks.org/resources/coins/catalogue/' +
              c_d['Accession number'] + '">Catalogue</a></p>'
            coin_list.appendChild(c_r);
        }
      };
      div.appendChild(coin_list);
      r.appendChild(div);
    // div.innerHTML = '<img class="result_image" src='
  });
  $('.flip').click(function(){
    //only need the conditional for text
    if (this.textContent.includes('Reverse')){
      this.textContent = 'Obverse';
    }
    else{
      this.textContent = 'Reverse';
    }
    var img = document.getElementById(this.attributes.target.nodeValue);
    var temp = img.src;
    img.src = this.attributes.opp.nodeValue;
    this.attributes.opp.nodeValue = temp;
  });
}, 750);

}
