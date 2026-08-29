using CampusServicesPortal.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CampusServicesPortal.Repositories.Interfaces
{
    public interface IStudentRepository
    {
        // Registration Gates
        Task<StudentMasterList?> GetMasterRecordAsync(string indexNumber);
        Task<bool> IsIndexRegisteredAsync(string indexNumber);
        Task<bool> IsEmailRegisteredAsync(string email);
        Task AddStudentAsync(Student student);
        Task UpdateAsync(Student student);

        // Core Profile & Search Operations
        Task<Student?> GetByIdAsync(int id);
        Task<IEnumerable<Student>> SearchStudentsAsync(string? search, string? faculty);

        Task<IEnumerable<StudentMasterList>> SearchMasterListAsync(string? search);
        Task BulkImportMasterListAsync(IEnumerable<StudentMasterList> masterRecords);


        // Safety & Validation checks for Deactivation
        Task<bool> HasActiveHostelAllocationAsync(int studentId);
        Task<bool> HasUpcomingLabBookingsAsync(int studentId);
        Task<bool> HasUpcomingEventRegistrationsAsync(int studentId);
        Task<bool> HasPendingCertificateRequestAsync(int studentId);
        Task<bool> HasUnpaidFeesAsync(int studentId);

        // Persistence Engine
        Task SaveChangesAsync();
    }
}
