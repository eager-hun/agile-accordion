/**
 * @file
 * Agile Accordion jQuery plugin.
 */

(function ($, window, document, undefined) {
  "use strict";

  $.fn.accdn = function(options) {

    var defaults = {
      tabsAt: 560,
      exclusiveItems: false,
      effectSpeed: 700
    };
    var settings = $.extend(true, {}, defaults, options);

    var $window = $(window);

    // #######################################################################
    // Methods.

    /**
     * By default, accordion items are hidden. This opens the ones that should
     * be open.
     */
    var init = function($items) {
      var $openItems = $items.filter('.is-open');
      var opts = {
        effect: 'plain',
        passFocus: false
      };
      $openItems.each(function(index, value) {
        openItem($(value), opts);
      });
    };

    /**
     * Indicates tab mode on wrapper element + opens active tab.
     *
     * Also indicates if the widget has been initialized.
     */
    var signalTabs = function($window, $wrapper, $items, $tabs) {
      // Setting up and showing tabs.
      if ($window.innerWidth() >= settings.tabsAt) {
        if (!$wrapper.hasClass('is-tabs')) {
          $wrapper.addClass('is-tabs');

          var $activeTab = $tabs.filter('.is-active');
          if ($activeTab.length > 0) {
            openTab($items, $tabs, $activeTab, false);
          }
          else {
            openTab($items, $tabs, $tabs.first(), false);
          }
        }
      }
      // Hiding tabs.
      else if ($wrapper.hasClass('is-tabs')) {
        $wrapper.removeClass('is-tabs');
      }
      // Indicating initialization.
      if (!$wrapper.hasClass('accdn-initialized')) {
        $wrapper.addClass('accdn-initialized');
      }
    };

    /**
     * Opens a single accordion item.
     */
    var openItem = function($item, opts) {
      $item.addClass('is-open');

      $item.data('boundTab').addClass('is-active');

      switch (opts.effect) {
        case 'slide':
          $item.children('.accdn__content').stop().slideDown(settings.effectSpeed);
          break;
        case 'plain':
          $item.children('.accdn__content').stop().show();
      }
      // FIXME: there should be a better way to know this here.
      if ($window.innerWidth() >= settings.tabsAt && opts.passFocus) {
        $item.children('.accdn__content').focus();
      }
    };

    /**
     * Closes a single accordion item.
     */
    var closeItem = function($item, opts) {
      $item.removeClass('is-open');

      switch (opts.effect) {
        case 'slide':
          $item.children('.accdn__content').stop().slideUp(settings.effectSpeed);
          break;
        case 'plain':
          $item.children('.accdn__content').stop().hide();
      }
    };

    /**
     * Closes the passed range of items.
     */
    var closeItems = function($itemsToClose, opts) {
      $itemsToClose.each(function() {
        closeItem($(this), opts);
      });
    };

    /**
     * Toggles an accordion item.
     */
    var operateItem = function($items, $tabs, $item, opts) {

      $tabs.removeClass('is-active');

      if (!$item.hasClass('is-open')) {
        if (opts.exclusive) {
          closeItems($items.not($item), opts);
        }
        openItem($item, opts);
      }
      else {
        closeItem($item, opts);
      }
    };

    /**
     * Looks like this opens a tab.
     */
    var openTab = function($items, $tabs, $tabToOpen, passFocus) {
      var $currentItem = $tabToOpen.data('boundItem');

      $tabs.not($tabToOpen).removeClass('is-active');

      var opts = {
        effect: 'plain',
      };
      if (typeof passFocus !== undefined && passFocus === true) {
        opts.passFocus = true;
      }

      // Note: by the nature of tabs, they will always behave as if items were
      // exclusive.
      closeItems($items.not($currentItem), opts);
      openItem($currentItem, opts);
    };


    // #######################################################################
    // Accordion instances on the page.

    this.each(function() {
      var $wrapper  = $(this);
      var $items    = $wrapper.children('.accdn__item');
      var $heads    = $items.children('.accdn__head');
      var $contents = $items.children('.accdn__content');

      // -----------------------------------------------------------------------
      // Either prepare heads and create tabs.

      var $tabsBar = $('<div/>')
        .addClass('accdn__tabs');

      $wrapper.prepend($tabsBar);

      var $tabs = $();

      $heads.each(function() {
        var $this = $(this);
        $this
          .attr('tabindex', 0)
          .find('.text')
          .prepend('<span class="accdn__head__marker"></span>');

        var $tab = $([
          '<div class="accdn__tab" tabindex="0">',
            '<span class="text">' + $this.text() + '</span>',
          '</div>'
        ].join(''));

        $tab.data('boundItem', $this.parent());
        $this.parent().data('boundTab', $tab);

        $tabsBar.append($tab);

        // See http://stackoverflow.com/a/7534016 .
        $tabs = $tabs.add($tab);
      });

      // -----------------------------------------------------------------------
      // Contents are focusable.
      $contents.attr('tabindex', -1);

      init($items);
      signalTabs($window, $wrapper, $items, $tabs);

      // -----------------------------------------------------------------------
      // Events.

      $window.on('resize', function() {
        signalTabs($window, $wrapper, $items, $tabs);
      });

      $heads.on('click', function() {
        var opts = {
          effect: 'slide',
          exclusive: settings.exclusiveItems
        };
        operateItem($items, $tabs, $(this).parent(), opts);
      });

      $heads.on('keydown', function(event) {
        var keyCode = event.keyCode ? event.keyCode : event.charCode;
        // Enter or space keys.
        if (keyCode === 13 || keyCode === 32) {
          event.preventDefault();
          var opts = {
            effect: 'slide',
            exclusive: settings.exclusiveItems
          };
          operateItem($items, $tabs, $(this).parent(), opts);
        }
      });

      $tabs.on('click', function() {
        openTab($items, $tabs, $(this), true);
      });
      $tabs.on('keydown', function(event) {
        var keyCode = event.keyCode ? event.keyCode : event.charCode;
        // Enter or space keys.
        if (keyCode === 13 || keyCode === 32) {
          event.preventDefault();
          openTab($items, $tabs, $(this), true);
        }
      });

    }); // this.each()
  }; // $.fn.accdn()

})(jQuery, this, this.document);

