/* Merchandise testing */
window.optimizelyEditorial = {
    elementsToDecorate: [],
    waitForElement: function(selector, fn) {

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
            window.optimizelyEditorial.waitForElement(items[i], 'article:has(a[href*="-' + items[i] + '.html"]):not(.content)',
                function() {
                    callback.call();
                });

            // If it's the article page itself
            if (document.location.href.indexOf('-' + items[i] + '.html') > -1) {
                window.optimizelyEditorial.waitForElement(items[i], 'article.content .story-intro',
                    function() {
                        callback.call();
                    });
            }
        }


    },
    decorateItem: function(identifier, data) {

        if (!data.new_headline) {
            return false;
        }


        // Get the last element added to the window.optimizelyEditorial.elementsToDecorate array to make sure each element gets treated only once, even if the experiment activates mutliple times on the page
        if (window.optimizelyEditorial.elementsToDecorate[identifier].length > 0) {
            var elem = window.optimizelyEditorial.elementsToDecorate[identifier].pop();
        } else {
            return false;
        }

        if (data.new_headline) {
            $(elem)
                .find('h1:not(:has(a)),h1 a,h2:not(:has(a)), h2 a, h3:not(:has(a)), h3 a, h4:not(:has(a)), h4 a').text(data.new_headline);
        }
        if (data.new_subhead) {
            $(elem)
                .find('.subhead, .tease p').text(data.new_subhead);
        }
        if (data.new_image) {
            $(elem)
                .find('figure img').attr('src', data.new_image);
            $(elem)
                .find('figure:not(:has(img)) a').attr('style', 'background-image: url(' + data.new_image + ')');
        }
        if (data.new_imagesource) {
            $(elem)
                .find('.art figcaption p').text(data.new_imagesource);
        }

    }
};