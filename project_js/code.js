window.optimizelyEditorial = {
    elementsToDecorate: [],
    waitForElement: function(identifier, selector, fn) {

        // If Mutation Observers are available
        if (window.MutationObserver || window.WebKitMutationObserver) {

            var listeners = [],
                doc = window.document,
                MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
                observer;

            // Store the selector and callback to be monitored
            listeners.push({
                selector: selector,
                fn: fn
            });

            function check() {
                // Check the DOM for elements matching a stored selector
                for (var i = 0, len = listeners.length, listener, elements; i < len; i++) {
                    listener = listeners[i];
                    // Query for elements matching the specified selector
                    elements = optimizely.$(listener.selector);

                    for (var j = 0, jLen = elements.length, element; j < jLen; j++) {
                        element = elements[j];
                        // Make sure the callback isn't invoked with the 
                        // same element more than once
                        if (!element.ready) {
                            element.ready = true;

                            // Add element to array so that it can be picked up from within variation code
                            window.optimizelyEditorial.elementsToDecorate[identifier] = window.optimizelyEditorial.elementsToDecorate[identifier] || [];
                            window.optimizelyEditorial.elementsToDecorate[identifier].push(element);

                            // Invoke the callback with the element
                            listener.fn.call(element, element);
                        }
                    }
                }
            }

            if (!observer) {

                // Watch for changes in the document
                observer = new MutationObserver(check);
                observer.observe(doc.documentElement, {
                    childList: true,
                    subtree: true
                });

            }

            // Check if the element is currently in the DOM
            check();

        }

    },
    itemOnPage: function(items, callback) {

        for (var i = 0; i < items.length; i++) {
            // Trigger callback every time an element matching the selector is added to the page
            // Every element will be pushed to the window.optimizelyEditorial.elementsToDecorate array once so that your experiment code can pick it up and decorate accordingly
            window.optimizelyEditorial.waitForElement(items[i], 'img[src*=",' + items[i] + ',"]',
                function() {
                    callback.call();
                });
        }


    },
    decorateItem: function(identifier, data) {
        // Make sure mandatory information (like the identifier) is in the data object
        if (!identifier || !data.product_id || !data.image_model || !data.image_item || !data.deeplink) {
            return false;
        }

        // Get the last element added to the window.optimizelyEditorial.elementsToDecorate array to make sure each element gets treated only once, even if the experiment activates mutliple times on the page
        if (window.optimizelyEditorial.elementsToDecorate[identifier].length > 0) {
            var elem = window.optimizelyEditorial.elementsToDecorate[identifier].pop();
        } else {
            return false;
        }

        //normal-image
        //zoom-image

        // source
        if ($(elem).attr('src').indexOf(data.image_model) > -1) {

            $(elem)
                .attr("src", $(elem).attr("src").replace(data.image_model, data.image_item));

        } else if ($(elem).attr('src').indexOf(data.image_item) > -1) {

            $(elem)
                .attr("src", $(elem).attr("src").replace(data.image_item, data.image_model));

        }

        //normal-image
        if ($(elem).attr('data-normal-image').indexOf(data.image_model) > -1) {

            $(elem)
                .attr("data-normal-image", $(elem).attr("data-normal-image").replace(data.image_model, data.image_item));

        } else if ($(elem).attr('data-normal-image').indexOf(data.image_item) > -1) {

            $(elem)
                .attr("data-normal-image", $(elem).attr("data-normal-image").replace(data.image_item, data.image_model));

        }

        /*

On product detail pages, instead of swapping out the images in the zoom gallery, we need to swap the entire item in the list. Here's some sample code that has to be factored into the Project JS still:

var idx = 1;

var replaceSlides = function (slider, idx) {
 var clone = slider.find('.slick-slide').eq(idx).clone();

 slider
   .slick('slickRemove', idx)
   .slick('slickAdd', clone, 0, true);
}

$('.slick-slider.gallery-thumbs, .gallery-full .slick-slider').each(function () {
 replaceSlides($(this), idx);
})

$('.slick-slider.gallery-thumbs').find('.slick-slide.slick-active.active').removeClass('active');
$('.slick-slider.gallery-thumbs').find('.slick-slide.slick-active').eq(0).addClass('active‘);

        */



    }
};