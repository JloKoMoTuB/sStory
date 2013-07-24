// Generated by CoffeeScript 1.6.2
var sStory, sStoryEditor;

sStory = (function() {
  function sStory(story_list) {
    this.story_list = story_list;
    if (this.story_list === void 0) {
      throw "No story_list defined";
    }
  }

  sStory.prototype.render = function() {
    var $content, templates, that;

    console.log("re-render");
    $content = $('#content');
    $content.html("");
    templates = {};
    $(".section-template").each(function() {
      var templateSource;

      templateSource = $(this).html();
      return templates[$(this).attr('id')] = Handlebars.compile(templateSource);
    });
    _.each(this.story_list, function(section, i) {
      var sectionContent, sectionHtml;

      sectionHtml = templates["section-template-" + section.type](section);
      sectionContent = $("<section id='" + i + "' class='" + section.type + "'></section>").html(sectionHtml);
      return $content.append(sectionContent);
    });
    this.handleWindowResize();
    that = this;
    $(window).on('resize', function() {
      return that.handleWindowResize();
    });
    this.renderMaps();
    return this.story_list;
  };

  sStory.prototype.verticalCenterElement = function(el, parEl) {
    var elHeight, pageHeight;

    elHeight = el.innerHeight() / 2;
    pageHeight = parEl.innerHeight() / 2;
    return $(el).css({
      paddingTop: pageHeight - elHeight
    });
  };

  sStory.prototype.verticalCenterPhotoTitles = function() {
    var that;

    that = this;
    $(".photoBigText h2").each(function() {
      return that.verticalCenterElement($(this), $(this).parent());
    });
    return $(".photoCaption h2").each(function() {
      return that.verticalCenterElement($(this), $(this).parent());
    });
  };

  sStory.prototype.handleWindowResize = function() {
    var windowHeight;

    this.verticalCenterPhotoTitles();
    windowHeight = $(window).height();
    $(".photoBigText .photo-background").css({
      minHeight: windowHeight
    });
    return $(".photoCaption .photo-background").css({
      minHeight: windowHeight
    });
  };

  sStory.prototype.renderMaps = function() {
    var that;

    that = this;
    return $(".single-location-map").each(function() {
      var address, caption, geoCode, latLon, mapId;

      mapId = _.uniqueId("map_");
      address = $(this).attr("data-address");
      caption = $(this).attr("data-caption");
      latLon = [];
      $(this).attr("id", mapId);
      geoCode = that.geocodeLocationRequest(address);
      return geoCode.done(function(result) {
        var circle, layer, map;

        console.log("geoCode result", result);
        result = result[0];
        latLon = [result.lat, result.lon];
        map = L.map(mapId, {
          scrollWheelZoom: false
        }).setView(latLon, 14);
        layer = new L.StamenTileLayer("toner-lite");
        map.addLayer(layer);
        return circle = L.circle(latLon, 120, {
          color: 'red',
          fillColor: 'red',
          fillOpacity: 0.5,
          closeOnClick: false
        }).bindPopup(caption, {
          maxWidth: 600,
          maxHeight: 600,
          closeButton: false
        }).addTo(map).openPopup();
      });
    });
  };

  sStory.prototype.geocodeLocationRequest = function(location) {
    var addr, baseUrl, url;

    console.log("Location", location);
    baseUrl = "http://open.mapquestapi.com/nominatim/v1/search.php?format=json";
    addr = "&q=" + location;
    url = encodeURI(baseUrl + addr + "&addressdetails=1&limit=1");
    console.log("URL>", url);
    return $.ajax({
      url: url,
      type: "GET",
      dataType: "json",
      cache: true
    });
  };

  sStory.prototype.centerMap = function(geocodeJSON) {
    return console.log("Geocode JSON->", geocodeJSON);
  };

  return sStory;

})();

sStoryEditor = (function() {
  function sStoryEditor(story) {
    this.story = story;
    this.sectionTypes = {
      photo: {
        photoBigText: {
          inputs: ['title', 'photoUrl'],
          mustHave: ['photoUrl']
        },
        photoCaption: {
          inputs: ['title', 'photoUrl', 'caption'],
          mustHave: ['photoUrl', 'caption']
        }
      },
      video: {
        videoYoutube: {
          inputs: ['embedCode'],
          mustHave: ['embedCode']
        },
        videoVimeo: {
          inputs: ['embedCode'],
          mustHave: ['embedCode']
        }
      },
      sound: {
        soundSoundcloud: {
          inputs: ['embedCode'],
          mustHave: ['embedCode']
        }
      },
      location: {
        locationSinglePlace: {
          inputs: ['address', 'caption', 'photoUrl'],
          mustHave: ['address', 'caption']
        }
      }
    };
    this.giveSectionsID();
    this.renderSectionList();
    this.renderSectionTypeSelector();
  }

  sStoryEditor.prototype.giveSectionsID = function() {
    var newStory;

    newStory = [];
    _.each(this.story.story_list, function(section) {
      if (section.id === void 0) {
        section.id = _.uniqueId("s");
      }
      return newStory.push(section);
    });
    return this.story.story_list = newStory;
  };

  sStoryEditor.prototype.renderSectionEditor = function() {
    var $editor, newSectionSubType, newSectionType, templates, that;

    templates = {};
    $(".editor-template").each(function() {
      var templateSource;

      templateSource = $(this).html();
      return templates[$(this).attr('id')] = Handlebars.compile(templateSource);
    });
    newSectionType = $("#new-section-type").val();
    newSectionSubType = $("#sub-section-type").val();
    $editor = $("#editor-inputs");
    $editor.html("");
    that = this;
    return _.each(this.sectionTypes[newSectionType][newSectionSubType].inputs, function(input) {
      var $template, mustHave, sectionData;

      sectionData = that.sectionTypes[newSectionType][newSectionSubType];
      mustHave = $.inArray(input, sectionData.mustHave) > -1;
      $template = $(templates['editor-template-' + input]());
      if (mustHave) {
        $template.addClass("must-have");
      }
      return $editor.append($template);
    });
  };

  sStoryEditor.prototype.renderSectionList = function() {
    var $content, $sortable, that;

    $content = $('#section-list');
    $content.html("");
    that = this;
    _.each(this.story.story_list, function(section, i) {
      var deleteIcon, sectionContent, sectionIcon, sectionMainType;

      sectionIcon = "";
      sectionMainType = "";
      switch (section.type) {
        case "photoBigText":
          sectionMainType = "photo";
          break;
        case "photoCaption":
          sectionMainType = "photo";
          break;
        case "videoYoutube":
          sectionMainType = "video";
          break;
        case "videoVimeo":
          sectionMainType = "video";
          break;
        case "soundSoundcloud":
          sectionMainType = "sound";
          break;
        case "locationSinglePlace":
          sectionMainType = "location";
      }
      switch (sectionMainType) {
        case "photo":
          sectionIcon = "<i class=\"icon-camera\"></i>";
          break;
        case "video":
          sectionIcon = "<i class=\"icon-video\"></i>";
          break;
        case "sound":
          sectionIcon = "<i class=\"icon-volume-up\"></i>";
          break;
        case "location":
          sectionIcon = "<i class=\"icon-location-circled\"></i>";
      }
      deleteIcon = "<i class=\"icon-cancel-squared delete-section\"></i>";
      sectionContent = deleteIcon + sectionIcon + " ";
      if (section.title !== void 0) {
        sectionContent += section.title;
      }
      $content.append($("<li id='" + i + "' data-id='" + section.id + "'>" + sectionContent + "</li>"));
      return $("i.delete-section").on("click", function() {
        return that.deleteSection($(this).parent().attr('data-id'));
      });
    });
    $content.sortable("destroy");
    $sortable = $content.sortable();
    that = this;
    return $sortable.bind('sortupdate', function() {
      var sortableSet, sortedList;

      sortedList = [];
      $(this).children().each(function() {
        return sortedList.push($(this).attr("data-id"));
      });
      that.reorderStoryList(sortedList);
      return sortableSet = true;
    });
  };

  sStoryEditor.prototype.reorderStoryList = function(sortedList) {
    var newStoryList, oldList;

    oldList = this.story.story_list;
    newStoryList = [];
    _.each(sortedList, function(listItemID) {
      var section;

      section = _.find(oldList, function(section) {
        return section.id === listItemID;
      });
      return newStoryList.push(section);
    });
    this.story.story_list = newStoryList;
    return this.updatePage();
  };

  sStoryEditor.prototype.updatePage = function() {
    this.renderSectionList();
    this.story.render();
    return this.story.handleWindowResize();
  };

  sStoryEditor.prototype.renderSectionSubTypeSelector = function(section) {
    var $select, subsections, that;

    if (section === void 0) {
      section = "photo";
    }
    subsections = this.sectionTypes[section];
    $select = $("#sub-section-type");
    $select.html("");
    _.each(_.keys(subsections), function(sectionType) {
      var $option;

      $option = $('<option value="' + sectionType + '">' + sectionType + '</option>');
      return $select.append($option);
    });
    that = this;
    return $select.on("change", function() {
      return that.renderSectionEditor();
    });
  };

  sStoryEditor.prototype.renderSectionTypeSelector = function() {
    var $select, that;

    $select = $("#new-section-type");
    $select.html("");
    _.each(_.keys(this.sectionTypes), function(sectionType) {
      var $option;

      $option = $('<option value="' + sectionType + '">' + sectionType + '</option>');
      return $select.append($option);
    });
    that = this;
    $select.on("change", function() {
      that.renderSectionSubTypeSelector($(this).val());
      return that.renderSectionEditor();
    });
    this.renderSectionSubTypeSelector();
    return this.renderSectionEditor();
  };

  sStoryEditor.prototype.deleteSection = function(delSection) {
    var newlist;

    console.log("Delete " + delSection);
    newlist = _.reject(this.story.story_list, function(section, k) {
      console.log("k>", k, "delSection>", delSection);
      if (section.id === delSection) {
        return true;
      } else {
        return false;
      }
    });
    this.story.story_list = newlist;
    console.log('@story', this.story);
    return this.updatePage();
  };

  sStoryEditor.prototype.addSection = function(section) {
    var newSection, newSectionNum, sectionCount;

    sectionCount = d3.max(_.keys(this.story.story_list));
    console.log("count:", sectionCount);
    newSectionNum = (+sectionCount) + 1;
    newSection = {};
    $("#editor-inputs input").each(function(el) {
      if ($(this).val() !== "") {
        return newSection[$(this).attr('id').split("-")[2]] = $(this).val();
      }
    });
    newSection.type = $("#sub-section-type").val();
    this.story.story_list[newSectionNum] = newSection;
    console.log("=>", this.story);
    this.giveSectionsID();
    return this.updatePage();
  };

  return sStoryEditor;

})();

$(document).ready(function() {
  var story, storyEditor, story_list;

  story_list = [
    {
      type: 'locationSinglePlace',
      address: "1039 Jefferson St. Oakland CA",
      caption: "An address!!",
      photoUrl: "http://31.media.tumblr.com/9c8bd8923c097095b5a4b3026baf3fe5/tumblr_mq8xv5e2wv1qcn8pro1_1280.jpg"
    }, {
      photoUrl: 'http://farm9.staticflickr.com/8315/8018537908_eb5ac81027_b.jpg',
      type: 'photoBigText',
      title: 'Making beautiful stories easy'
    }, {
      photoUrl: 'http://farm8.staticflickr.com/7038/6990421086_e92cafc3da_k.jpg',
      type: 'photoCaption',
      caption: 'You can place a short descriptive caption of the picture here. Think of it as a tweet.',
      title: 'Big images + captions'
    }, {
      embedCode: '<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=http%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F99067369"></iframe>',
      type: "soundSoundcloud"
    }, {
      embedCode: '<iframe width="560" height="315" src="http://www.youtube.com/embed/Y2yaNhK4PCE" frameborder="0" allowfullscreen></iframe>',
      type: "videoYoutube"
    }, {
      embedCode: '<iframe src="http://player.vimeo.com/video/70638980" width="500" height="281" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe> <p><a href="http://vimeo.com/70638980">CoGe - Master Mixer 2013-07-16 at 19.36.39</a> from <a href="http://vimeo.com/pseudoplacebo">EJ Fox</a> on <a href="https://vimeo.com">Vimeo</a>.</p>',
      type: "videoVimeo"
    }
  ];
  story = new sStory(story_list);
  story.render();
  storyEditor = new sStoryEditor(story);
  return d3.select("#add-section").on("click", function() {
    storyEditor.addSection();
    return $("#editor-inputs input").val(" ");
  });
});
