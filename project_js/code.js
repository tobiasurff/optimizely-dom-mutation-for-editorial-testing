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
                            listener.fn.call(element, element, identifier);
                        }
                    }
                }
            }
            if (!observer) {
                // Watch for changes in the document
                observer = new MutationObserver(check);
                observer.observe(doc.documentElement, {
                    childList: true,
                    subtree: true,
                    //attributes: true,
                    //attributeFilter: ['style']
                });
            }
            // Check if the element is currently in the DOM
            check();
        }

    },
    itemOnPage: function(items, callback) {
        // Loop through items
        for (var i = 0; i < items.length; i++) {
            
            // Trigger vor cover stories on edition home
            window.optimizelyEditorial.waitForElement(items[i], 'section.cover-banner:has(a[href*="' + items[i] + '"])',
                function() {
                    callback.call();
                });

            // Trigger for article teasers on edition home
            window.optimizelyEditorial.waitForElement(items[i], 'article.teaser:has(a[href*="' + items[i] + '"])',
                function() {
                    callback.call();
                });

            // Trigger for article list teaser links on edition home
            window.optimizelyEditorial.waitForElement(items[i], 'div.list-teaser ul li:has(a[href*="' + items[i] + '"])',
                function() {
                    callback.call();
                });

            // Trigger for actual article extract (when inserted) on article page (if url matches article url)
            curitem = items[i];
            window.optimizelyEditorial.waitForElement(items[i], '.article-extract',
                function(elem, identifier) {
                    console.log('Callback triggered' + identifier);
                        if ( window.location.href.indexOf(identifier) > -1 ){
                            console.log('Callback triggered' + identifier);
                            callback.call();
                        }
                    
                });
        }
    },
    decorateItem: function(identifier, data) {
        // Make sure mandatory information (like the identifier) is in the data object
        if (!identifier) {
            return false;
        }
        // Get the last element added to the window.optimizelyEditorial.elementsToDecorate array to make sure each element gets treated only once, even if the experiment activates mutliple times on the page
        if (typeof window.optimizelyEditorial.elementsToDecorate[identifier] !== 'undefined' && window.optimizelyEditorial.elementsToDecorate[identifier].length > 0) {
            var elem = window.optimizelyEditorial.elementsToDecorate[identifier].pop();
        } else {
            return false;
        }

        if (data.headline) {
            // Regular teaser
            if ( $(elem).hasClass('teaser') || $(elem).hasClass('cover-banner') ){
                $(elem).find('h2').text(data.headline);
            }
            // List teaser
            if ( $(elem).is('li') ){
                $(elem).find('a').text(data.headline);
            }
            // Article
            if ( $(elem).hasClass('article-extract') ){
                $(elem).find('h1').text(data.headline);
            }
        }

        if (data.overline) {
            //Regular teaser
            if ( $(elem).hasClass('teaser') || $(elem).hasClass('cover-banner') ){
                $(elem).find('h3').text(data.overline);
            }
            // Article
            if ( $(elem).hasClass('article-extract') ){
                $(elem).find('h2.overline').text(data.overline);
            }
        }

        if (data.teaser) {
            if ( $(elem).hasClass('teaser') ){
                // TODO: Read more link
                $(elem).find('.teaser-content p').text(data.teaser);
            }
            if ( $(elem).hasClass('cover-banner') ){
                $(elem).find('.bottom-content p').text(data.teaser);
            }
            // Article
            if ( $(elem).hasClass('article-extract') ){
                $(elem).find('p').text(data.teaser);
            }
        }

        if (data.teaser_image) {
            if ( $(elem).hasClass('teaser') ){
                $(elem)
                    .find('.teaser-image img').attr({
                        src: data.teaser_image,
                        "data-src": data.teaser_image,
                        "data-srcset": data.teaser_image + " 300w, " + data.teaser_image + " 600w",
                        "srcset": data.teaser_image + " 300w, " + data.teaser_image + " 600w",
                    });
            }
            if ( $(elem).hasClass('cover-banner') ){
                $(elem).css("background-image",'url("' + data.teaser_image + '")');
                $(elem).attr({
                    "data-img-lg": data.teaser_image,
                    "data-img-md": data.teaser_image,
                    "data-img-sm": data.teaser_image
                });
            }
        }
    }
};
