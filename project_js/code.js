window.optimizelyEditorial = {
  elementsToDecorate: [],
  escapeStringForVariableName: function(string) {
    return 'elem' + string.replace(/[^a-z0-9]/g, function(s) {
      var c = s.charCodeAt(0);
      //if (c == 32) return '-';
      //if (c >= 65 && c <= 90) return '_' + s.toLowerCase();
      return ('000' + c.toString(16))
        .slice(-4);
    });
  },
  setIntervalX: function(callback, delay, repetitions, breakcondition) {
    var x = 0;
    var intervalID = window.setInterval(function () {

       callback();

       if (++x === repetitions || breakcondition === true) {
           window.clearInterval(intervalID);
       }
    }, delay);
},
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
        identifier: identifier,
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

              var identifier = window.optimizelyEditorial.escapeStringForVariableName(listener.identifier);
              // Add element to array so that it can be picked up from within variation code
              window.optimizelyEditorial.elementsToDecorate[identifier] = window.optimizelyEditorial.elementsToDecorate[
                identifier] || [];
              window.optimizelyEditorial.elementsToDecorate[identifier].push(element);

              // Invoke the callback with the element
              listener.fn.call(element, element, listener.identifier);
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

      // Model image on cat page
      window.optimizelyEditorial.waitForElement(items[i], '.productlisting-main-image a[href*="' + items[i] + '"] img',
        function() {
          callback.call();
        });

      // Model image in last viewed
      window.optimizelyEditorial.waitForElement(items[i], '.productimage a[href*="' + items[i] + '"] img',
        function() {
          callback.call();
        });

      // Model image in reco
      window.optimizelyEditorial.waitForElement(items[i], '.recommendation_image a[href*="' + items[i] + '"] img',
        function() {
          callback.call();
        });

      // Model image in mini cart
      window.optimizelyEditorial.waitForElement(items[i], '.checkoutminicart .summaryproduct .image a[href*="' + items[i] + '"] img',
        function() {
          callback.call();
        });

      // Model image in cart
      window.optimizelyEditorial.waitForElement(items[i], '.productcontainer .image img[src*="' + items[i] + '"]',
        function() {
          callback.call();
        });

      // PDP first image
      window.optimizelyEditorial.waitForElement(items[i], '.cont_prod_det_pic_1:has(a[href*="' + items[i] + '"])',
        function() {
          callback.call();
        });

      // PDP second image
      window.optimizelyEditorial.waitForElement(items[i], '.cont_prod_det_pic_2:has(a[href*="' + items[i] + '"])',
        function() {
          callback.call();
        });

    }
  },
  decorateItem: function(identifier, data) {
    // Make sure mandatory information (like the identifier) is in the data object
    if (!identifier) {
      return false;
    }

    identifier = window.optimizelyEditorial.escapeStringForVariableName(identifier);
    // Get the last element added to the window.optimizelyEditorial.elementsToDecorate array to make sure each element gets treated only once, even if the experiment activates mutliple times on the page
    if (typeof window.optimizelyEditorial.elementsToDecorate[identifier] !== 'undefined' && window.optimizelyEditorial
      .elementsToDecorate[identifier].length > 0) {
      var elem = window.optimizelyEditorial.elementsToDecorate[identifier].pop();
    } else {
      return false;
    }

    if (data.bust && data.model) {
     
      // Swap all images
      if ($(elem).is('img')){
        $(elem).attr('src', data.bust);
      } 
      
      // Change zoom overlay on main pic on PDP
      else if ($(elem).is('.cont_prod_det_pic_1')) {

        // Adapt image that opens when image is clicked (setInterval since asyn)
        optimizelyEditorial.setIntervalX(function(){
          $(elem).find('a').attr({
            'dialog-image': data.bust,
            'href': data.bust
          });
        }, 50, 100);
        
      }

      // Change zoom overlay on main pic on PDP
      else if ($(elem).is('.cont_prod_det_pic_2')) {

        // Swap out image
        $(elem).find('img').attr('src', data.bust);
        
        // Adapt image that opens when image is clicked (setInterval since asyn)
        optimizelyEditorial.setIntervalX(function(){
          $(elem).find('a').attr({
            'dialog-image': data.model,
            'href': data.model
          });
          $(elem).find('img').attr('src', data.model);
        }, 50, 100);
        
        //Reinitialize cloudzoom (setInterval since async)
        optimizelyEditorial.setIntervalX(function(){
          jQuery('.cloud-zoom').CloudZoom();
        }, 800, 5);

      }

    }
  }
};