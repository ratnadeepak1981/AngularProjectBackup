using System.ComponentModel.DataAnnotations;

namespace CampusServicesPortal.DTOs.Requests.Complaints
{
    public class UpdateComplaintStatusDto
    {
        [Required(ErrorMessage = "Complaint status is required.")]
        [MaxLength(20)]
        public string Status { get; set; } = null!;

        [MaxLength(1000)]
        public string? ResolutionNote { get; set; }
    }
}