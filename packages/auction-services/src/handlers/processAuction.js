import createError from "http-errors"

import { closeAuction } from "../lib/closeAuction"
import { getEndedActions } from "../lib/getEndedAction"

async function processAuction(event, context) {
  try {
    const auctionsToClose = await getEndedActions()
    const closeAuctionPromises = auctionsToClose.map((auction) =>
      closeAuction(auction)
    )

    Promise.all(closeAuctionPromises)
    return { closed: closeAuctionPromises.length }
  } catch (error) {
    console.error(error)
    createError.InternalServerError(error)
  }
}

export const handler = processAuction
