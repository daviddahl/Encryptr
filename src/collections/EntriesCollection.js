(function (window, console, Encryptr, undefined) {
  "use strict";
  console       = console || {};
  console.log   = console.log || function() {};
  var Backbone  = window.Backbone,
    _           = window._,
    $           = window.Zepto;

  var EntriesCollection = Backbone.Collection.extend({
    rootContainerID: "entries",
    initialize: function(models, options) {
      this.container = (options && options.container ||
                        this.rootContainerID); // default
      this.model = Encryptr.prototype.EntryModel; // default
    },
    fetch: function (options) {
      var _this = this;
      var container = (options && options.container) || this.container;
      window.app.session.load(container, function(err, entries) {
        if (options && options.error && err) options.error(err);
        _this.set(
          _.map(entries.keys, function(entry, key){
            var it;
            if (entry.type === "Folder") {
              it = new Encryptr.prototype.FolderModel(entry);
            }
            else {
              // Can't use _this.model() because FolderModel twiddles it.
              it = new Encryptr.prototype.EntryModel(entry);
            }
            it.container = container;
            return it;
          })
        );
        if (options && options.success) options.success(_this);
      });
    },
    // There is no underlying collection.destroy().
    destroy: function (options) {
      // Ensure we have our crypton container, in so far as it's available:
      this.fetch();
      // Iterate over the contents, to dispatch on any contained folders:
      this.forEach(function (entry) {
        if (entry.get("folderId")) {
          entry.destroy(options);
        }
      });
    },
    which: "EntriesCollection"
  });

  Encryptr.prototype.EntriesCollection = EntriesCollection;

})(this, this.console, this.Encryptr);
