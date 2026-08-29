namespace CampusServicesPortal.DTOs.Responses.Complaints
{
    public class ComplaintCategoryResponseDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = null!;

        public bool IsActive { get; set; }
    }
}