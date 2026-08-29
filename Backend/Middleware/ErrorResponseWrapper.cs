using System.Collections.Generic;

namespace CampusServicesPortal.Wrappers
{
    public class ErrorResponseWrapper<T>
    {
        public bool Succeeded { get; set; } = false;
        public string Message { get; set; } = null!;
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }
}
