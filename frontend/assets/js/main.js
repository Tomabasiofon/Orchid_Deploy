(function ($) {
	"use strict";

/*=============================================
	=    		 Preloader			      =
=============================================*/
function preloader() {
	$('#preloader').fadeOut();
};

$(window).on('load', function () {
	preloader();
	mainSlider();
	wowAnimation();
});



/*=============================================
	=    		Mobile Menu			      =
=============================================*/
//SubMenu Dropdown Toggle
if ($('.menu-area li.menu-item-has-children ul').length) {
	$('.menu-area .navigation li.menu-item-has-children').append('<div class="dropdown-btn"><span class="fas fa-angle-down"></span></div>');

}

//Mobile Nav Hide Show
if ($('.mobile-menu').length) {

	var mobileMenuContent = $('.menu-area .main-menu').html();
	$('.mobile-menu .menu-box .menu-outer').append(mobileMenuContent);

	//Dropdown Button
	$('.mobile-menu li.menu-item-has-children .dropdown-btn').on('click', function () {
		$(this).toggleClass('open');
		$(this).prev('ul').slideToggle(500);
	});
	//Menu Toggle Btn
	$('.mobile-nav-toggler').on('click', function () {
		$('body').addClass('mobile-menu-visible');
	});

	//Menu Toggle Btn
	$('.menu-backdrop, .mobile-menu .close-btn').on('click', function () {
		$('body').removeClass('mobile-menu-visible');
	});
}




/*=============================================
	=     Menu sticky & Scroll to top      =
=============================================*/
$(window).on('scroll', function () {
	var scroll = $(window).scrollTop();
	if (scroll < 245) {
		$("#sticky-header").removeClass("sticky-menu");
		$('.scroll-to-target').removeClass('open');

	} else {
		$("#sticky-header").addClass("sticky-menu");
		$('.scroll-to-target').addClass('open');
	}
});


/*=============================================
	=    		 Scroll Up  	         =
=============================================*/
if ($('.scroll-to-target').length) {
  $(".scroll-to-target").on('click', function () {
    var target = $(this).attr('data-target');
    // animate
    $('html, body').animate({
      scrollTop: $(target).offset().top
    }, 1000);

  });
}



/*=============================================
	=          Data Background               =
=============================================*/
$("[data-background]").each(function () {
	$(this).css("background-image", "url(" + $(this).attr("data-background") + ")")
})



/*=============================================
	=    		 Main Slider		      =
=============================================*/
function mainSlider() {
	var BasicSlider = $('.slider-active');
	BasicSlider.on('init', function (e, slick) {
		var $firstAnimatingElements = $('.single-slider:first-child').find('[data-animation]');
		doAnimations($firstAnimatingElements);
	});
	BasicSlider.on('beforeChange', function (e, slick, currentSlide, nextSlide) {
		var $animatingElements = $('.single-slider[data-slick-index="' + nextSlide + '"]').find('[data-animation]');
		doAnimations($animatingElements);
	});
	BasicSlider.slick({
		autoplay: true,
		autoplaySpeed: 5000,
		dots: false,
		fade: true,
		arrows: false,
		responsive: [
			{ breakpoint: 767, settings: { dots: false, arrows: false } }
		]
	});

	function doAnimations(elements) {
		var animationEndEvents = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
		elements.each(function () {
			var $this = $(this);
			var $animationDelay = $this.data('delay');
			var $animationType = 'animated ' + $this.data('animation');
			$this.css({
				'animation-delay': $animationDelay,
				'-webkit-animation-delay': $animationDelay
			});
			$this.addClass($animationType).one(animationEndEvents, function () {
				$this.removeClass($animationType);
			});
		});
	}
}


/*=============================================
	=    		Brand Active		      =
=============================================*/
$('.brand-active').slick({
	dots: false,
	infinite: true,
	speed: 1000,
	autoplay: true,
	arrows: false,
	slidesToShow: 6,
	slidesToScroll: 2,
	responsive: [
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 5,
				slidesToScroll: 1,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 4,
				slidesToScroll: 1
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 1,
				arrows: false,
			}
		},
		{
			breakpoint: 575,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				arrows: false,
			}
		},
	]
});



/*=============================================
	=    		Service Active		      =
=============================================*/
$('.service-active').slick({
	dots: false,
	infinite: true,
	speed: 2000,
	autoplay: true,
	arrows: true,
	slidesToShow: 3,
	slidesToScroll: 1,
	prevArrow: '<span class="slick-prev"><i class="fa-solid fa-arrow-left"></i></span>',
	nextArrow: '<span class="slick-next"><i class="fa-solid fa-arrow-right"></i></span>',
	appendArrows: ".service-nav",
	responsive: [
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				arrows: false,
			}
		},
		{
			breakpoint: 575,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				arrows: false,
			}
		},
	]
});

/*=============================================
	=    	   Toggle Active  	         =
=============================================*/
$('.flight-detail-wrap').slideUp();
$('.detail').on('click', function () {
	$(this).toggleClass('show');
	$(this).parent().parent().parent().parent().find('.flight-detail-wrap').slideToggle();
});


/*=============================================
	=           DatePicker Active             =
=============================================*/
$(function () {
	$(".form-grp .date").datepicker({
		autoclose: true,
		todayHighlight: true
	}).datepicker('update', new Date());
});

$(document).ready(function () {
    $('#start_date').datepicker({
        format: 'mm/dd/yyyy', // Set your desired date format
        autoclose: true,
        todayHighlight: true,
    });

    $('#end_date').datepicker({
        format: 'mm/dd/yyyy', // Set your desired date format
        autoclose: true,
        todayHighlight: true,
        startDate: new Date() // Set the initial date as the minimum selectable date
    });

    // Add an event listener to the start date input to update the endDate picker's startDate
    $('#start_date').on('changeDate', function (selected) {
        const startDate = new Date(selected.date);
        startDate.setDate(startDate.getDate()); // Increment by 1 day to prevent selecting the same day
        $('#end_date').datepicker('setStartDate', startDate);
    });
});
$(document).ready(function () {
    $('#promo-start-date').datepicker({
        format: 'mm/dd/yyyy', // Set your desired date format
        autoclose: true,
        todayHighlight: true,
    });

    $('#promo-end-date').datepicker({
        format: 'mm/dd/yyyy', // Set your desired date format
        autoclose: true,
        todayHighlight: true,
        startDate: new Date() // Set the initial date as the minimum selectable date
    });

    // Add an event listener to the start date input to update the end date
    $('#promo-start-date').on('changeDate', function (selected) {
        const startDate = new Date(selected.date);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // Set the end date 7 days from the start date
        
        // Format the end date as 'mm/dd/yyyy'
        const formattedEndDate = (endDate.getMonth() + 1) + '/' + endDate.getDate() + '/' + endDate.getFullYear();
        
        // Set the end date input value to the calculated end date
        $('#promo-end-date').val(formattedEndDate);
    });
});

// $(document).ready(function () {
//     $('#start_date').datepicker({
//         format: 'mm/dd/yyyy', // Set your desired date format
//         autoclose: true,
//         todayHighlight: true,
//     });

//     $('#end_date').datepicker({
//         format: 'mm/dd/yyyy', // Set your desired date format
//         autoclose: true,
//         todayHighlight: true,
//         startDate: new Date() // Set the initial date as the minimum selectable date
//     });

//     // Add an event listener to the start date input to update the endDate picker's startDate
//     $('#start_date').on('changeDate', function (selected) {
//         const startDate = new Date(selected.date);
//         startDate.setDate(startDate.getDate() + 1); // Increment by 1 day to prevent selecting the same day
//         $('#end_date').datepicker('setStartDate', startDate);
        
//         // Check if the end date is currently set to a date before the new start date
//         const endDate = $('#end_date').datepicker('getDate');
//         if (endDate !== null && endDate < startDate) {
//             $('#end_date').datepicker('setDate', startDate);
//         }
//     });
// });


$(document).ready(function(){
	$('.test-slick').slick({
		prevArrow: '<span class="slick-prev"><i class="fa-solid fa-arrow-left"></i></span>',
		nextArrow: '<span class="slick-next"><i class="fa-solid fa-arrow-right"></i></span>',
		appendArrows: ".service-nav",
		responsive: [
			{
				breakpoint: 1200,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1,
					infinite: true,
				}
			},
			{
				breakpoint: 992,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1
				}
			},
			{
				breakpoint: 767,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1,
				}
			},
			{
				breakpoint: 575,
				settings: {
					slidesToShow: 1,
					slidesToScroll: 1,
				}
			},
		]
	});
  });




/*=============================================
	=    	 Slider Range Active  	         =
=============================================*/
$("#slider-range").slider({
	range: true,
	min: 300,
	max: 5500,
	values: [1000, 4500],
	slide: function (event, ui) {
		$("#amount").val("$" + ui.values[0] + " - $" + ui.values[1]);
	}
});
$("#amount").val("$" + $("#slider-range").slider("values", 0) + " - $" + $("#slider-range").slider("values", 1));



/*=============================================
	=    		Odometer Active  	       =
=============================================*/
$('.odometer').appear(function (e) {
	var odo = $(".odometer");
	odo.each(function () {
		var countNumber = $(this).attr("data-count");
		$(this).html(countNumber);
	});
});


/*=============================================
	=    		Magnific Popup		      =
=============================================*/
$('.popup-image').magnificPopup({
	type: 'image',
	gallery: {
		enabled: true
	}
});

/* magnificPopup video view */
$('.popup-video').magnificPopup({
	type: 'iframe'
});


/*=============================================
	=    		Isotope	Active  	      =
=============================================*/
$('.fly-next-active').imagesLoaded(function () {
	// init Isotope
	var $grid = $('.fly-next-active').isotope({
		itemSelector: '.grid-item',
		percentPosition: true,
		masonry: {
			columnWidth: '.grid-item',
		}
	});
	// filter items on button click
	$('.fly-next-nav').on('click', 'button', function () {
		var filterValue = $(this).attr('data-filter');
		$grid.isotope({ filter: filterValue });
	});

});
//for menu active class
	$('.fly-next-nav button, .content-top li, .gender-select ul li').on('click', function (event) {
	$(this).siblings('.active').removeClass('active');
	$(this).addClass('active');
	event.preventDefault();
});


/*=============================================
	=    		 Wow Active  	         =
=============================================*/
function wowAnimation() {
	var wow = new WOW({
		boxClass: 'wow',
		animateClass: 'animated',
		offset: 0,
		mobile: false,
		live: true
	});
	wow.init();
}

// $('.selection-box').dblclick(function() {
//     $('.selection-box').toggleClass("selected-box");
// })

})(jQuery);