using System.ComponentModel.DataAnnotations;

namespace CampusServicesPortal.Models;

public class StudentMasterList
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public required string IndexNumber { get; set; }

    [Required]
    [MaxLength(150)]
    public required string FullName { get; set; }

    [Required]
    public int FacultyId { get; set; }
}
