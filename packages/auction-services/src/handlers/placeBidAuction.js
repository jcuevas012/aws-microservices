import validator from "@middy/validator"
import AWS from "aws-sdk"
import createError from "http-errors"

import commonMiddleware from "../lib/comon-middleware"
import placeBidSchema from "../lib/schemas/placeBidSchema"
import { getAuctionById } from "./getAuction"

const documentClient = new AWS.DynamoDB.DocumentClient()

async function updateAuction(event, context) {
  const { id } = event.pathParameters
  const { email } = event.requestContext.authorizer
  const { amount } = event.body

  const auction = await getAuctionById(id)

  if (email === auction.seller) {
    throw new createError.Forbidden("You can't bid to your own auction")
  }

  if (email === auction.higthestBid.bidder) {
    throw new createError.Forbidden("You are alredy the highest bidder")
  }

  // you can bid to close auction
  if (auction.status !== "OPEN") {
    throw new createError.Forbidden("You can not bid to a closed auction")
  }

  // amount has to be higher than the bid already placed
  if (amount <= auction.higthestBid.amount) {
    throw new createError.Forbidden(
      `Your bid you be higther then ${auction.higthestBid.amount}`
    )
  }

  const params = {
    TableName: process.env.AUCTION_TABLE_NAME,
    Key: { id },
    UpdateExpression:
      "set higthestBid.amount = :amount, higthestBid.bidder = :bidder",
    ExpressionAttributeValues: {
      ":amount": amount,
      ":bidder": email,
    },
    ReturnValues: "ALL_NEW",
  }

  let updatedAuction

  try {
    const result = await documentClient.update(params).promise()

    updatedAuction = result.Attributes
  } catch (error) {
    console.error(error)
    throw new createError.InternalServerError(error)
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ updatedAuction }),
  }
}

export const handler = commonMiddleware(updateAuction).use(
  validator({ inputSchema: placeBidSchema, useDefaults: true })
)
