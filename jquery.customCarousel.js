/**
 * Plugin for create carousels
 * @author Anton Vakhmin (html.ru@gmail.com)
 * @version 4.0
 */

(function($){
    
    var methods = {
        __init: function(options){
            options = $.extend({
                animation: 'slideLeft',
                slowpokeMode: true,
                slideTimeout: false,
                nextSelector: false,
                prevSelector: false,
                changeSelector: false,
                disabledClass: false,
                beforeSlideCallback: false,
                afterSlideCallback: false,
                debug: false
            }, options);
            
            var bindedCount = this.length;

            return this.each(function(index, element){
                var context = this;
                var data = $(this).data();
                data.bindedCount = bindedCount;
                data.isSliding = false;
                data.currentIndex = 0;
                data.itemsDimensions = [];
                data.options = options;
                if (options.infiniteLoop) {
                    data.infiniteLoop = options.infiniteLoop;
                } else {
                    data.infiniteLoop = (options.disabledClass) ? false : true;
                }
                var carouselItems = data.carouselItems = $(this).children(),
                    carouselRelative = data.carouselRelative = $('<div class="j-customCarousel-relative" />'),
                    carouselAbsolute = data.carouselAbsolute = $('<div class="j-customCarousel-absolute" />');

                methods.getItemsDimensions.call(this);
                
                // добавление контейнеров в код
                carouselRelative.append(carouselAbsolute);
                carouselAbsolute.append(carouselItems);
                $(this).html(carouselRelative);

                // css для контейнеров
                carouselRelative.css({
                    'overflow': 'hidden',
                    'position': 'relative',
                });
                carouselAbsolute.css({
                    'position': 'absolute',
                    'width': '100%'
                });

                data.containerDimensions = {
                    width: carouselRelative.width(),
                    height: carouselRelative.height()
                };

                for (var i = 0; i < data.itemsDimensions.length; i++) {
                    if (data.containerDimensions.height < data.itemsDimensions[i].height) {
                        data.containerDimensions.height = data.itemsDimensions[i].height;
                    }
                }
                carouselRelative.height(data.containerDimensions.height);

                if (options.slideDimension) {
                    data.slideDimension = options.slideDimension;
                } else if (options.animation) {
                    switch (options.animation) {
                        case 'slideTop':
                        case 'switchTop':
                            data.slideDimension = 'height';
                            break;
                        case 'fade':
                            data.slideDimension = '';
                            break;
                        default:
                            data.slideDimension = 'width';
                            break;
                    }
                }

                methods.setItemsCss.call(this);
                methods.getContainerDimensions.call(this);
                
                // устанвока обработчика для переключения на след. элемент
                if (options.nextSelector) {
                    var selector = (data.binded > 1) ? $(options.nextSelector).get(index) : options.nextSelector;
                    $(selector).bind('click', function(event){
                        methods.slide.call(context, (data.currentIndex + 1));
                        event.preventDefault();
                    });
                }
                
                // устанвока обработчика для переключения на пред. элемент
                if (options.prevSelector) {
                    var selector = (data.binded > 1) ? $(options.prevSelector).get(index) : options.prevSelector;
                    $(selector).bind('click', function(event){
                        methods.slide.call(context, (data.currentIndex - 1));
                        event.preventDefault();
                    });
                }
                
                // устанвока обработчика для произвольного переключения элементов
                if (options.changeSelector) {
                    var selector = (data.binded > 1) ? $(options.changeSelector).get(index) : options.changeSelector;
                    $(selector).bind('click', function(event){
                        var itemIndex = $(this).index();
                        if (itemIndex != data.currentIndex) {
                            methods.slide.call(context, itemIndex);
                        }
                        event.preventDefault();
                    });
                }
                if (data.options.debug) {
                    console.log('inited');
                    console.log(data);
                }
                
                methods.checkActive.call(context);
                if (options.slideTimeout > 0) {
                    methods.autoSlide.call(context);
                }
            });
        },

        // обновление css элементов в зависимости от анимации
        setItemsCss: function(){
            var context = this;
            var data = $(this).data();
            return $(data.carouselItems).each(function(index, element){
                var cssParams = {
                    'position': 'absolute'
                }
                if (data.slideDimension == 'width') {
                    cssParams.marginLeft = methods.getItemOffset.call(context, 'width', index) + 'px';
                } else if (data.slideDimension == 'height') {
                    cssParams.marginTop = methods.getItemOffset.call(context, 'height', index) + 'px';
                }
                $(element).css(cssParams);
            });
        },

        // получение отступа для элемента по определенной оси
        getItemOffset: function(dimenstionName, itemIndex){
            var data = $(this).data();
            var offset = 0;
            for (var i = 0; i < data.itemsDimensions.length; i++) {
                if (i >= itemIndex) {
                    break;
                }
                offset += data.itemsDimensions[i][dimenstionName];
            }
            return offset;
        },

        // обновление списка размеров эелемента(ов)
        getItemsDimensions: function(itemIndex){
            var data = $(this).data();
            if (itemIndex) {
                data.itemsDimensions[itemIndex] = {
                    width: $(data.carouselItems[i]).outerWidth(),
                    height: $(data.carouselItems[i]).outerHeight()
                };
            } else {
                for (var i = 0; i < data.carouselItems.length; i++) {
                    data.itemsDimensions.push({
                        width: $(data.carouselItems[i]).outerWidth(),
                        height: $(data.carouselItems[i]).outerHeight()
                    });
                }
            }
        },

        // обновление размеров контейнера
        getContainerDimensions: function(){
            var data = $(this).data();
            if (['width', 'height'].indexOf(data.slideDimension) > -1) {
                data.maximumOffset = (methods.getItemOffset.call(this, data.slideDimension, data.itemsDimensions.length) - ((data.slideDimension == 'width') ? data.carouselRelative.width() : data.carouselRelative.height()));
                data.maximumItems = 0;
                var offsetRemain = data.maximumOffset;
                while (offsetRemain > 0) {
                    offsetRemain -= data.itemsDimensions[data.maximumItems][data.slideDimension];
                    data.maximumItems++;
                }
                data.maximumOffset *= -1;
            }
        },

        slide: function(itemIndex, animation){
            var context = this;
            var data = $(this).data();
            if (data.options.debug) console.log('trying slide to ' + itemIndex);
            if (data.options.slowpokeMode && data.sliding) return false;
            if (itemIndex > data.maximumItems) {
                if (data.options.debug) console.log('at end of list');
                if (data.infiniteLoop == true) {
                    itemIndex = 0;
                } else {
                    return false;
                }
            }
            if (itemIndex < 0) {
                if (data.options.debug) console.log('at start of list');
                if (data.infiniteLoop == true) {
                    itemIndex = data.maximumItems;
                } else {
                    return false;
                }
            }
            animation = animation || data.options.animation;
            if (data.options.beforeSlideCallback) {
                data.options.beforeSlideCallback(data);
            }
            data.sliding = true;
            data.currentIndex = itemIndex;
            clearTimeout(data.sliderTimeout);
            if (['width', 'height'].indexOf(data.slideDimension) > -1) {
                var offset = (methods.getItemOffset.call(context, data.slideDimension, data.currentIndex) * -1);
                if (offset <= data.maximumOffset) {
                    offset = data.maximumOffset;
                }
                offset += 'px';
            }
            if (typeof animation == 'string') {
                switch (animation) {
                    case 'slideLeft':
                        data.carouselAbsolute.animate({'margin-left': offset}, 400, function(){data.sliding = false;});
                        break;

                    case 'slideTop':
                        data.carouselAbsolute.animate({'margin-top': offset}, 400, function(){data.sliding = false;});
                        break;

                    case 'switchLeft':
                        data.carouselAbsolute.css('margin-left', offset);
                        data.sliding = false;
                        break;

                    case 'switchTop':
                        data.carouselAbsolute.css('margin-top', offset);
                        data.sliding = false;
                        break;

                    case 'fade':
                        data.carouselItems.fadeOut();
                        data.carouselItems.eq(data.currentIndex).fadeIn(400, function(){data.sliding = false;});
                        break;
                }
            } else if (['object','function'].indexOf(typeof animation)) {
                animation(data, offset);
            } else {
                console.error('type of animation is "'+typeof animation+'"');
            }
            methods.checkActive.call(context);
            if (data.options.afterSlideCallback) {
                data.options.afterSlideCallback(data);
            }
            if (data.options.slideTimeout > 0) {
                methods.autoSlide.call(this);
            }
        },

        checkActive: function(){
            var data = $(this).data();
            if (data.options.disabledClass) {
                var prevSelector = (data.binded > 1) ? $(data.options.prevSelector).get(index) : data.options.prevSelector;
                var nextSelector = (data.binded > 1) ? $(data.options.nextSelector).get(index) : data.options.nextSelector;
                if (data.currentIndex == 0) {
                    $(prevSelector).addClass(data.options.disabledClass);
                } else {
                    $(prevSelector).removeClass(data.options.disabledClass);
                }
                if (data.currentIndex >= data.maximumItems) {
                    $(nextSelector).addClass(data.options.disabledClass);
                } else {
                    $(nextSelector).removeClass(data.options.disabledClass);
                }
            }
        },

        autoSlide: function(){
            var context = this;
            var data = $(this).data();
            if (data.options.debug) console.log('autoSlide');
            data.sliderTimeout = setTimeout(function(){
                methods.slide.call(context, (data.currentIndex + 1));
            }, data.options.slideTimeout);
        }
    }

    $.fn.customCarousel = function(request){
        if (methods[request]) {
            return methods[request].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof request === 'object' || !request) {
            return methods.__init.apply(this, arguments);
        } else {
            $.error('Method '+request+' does not exist on jQuery.tooltip');
        }
    }

})(jQuery);
