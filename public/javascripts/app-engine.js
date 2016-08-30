'use strict';
/**
 * Created by tianhengzhou on 12/4/15.
 * This file contains the logic that used to initial the map and put the marker on the map
 */
function mapviewmodel() {
  var self = this,
    infowindow = null,
    infowindowforlist = null,
    myLatlng = new google.maps.LatLng(37.352886, -122.012384),
    mapOptions = {
      zoom: 12,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false
    },
    map = new google.maps.Map(document.getElementById("map"),
        mapOptions);
  // Define search term and assign initial value as Chinese food
  self.searchTerm = ko.observable('Chinese Food');
  // update search result function
  self.updateSearchResult = function () {
    self.blists([]);
    clearMarker();
    self.filterList([]);
    ko.computed(function () {
      window.setTimeout(function () {
        yelpSearch('94087', self.searchTerm());
      }, 600);
    }, self);
  };
  this.filterTerm = ko.observable('');
  this.mapMarkers = ko.observableArray([]);
  this.blists = ko.observableArray([]);
  this.filterList = ko.observable([]);
  this.toggle = ko.observable(false);
  this.active = ko.observable(false);
  this.status = ko.observable('Searching for business nearby...');
  /*
   * Result filter function
   * */
  this.filterResult = function () {
    var rawList = self.blists(),
      array = ko.observableArray([]),
      filterTerm = self.filterTerm().toLowerCase(),
      count = 0;
    clearMarker();
    if (!filterTerm) {
      self.filterList(rawList);
      rawList.forEach(function (item) {
        pushBusinessMarker(item, null, 0);
      });
    } else {
      rawList.forEach(function (item) {
        if (item.name.toLowerCase().indexOf(filterTerm) !== -1) {
          array().push(item);
          pushBusinessMarker(item, count);
          count += 1;
        }
      });
      self.filterList(array());
    }
  };
  // The event for opening the info window for each marker when click it's corresponding item in list.
  this.listToMarkerEvent = function (clickedlist, index) {
    if (self.mapMarkers().length !== 0) {
      if (infowindowforlist !== null) {
        infowindowforlist.close();
      }
      if (infowindow !== null) {
        infowindow.close();
      }
      self.active(index);
      var content = infoWindowTemplate(clickedlist);
      infowindowforlist = new google.maps.InfoWindow({
        content: content,
        maxWidth: 250
      });
      map.panTo(self.mapMarkers()[index].position);
      map.setZoom(14);
      infowindowforlist.open(map, self.mapMarkers()[index]);
    }
  };
  /*
   * Map initial function
   * */
  function mapInit() {
    map.addListener('click', function () {
      window.setTimeout(function () {
        self.toggle(false);
        self.active(null);
      }, 600);
      if (infowindowforlist !==  null) {
        infowindowforlist.close();
      }
      if (infowindow !==  null) {
        infowindow.close();
      }
      map.setZoom(12);
      self.mapMarkers().forEach(function (marker) {
        marker.setAnimation(null);
      });
    });
    google.maps.event.addDomListener(window, "resize", function () {
      var center = map.getCenter();
      google.maps.event.trigger(map, "resize");
      map.setCenter(center);
    });
  }

  /*
   * Add business mark onto map.
   * */
  function addBusinessMark(position, timeout, i, dataSet, flag) {
    var iconImage = {
      url: '/images/yelp_star.png',
      size: new google.maps.Size(24, 32)
    };
    // The function that is used to gradually put the markers on map
    window.setTimeout(
      function () {
        var mkr = new google.maps.Marker({
          position: position,
          map: map,
          icon: iconImage
        });
        if (flag) {
          mkr.setAnimation(google.maps.Animation.DROP);
        } else {
          mkr.setAnimation(null);
        }
        /*
         * Add mouse click event to set bounce animate to mark. Also pulling out list and set the viewport to
         * the corresponded list item.
         * */
        mkr.addListener('click', (function (mkr, i) {
          return function () {
            toggleBounce(mkr, i);
          };

        })(mkr, i));
          // Add mouse over event to change the icon to grey yelp to indicate mouse over.
        mkr.addListener('click', function () {
          if (infowindow !== null) {
            if (infowindow.getMap() !== null && infowindow.getMap() !== null) {
              infowindow.close();
            }
          }
          var content = infoWindowTemplate(dataSet);
          infowindow = null;
          infowindow = new google.maps.InfoWindow({
            content: content,
            maxWidth: 250
          });
          var icon = mkr.getIcon();
          icon.url = '/images/yelp_star_active.png';
          mkr.setIcon(icon);
          infowindow.open(map, mkr);
          map.panTo(self.mapMarkers()[i].position);
          map.setZoom(14);
          if (infowindowforlist !== null) {
            if (infowindowforlist.getMap() !== null && infowindowforlist.getMap() !== null) {
              infowindowforlist.close();
            }
          }
        });
          // Add mouse out event to change the icon back to origin.
        mkr.addListener('mouseout', function () {
          var icon = mkr.getIcon();
          icon.url = '/images/yelp_star.png';
          mkr.setIcon(icon);
        });
        self.mapMarkers().push(mkr);
      }, timeout
    );
  }

  //Assemble url and use Ajax function to get data from backend and use the data to construct the business list
  // and markers.
  function yelpSearch(location, term) {
    var searchUrl = "/yelpsearch?location=" + location + "&term=" + term;
    $.get(searchUrl, function (data) {
      yelpList(JSON.parse(data).businesses);
      self.status("Search for " + term + " nearby " + location);
    }).fail(function () {
      self.status('Fail to get business data from Yelp');
    });
  }

  // The function used to construct business list and markers.
  function yelpList(data) {
    self.filterList([]);
    data.forEach(function (business, i) {
      self.blists().push(business);
      pushBusinessMarker(self.blists()[i], i, 1);
    });
    self.filterList(self.blists());
  }
  // Clear all mark from map
  function clearMarker() {
    self.mapMarkers().forEach(function (marker) {
      marker.setMap(null);
    });
    self.mapMarkers([]);
  }

  // The template to generate the info window for each marker.
  function infoWindowTemplate(dataSet) {
    var snippetImage = "<img src='" + dataSet.snippet_image_url + "'>",
      snippetText = "<p>" + dataSet.snippet_text + "</p></div>",
      bName = "<div class='info-window'><h4><a href='" + dataSet.url + "'>" +
          dataSet.name + "</a></h4>";
    return bName + snippetImage + snippetText;
  }

  // The function to push the markers onto maps.
  function pushBusinessMarker(dataSet, i, flag) {
    var blat = dataSet.location.coordinate.latitude,
      blng = dataSet.location.coordinate.longitude,
      bposition = new google.maps.LatLng(blat, blng);
    addBusinessMark(bposition, 200, i, dataSet, flag);
  }

  // The function to set bounce animation to markers and also the animation of list(including pulling out and pushing in
  // and change viewport to selected item).
  function toggleBounce(mkr, i) {
    mkr.setAnimation(google.maps.Animation.BOUNCE);
    window.setTimeout(function () {
      mkr.setAnimation(null);
    }, 2000);
    $('#mark_info').animate({
      scrollTop: 200 * i
    });
    if (self.toggle() === false) {
      self.toggle(true);
    }
    self.active(i);
  }

  this.switchShow = function () {
    if (self.toggle() === true) {
      self.toggle(false);
    } else {
      self.toggle(true);
    }
    if (infowindowforlist !== null) {
      infowindowforlist.close();
    }
    map.setZoom(12);
    self.active(null);
  };
  // Map sequence initiating and set original info as Chinese food
  mapInit();
  yelpSearch('94087', 'Chinese Food');
}

$(function () {
  var MVM = new mapviewmodel();
  ko.applyBindings(MVM);
  MVM.filterTerm.subscribe(function () {
    MVM.filterResult();
  });
});