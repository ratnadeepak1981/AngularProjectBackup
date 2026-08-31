using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CampusServicesPortal.Models;

public class FeeType
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public required string Name { get; set; } // e.g., "Tuition Fee", "Semester Fee", "Exam Fee", "Lab Fine"

    public bool IsActive { get; set; } = true;
}
