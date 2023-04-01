const handler = async (
  event: AWSLambda.APIGatewayEvent
): Promise<any> => {
  if(event.httpMethod === "OPTIONS"){
    return {
      statusCode: 200,
      body: "",
      headers: {
        "cache-control": "max-age=3600, s-maxage=3600", // Caches preflight req on browser and proxy for 1 hour
        "access-control-allow-methods": "OPTIONS,GET",
        "access-control-allow-headers":
          "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent",
        "Access-Control-Allow-Origin": "*",
      },
    };
  }
  const response = {
    statusCode: 404,
    body: "This endpoint doesn't exist",
    headers: {
        "Cache-Control": `max-age=${3600}`,
        "Access-Control-Allow-Origin": "*",
    }
  }

  return response;
};

export default handler;
