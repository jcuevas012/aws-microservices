import middy from "@middy/core"
import httpErrorHandler from "@middy/http-error-handler"
import createErrors from "http-errors"

import { setImageAuction } from "../lib/setImageAuction"
import { uploadPictureToS3 } from "../lib/uploadPictureToS3"
import { getAuctionById } from "./getAuction"

async function uploadPicture(event, context) {
  const { id } = event.pathParameters
  const { email } = event.authorizer

  const auction = await getAuctionById(id)

  // check if the user can upload image
  if (auction.seller === email) {
    throw new createErrors.Forbidden(
      "You do not have permission to upload images to this auction"
    )
  }

  const base64 = event.body.replace(/^data:image\/\w+;base64,/, "")
  const buffer = Buffer.from(base64, "base64")

  let updatedAuction

  try {
    const imageUrl = await uploadPictureToS3(`${auction.id}.jpg`, buffer)
    updatedAuction = await setImageAuction(auction.id, imageUrl)
  } catch (error) {
    console.error(error)
    throw new createErrors.InternalServerError(error)
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  }
}

export const handler = middy(uploadPicture).use(httpErrorHandler())
