/**
 * Plugin for create carousels
 * @author Anton Vahmin (html.ru@gmail.com)
 * @copyright Clever Site Studio (http://clever-site.ru)
 * @version 3.3.1
 */

(function($){
	
	var methods = {
		init: function(options){
			options = $.extend({
				animation: 'slideLeft',
				displayed: 1,
				slowpokeMode: false,
				itemWidth: false,
				carouselHeight: false,
				autoTimeout: false,
				nextItemSelector: false,
				prevItemSelector: false,
				changeItemSelector: false,
				slideCallback: false
			}, options);
			var binded = this.length;

			return this.each(function(index, element){
				var object = this;
				var data = $(object).data();
				data.binded = binded;
				data.sliding = false;
				data.currentItem = 0;
				data.itemsLength = 0;
				data.itemWidth = 0;
				data.carouselHeight = 0;
				options = data.options = options;
				var carouselItems = data.carouselItems = $(object).children(),
					carouselRelative = data.carouselRelative = $('<div class="j-customCarousel-relative" />'),
					carouselAbsolute = data.carouselAbsolute = $('<div class="j-customCarousel-absolute" />');

				data.itemsLength = carouselItems.length;
				if (options.displayed > 1) {
					data.itemsLength = data.itemsLength - (options.displayed - 1);
				}
				data.itemWidth = (options.itemWidth) ? options.itemWidth : $(carouselItems.get(0)).width();
				data.carouselHeight = (options.carouselHeight) ? options.carouselHeight : $(carouselItems.get(0)).height();

				// UPDATE ITEMS CSS
				methods.updateItems.call(object);

				// SET CONTAINER
				carouselRelative.append(carouselAbsolute);
				carouselAbsolute.append(carouselItems);

				$(object).html(carouselRelative);

				// UPDATE CONTAINER CSS
				carouselRelative.css({
					'overflow': 'hidden',
					'position': 'relative',
					'height': data.carouselHeight + 'px',
				});
				carouselAbsolute.css({
					'position': 'absolute',
					'width': '100%'
				});
				

				if (options.nextItemSelector) {
					var selector = (data.binded > 1) ? $(options.nextItemSelector).get(index) : options.nextItemSelector;
					$(selector).bind('click', function(){
						var nextItem = ((data.currentItem + 1) >= data.itemsLength) ? 0 : (data.currentItem + 1);
						methods.slide.call(object, nextItem);
						return false;
					});
				}
				
				if (options.prevItemSelector) {
					var selector = (data.binded > 1) ? $(options.prevItemSelector).get(index) : options.prevItemSelector;
					$(selector).bind('click', function(){
						var nextItem = ((data.currentItem - 1) < 0) ? (data.itemsLength - 1) : (data.currentItem - 1);
						methods.slide.call(object, nextItem);
						return false;
					});
				}
				
				if (options.changeItemSelector) {
					var selector = (data.binded > 1) ? $(options.changeItemSelector).get(index) : options.changeItemSelector;
					$(selector).bind('click', function(){
						var itemIndex = $(this).index();
						if (itemIndex != data.currentItem) {
							methods.slide.call(object, itemIndex);
						}
						return false;
					});
				}
				
				if (options.autoTimeout > 0) {
					methods.autoSlide.call(object);
				}
			});
		},

		data: function(){
			return $(this).data();
		},

		setData: function(){
			var data = $(this).data();
			return data[arguments[0]] = arguments[1];
		},

		setOption: function(){
			var data = $(this).data();
			return data.options[arguments[0]] = arguments[1];
		},

		updateItems: function(){
			var data = $(this).data();
			return $(data.carouselItems).each(function(index, element){
				var cssParams = {
					'position': 'absolute'
				}
				if (data.options.animation == 'slideLeft') {
					cssParams.marginLeft = (index * data.itemWidth) + 'px';
				} else if (data.options.animation == 'slideTop') {
					cssParams.marginTop = (index * data.itemWidth) + 'px';
				}
				$(element).css(cssParams);
			});
		},

		slide: function(itemIndex){
			var data = $(this).data();
			var carouselAbsolute = data.carouselAbsolute,
				carouselItems = data.carouselItems,
				options = data.options;

			if (options.slowpokeMode && data.sliding) {
				return false;
			}
			if (itemIndex >= data.itemsLength) {
				console.error('item '+itemIndex+' does not exists. data of this carousel:');
				console.error(data);
				return false;
			}

			data.sliding = true;
			data.currentItem = itemIndex;
			clearTimeout(data.sliderTimeout);
			if (typeof options.animation == 'string') {
				switch (options.animation) {
					case 'slideLeft':
					carouselAbsolute.animate({
						'margin-left': (data.currentItem * data.itemWidth * -1)+'px'
					}, 400, function(){
						data.sliding = false;
					});
					break;
					
					case 'slideTop':
					carouselAbsolute.animate({
						'margin-top': (data.currentItem * data.itemWidth * -1)+'px'
					}, 400, function(){
						data.sliding = false;
					});
					break;
					
					case 'fade':
					carouselItems.fadeOut();
					carouselItems.eq(data.currentItem).fadeIn(400, function(){
						data.sliding = false;
					});
					break;
				}
			} else if (typeof options.animation == 'object') {
				options.animation(data);
			} else {
				console.error('type of animation is "'+typeof options.animation+'"');
			}
			if (options.slideCallback) {
				options.slideCallback(data);
			}
			if (options.autoTimeout > 0) {
				methods.autoSlide.call(this);
			}
		},

		autoSlide: function(){
			var data = $(this).data();
			var object = this;
			data.sliderTimeout = setTimeout(function(){
				var nextItem = ((data.currentItem + 1) >= data.itemsLength) ? 0 : (data.currentItem + 1);
				methods.slide.call(object, nextItem);
			}, data.options.autoTimeout);
		}
	}

	$.fn.customCarousel = function(request){
		if (methods[request]) {
			return methods[request].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof request === 'object' || !request) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method '+request+' does not exist on jQuery.tooltip');
		}
	}

})(jQuery);
