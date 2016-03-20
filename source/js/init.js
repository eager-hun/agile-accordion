/**
 * @file
 * Initialize stuff.
 */

(function ($, window, document, undefined) {
  "use strict";


  // ###########################################################################
  // For debugging.

  if (typeof console === "undefined") {
    this.console = { log: function() {} };
  }
  console.log('Init.');


  // ###########################################################################
  // Init accordions.

  $('.accdn').accdn({
    tabsAt: 740,
    exclusiveItems: false
  });

})(jQuery, this, this.document);

