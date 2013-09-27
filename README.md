customCarousel
==============

light & simple jquery carousel plugin

### options:

`animation` - may be a string or a function. if this is string, it should be a `slideLeft` or `slideTop` or `fade`

`displayed` - count of items to showed at same time

`slowpokeMode` - inability to slide many times, before current animation is over

`infiniteLoop` - infinite loop (true by default)

`itemWidth` - width of one item (not need if you use `fade` animation)

`carouselHeight` - name speaks for itself

`autoTimeout` - timer (in ms) for auto sliding

`nextItemSelector` - selector of link for slide to next item

`prevItemSelector` - selector of link for slide to previous item

`changeItemSelector` - selector of link for slide by index

`beforeSlideCallback` - function called before slide

`slideCallback` - function called after slide method


### also you can call these methods:

`updateItems` - update css parameters of items

`slide` - slide to index, example:
```
$('.example-selector').customCarousel('slide', 1);
```

`autoSlide` - start of sliding by timeout (needed to be set by option `autoTimeout`)


### ...
you can access of all options and other data by using method data, example:
```
$('.example-selector').data();
$('.example-selector').data('options');
```
