using CampusServicesPortal.DTOs.Requests.Complaints;
using CampusServicesPortal.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CampusServicesPortal.Controllers
{
    [ApiController]
    [Route("api/complaint-categories")]
    public class ComplaintCategoriesController
        : BaseApiController
    {
        private readonly IComplaintService
            _complaintService;

        public ComplaintCategoriesController(
            IComplaintService complaintService)
        {
            _complaintService = complaintService;
        }

        // GET /api/complaint-categories
        [HttpGet]
        public async Task<IActionResult> GetActiveCategories() 
        {
            var result = await _complaintService.GetActiveCategoriesAsync();

            return ProcessServiceResult(result,"Active complaint categories retrieved successfully.");
        }

        // POST /api/complaint-categories
        [HttpPost]
        public async Task<IActionResult>
            CreateCategory([FromBody] CreateComplaintCategoryDto request)
        {
            var result = await _complaintService.CreateCategoryAsync(request);

            return ProcessServiceResult(result,"Complaint category created successfully.");
        }

        // PUT /api/complaint-categories/1
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateCategory(int id,[FromBody] UpdateComplaintCategoryDto request)
        {
            var result =
                await _complaintService
                    .UpdateCategoryAsync(id, request);

            return ProcessServiceResult(
                result,
                "Complaint category updated successfully.");
        }

        // DELETE /api/complaint-categories/1
        [HttpDelete("{id:int}")]
        public async Task<IActionResult>
            DeleteCategory(int id)
        {
            var result =
                await _complaintService
                    .DeleteCategoryAsync(id);

            return ProcessServiceResult(
                result,
                "Complaint category deleted or deactivated successfully.");
        }
    }
}