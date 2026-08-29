using System.Collections.Generic;

namespace CampusServicesPortal.DTOs.Responses.Auth
{
    public class DeactivationCheckResponseDto
    {
        public bool CanDeactivate { get; set; }
        public List<string> BlockingReasons { get; set; } = new();
    }
}
