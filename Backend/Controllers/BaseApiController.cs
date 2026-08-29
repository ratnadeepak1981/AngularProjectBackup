using CampusServicesPortal.Wrappers; // Fixed: Changed from 'namespace' to a clean 'using' import
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace CampusServicesPortal.Controllers
{
    [ApiController]
    public class BaseApiController : ControllerBase
    {
        // Centralized utility method to instantly wrap all endpoints in the ApiResponse envelope
        protected IActionResult ProcessServiceResult<T>(ServiceResult<T> result, string successMessage)
        {
            if (!result.IsSuccess)
            {
                var errorResponse = new ApiResponse<object>(result.ErrorMessage!)
                {
                    Errors = result.ValidationErrors
                };
                return StatusCode(result.StatusCode, errorResponse);
            }

            var successResponse = new ApiResponse<T>(result.Data!, successMessage);
            return StatusCode(result.StatusCode, successResponse);
        }
    }
}
