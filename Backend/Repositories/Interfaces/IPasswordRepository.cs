using System.Threading.Tasks;
using CampusServicesPortal.Models;

namespace CampusServicesPortal.Repositories.Interfaces
{
    public interface IPasswordRepository
    {
        Task<Student?> GetStudentByEmailThroughUserAsync(string email);
        Task InvalidateExistingResetTokensAsync(int studentId);
        Task SavePasswordResetTokenAsync(PasswordResetToken token);
        Task<PasswordResetToken?> GetPasswordResetTokenAsync(string token);
        Task<PasswordResetToken?> GetLatestUnusedTokenAsync();
        Task<Student?> GetStudentByIdAsync(int id);
        Task UpdateUserAsync(User user);
        Task UpdateResetTokenStatusAsync(PasswordResetToken token);
        Task RevokeAllUserSessionsAsync(int userId);
    }
}
