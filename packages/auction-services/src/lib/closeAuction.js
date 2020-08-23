import AWS from "aws-sdk"

const documentClient = new AWS.DynamoDB.DocumentClient()
const sqs = new AWS.SQS()

export async function closeAuction(auction) {
  const params = {
    TableName: process.env.AUCTION_TABLE_NAME,
    Key: { id: auction.id },
    UpdateExpression: "set #status = :status",
    ExpressionAttributeValues: {
      ":status": "CLOSED",
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  }

  const result = await documentClient.update(params).promise()

  const { seller, higthestBid, title } = auction
  const { amount, bidder } = higthestBid

  if (amount === 0) {
    await sqs
      .sendMessage({
        QueueUrl: process.env.MAIL_QUEUE_URL,
        MessageBody: JSON.stringify({
          subject: "Not bidder for your auction",
          body: `Your auction has closed with any bidder`,
          recipient: seller,
        }),
      })
      .promise()
    return
  }

  const notifySeller = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: "Item has been sold",
        body: `Woo!. Your ${title} has been sold in ${amount} dollars`,
        recipient: seller,
      }),
    })
    .promise()

  const notifyBidder = sqs
    .sendMessage({
      QueueUrl: process.env.MAIL_QUEUE_URL,
      MessageBody: JSON.stringify({
        subject: "You won the item",
        body: `Woo!. You won the item ${title}  in ${amount} dollars`,
        recipient: bidder,
      }),
    })
    .promise()

  await Promise.all([notifySeller, notifyBidder])

  return result
}
