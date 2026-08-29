using System.Collections.Generic;
using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.Hostel.Application;
using CampusServicesPortal.DTOs.Responses.Hostel.Application;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface IHostelService
    {
        // Submits initial housing preferences and parameters
        Task<ServiceResult<HostelApplicationResponseDto>> SubmitApplicationAsync(int studentId, SubmitHostelApplicationDto request);

        // Admin override to approve/reject intake allocations
        Task<ServiceResult<HostelApplicationResponseDto>> UpdateStatusAsync(int applicationId, UpdateHostelStatusDto request);

        // Assigns exact rooms without exceeding physical structural limitations
        Task<ServiceResult<HostelApplicationResponseDto>> AssignRoomAsync(int applicationId, AssignRoomDto request);

        // Tracking queries
        Task<ServiceResult<IEnumerable<HostelApplicationResponseDto>>> GetStudentApplicationsAsync(int studentId);
        Task<ServiceResult<IEnumerable<HostelApplicationResponseDto>>> GetAllPendingApplicationsAsync();
        Task<ServiceResult<IEnumerable<HostelApplicationResponseDto>>> GetAllApplicationsAsync();

        Task<ServiceResult<IEnumerable<HostelLookupResponseDto>>> GetAllActiveHostelsAsync();
    }
}
