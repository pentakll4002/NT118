using Backend.Contracts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Backend.Filters;

public class ApiResponseWrapperFilter : IAsyncResultFilter
{
    public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        if (context.Result is ObjectResult objectResult)
        {
            var traceId = context.HttpContext.TraceIdentifier;
            var statusCode = objectResult.StatusCode ?? StatusCodes.Status200OK;
            var value = objectResult.Value;

            if (value is not IApiResponse)
            {
                if (statusCode >= 200 && statusCode < 300)
                {
                    objectResult.Value = ApiResponses.Ok(value, traceId: traceId);
                }
                else
                {
                    string? message = null;
                    if (value is { } && value.GetType().GetProperty("message") is { } prop)
                    {
                        message = prop.GetValue(value)?.ToString();
                    }

                    if (string.IsNullOrEmpty(message))
                    {
                        message = statusCode switch
                        {
                            StatusCodes.Status400BadRequest => "Bad request",
                            StatusCodes.Status401Unauthorized => "Unauthorized",
                            StatusCodes.Status403Forbidden => "Forbidden",
                            StatusCodes.Status404NotFound => "Not found",
                            StatusCodes.Status409Conflict => "Conflict",
                            _ => "Request failed",
                        };
                    }
                    objectResult.Value = ApiResponses.Fail(message!, value, traceId);
                }
            }
        }

        await next();
    }
}
