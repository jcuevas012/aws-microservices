import AWS from "aws-sdk"

const documentClient = new AWS.DynamoDB.DocumentClient()

export async function setImageAuction(id, imageUrl) {
  const params = {
    TableName: process.env.AUCTION_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set imageUrl = :imageUrl",
    ExpressionAttributeValues: {
      ":imageUrl": imageUrl,
    },
    ReturnValues: "ALL_NEW",
  }

  const result = await documentClient.update(params).promise()
  const updatedAuction = result.Attributes

  return updatedAuction
}
