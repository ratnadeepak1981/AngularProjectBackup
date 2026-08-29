using System.ComponentModel.DataAnnotations;

namespace CampusServicesPortal.DTOs.Requests.Auth
{
    public class RevokeTokenRequestDto
    {
        [Required(ErrorMessage = "Refresh Token parameter is required.")]
        public string RefreshToken { get; set; } = null!;
    }
}
