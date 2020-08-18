import validator from "@middy/validator"
import AWS from "aws-sdk"
import createError from "http-errors"

import commonMiddleware from "../lib/comon-middleware"
import getAuctionsSchema from "../lib/schemas/getAuctionsSchema"

async function getAuctions(event, context) {
  const { status } = event.queryStringParameters
  const documentClient = new AWS.DynamoDB.DocumentClient()
  let auctions

  try {
    const params = {
      TableName: process.env.AUCTION_TABLE_NAME,
      IndexName: "StatusAndEndDate",
      KeyConditionExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
    }
    const result = await documentClient.query(params).promise()

    auctions = result.Items
  } catch (error) {
    console.error(error)
    throw new createError.InternalServerError(error)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ auctions }),
  }
}

export const handler = commonMiddleware(getAuctions).use(
  validator({ inputSchema: getAuctionsSchema, useDefaults: true })
)
