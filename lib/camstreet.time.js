(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.returnExports = factory();
  }
}(this, function () {

  L.Control.Time = L.Control.extend({

    options: {
      position: 'bottomright',
      time: {
        min: new Date( 2013, 04, 06 ),
        max: new Date( 2013, 04, 15 )
      }
    },

    initialize: function (options) {
      L.setOptions(this, options);
      this._wmslayers = [];
    },

    onAdd: function (map) {
      var timeName = 'leaflet-control-time',
        container = L.DomUtil.create('div', timeName + ' leaflet-bar');

      this._map = map;

      this._label =
      this._createLabel( timeName + '-label', container, this );

      this._slider =
      this._createSlider( timeName + '-slider', container, this._rollTime, this );

      this._slider.step = 60 * 60 * 1000;
      this._slider.min = this.options.time.min.getTime();
      this._slider.max = this.options.time.max.getTime();

      this._label.innerHTML = new Date( parseInt( this._slider.value ) ).toLocaleString();

      map.on('layeradd', this._addLayer, this );

      return container;
    },

    onRemove: function (map) {
      map.off('layeradd', this._addLayer, this);
    },

    _addLayer: function(event) {
      if ( event.layer.wmsParams ) {
        this._wmslayers.push( event.layer );
      }
    },

    _rollTime: function(e) {
      var dt = new Date( parseInt( e.target.value ) )
      this._label.innerHTML = dt.toLocaleString();
      for (var i = 0; i < this._wmslayers.length; i++) {
        this._wmslayers[i].setParams({ time: dt.toISOString() });
      }
    },

    _createLabel: function ( className, container, context ) {
      var label = L.DomUtil.create('div', className, container);
      return label;
    },

    _createSlider: function ( className, container, fn, context ) {
      var slider = L.DomUtil.create('input', className, container);
      slider.type   = 'range';
      slider.step   = 1;
      slider.height = 50;
      slider.width  = 150;

      var stop = L.DomEvent.stopPropagation;

      L.DomEvent
        .on(slider, 'click',     stop)
        .on(slider, 'mousedown', stop)
        .on(slider, 'dblclick',  stop)
        .on(slider, 'change',    L.DomEvent.preventDefault)
        .on(slider, 'change',    fn, context);

      return slider;
    }
  });

  L.Map.mergeOptions({
    timeControl: false
  });

  L.Map.addInitHook(function () {
    if (this.options.timeControl) {
      this.timeControl = new L.Control.Time();
      this.addControl(this.timeControl);
    }
  });

}));