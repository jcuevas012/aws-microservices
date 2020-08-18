import AWS from "aws-sdk"

export async function closeAuction(auction) {
  const documentClient = new AWS.DynamoDB.DocumentClient()

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

  return result
}
