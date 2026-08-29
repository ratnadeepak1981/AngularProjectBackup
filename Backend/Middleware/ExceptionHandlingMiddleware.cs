using System;
using System.Collections.Generic;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IHostEnvironment _env;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An unhandled system exception occurred: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError; // 500 Internal Server Error

            var response = new ErrorResponseWrapper<object>
            {
                Succeeded = false,
                Message = "A critical system crash occurred while processing your request.",
                Data = null,
                Errors = new List<string>()
            };

            // Rule: Populates error array details dynamically based on environment hosting state
            if (_env.IsDevelopment())
            {
                response.Errors.Add($"Exception: {exception.Message}");
                response.Errors.Add($"StackTrace: {exception.StackTrace}");
            }
            else
            {
                response.Errors.Add("Internal server error. Contact the system administrator.");
            }

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var jsonResult = JsonSerializer.Serialize(response, options);

            await context.Response.WriteAsync(jsonResult);
        }
    }
}
