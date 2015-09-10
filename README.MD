## Synopsis

To use Optimizely for editorial / headline testing, a scalable approach to activating experiments only if a visitor is actually exposed to a control or treatment (i.e. only if the particular piece of content tested is actually on e.g. the homepage) and applying changes in a structured way is needed.

This repo contains templates for three parts of Optimizely:

* **Project JS** is used to implement shared logic for both, activation of experiments as well as treatment of variations. This allows for centralized changes at any point in time (e.g. if your site layout changes), even if hundreds of experiments are active.
* **Conditional Activation JS** is used in addition to URL and Audience targeting to ensure only visitors who are exposed to the control (Original) or treatment (Variation) are included in the sample. That way, the experiment will only activate if e.g. a particular product that should be tested is actually displayed anywhere on the page.
* **Variation JS** is home to the variables of the treatment (e.g. the changed headline or the new product image url) and fires code in Project JS to actually decorate the DOM for the treatment.

## Instructions

Use the three parts in your experiments and adapt the functions in Project JS and the variables to the needs of your site.

Watch the 11-minute video walkthrough of how to set things up in Optimizely:

[![Video walkthrough thumbnail](https://embed-ssl.wistia.com/deliveries/59687252aa8315b88edaa5bec0ab3c943054499a.jpg?image_play_button=true&image_play_button_color=0081bae0&image_crop_resized=450x281)](https://fast.wistia.net/embed/iframe/6mflhbjy7x)

This is best used in combination with a CMS integration that creates these types of experiments in the background through Optimizely's REST API, without user interaction with the Optimizely UI.

You can easily simulate what a CMS or shop system integration would look like by building a prototype (e.g. [https://github.com/tobiasurff/editorial-testing-prototype](https://github.com/tobiasurff/editorial-testing-prototype))

## Example use cases

* E-Commerce: Your content team uploads hundreds of products every week into your shop system (e.g. Magento). You want to run one experiment for every product to see which of the five product images work best on category pages, search results or in product recommendations
* News sites / media / publishing: Your editors create two headlines or upload two teaser images with every article they create. Both variations will run on your homepage for a few minutes until one is a clear winner ([Optimizely's Stats Engine](https://www.optimizely.com/statistics) is ideal for this type of sequential testing) if found – then the winner is displayed to all new visitors.
