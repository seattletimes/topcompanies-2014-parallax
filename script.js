var canvas = document.querySelector("canvas.backdrop");
var context;

var qsa = function(s) { return Array.prototype.slice.call(document.querySelectorAll(s)) };

var texts = qsa(".scroll-text");
var sections = qsa(".scroll-section");
var images = {};
var loaded = 0;
var checkLoaded = function() {
  loaded++;
  if (loaded == sections.length) {
    init();
  }
};
sections.forEach(function(section) {
  var url = section.getAttribute("data-image");
  var image = new Image();
  image.onload = checkLoaded;
  image.src = url;
  images[url] = image;
});

var init = function() {
  try {
    context = canvas.getContext("2d");
  } catch(e) {
    //IE8 gets mobile
    initMobile();
  }
  if (!window.matchMedia || window.matchMedia("(max-device-width: 800px)").matches) {
    //mobile
    initMobile();
  } else {
    window.addEventListener("scroll", render);
    window.addEventListener("resize", render);
    render();
  }
};

var initMobile = function() {
  sections.forEach(function(section) {
    var img = document.createElement("img");
    img.src = section.getAttribute("data-image");
    img.className = "fallback";
    section.insertBefore(img, section.children[0]);
    section.className += " fallback";
    section.style.minHeight = img.height + "px";
  })
};

var render = function(e) {
  var top = document.body.scrollTop || document.documentElement.scrollTop;
  var height = window.innerHeight;
  var width = window.innerWidth;
  var bottom = top + height;
  canvas.width = width;
  canvas.height = height;
  sections.forEach(function(section, i) {
    var bounds = section.getBoundingClientRect();
    if (bounds.bottom < 0) return;
    if (bounds.top > height) return;
    var url = section.getAttribute("data-image");
    var image = images[url];
    var imgWidth = width;
    var imgHeight = imgWidth / image.width * image.height;
    var imgX = 0;
    if (imgHeight < height) {
      imgHeight = height;
      imgWidth = imgHeight / image.height * image.width;
      imgX = (width - imgWidth) / 2;
    }

    var imgTop = bounds.top;
    if (imgTop <= 0) {
      imgTop = 0;
      if (bounds.bottom < height) {
        imgTop = bounds.bottom - height;
      }
    }

    //create parallax
    var offset = 0;
    if (bounds.top < 0) {
      //how much bigger is the box than the screen?
      var buffer = bounds.height - height;
      //how much bigger is the image than the screen?
      var overscan = imgHeight - height;
      //how far into the image are we?
      var progress = bounds.top / buffer;
      //clamp progress at 1
      if (progress < -1) {
        progress = -1;
      }
      //figure out offset from progress through the overscan
      offset = progress * overscan;
    }

    //optimize: if it's only a chunk of the image, why draw the whole thing?
    //figure out sourceRect, destRect, use those
    context.drawImage(image, imgX, imgTop + offset, imgWidth, imgHeight);
  });
  texts.forEach(function(text) {
    var textBounds = text.getBoundingClientRect();
    if (textBounds.top > height) return;
    if (textBounds.bottom < 0) return;
    text.style.opacity = 1 - ((textBounds.bottom - height) / height);
  });
};