async function hello(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "hello" }),
  }
}

export const handler = hello
