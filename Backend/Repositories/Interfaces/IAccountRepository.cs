using System.Threading.Tasks;
using CampusServicesPortal.Models;

namespace CampusServicesPortal.Repositories.Interfaces
{
    public interface IAccountRepository
    {
        Task<Student?> GetStudentByVerificationTokenAsync(string token);
        Task<Student?> GetStudentByEmailThroughUserAsync(string email);
        Task<Student?> GetStudentByIdAsync(int id);
        Task UpdateStudentAsync(Student student);
        Task UpdateUserAsync(User user);

        // Strict Deactivation Validation Rules (BRD Section 6 Rule 11)
        Task<bool> HasActiveHostelRoomAsync(int studentId);
        Task<bool> HasUpcomingLabBookingsAsync(int studentId);
        Task<bool> HasUpcomingEventRegistrationsAsync(int studentId);
        Task<bool> HasPendingCertificateRequestsAsync(int studentId);
        Task<bool> HasOutstandingFeesAsync(int studentId);

        // Deactivation state mutation
        Task DeactivateStudentAccountAsync(int studentId);
        Task ReactivateStudentAccountAsync(int studentId);
    }
}
