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
        // Loop through items
        for (var i = 0; i < items.length; i++) {
            // Trigger callback every time an element matching the selector is added to the page
            // Every element will be pushed to the window.optimizelyEditorial.elementsToDecorate array once so that your experiment code can pick it up and decorate accordingly
            
            // Main tiles on homepage
            window.optimizelyEditorial.waitForElement(items[i], '.tile:has(a[href*="' + items[i] + '"])',
                function() {
                    callback.call();
                });

            // Channel tiles lower on the homepage
            window.optimizelyEditorial.waitForElement(items[i], '.channel-image:has(a[href*="' + items[i] + '"])',
                function() {
                    callback.call();
                }); 

            // Capture the article page itself
            if (window.location.href.indexOf(items[i]) > -1){
                window.optimizelyEditorial.waitForElement(items[i], '.hero-article, .article-section',
                function() {
                    callback.call();
                }); 
            }
        }
    },
    decorateItem: function(identifier, data) {
        // Make sure mandatory information (like the identifier) is in the data object
        if (!identifier) {
            return false;
        }
        // Get the last element added to the window.optimizelyEditorial.elementsToDecorate array to make sure each element gets treated only once, even if the experiment activates mutliple times on the page
        if (window.optimizelyEditorial.elementsToDecorate[identifier].length > 0) {
            var elem = window.optimizelyEditorial.elementsToDecorate[identifier].pop();
        } else {
            return false;
        }
        // Check if treatment is available for e.g. headlines, teaser images etc. and apply changes
        if (data.headline) {
            $(elem)
                .find('h2.article-title a, h1.title').text(data.headline);
        }
        if (data.primary_tag) {
            $(elem)
                .find('h2.primary-tag a').text(data.primary_tag);
        }
        if (data.teaser_image) {
            $(elem)
                .find('.img img, .main-image img').attr('src', data.teaser_image);
        }
        if (data.teaser_text) {
            $(elem)
                .find('.field-dek p').text(data.teaser_text);
        }
    }
};