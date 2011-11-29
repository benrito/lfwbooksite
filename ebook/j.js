// JavaScript for Howtos


updateHowtoScroll = function() {
  // We need to call this whenever the dom updates.
  setTimeout(function() {
    howtoScroll.refresh();
    }, 0);
};

$(document).ready(function(){
  
	
  $(".button:first").addClass("filled"); 
  $(".button").click(function(){

    if($(this).hasClass("filled"))
    {
    }
    else
    {
    	$(".button").removeClass("filled");
    	$(this).addClass("filled");
    	$("#content li").fadeOut("slow", function() {   
   
      		});
		
    		//var button = $('.center');
    		var position= $(this).index();
    		$("#content li:nth-child("+(position+1)+")").fadeIn("slow", function() { 
		
		
    		});
		
    }	
  
      });
  
    $("dd").hide();
    $("dt a").click(function(){
    //$("dd:visible").slideUp("slow");
    if( $(this).parent().next().is(":visible")) {
    	//hide the stuff
	
    	$(this).parent().next().slideUp("slow", updateHowtoScroll);
    	$(this).removeClass("b");
	
	
    }

    else{
    	$(this).parent().next().slideDown("slow", updateHowtoScroll);
    	$(this).addClass("b");
	
    }

    return false ;
  });
  
  // Set up scrolling
  
  var touch = 'ontouchstart' in window; // Test for touch browser
  
  if (touch) {
    document.addEventListener('touchmove', function(e){ e.preventDefault(); }, false);
    howtoScroll = new iScroll('wrapper');
    setTimeout(updateHowtoScroll, 500);
  } else {
    $('#wrapper').css("overflow-y", "auto");
    $('#wrapper').css("overflow-x", "hidden");
  }

}); 