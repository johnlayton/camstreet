(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.returnExports = factory();
  }
}(this, function () {

  L.Control.Notification = L.Control.extend({
    options: {
      position: 'bottomleft',
      prefix: 'Produced by <a href="http://www.stocksoftware.com.au">StockSoftware</a>'
    },

    initialize: function (options) {
      L.setOptions(this, options);

      this._attributions = {};
    },

    onAdd: function (map) {
      this._container = L.DomUtil.create('div', 'leaflet-control-notification');
      L.DomEvent.disableClickPropagation(this._container);

      map
        .on('layeradd', this._onLayerAdd, this)
        .on('layerremove', this._onLayerRemove, this);

      this._update();

      return this._container;
    },

    onRemove: function (map) {
      map
        .off('layeradd', this._onLayerAdd)
        .off('layerremove', this._onLayerRemove);

    },

    setPrefix: function (prefix) {
      this.options.prefix = prefix;
      this._update();
      return this;
    },

    addAttribution: function (text) {
      if (!text) { return; }

      if (!this._attributions[text]) {
        this._attributions[text] = 0;
      }
      this._attributions[text]++;

      this._update();

      return this;
    },

    removeAttribution: function (text) {
      if (!text) { return; }

      this._attributions[text]--;
      this._update();

      return this;
    },

    _update: function () {
      if (!this._map) { return; }

      var attribs = [];

      for (var i in this._attributions) {
        if (this._attributions.hasOwnProperty(i) && this._attributions[i]) {
          attribs.push(i);
        }
      }

      var prefixAndAttribs = [];

      if (this.options.prefix) {
        prefixAndAttribs.push(this.options.prefix);
      }
      if (attribs.length) {
        prefixAndAttribs.push(attribs.join(', '));
      }

      this._container.innerHTML = prefixAndAttribs.join(' &#8212; ');
    },

    _onLayerAdd: function (e) {
      if (e.layer.getAttribution) {
        this.addAttribution(e.layer.getAttribution());
      }
    },

    _onLayerRemove: function (e) {
      if (e.layer.getAttribution) {
        this.removeAttribution(e.layer.getAttribution());
      }
    }

    /*
      this._container.innerHTML = '<button href="" onclick="window.webkitNotifications.requestPermission(); return true;"  id="notifications">Enable Notifications</button>';
    */

  });

  L.Map.mergeOptions({
    notificationControl: true
  });

  L.Map.addInitHook(function () {
    if (this.options.notificationControl) {
      this.notificationControl = (new L.Control.Notification()).addTo(this);
    }
  });

  L.control.notification = function (options) {
    return new L.Control.Notification(options);
  };

}));