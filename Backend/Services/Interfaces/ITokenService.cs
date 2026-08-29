using CampusServicesPortal.Models;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface ITokenService
    {
        // Rule: Encrypts user identity matrix strings into secure JWT access tokens for API authorization headers
        string GenerateJwtToken(Student student, string assignedRole);
    }
}
