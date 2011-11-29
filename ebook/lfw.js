
// iScroll

var mainScroll; // global
var sideScroll; // global

var LFW = {};

LFW.facebookLikePrefix = 'http://www.facebook.com/plugins/like.php?href=';
LFW.facebookLikeURL = '';

LFW.sideScrollRefresh = function() {
  if (sideScroll) {
    sideScroll.refresh(); // Adjust scroller for new elements and fonts loading
  }
};

LFW.mainScrollRefresh = function() {
  if (mainScroll) {
    mainScroll.refresh(); // Adjust scroller for new elements and fonts loading
  }
};

LFW.updateLikeButton = function(link) {
  // Update like button to passed in link, otherwise use document URL.
  
  if (!link) link = window.location.href;
  var target = LFW.facebookLikePrefix + escape(link).replace(/\//g,"%2F");
  if (LFW.facebookLikeURL != target) {
    // The URL changed.
    LFW.facebookLikeURL = target;
    $('#fb-root iframe').attr('src', target);
  }
};

LFW.linkify = function() {
  // Replace all simple #anchor links with JavaScript links.
  // Hack around hashtags breaking iScroll. This is supposed to be fixed in iScroll 4.2.
  
  var nav_links = $('#side a');
  
  for (var i = 0; i < nav_links.length; i++) {
    // Find links with in-page hashes
    
    var link = nav_links[i];
    var url = link.href.split('#');
    var linkPage = url[0];
    var hash = url[1];
    
    var currentPage = document.location.toString().split('#')[0];
    var linkIsInPage = (linkPage == currentPage);
    
    if (linkIsInPage && hash) {
      link.LFWhash = hash; // store for jumping later
      
      link.onclick = function(e) {
        LFW.jumpTo(this.LFWhash);
        return false;
      };
    }
  }
};

LFW.scrollEnd = function() {
  // A scroll on the main content ended.
  
  // Update highlighted section
  var markers = $('a[name^="lfw_"]'); // All section anchors, form "lfw_XXX"
  var currentTop;
  if (mainScroll) {
    // Fake scrolling
     currentTop = mainScroll.y - 20;
  } else {
    currentTop = $('#main').scrollTop();
  }

  var currentSectionMarker;
  
  markers.each(function(i, marker) {
    var markerTop; // Position of this marker in its scroller
    var isBestSoFar = false;
    
    if (mainScroll) {
      // Fake scrolling - ask iScroll
      markerTop = mainScroll._offset(marker).top;
      isBestSoFar = markerTop > currentTop; // Offsets decrease
    } else {
      markerTop = marker.offsetTop - 20;
      isBestSoFar = markerTop < currentTop; // Offsets increase
    }
    
    if (isBestSoFar) {
      // Best marker found so far
      currentSectionMarker = marker;
    } // Once it starts finding markers past the current position, it stops recording them
    
  });
  
  if (!currentSectionMarker || !($(currentSectionMarker).length)) {
    console.log("No section marker found.");
    return;
  }
  
  var sectionName = currentSectionMarker.name;
  sectionName = sectionName.substring("lfw_".length); // Strip off lfw_
  
  sectionLink = $('a[href$=#' + sectionName + ']'); // hrefs that link to #name for the found anchor
  $('a.current').removeClass('current');
  sectionLink.addClass('current');
  
  // Update Like button to that URL.
  LFW.updateLikeButton(sectionLink[0].href);
};

LFW.loaded = function() {
    // Page setup.
    
    LFW.linkify();
  
    document.addEventListener('touchmove', function(e){ e.preventDefault(); }, false);

    var touch = 'ontouchstart' in window; // Test for touch browser

    if (touch) {
      mainScroll = new iScroll('main', {'onScrollEnd': LFW.scrollEnd});
      sideScroll = new iScroll('side');
    } else {
      $('#main').scroll(LFW.scrollEnd);
    }
    var currentHash = document.location.toString().split('#')[1];
    LFW.jumpTo(currentHash, true);
    
    console.log('scroll create');

    $("dd").hide(); // Close all the nav lists
    $("dt.open").next().show(); // Open the nav list that should be open

    var openElement = $("dt.open")[0];
    if (openElement) {
      // Make element visible

      var scrollPadding = 80; // Make this much room in addition to making element visible
      
      if (sideScroll) {
        // Fake scrolling
        sideScroll.scrollToElement(openElement, 0); // Scroll to the nav list
        sideScroll.scrollTo(0, -scrollPadding, 0, true); // Scroll backwards a bit so the element isn't right at the top
      } else {
        // Desktop scrolling
        var targetScroll = openElement.offsetTop;
        $('#side').scrollTop(targetScroll - scrollPadding);
      }
    }
    
    $("dt a").click(function() {
      // On click, open this subnav.
      
      var visible = $("#navigation dd:visible")[0];
      var child = $(this).parent().next()[0];
      
      $(visible).slideUp("slow", LFW.sideScrollRefresh); // Close whatever is open
      
      if (visible != child) {
        $(child).slideDown("slow", LFW.sideScrollRefresh);
      }

      $('.open').removeClass('open'); // Close last opened flag
      $(this).parent().addClass('open'); // Apply open style

      LFW.sideScrollRefresh();

      return false ;
    });
    
    $('.example2').hide();
    $('#logo').click(function() {
      $('#top').slideToggle(800);
      return false;
    });

    LFW.sideScrollRefresh();
    
    /* This is a hack to get the scrolling heights to refresh as new content renders. */
    setTimeout(LFW.sideScrollRefresh, 500);
    setTimeout(LFW.mainScrollRefresh, 500);
    setTimeout(LFW.sideScrollRefresh, 5000);
    setTimeout(LFW.mainScrollRefresh, 5000);
    
    // Update Like button
    LFW.updateLikeButton();
};

LFW.jumpTo = function(anchor, instant) {
  // Jump the main content to a destination anchor, prepending lfw_ so the hash marks don't confuse iscroll
  
  var time = instant ? 0 : 500;
  anchor = 'lfw_' + anchor;
  
  var targetAnchor = $('a[name=' + anchor + ']')[0];

  if (mainScroll) {
    if (targetAnchor) {
      mainScroll.scrollToElement(targetAnchor, time);
    } else {
      console.error("No <a> found with name=", anchor);
    }
  } else {
    // No iScroll

    if (targetAnchor) {
      // Scroll desktop-style
      var targetScroll = targetAnchor.offsetTop;
      $('#main').scrollTop(targetScroll);
    } else {
      console.error("No <a> found with name=", anchor);
    }
  }
};

LFW.lightbox = function(url) {
  var box = '<div id="lightbox"><img class="close" src="images/x1.png"/>'
    +'<div id="content"><iframe scrolling="no" src="'+ url +'"></iframe></div>'
    +'</div>';
  
  $('body').append(box);
  $('#lightbox .close').click(function() {
    LFW.closeLightbox();
  });
};

LFW.closeLightbox = function() {
  $('#lightbox').remove();
};

document.addEventListener('DOMContentLoaded', LFW.loaded, false);

/*Fancybox Plugin */

$(document).ready(function() {

	/* This is basic - uses default settings */
	
	$("a#single_image").fancybox();
	
	/* Using custom settings */
	
	$("a#inline").fancybox({
		'hideOnContentClick': true
	});

	/* Apply fancybox to multiple items */
	
	$("a.group").fancybox({
		'transitionIn'	:	'elastic',
		'transitionOut'	:	'elastic',
		'titlePosition'	:   "inside", 
		'speedIn'		:	600, 
		'speedOut'		:	200, 
		'overlayShow'	:	false
		
	});
});