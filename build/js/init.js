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


  // ##########################################################################
  // Init accordions.

  $('.accdn')
    .not('#accdn--3, #accdn--4')
    .accdn();

  $('#accdn--3')
    .accdn({
      tabsAt: 0
    });

  $('#accdn--4')
    .accdn({
      tabsAt: 100000
    });

})(jQuery, this, this.document);
