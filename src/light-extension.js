// Lightweight Azure DevOps PR Agent Extension
(function() {
  'use strict';

  // Simple initialization - no heavy SDK waiting
  function initializeLight() {
    console.log('🚀 PR Agent Extension loaded');
    
    // Just log that we're ready - no complex UI generation
    if (typeof console !== 'undefined') {
      console.log('✅ PR Agent Extension ready');
    }
  }

  // Initialize immediately
  initializeLight();

})(); 