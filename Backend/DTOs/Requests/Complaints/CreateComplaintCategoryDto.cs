using System.ComponentModel.DataAnnotations;

namespace CampusServicesPortal.DTOs.Requests.Complaints
{
    public class CreateComplaintCategoryDto
    {
        [Required(ErrorMessage = "Category name is required.")]
        [MaxLength(100)]
        public string Name { get; set; } = null!;
    }
}