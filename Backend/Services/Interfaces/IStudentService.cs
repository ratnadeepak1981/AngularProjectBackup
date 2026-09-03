using System.Collections.Generic;
using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.Student;
using CampusServicesPortal.DTOs.Responses.Student;
using CampusServicesPortal.Models;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface IStudentService
    {
        // POST /api/students/register [Index 0.1.3]
        Task<ServiceResult<StudentProfileResponseDto>> RegisterStudentAsync(RegisterStudentRequestDto request);

        // GET /api/students/{id} [Index 0.1.3]
        Task<ServiceResult<StudentProfileResponseDto>> GetStudentProfileAsync(int id);

        // PUT /api/students/{id} [Index 0.1.3]
        Task<ServiceResult<StudentProfileResponseDto>> UpdateStudentProfileAsync(int id, UpdateStudentProfileDto request);

        // GET /api/students?search=&faculty= [Index 0.1.3]
        Task<ServiceResult<IEnumerable<StudentProfileResponseDto>>> SearchStudentsAsync(string? search, string? faculty);

        // DELETE /api/students/{id} [Index 0.1.3]
        Task<ServiceResult<bool>> DeactivateStudentAsync(int id);

        // GET /api/student-master/{indexNumber} [Index 0.1.4]
        Task<ServiceResult<object>> VerifyMasterIndexAsync(string indexNumber);

        // GET /api/student-master?search= [Index 0.1.4]
        Task<ServiceResult<IEnumerable<object>>> SearchMasterRecordsAsync(string? search);

        // POST /api/student-master/import [Index 0.1.4]
        Task<ServiceResult<int>> BulkImportMasterRecordsAsync(IFormFile file);
    }
}
