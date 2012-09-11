/**
 * Plugin for create carousels
 * @author Anton Vahmin (html.ru@gmail.com)
 * @copyright Clever Site Studio (http://clever-site.ru)
 * @version 2.1.0
 */

(function($){
	$.fn.extend({

		customCarousel: function(options) {
			
			var defaults = {
				nextButtonSelector: false,
				prevButtonSelector: false,
				changeItemSelector: false,
				timeout: false,
				slide: false,
				slideCallback: false,
				animation: 'slide',
				width: false,
				height: false
			};
			
			function slide(itemIndex) {
				clearTimeout(sliderTimeout);
				currentItem = itemIndex;
				if (typeof options.animation == 'string') {
					switch (options.animation) {
						case 'slide':
						carouselAbsolute.animate({
							'margin-left': (currentItem * itemWidth * -1)+'px'
						});
						break;
						
						case 'fade':
						carouselItems.fadeOut();
						carouselItems.eq(currentItem).fadeIn();
						break;
					}
				} else {
					var allparams = {
						options: options,
						carouselRelative: carouselRelative,
						carouselAbsolute: carouselAbsolute,
						carouselItems: carouselItems,
						currentItem: currentItem,
						itemsLength: itemsLength,
						itemWidth: itemWidth,
						itemHeight: itemHeight
					};
					options.animation(allparams);
				}
				if (options.slideCallback) {
					options.slideCallback(currentItem);
				}
				if (options.timeout > 0) {
					changeAuto();
				}
			}
			
			function changeAuto() {
				sliderTimeout = setTimeout(function(){
					var nextItem = ((currentItem + 1) >= itemsLength) ? 0 : (currentItem + 1);
					slide(nextItem);
				}, options.timeout);
			}
			
			var options = $.extend(defaults, options);
			var carouselRelative = $('<div class="j-customCarousel-relative" />');
			var carouselAbsolute = $('<div class="j-customCarousel-absolute" />');
			var carouselItems,
				sliderTimeout;
			var currentItem = 0;
			var itemsLength = 0;
			var itemWidth = 0;
			var itemHeight = 0;
			
			return this.each(function() {
				carouselObj = $(this);
				carouselItems = carouselObj.children();
				itemsLength = carouselItems.length;

				itemWidth = (options.width) ? options.width : $(carouselItems.get(0)).width();
				itemHeight = (options.height) ? options.height : $(carouselItems.get(0)).height();

				// UPDATE ITEMS CSS
				carouselItems.each(function(index, element){
					var cssParams = {
						'position': 'absolute'
					}
					if (options.animation == 'slide') {
						cssParams.marginLeft = (index * itemWidth) + 'px';
					}
					$(element).css(cssParams);
				});

				// SET CONTAINER
				carouselRelative.append(carouselAbsolute);
				carouselAbsolute.append(carouselItems);

				carouselObj.html(carouselRelative);

				// UPDATE CONTAINER CSS
				carouselRelative.css({
					'overflow': 'hidden',
					'position': 'relative',
					'height': itemHeight + 'px',
				});
				carouselAbsolute.css({
					'position': 'absolute',
					'width': '100%'
				});
				
				$(options.nextButtonSelector).bind('click', function(){
					var nextItem = ((currentItem + 1) >= itemsLength) ? 0 : (currentItem + 1);
					slide(nextItem);
					return false;
				});
				
				$(options.prevButtonSelector).bind('click', function(){
					var nextItem = ((currentItem - 1) < 0) ? (itemsLength - 1) : (currentItem - 1);
					slide(nextItem);
					return false;
				});
				
				$(options.changeItemSelector).bind('click', function(){
					var itemIndex = $(this).index();
					if (itemIndex != currentItem) {
						slide(itemIndex);
					}
					return false;
				});
				
				if (options.timeout > 0) {
					changeAuto();
				}
			});
		}
	});

})(jQuery);