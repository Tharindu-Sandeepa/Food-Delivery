const amqp = require('amqplib')

let channel = null

const connectRabbitMQ = async () => {
  const conn = await amqp.connect(process.env.RABBITMQ_URL)
  channel = await conn.createChannel()
  
  // Order service listens for driver assignments
  if (process.env.SERVICE_NAME === 'order-service') {
    await channel.assertQueue('driver-assigned')
    channel.consume('driver-assigned', (msg) => {
      const data = JSON.parse(msg.content.toString())
      // Update order with driver info
      Order.updateOne(
        { orderId: data.orderId },
        { 
          status: 'assigned',
          deliveryPersonId: data.driverId
        }
      ).exec()
      channel.ack(msg)
    })
  }
  
  // Delivery service listens for ready orders
  if (process.env.SERVICE_NAME === 'delivery-service') {
    await channel.assertQueue('order-ready')
    channel.consume('order-ready', (msg) => {
      const data = JSON.parse(msg.content.toString())
      // Trigger driver assignment
      deliveryController.assignDriver({ body: data })
      channel.ack(msg)
    })
  }
}

const publishToQueue = (queue, message) => {
  if (!channel) throw new Error("RabbitMQ channel not initialized")
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)))
}

module.exports = { connectRabbitMQ , publishToQueue }