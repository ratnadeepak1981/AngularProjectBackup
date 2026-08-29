using CampusServicesPortal.DTOs.Requests.Hostel;
using CampusServicesPortal.DTOs.Requests.Hostel.Managment;
using CampusServicesPortal.DTOs.Responses.Hostel;
using CampusServicesPortal.DTOs.Responses.Hostel.Management;
using CampusServicesPortal.Wrappers;
using System.Threading.Tasks;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface IHostelManagementService
    {
        Task<ServiceResult<HostelResponseDto>> CreateHostelAsync(CreateHostelRequestDto request);
        Task<ServiceResult<HostelResponseDto>> UpdateHostelAsync(int id, UpdateHostelRequestDto request);
        Task<ServiceResult<object>> DeleteHostelAsync(int id);
        Task<ServiceResult<RoomResponseDto>> CreateRoomAsync(int hostelId, CreateRoomRequestDto request);
        Task<ServiceResult<RoomResponseDto>> UpdateRoomAsync(int id, UpdateRoomRequestDto request);
        Task<ServiceResult<object>> DeleteRoomAsync(int id);
        Task<ServiceResult<RoomOccupancyResponseDto>> GetRoomOccupancyAsync(int id);
    }
}
