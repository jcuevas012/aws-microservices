import AWS from "aws-sdk"

export async function getEndedActions() {
  const documentClient = new AWS.DynamoDB.DocumentClient()
  const now = new Date()

  const params = {
    TableName: process.env.AUCTION_TABLE_NAME,
    IndexName: "StatusAndEndDate",
    KeyConditionExpression: "#status = :status and endDateAt <= :now",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": "OPEN",
      ":now": now.toISOString(),
    },
  }

  const result = await documentClient.query(params).promise()

  return result.Items
}
