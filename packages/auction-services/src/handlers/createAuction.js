import validator from "@middy/validator"
import AWS from "aws-sdk"
import createError from "http-errors"
import { v4 as uuid } from "uuid"

import commonMiddleware from "../lib/comon-middleware"
import createAuctionSchema from "../lib/schemas/createAuctionSchema"

async function getAuction(event, context) {
  const { title } = event.body
  const { email } = event.requestContext.authorizer
  const documentClient = new AWS.DynamoDB.DocumentClient()
  const createdAt = new Date()
  const endDateAt = new Date()
  endDateAt.setHours(createdAt.getHours() + 1)

  const auction = {
    id: uuid(),
    status: "OPEN",
    title,
    createdAt: createdAt.toISOString(),
    endDateAt: endDateAt.toISOString(),
    higthestBid: {
      amount: 0,
    },
    seller: email,
  }

  try {
    await documentClient
      .put({
        TableName: process.env.AUCTION_TABLE_NAME,
        Item: auction,
      })
      .promise()
  } catch (error) {
    console.error(error)
    throw new createError.InternalServerError(error)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ auction }),
  }
}

export const handler = commonMiddleware(getAuction).use(
  validator({ inputSchema: createAuctionSchema, useDefaults: true })
)
