namespace CampusServicesPortal.DTOs.Responses.MasterData
{
    public class CertificateTypeResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public bool IsActive { get; set; }
    }
}
