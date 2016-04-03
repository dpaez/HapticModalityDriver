/**
 * Module dependencies
 */

var inherits = require( 'inherits' );
var Hammer = require( 'hammerjs' );
var ModalityDriverChannel = require( '../gyes/build/gyes' ).ModalityDriver;

/**
 * Module exports
 */

module.exports = HapticModalityDriver;

/**
 * Module contructor
 */

function HapticModalityDriver( opts ){
  opts = opts || {};
  opts.element = opts.element || document.body;
  opts.hapticEvents = opts.hapticEvents || [ 'hold', 'tap', 'doubletap', 'drag',
  'dragstart', 'dragend', 'dragup', 'dragdown', 'dragleft', 'dragright',
  'swipe', 'swipeup', 'swipedown', 'swipeleft', 'swiperight', 'transform',
  'transformstart', 'transformend', 'rotate', 'pinch', 'pinchin', 'pinchout',
  'touch', 'release' ];

  // input
  this.gesture = Hammer( opts.element, {gesture:true} );

  this.gesture.on( opts.hapticEvents.join(' '), this.newEvent.bind(this) );

  // some kind of module name
  this.id = 'WEBHAPTIC';

  // output
  this.vibrate = navigator.vibrate.bind(navigator) ||
        navigator.webkitVibrate.bind(navigator) ||
        navigator.mozVibrate.bind(navigator) ||
        navigator.msVibrate.bind(navigator);

  if ( this.vibrate ){
    this.on( 'synthetized', this.fission.bind(this) );
  }
}

inherits( HapticModalityDriver, ModalityDriverChannel );

HapticModalityDriver.prototype.fission = function( time ){
  time = time || 1000;
  var pattern = [100,30,100];
  pattern.push( time );
  console.log( 'HapticMD::onFission ', time );
  this.vibrate( pattern );
};

HapticModalityDriver.prototype.newEvent = function( data ){
  // Modality Driver Developer could add more functionality/parsing here.
  //console.log( 'HapticMD::onSignal ', data );
  var gesture = {};
  gesture.name = data.type || '';
  gesture.data = data.gesture || {};
  this.fire( 'recognized', {'gesture':data.type} );
};
