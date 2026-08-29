using System.Collections.Generic;
using System.Threading.Tasks;
using CampusServicesPortal.DTOs.Requests.Complaints;
using CampusServicesPortal.DTOs.Responses.Complaints;
using CampusServicesPortal.Wrappers;

namespace CampusServicesPortal.Services.Interfaces
{
    public interface IComplaintService
    {
        Task<ServiceResult<ComplaintResponseDto>> SubmitComplaintAsync(int studentId, SubmitComplaintDto request);

        Task<ServiceResult<IEnumerable<ComplaintResponseDto>>> GetStudentComplaintsAsync(int studentId);

        Task<ServiceResult<IEnumerable<ComplaintResponseDto>>> GetComplaintsAsync(string? status);

        Task<ServiceResult<ComplaintResponseDto>> UpdateComplaintStatusAsync(int complaintId, UpdateComplaintStatusDto request);

        Task<ServiceResult<IEnumerable<ComplaintCategoryResponseDto>>> GetActiveCategoriesAsync();

        Task<ServiceResult<ComplaintCategoryResponseDto>> CreateCategoryAsync(CreateComplaintCategoryDto request);

        Task<ServiceResult<ComplaintCategoryResponseDto>> UpdateCategoryAsync(int categoryId, UpdateComplaintCategoryDto request);

        Task<ServiceResult<bool>> DeleteCategoryAsync(int categoryId);
    }
}
