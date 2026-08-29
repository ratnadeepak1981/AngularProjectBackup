namespace CampusServicesPortal.DTOs.Requests.Certificates
{
    public class UpdateCertificateStatusDto
    {
        // Aligns with BRD workflow statuses (e.g., "Approved", "Rejected", "Ready for Collection")
        public string Status { get; set; } = null!;
    }
}
