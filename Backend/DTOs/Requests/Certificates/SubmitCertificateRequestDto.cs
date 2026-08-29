namespace CampusServicesPortal.DTOs.Requests.Certificates
{
    public class SubmitCertificateRequestDto
    {
        public int CertificateTypeId { get; set; }
        public string Reason { get; set; } = null!;
    }
}
