const EventEmitter = require('events');

class PulseGridEventBus extends EventEmitter {
  constructor() {
    super();
    // Increase max listeners since a large topology (50+ nodes) 
    // might have many subscribers to chaos and system events.
    this.setMaxListeners(100);
  }
}

// Export as a Singleton
module.exports = new PulseGridEventBus();