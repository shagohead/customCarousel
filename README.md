customCarousel
==============

light & simple jquery carousel plugin

### examples:

just create carousel:
```
$('.example-carousel').customCarousel();
```

create carousel with auto sliding:
```
$('.example-carousel').customCarousel({
    slideTimeout: 1000
});
```

create carousel and bind events on "arrows" clicks:
```
$('.example-carousel').customCarousel({
    nextSelector: '.toRight',
    prevSelector: '.toLeft'
});
```

create carousel with custom animation:
```
$('.example-carousel').customCarousel({
    nextSelector: '.toRight',
    prevSelector: '.toLeft',
    animation: function(data, offset){
        data.carouselAbsolute.animate(
            {
                'margin-left': offset,
                'opacity': 0.7
            },
            800,
            function(){
                data.sliding = false;
                data.carouselAbsolute.animate(
                    {'opacity': 1},
                    400
                );
            }
        );
    }
});
```

### ...
you can access of all options and other data by using method 'data()', example:
```
$('.example-carousel').data();
$('.example-carousel').data('options');
```
