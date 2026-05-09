using Backend.Contracts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Backend.Filters;

public class ApiExceptionFilter : IExceptionFilter
{
    public void OnException(ExceptionContext context)
    {
        var traceId = context.HttpContext.TraceIdentifier;
        var (statusCode, message) = context.Exception switch
        {
            KeyNotFoundException => (StatusCodes.Status404NotFound, context.Exception.Message),
            InvalidOperationException => (StatusCodes.Status400BadRequest, context.Exception.Message),
            UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, context.Exception.Message),
            _ => (StatusCodes.Status500InternalServerError, "Internal server error"),
        };

        context.Result = new ObjectResult(ApiResponses.Fail(context.Exception.Message, traceId: traceId))
        {
            StatusCode = statusCode,
        };
        context.ExceptionHandled = true;
    }
}
