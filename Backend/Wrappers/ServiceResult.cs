using System.Collections.Generic;

namespace CampusServicesPortal.Wrappers
{
    public class ServiceResult<T>
    {
        public bool IsSuccess { get; private set; }
        public T? Data { get; private set; }
        public string? ErrorMessage { get; private set; }
        public List<string> ValidationErrors { get; private set; } = new List<string>();
        public int StatusCode { get; private set; } // e.g., 200, 400, 404, 409

        // Successful Result Factory
        public static ServiceResult<T> Success(T data, int statusCode = 200)
        {
            return new ServiceResult<T> { IsSuccess = true, Data = data, StatusCode = statusCode };
        }

        // Business Rule Violation Failure Factory
        public static ServiceResult<T> Failure(string errorMessage, int statusCode = 400, List<string>? validations = null)
        {
            return new ServiceResult<T>
            {
                IsSuccess = false,
                ErrorMessage = errorMessage,
                StatusCode = statusCode,
                ValidationErrors = validations ?? new List<string>()
            };
        }
    }
}
