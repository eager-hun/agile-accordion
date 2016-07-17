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

  $('.accdn')
    .not('#accdn--3')
    .accdn({
      tabsAt: 740,
      exclusiveItems: false
    });

  $('#accdn--3')
    .accdn({
      tabsAt: 100
    });

})(jQuery, this, this.document);

