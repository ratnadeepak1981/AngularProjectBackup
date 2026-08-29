using System;
using System.Collections.Generic;

namespace CampusServicesPortal.Wrappers
{
    public class ApiResponse<T>
    {
        public bool Succeeded { get; set; }
        public string? Message { get; set; }
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new List<string>();

        // Constructor for Successful Operations
        public ApiResponse(T data, string? message = null)
        {
            Succeeded = true;
            Message = message;
            Data = data;
        }

        // Constructor for Failed Operations
        public ApiResponse(string message, List<string>? errors = null)
        {
            Succeeded = false;
            Message = message;
            Data = default;
            if (errors != null)
            {
                Errors = errors;
            }
        }
    }
}
