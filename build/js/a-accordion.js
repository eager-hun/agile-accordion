/**
 * @file
 * Agile Accordion jQuery plugin.
 *
 * The underlying plugin pattern was inspired by:
 * https://www.smashingmagazine.com/2011/10/essential-jquery-plugin-patterns/
 * and
 * http://stackoverflow.com/questions/10978070/how-would-i-add-a-method-to-this-jquery-plugin-pattern/10978478#10978478
 */

;(function ($, window, document, undefined) {
  "use strict";

  // --------------------------------------------------------------------------
  // Defaults.

  var pluginName = 'accdn';
  var defaults = {
    // Screen width value in pixels.
    tabsAt: 700,
    // Boolean. Whether to close the rest of items when one is opened.
    exclusiveItems: false,
    // Milliseconds.
    effectSpeed: 700,
    // Batch operating button's text when it will open things.
    textForBatchOpen: 'Open all',
    // Batch operating button's text when it will close things.
    textForBatchClose: 'Close all'
  };
  var $window = $(window);

  // --------------------------------------------------------------------------
  // Methods.

  // Opens initially open items upon initialization.
  var openInitialItems = function(instance) {
    var $initiallyOpenItems = instance.$items.filter('.is-open');
    var opts = {
      effect: 'plain',
      passFocus: false
    };
    $initiallyOpenItems.each(function(index, value) {
      openItem(instance, $(value), opts);
    });
  };

  var updateWidget = function(instance) {
    instance.isTabs = $window.innerWidth() >= instance.settings.tabsAt;

    if (!instance.isTabs) {
      if (instance.$wrapper.hasClass('is-tabs')) {
        instance.$wrapper.removeClass('is-tabs');
      }
    }
    else {
      if (!instance.$wrapper.hasClass('is-tabs')) {
        instance.$wrapper.addClass('is-tabs');
      }

      // Opening a tab.
      var $activeTab = instance.$tabs.filter('.is-active');
      if ($activeTab.length > 0) {
        instance.openTab(instance, $activeTab, false);
      }
      // Fallback: open the first tab.
      else {
        instance.openTab(instance, instance.$tabs.first(), false);
      }
    }

    // Showing/hiding batchbutton.
    if (instance.$batchButton.length > 0) {
      if (!instance.isTabs) {
        instance.$batchButton.show();
      }
      else {
        instance.$batchButton.hide();
      }
    }

    // Updating batchbutton.
    if (instance.$batchButton.length > 0) {
      instance.updateBatchButton(instance);
    }
  };

  // Opens a single accordion item.
  var openItem = function(instance, $item, opts) {
    $item.addClass('is-open');

    $item.data('boundTab').addClass('is-active');

    switch (opts.effect) {
      case 'slide':
        $item.children('.accdn__content').stop().slideDown(instance.settings.effectSpeed);
        break;
      case 'plain':
        $item.children('.accdn__content').stop().show();
    }

    if (instance.isTabs && opts.passFocus) {
      $item.children('.accdn__content').focus();
    }

    instance.updateBatchButton(instance);
  };

  // This called when clicking a tab, also upon widget update.
  var openTab = function(instance, $tabToOpen, passFocus) {
    var $currentItem = $tabToOpen.data('boundItem');

    instance.$tabs.not($tabToOpen).removeClass('is-active');

    var opts = {
      effect: 'plain'
    };
    if (typeof passFocus !== undefined) {
      opts.passFocus = passFocus;
    }

    // Note: by the nature of tabs, they will always behave as if items were
    // exclusive.
    instance.closeItems(instance, instance.$items.not($currentItem), opts);
    instance.openItem(instance, $currentItem, opts);
  };

  // Closes a single accordion item.
  var closeItem = function(instance, $item, opts) {
    $item.removeClass('is-open');

    $item.data('boundTab').removeClass('is-active');

    // Re-highlight the first such tab whose item is still open.
    if (instance.$items.filter('.is-open').length > 0) {
      instance.$items.filter('.is-open').first().data('boundTab').addClass('is-active');
    }

    switch (opts.effect) {
      case 'slide':
        $item.children('.accdn__content').stop().slideUp(instance.settings.effectSpeed);
        break;
      case 'plain':
        $item.children('.accdn__content').stop().hide();
    }

    instance.updateBatchButton(instance);
  };

  // Closes the passed range of items.
  var closeItems = function(instance, $itemsToClose, opts) {
    $itemsToClose.each(function() {
      closeItem(instance, $(this), opts);
    });
  };

  // Toggles an accordion item.
  var operateItem = function(instance, $item, opts) {
    instance.$tabs.removeClass('is-active');

    if (!$item.hasClass('is-open')) {
      if (opts.exclusive) {
        instance.closeItems(instance, instance.$items.not($item), opts);
      }
      openItem(instance, $item, opts);
    }
    else {
      closeItem(instance, $item, opts);
    }
  };

  var updateBatchButton = function(instance) {
    var $closedItems = instance.$items.filter(':not(.is-open)');

    if ($closedItems.length > 0) {
      instance.$batchButton.html(instance.settings.textForBatchOpen);
      instance.$batchButton.attr('data-next-action', 'open');
    }
    else {
      instance.$batchButton.html(instance.settings.textForBatchClose);
      instance.$batchButton.attr('data-next-action', 'close');
    }
  };

  // --------------------------------------------------------------------------
  // Methods that are callable after initialization.

  Plugin.prototype.toggleAllInAccordion = function(arg) {
    var self = this;

    if (this.isTabs) {
      // console.log('Is tabs.');
      return false;
    }

    var opts = {};

    if (arg == 'open') {
      opts.effect = 'slide';
      opts.passFocus = false;
      opts.suppressWidgetUpdate = true;

      this.$items.each(function(index, value) {
        openItem(self, $(value), opts);
      });
    }
    else {
      opts.effect = 'slide';
      opts.suppressWidgetUpdate = true;

      closeItems(this, this.$items, opts);
    }

    this.updateWidget(this);
  };

  // --------------------------------------------------------------------------
  // Tasks on initialization.

  Plugin.prototype.init = function() {

    var self = this;

    this.$wrapper     = $(this.element);
    this.$items       = this.$wrapper.children('.accdn__item');
    this.$heads       = this.$items.children('.accdn__head');
    this.$contents    = this.$items.children('.accdn__content');
    this.instanceId   = this.$wrapper.attr('id');
    this.isTabs       = undefined;
    this.$batchButton = $('[data-accdn-batch-toggle="' + this.instanceId + '"]');

    // -----------------------------------------------------------------------
    // Prepare heads and create tabs.

    this.$tabsBar = $('<div/>')
      .addClass('accdn__tabs');

    this.$wrapper.prepend(this.$tabsBar);

    this.$tabs = $();

    this.$heads.each(function() {
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

      self.$tabsBar.append($tab);

      // See http://stackoverflow.com/a/7534016 .
      self.$tabs = self.$tabs.add($tab);
    });

    // Contents are focusable.
    this.$contents.attr('tabindex', -1);

    // -----------------------------------------------------------------------
    // Do initial things.

    this.openInitialItems(this);
    this.updateWidget(this);
    this.$wrapper.addClass('accdn-initialized');

    // -----------------------------------------------------------------------
    // Events.

    $window.on('resize', function() {
      self.updateWidget(self);
    });

    this.$heads.on('click', function() {
      var opts = {
        effect: 'slide',
        exclusive: self.settings.exclusiveItems
      };
      operateItem(self, $(this).parent(), opts);
    });

    this.$heads.on('keydown', function(event) {
      var keyCode = event.keyCode ? event.keyCode : event.charCode;
      // Enter or space keys.
      if (keyCode === 13 || keyCode === 32) {
        event.preventDefault();
        var opts = {
          effect: 'slide',
          exclusive: self.settings.exclusiveItems
        };
        operateItem(self, $(this).parent(), opts);
      }
    });

    this.$tabs.on('click', function() {
      self.openTab(self, $(this), true);
    });

    this.$tabs.on('keydown', function(event) {
      var keyCode = event.keyCode ? event.keyCode : event.charCode;
      // Enter or space keys.
      if (keyCode === 13 || keyCode === 32) {
        event.preventDefault();
        openTab(self, $(this), true);
      }
    });
  };

  $('[data-accdn-batch-toggle]').on('click', function() {
    var $this = $(this);
    var $target = $('#' + $this.attr('data-accdn-batch-toggle'));
    if ($target.length > 0) {
      $target
        [pluginName]('toggleAllInAccordion', $this.attr('data-next-action'));
    }
  });

  // --------------------------------------------------------------------------
  // Plugin definition.

  function Plugin(element, options) {
    this.element = element;
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
    this._name = pluginName;

    // Methods.
    this.updateWidget = updateWidget;
    this.openInitialItems = openInitialItems;
    this.openItem = openItem;
    this.openTab = openTab;
    this.closeItem = closeItem;
    this.closeItems = closeItems;
    this.operateItem = operateItem;
    this.updateBatchButton = updateBatchButton;

    this.init();
  }

  // --------------------------------------------------------------------------
  // Applying plugin.

  $.fn[pluginName] = function(options) {
    // When we call a method after initialization.
    if (typeof options === "string") {
      var args = Array.prototype.slice.call(arguments, 1);
      this.each(function() {
        var plugin = $.data(this, 'plugin_' + pluginName);
        plugin[options].apply(plugin, args);
      });
    }
    // Else initialize.
    else {
      return this.each(function() {
        if (!$.data(this, 'plugin_' + pluginName)) {
          $.data(
            this,
            'plugin_' + pluginName,
            new Plugin(this, options)
          );
        }
      });
    }
  };

})(jQuery, this, this.document);
