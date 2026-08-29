using System.Collections.Generic;
using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.MasterData;
using CampusServicesPortal.DTOs.Requests.Nortifcation;
using CampusServicesPortal.DTOs.Responses.MasterData;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface IFacultyService
    {
        // 🆕 Faculty Operations [PDF: 0.1.17]
        Task<ServiceResult<IEnumerable<FacultyResponseDto>>> GetAllFacultiesAsync();
        Task<ServiceResult<FacultyResponseDto>> CreateFacultyAsync(CreateFacultyRequestDto request);
        Task<ServiceResult<FacultyResponseDto>> UpdateFacultyAsync(int id, UpdateFacultyRequestDto request);
        Task<ServiceResult<object>> DeleteFacultyAsync(int id);

        // System Settings & Cross-Cutting Controls [PDF: 0.1.12]
        Task<ServiceResult<object>> UpdateGlobalSettingAsync(string key, string value);

        // Notification Lifecycle Engine [PDF: 0.1.16, 0.1.17]
        Task<ServiceResult<IEnumerable<NotificationResponseDto>>> GetStudentNotificationsAsync(int studentId);
        Task<ServiceResult<object>> MarkNotificationAsReadAsync(int notificationId, int studentId);
        Task<ServiceResult<object>> SendInternalNotificationAsync(CreateNotificationDto dto);
    }
}
