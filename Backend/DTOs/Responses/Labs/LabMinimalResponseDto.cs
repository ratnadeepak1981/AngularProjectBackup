namespace CampusServicesPortal.DTOs.Responses.Labs
{
    public class LabMinimalResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string LabType { get; set; } = string.Empty; // "Computer" or "Science"
        public int Capacity { get; set; }
    }
}
