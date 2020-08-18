import AWS from "aws-sdk"
import createError from "http-errors"

import commonMiddleware from "../lib/comon-middleware"

export async function getAuctionById(id) {
  let auction

  const documentClient = new AWS.DynamoDB.DocumentClient()
  try {
    const result = await documentClient
      .get({
        TableName: process.env.AUCTION_TABLE_NAME,
        Key: { id },
      })
      .promise()

    auction = result.Item
  } catch (error) {
    console.error(error)
    throw new createError.InternalServerError(error)
  }

  if (!auction) {
    throw new createError.NotFound(`auction ${id} Not Found`)
  }

  return auction
}

async function getAuction(event, context) {
  const { id } = event.pathParameters

  const auction = await getAuctionById(id)

  return {
    statusCode: 200,
    body: JSON.stringify({ auction }),
  }
}

export const handler = commonMiddleware(getAuction)
