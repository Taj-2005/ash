const Pusher = require('pusher');

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

const sendOrderUpdate = async (userId, data) => {
  try {
    const channel = `user-${userId}`;
    console.log(`[Pusher] Sending order update to ${channel}:`, data);
    
    await pusher.trigger(channel, 'order-update', data);
    
    return true;
  } catch (error) {
    console.error('[Pusher] ❌ Error sending order update:', error);
    return false;
  }
};

const sendVendorOrderAlert = async (data) => {
  try {
    const channel = 'vendor-orders';
    console.log(`[Pusher] Sending new order alert to ${channel}:`, data);
    
    await pusher.trigger(channel, 'new-order', data);
    
    return true;
  } catch (error) {
    console.error('[Pusher] ❌ Error sending vendor alert:', error);
    return false;
  }
};

const broadcastStoreStatus = async (isOpen) => {
  try {
    console.log(`[Pusher] Broadcasting store status: ${isOpen ? 'OPEN' : 'CLOSED'}`);
    
    await pusher.trigger('store-channel', 'status-change', { isOpen });
    return true;
  } catch (error) {
    console.error('[Pusher] ❌ Error broadcasting store status:', error);
    return false;
  }
};

module.exports = {
  sendOrderUpdate,
  sendVendorOrderAlert, 
  broadcastStoreStatus
};