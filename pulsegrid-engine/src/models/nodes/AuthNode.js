const { BaseNode } = require('./BaseNode');

class AuthNode extends BaseNode {
  constructor(id, label, config = {}) {
    super(id, label, 'auth', {
      baseLatency: 30,         // Cryptographic processing
      concurrencyLimit: 10,
      baseCpu: 15,             // Hashing compute cost
      ...config,
    });
  }
}

module.exports = AuthNode;