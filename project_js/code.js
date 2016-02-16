window.optimizelyEditorial = {
    elementsToRender: [],
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
                          window.optimizelyEditorial.elementsToRender[identifier] = window.optimizelyEditorial.elementsToRender[identifier] || [];
                            window.optimizelyEditorial.elementsToRender[identifier].push(element);
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
            // Every element will be pushed to the window.optimizelyEditorial.elementsToRender array once so that your experiment code can pick it up and decorate accordingly

            window.optimizelyEditorial.waitForElement(items[i], '.teaser:has([data-ctrl-pixeltracking-click*="did=' + items[i] + '"])',
                function() {
                    callback.call();
                });
        }
    },
    decorateItem: function(identifier, data) {


        // Make sure mandatory information is in the data object
        if (!identifier) {
            return false;
        }

        // Get the last element added to the window.optimizelyEditorial.elementsToRender array to make sure each element gets treated only once, even if the experiment activates mutliple times on the page
        if (typeof window.optimizelyEditorial.elementsToRender[identifier] !== 'undefined' && window.optimizelyEditorial.elementsToRender[identifier].length > 0) {
            var elem = window.optimizelyEditorial.elementsToRender[identifier].pop();
        } else {
            return false;
        }

        if (data.dachzeile) {
            $(elem)
                .find('.dachzeile a').text(data.dachzeile);
        }

        if (data.ueberschrift) {
            $(elem)
                .find('.headline a').text(data.ueberschrift);
        }

        if (data.teaserbild) {
            $(elem)
                .find('.img').replaceWith('<img src="' + data.teaserbild + '" class="img" title="(Quelle: ' + data.teaserbildquelle + ')" alt="' + data.teaserbildbeschreibung + '">');
        }

        if (data.ueberschrift) {
            $(elem)
                .find('.headline a').text(data.ueberschrift);

        }

        if (data.rubrikueberschrift) {
            $(elem).parents('.hasTitle').children('.rasterHeadline').text(data.rubrikueberschrift);

        }


    }
};